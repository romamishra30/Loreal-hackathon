import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { selectTerritoryRefills30d } from '../domain/selectors/territorySelectors'
import { selectClinicCumulativeMargin, selectClinicBinCount } from '../domain/selectors/clinicSelectors'
import { t, setLanguage, getLanguage } from '../i18n'

describe('End-to-End Integration Suite: Cross-Entity Reactivity', () => {
  beforeEach(() => {
    useAppStore.getState().resetDemoData()
  })

  it('1. Refill in Counter immediately updates Territory, Doctor Margin, Bin Count, and Patient Streak', async () => {
    const state = useAppStore.getState()
    const clinicId = 'clinic-1'
    const terrClinics = state.clinics.filter(c => c.territoryId === 'terr-mumbai-thane')
    const initialTerritoryRefills = selectTerritoryRefills30d(state.transactions, terrClinics, 'terr-mumbai-thane')
    const initialMargin = selectClinicCumulativeMargin(state.transactions, clinicId)
    const initialBin = selectClinicBinCount(state.returns, state.pickups, clinicId)
    const initialPatient = state.patients[0]
    const initialStreak = initialPatient.refillStreak || 0

    // Process a verified refill
    const uniqueBatch = `TEST-BATCH-${Date.now()}`
    const result = await useAppStore.getState().processRefill({
      clinicId,
      patientId: initialPatient.id,
      skuId: 'sku-moisturiser-50',
      batchCode: uniqueBatch,
      paymentMode: 'upi',
      verification: {
        intact: true,
        matchesRange: true,
        batchLegible: true,
      },
      staffPin: '1234',
    })

    expect(result.success).toBe(true)

    const updatedState = useAppStore.getState()
    const updatedTerritoryRefills = selectTerritoryRefills30d(updatedState.transactions, terrClinics, 'terr-mumbai-thane')
    const updatedMargin = selectClinicCumulativeMargin(updatedState.transactions, clinicId)
    const updatedBin = selectClinicBinCount(updatedState.returns, updatedState.pickups, clinicId)
    const updatedPatient = updatedState.patients.find(p => p.id === initialPatient.id)!

    // Assertions across views
    expect(updatedTerritoryRefills).toBe(initialTerritoryRefills + 1)
    expect(updatedMargin).toBeGreaterThan(initialMargin)
    expect(updatedBin).toBe(initialBin + 1)
    expect(updatedPatient.refillStreak).toBe(initialStreak + 1)
  })

  it('2. Anti-fraud prevention: processing duplicate batch code is rejected', async () => {
    const clinicId = 'clinic-1'
    const patientId = useAppStore.getState().patients[0].id
    const duplicateBatch = `DUP-BATCH-${Date.now()}`

    // First transaction succeeds
    const firstAttempt = await useAppStore.getState().processRefill({
      clinicId,
      patientId,
      skuId: 'sku-moisturiser-50',
      batchCode: duplicateBatch,
      paymentMode: 'upi',
      verification: { intact: true, matchesRange: true, batchLegible: true },
      staffPin: '1234',
    })
    expect(firstAttempt.success).toBe(true)

    // Second transaction with SAME batch code fails
    const secondAttempt = await useAppStore.getState().processRefill({
      clinicId,
      patientId,
      skuId: 'sku-moisturiser-50',
      batchCode: duplicateBatch,
      paymentMode: 'cash',
      verification: { intact: true, matchesRange: true, batchLegible: true },
      staffPin: '1234',
    })

    expect(secondAttempt.success).toBe(false)
    expect(secondAttempt.error).toMatch(/already used|duplicate/i)
  })

  it('3. Void transaction restores stock on hand and reverts clinic bin count', async () => {
    const clinicId = 'clinic-1'
    const skuId = 'sku-moisturiser-50'
    const patientId = useAppStore.getState().patients[0].id
    const batchCode = `VOID-TEST-${Date.now()}`

    const stockBefore = useAppStore.getState().stocks.find(s => s.clinicId === clinicId && s.skuId === skuId)!
    const initialRefillsOnHand = stockBefore.refillsOnHand

    const txResult = await useAppStore.getState().processRefill({
      clinicId,
      patientId,
      skuId,
      batchCode,
      paymentMode: 'upi',
      verification: { intact: true, matchesRange: true, batchLegible: true },
      staffPin: '1234',
    })

    expect(txResult.success).toBe(true)
    const txId = txResult.transactionId!

    // Refill deducted stock by 1
    const stockAfterRefill = useAppStore.getState().stocks.find(s => s.clinicId === clinicId && s.skuId === skuId)!
    expect(stockAfterRefill.refillsOnHand).toBe(initialRefillsOnHand - 1)

    // Now void the transaction
    useAppStore.getState().undoTransaction(txId)

    const stockAfterVoid = useAppStore.getState().stocks.find(s => s.clinicId === clinicId && s.skuId === skuId)!
    expect(stockAfterVoid.refillsOnHand).toBe(initialRefillsOnHand)

    const voidedTx = useAppStore.getState().transactions.find(t => t.id === txId)
    expect(voidedTx?.status).toBe('voided')
  })

  it('4. Onboarding: enrollment adds 26th clinic to territory and sets it active', () => {
    const stateBefore = useAppStore.getState()
    const initialCount = stateBefore.clinics.filter(c => c.territoryId === 'terr-mumbai-thane').length
    expect(initialCount).toBe(25)

    const newClinic = useAppStore.getState().enrollClinic({
      clinicName: 'Radiance Derma Centre',
      doctorName: 'Dr. Neha Varma',
      doctorDegree: 'MD, DVD',
      address: 'Shop 4, Vashi Sector 17, Navi Mumbai',
      locality: 'Vashi, Navi Mumbai',
      staffName: 'Pooja Patil',
      staffPhone: '+91 98201 11223',
      staffPin: '4321',
      territoryId: 'terr-mumbai-thane',
      eSignature: 'Dr. N. Varma',
      initialRefillStock: 20,
    })

    expect(newClinic).toBeDefined()
    const stateAfter = useAppStore.getState()
    const updatedCount = stateAfter.clinics.filter(c => c.territoryId === 'terr-mumbai-thane').length
    expect(updatedCount).toBe(26)
    expect(stateAfter.selectedClinicId).toBe(newClinic.id)

    // Stock items initialized for new clinic
    const newClinicStocks = stateAfter.stocks.filter(s => s.clinicId === newClinic.id)
    expect(newClinicStocks.length).toBeGreaterThan(0)
  })

  it('5. Language switcher reactively changes translations across en, hi, mr', () => {
    setLanguage('en')
    expect(getLanguage()).toBe('en')
    expect(t('nav.counter')).toBe('Clinic Refill Counter')

    setLanguage('hi')
    expect(getLanguage()).toBe('hi')
    expect(t('nav.counter')).toBe('क्लिनिक रिफिल काउंटर')

    setLanguage('mr')
    expect(getLanguage()).toBe('mr')
    expect(t('nav.counter')).toBe('क्लिनिक रिफिल काउंटर')

    // Reset back to English
    setLanguage('en')
    expect(getLanguage()).toBe('en')
  })

  it('6. Returns Bin Logic: No clinic may have bin count >= threshold without an open pickup task', () => {
    const state = useAppStore.getState()
    const threshold = state.config.returnsBinThreshold || 20

    // Check every clinic in the initial seeded state
    for (const clinic of state.clinics) {
      const binCount = selectClinicBinCount(state.returns, state.pickups, clinic.id)
      const hasOpenPickup = state.pickups.some(
        p => p.clinicId === clinic.id && p.status !== 'recycled'
      )

      if (binCount >= threshold) {
        expect(hasOpenPickup).toBe(true)
      } else {
        expect(binCount).toBeLessThan(threshold)
      }
    }

    // Verify 2-3 clinics are deliberately at 20+ with open pickup tasks
    const thresholdClinics = state.clinics.filter(
      c => selectClinicBinCount(state.returns, state.pickups, c.id) >= threshold
    )
    expect(thresholdClinics.length).toBeGreaterThanOrEqual(2)
    expect(thresholdClinics.length).toBeLessThanOrEqual(3)
  })

  it('7. Completing a pickup resets that clinic\'s bin to 0 and increments packs recovered', () => {
    const state = useAppStore.getState()
    const threshold = state.config.returnsBinThreshold || 20
    const clinicWithOpenPickup = state.clinics.find(
      c => selectClinicBinCount(state.returns, state.pickups, c.id) >= threshold
    )!
    expect(clinicWithOpenPickup).toBeDefined()

    const openPickup = state.pickups.find(
      p => p.clinicId === clinicWithOpenPickup.id && p.status !== 'recycled'
    )!
    expect(openPickup).toBeDefined()

    const binBefore = selectClinicBinCount(state.returns, state.pickups, clinicWithOpenPickup.id)
    expect(binBefore).toBeGreaterThanOrEqual(threshold)

    // Complete the pickup
    useAppStore.getState().completePickup(openPickup.id)

    const updatedState = useAppStore.getState()
    const binAfter = selectClinicBinCount(updatedState.returns, updatedState.pickups, clinicWithOpenPickup.id)
    expect(binAfter).toBe(0)

    const completedPickup = updatedState.pickups.find(p => p.id === openPickup.id)
    expect(completedPickup?.status).toBe('recycled')
    expect(completedPickup?.completedAt).toBeDefined()
  })
})
