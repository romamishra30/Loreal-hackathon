import { Clinic, ProductSKU, RefillTransaction, ReturnPack } from '../types'

export interface EconomicsInput {
  patientsPerMonth: number
  dispensingSharePct: number // 0 to 1
  dailyUseRangePct: number // 0 to 1
  avgPackPrice: number // INR
  refillDiscountPct: number // 0 to 1
  doctorFullMarginPct: number // 0 to 1
  doctorRefillMarginPct: number // 0 to 1
  baselineRepeatRate: number // 0 to 1
  refillLiftedRepeatRate: number // 0 to 1
  staffTimePerRefillMins: number
  costPerStaffMinuteINR: number
  stockHoldingDays: number
}

export interface EconomicsOutput {
  eligiblePatientsMonthly: number
  baselineMonthlyPurchases: number
  baselineMonthlyMargin: number
  refillMonthlyPurchases: number
  refillPrice: number
  refillGrossMarginPerUnit: number
  monthlyRefillGrossMargin: number
  monthlyStaffCost: number
  monthlyNetIncrementalMargin: number
  annualNetIncrementalMargin: number
  repeatLiftPct: number
  paybackPeriodMonths: number
  monthlyCashFlow: number[]
  cumulativeCashFlow: number[]
}

export const DEFAULT_ECONOMICS: EconomicsInput = {
  patientsPerMonth: 350,
  dispensingSharePct: 0.55,
  dailyUseRangePct: 0.45,
  avgPackPrice: 1250,
  refillDiscountPct: 0.20,
  doctorFullMarginPct: 0.25,
  doctorRefillMarginPct: 0.32,
  baselineRepeatRate: 0.28,
  refillLiftedRepeatRate: 0.62,
  staffTimePerRefillMins: 1.2,
  costPerStaffMinuteINR: 2.5,
  stockHoldingDays: 20,
}

export const PRESET_SCENARIOS: Record<'conservative' | 'base' | 'optimistic', EconomicsInput> = {
  conservative: {
    ...DEFAULT_ECONOMICS,
    dispensingSharePct: 0.40,
    dailyUseRangePct: 0.35,
    doctorRefillMarginPct: 0.28,
    baselineRepeatRate: 0.25,
    refillLiftedRepeatRate: 0.45,
  },
  base: {
    ...DEFAULT_ECONOMICS,
  },
  optimistic: {
    ...DEFAULT_ECONOMICS,
    dispensingSharePct: 0.65,
    dailyUseRangePct: 0.50,
    doctorRefillMarginPct: 0.35,
    baselineRepeatRate: 0.30,
    refillLiftedRepeatRate: 0.75,
  },
}

export function calculateClinicEconomics(input: EconomicsInput): EconomicsOutput {
  const eligiblePatientsMonthly = Math.round(input.patientsPerMonth * input.dispensingSharePct * input.dailyUseRangePct)
  
  // Baseline without refills
  const baselineMonthlyPurchases = Math.round(eligiblePatientsMonthly * input.baselineRepeatRate)
  const fullPackMarginPerUnit = input.avgPackPrice * input.doctorFullMarginPct
  const baselineMonthlyMargin = baselineMonthlyPurchases * fullPackMarginPerUnit

  // With Refill program
  const refillMonthlyPurchases = Math.round(eligiblePatientsMonthly * input.refillLiftedRepeatRate)
  const refillPrice = Math.round(input.avgPackPrice * (1 - input.refillDiscountPct))
  const refillGrossMarginPerUnit = refillPrice * input.doctorRefillMarginPct
  const monthlyRefillGrossMargin = refillMonthlyPurchases * refillGrossMarginPerUnit

  // Staff operational friction
  const monthlyStaffCost = Math.round(refillMonthlyPurchases * input.staffTimePerRefillMins * input.costPerStaffMinuteINR)

  // Net incremental
  const monthlyNetIncrementalMargin = Math.max(0, Math.round(monthlyRefillGrossMargin - monthlyStaffCost - (baselineMonthlyPurchases * (fullPackMarginPerUnit * 0.5))))
  const annualNetIncrementalMargin = monthlyNetIncrementalMargin * 12

  const repeatLiftPct = input.baselineRepeatRate > 0 
    ? (input.refillLiftedRepeatRate - input.baselineRepeatRate) / input.baselineRepeatRate
    : 0

  // Assume starter kit setup cost is ~₹12,000 (display rack, standee, initial training)
  const starterKitCost = 12000
  const paybackPeriodMonths = monthlyNetIncrementalMargin > 0
    ? Number((starterKitCost / monthlyNetIncrementalMargin).toFixed(1))
    : 0

  // 12-month projections with ramp-up factor
  const monthlyCashFlow: number[] = []
  const cumulativeCashFlow: number[] = []
  let cumulative = -starterKitCost

  for (let m = 1; m <= 12; m++) {
    // Adoption ramp curve: 40% m1, 60% m2, 80% m3, 100% m4+
    const ramp = m === 1 ? 0.4 : m === 2 ? 0.65 : m === 3 ? 0.85 : 1.0
    const netM = Math.round(monthlyNetIncrementalMargin * ramp)
    monthlyCashFlow.push(netM)
    cumulative += netM
    cumulativeCashFlow.push(cumulative)
  }

  return {
    eligiblePatientsMonthly,
    baselineMonthlyPurchases,
    baselineMonthlyMargin,
    refillMonthlyPurchases,
    refillPrice,
    refillGrossMarginPerUnit,
    monthlyRefillGrossMargin,
    monthlyStaffCost,
    monthlyNetIncrementalMargin,
    annualNetIncrementalMargin,
    repeatLiftPct,
    paybackPeriodMonths,
    monthlyCashFlow,
    cumulativeCashFlow,
  }
}

