import { Patient, RefillTransaction, Sku, LoyaltyTier } from '../entities'
import { subDays, parseISO, differenceInDays } from 'date-fns'

export function selectPatientById(patients: Patient[], id: string): Patient | undefined {
  return patients.find(p => p.id === id) || patients[0]
}

export function selectPatientTxs(txs: RefillTransaction[], patientId: string): RefillTransaction[] {
  return txs.filter(t => t.patientId === patientId && t.status === 'completed')
}

export function selectPatientRefillStreak(txs: RefillTransaction[], patientId: string): number {
  const count = selectPatientTxs(txs, patientId).length
  return Math.max(1, count)
}

export function selectPatientLoyaltyTier(txs: RefillTransaction[], patientId: string): LoyaltyTier {
  const streak = selectPatientRefillStreak(txs, patientId)
  if (streak >= 5) return 'gold'
  if (streak >= 2) return 'green'
  return 'starter'
}

export function selectPatientDaysRemaining(
  patient: Patient,
  txs: RefillTransaction[],
  skus: Sku[]
): { daysRemaining: number; daysElapsed: number; percentElapsed: number } {
  const sku = skus.find(s => s.id === patient.activeSkuId) || skus[0]
  const completed = selectPatientTxs(txs, patient.id)
  
  let daysElapsed = 25
  if (completed.length > 0) {
    try {
      const lastTx = completed[completed.length - 1]
      daysElapsed = Math.max(0, differenceInDays(new Date(), parseISO(lastTx.timestamp)))
    } catch {
      daysElapsed = 25
    }
  }

  const cycleDays = sku ? sku.usageCycleDays : 30
  const daysRemaining = Math.max(0, cycleDays - daysElapsed)
  const percentElapsed = Math.min(100, Math.round((daysElapsed / cycleDays) * 100))

  return { daysRemaining, daysElapsed, percentElapsed }
}

export function selectPatientPlasticGrams(txs: RefillTransaction[], skus: Sku[], patientId: string): number {
  const completed = selectPatientTxs(txs, patientId)
  return completed.reduce((sum, tx) => {
    const sku = skus.find(s => s.id === tx.skuId)
    return sum + (sku ? sku.plasticWeightGrams : 42)
  }, 0)
}

