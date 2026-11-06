import { 
  Clinic, 
  Doctor, 
  Staff, 
  RefillTransaction, 
  StockItem, 
  ReturnedPack, 
  PickupTask, 
  Sku, 
  Patient, 
  HealthStatus, 
  TrainingProgress, 
  Certification 
} from '../entities'
import { ProgramConfig } from '../config'
import { subDays, parseISO, isAfter } from 'date-fns'

export function selectClinicById(clinics: Clinic[], id: string): Clinic | undefined {
  return clinics.find(c => c.id === id) || clinics[0]
}

export function selectDoctorByClinic(doctors: Doctor[], clinicId: string): Doctor | undefined {
  return doctors.find(d => d.primaryClinicId === clinicId) || doctors[0]
}

export function selectStaffByClinic(staffList: Staff[], clinicId: string): Staff | undefined {
  return staffList.find(s => s.clinicId === clinicId) || staffList[0]
}

export function selectClinicCompletedTxs(txs: RefillTransaction[], clinicId: string): RefillTransaction[] {
  return txs.filter(t => t.clinicId === clinicId && t.status === 'completed')
}

export function selectClinicRefills30d(txs: RefillTransaction[], clinicId: string): number {
  const thirtyDaysAgo = subDays(new Date(), 30)
  return txs.filter(t => {
    if (t.clinicId !== clinicId || t.status !== 'completed') return false
    try {
      return isAfter(parseISO(t.timestamp), thirtyDaysAgo)
    } catch {
      return true
    }
  }).length
}

export function selectClinicLastCompletedPickup(pickups: PickupTask[], clinicId: string): PickupTask | undefined {
  const completed = pickups.filter(p => p.clinicId === clinicId && (p.status === 'recycled' || Boolean(p.completedAt)))
  if (completed.length === 0) return undefined
  return completed.slice().sort((a, b) => {
    const timeA = new Date(a.completedAt || a.requestedAt).getTime()
    const timeB = new Date(b.completedAt || b.requestedAt).getTime()
    return timeB - timeA
  })[0]
}

export function selectClinicBinCount(returns: ReturnedPack[], pickups: PickupTask[], clinicId: string): number {
  const lastCompleted = selectClinicLastCompletedPickup(pickups, clinicId)
  const clinicReturns = returns.filter(r => r.clinicId === clinicId)
  if (!lastCompleted) {
    return clinicReturns.length
  }
  const completedTime = new Date(lastCompleted.completedAt || lastCompleted.requestedAt).getTime()
  return clinicReturns.filter(r => new Date(r.scannedAt).getTime() > completedTime).length
}

export function selectClinicPacksRecovered(pickups: PickupTask[], clinicId?: string): number {
  const relevant = pickups.filter(p => (p.status === 'recycled' || Boolean(p.completedAt)) && (!clinicId || p.clinicId === clinicId))
  return relevant.reduce((sum, p) => sum + (p.packCount || 0), 0)
}

export function selectClinicPlasticKg(txs: RefillTransaction[], skus: Sku[], clinicId: string): number {
  const completed = selectClinicCompletedTxs(txs, clinicId)
  const totalGrams = completed.reduce((sum, tx) => {
    const sku = skus.find(s => s.id === tx.skuId)
    return sum + (sku ? sku.plasticWeightGrams : 42)
  }, 0)
  return Number((totalGrams / 1000).toFixed(1))
}

export function selectClinicCumulativeMargin(txs: RefillTransaction[], clinicId: string): number {
  return selectClinicCompletedTxs(txs, clinicId).reduce((sum, tx) => sum + tx.doctorMarginINR, 0)
}

export function selectClinicDaysOfCover(stockItems: StockItem[], clinicId: string): number {
  const items = stockItems.filter(s => s.clinicId === clinicId)
  if (items.length === 0) return 18
  const totalRefills = items.reduce((sum, i) => sum + i.refillsOnHand, 0)
  // Approximate average daily consumption as ~0.8 units/day
  return Math.max(0, Math.round(totalRefills / 0.8))
}