/**
 * Health Score formula (0-100):
 * - 40% refill rate vs target (target 40% -> ratio capped at 1.0)
 * - 25% weekly consistency (weeks with >= 1 refill out of last 4 weeks)
 * - 20% stock availability (days of cover >= 14 days)
 * - 15% staff engagement (training complete + counter app used in 7 days)
 */
export function calculateHealthScore(params: {
  refillRate: number // e.g. 0.38
  targetRefillRate: number // e.g. 0.40
  activeWeeksLast4: number // 0 to 4
  daysOfCover: number // e.g. 18
  hasTrainedStaff: boolean
  hasRecentCounterActivity: boolean
}): { score: number; status: 'champion' | 'on_track' | 'at_risk' | 'dormant' } {
  // 1. Refill rate component (40 points)
  const rateRatio = params.targetRefillRate > 0 ? Math.min(1.2, params.refillRate / params.targetRefillRate) : 0
  const rateScore = Math.min(40, (rateRatio / 1.0) * 40)

  // 2. Consistency component (25 points)
  const consistencyScore = (Math.min(4, Math.max(0, params.activeWeeksLast4)) / 4) * 25

  // 3. Stock availability (20 points)
  const stockScore = params.daysOfCover >= 14 ? 20 : params.daysOfCover >= 7 ? 12 : params.daysOfCover > 0 ? 5 : 0

  // 4. Staff engagement (15 points)
  const staffScore = (params.hasTrainedStaff ? 8 : 0) + (params.hasRecentCounterActivity ? 7 : 0)

  const rawScore = Math.round(rateScore + consistencyScore + stockScore + staffScore)
  const score = Math.max(0, Math.min(100, rawScore))

  let status: 'champion' | 'on_track' | 'at_risk' | 'dormant' = 'dormant'
  if (score >= 85) status = 'champion'
  else if (score >= 65) status = 'on_track'
  else if (score >= 40) status = 'at_risk'

  return { score, status }
}

/**
 * Plastic & CO2e saved calculation
 */
export function calculateSustainabilityImpact(packsSaved: number, sku?: ProductSKU) {
  const avgGramsPlastic = sku ? sku.plasticWeightGrams : 42
  const avgGramsCO2 = sku ? sku.co2FactorGrams : 125

  const totalGramsPlastic = packsSaved * avgGramsPlastic
  const totalKgPlastic = Number((totalGramsPlastic / 1000).toFixed(2))

  const totalGramsCO2 = packsSaved * avgGramsCO2
  const totalKgCO2 = Number((totalGramsCO2 / 1000).toFixed(2))

  // Realistic comparisons
  const waterBottlesEquivalent = Math.round(totalGramsPlastic / 12) // 12g standard 500ml PET bottle
  const carKmAvoided = Number((totalKgCO2 / 0.192).toFixed(1)) // 0.192 kg CO2 per km for average petrol car
  const treesOffsetDays = Number((totalKgCO2 / 0.06).toFixed(1)) // Tree absorbs ~21.77 kg/year -> ~0.06 kg/day

  return {
    totalKgPlastic,
    totalKgCO2,
    waterBottlesEquivalent,
    carKmAvoided,
    treesOffsetDays,
  }
}

/**
 * Check if batch code has already been returned (anti-fraud check)
 */
export function isDuplicateBatch(batchCode: string, existingReturns: ReturnPack[]): boolean {
  if (!batchCode || !batchCode.trim()) return false
  const clean = batchCode.trim().toUpperCase()
  return existingReturns.some(r => r.batchCode.trim().toUpperCase() === clean)
}

/**
 * Check patient refill eligibility
 */
export function checkRefillEligibility(
  usageDaysElapsed: number, 
  usageCycleDays: number = 30
): { isEligible: boolean; warning?: string; daysRemaining: number } {
  const minThresholdDays = Math.floor(usageCycleDays * 0.6) // e.g. 18 days for 30 day supply
  const daysRemaining = Math.max(0, usageCycleDays - usageDaysElapsed)

  if (usageDaysElapsed < minThresholdDays) {
    return {
      isEligible: true,
      warning: `Early Refill Notice: Patient used product for only ${usageDaysElapsed} of ${usageCycleDays} days expected. Please confirm high dosage or accidental spill with patient.`,
      daysRemaining,
    }
  }

  return {
    isEligible: true,
    daysRemaining,
  }
}

/**
 * Incentive Tier calculation based on monthly refills & consistency
 */
export function evaluateIncentiveTier(monthlyRefills: number, consistencyWeeks: number): {
  tier: 'bronze' | 'silver' | 'gold' | 'unranked'
  doctorRewardPerRefill: number
  staffRewardPerRefill: number
  bonusINR: number
} {
  if (monthlyRefills >= 60 && consistencyWeeks >= 4) {
    return { tier: 'gold', doctorRewardPerRefill: 50, staffRewardPerRefill: 15, bonusINR: 3000 }
  }
  if (monthlyRefills >= 30 && consistencyWeeks >= 3) {
    return { tier: 'silver', doctorRewardPerRefill: 35, staffRewardPerRefill: 10, bonusINR: 1500 }
  }
  if (monthlyRefills >= 15 && consistencyWeeks >= 2) {
    return { tier: 'bronze', doctorRewardPerRefill: 20, staffRewardPerRefill: 5, bonusINR: 500 }
  }
  return { tier: 'unranked', doctorRewardPerRefill: 0, staffRewardPerRefill: 0, bonusINR: 0 }
}