export function selectClinicAdoptionHealthScore(
  clinicId: string,
  txs: RefillTransaction[],
  stockItems: StockItem[],
  staffList: Staff[],
  training: TrainingProgress[],
  config: ProgramConfig
): { score: number; status: HealthStatus; breakdown: { rate: number; consistency: number; stock: number; staff: number } } {
  const completed = selectClinicCompletedTxs(txs, clinicId)
  const recent30d = selectClinicRefills30d(txs, clinicId)
  
  // 1. Refill rate component (40 pts)
  // Assume ~45 eligible purchases/mo in clinic OPD
  const estimatedEligible = 45
  const rateRatio = estimatedEligible > 0 ? (recent30d / estimatedEligible) / config.targetRefillRate : 0
  const rateScore = Math.min(config.scoreWeights.refillRate, Math.round(Math.min(1.2, rateRatio) * config.scoreWeights.refillRate))

  // 2. Consistency component (25 pts)
  // Check active weeks out of last 4
  const now = new Date()
  let activeWeeks = 0
  for (let w = 1; w <= 4; w++) {
    const start = subDays(now, w * 7)
    const end = subDays(now, (w - 1) * 7)
    const hasTx = completed.some(t => {
      try {
        const d = parseISO(t.timestamp)
        return isAfter(d, start) && !isAfter(d, end)
      } catch {
        return false
      }
    })
    if (hasTx) activeWeeks++
  }
  const consistencyScore = Math.round((activeWeeks / 4) * config.scoreWeights.consistency)

  // 3. Stock availability (20 pts)
  const coverDays = selectClinicDaysOfCover(stockItems, clinicId)
  const stockScore = coverDays >= config.minCoverDaysThreshold 
    ? config.scoreWeights.stock 
    : coverDays >= 7 
    ? 12 
    : coverDays > 0 
    ? 5 
    : 0

  // 4. Staff engagement (15 pts)
  const staff = selectStaffByClinic(staffList, clinicId)
  const modulesPassed = staff ? training.filter(tp => tp.staffId === staff.id).length : 0
  const isCertified = modulesPassed >= 6
  const hasRecentTx = completed.some(t => {
    try {
      return isAfter(parseISO(t.timestamp), subDays(now, 7))
    } catch {
      return false
    }
  })
  const staffScore = (isCertified ? 8 : modulesPassed > 0 ? 4 : 0) + (hasRecentTx ? 7 : 0)

  const rawScore = rateScore + consistencyScore + stockScore + staffScore
  const score = Math.max(0, Math.min(100, rawScore))

  let status: HealthStatus = 'dormant'
  if (score >= 85) status = 'champion'
  else if (score >= 65) status = 'on_track'
  else if (score >= 40) status = 'at_risk'

  return {
    score,
    status,
    breakdown: {
      rate: rateScore,
      consistency: consistencyScore,
      stock: stockScore,
      staff: staffScore,
    }
  }
}

export function selectClinicRank(
  clinicId: string, 
  clinics: Clinic[], 
  txs: RefillTransaction[]
): { rank: number; total: number } {
  const current = clinics.find(c => c.id === clinicId)
  if (!current) return { rank: 1, total: clinics.length }

  const territoryClinics = clinics.filter(c => c.territoryId === current.territoryId)
  const ranked = territoryClinics
    .map(c => ({
      id: c.id,
      refills: selectClinicRefills30d(txs, c.id),
    }))
    .sort((a, b) => b.refills - a.refills)

  const idx = ranked.findIndex(r => r.id === clinicId)
  return {
    rank: idx >= 0 ? idx + 1 : 1,
    total: territoryClinics.length,
  }
}

export function selectClinicIncentiveTier(
  clinicId: string,
  txs: RefillTransaction[],
  config: ProgramConfig
): { tier: 'bronze' | 'silver' | 'gold' | 'unranked'; bonusINR: number; rewardPerRefill: number } {
  const refills = selectClinicRefills30d(txs, clinicId)
  if (refills >= config.tierThresholds.goldRefills) {
    return { tier: 'gold', bonusINR: 3000, rewardPerRefill: 50 }
  }
  if (refills >= config.tierThresholds.silverRefills) {
    return { tier: 'silver', bonusINR: 1500, rewardPerRefill: 35 }
  }
  if (refills >= config.tierThresholds.bronzeRefills) {
    return { tier: 'bronze', bonusINR: 500, rewardPerRefill: 20 }
  }
  return { tier: 'unranked', bonusINR: 0, rewardPerRefill: 0 }
}

export function selectClinicDefaultEconomics(
  clinicId: string,
  patients: Patient[],
  txs: RefillTransaction[],
  config: ProgramConfig,
  skus: Sku[]
) {
  const clinicPatients = patients.filter(p => p.primaryClinicId === clinicId)
  const completed = selectClinicCompletedTxs(txs, clinicId)

  const patientsPerMonth = Math.max(150, clinicPatients.length > 0 ? clinicPatients.length : 350)
  const dispensingSharePct = 0.55
  const dailyUseRangePct = 0.45
  const avgPackPrice = skus.length > 0 ? Math.round(skus.reduce((s, k) => s + k.fullPriceINR, 0) / skus.length) : 1250

  return {
    patientsPerMonth,
    dispensingSharePct,
    dailyUseRangePct,
    avgPackPrice,
    refillDiscountPct: config.refillDiscountPct,
    doctorFullMarginPct: config.defaultDoctorFullMarginPct,
    doctorRefillMarginPct: config.defaultDoctorRefillMarginPct,
    baselineRepeatRate: config.baselineRepeatRate,
    refillLiftedRepeatRate: config.refillLiftedRepeatRate,
    staffTimePerRefillMins: config.staffHandlingTimeMin,
    costPerStaffMinuteINR: config.staffCostPerMinINR,
    stockHoldingDays: 20,
  }
}

