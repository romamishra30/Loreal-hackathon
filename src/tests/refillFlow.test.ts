import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { PRODUCT_SKUS } from '../data/seedConstants'

describe('Refill Counter Core Workflow & Ledger Sync', () => {
  beforeEach(() => {
    useAppStore.getState().resetDemoData()
  })

  it('processes a 3-tap refill transaction, decrements stock, and increments returns bin', () => {
    const store = useAppStore.getState()
    const clinicId = 'clinic-1'
    const patientId = 'pat-1'
    const skuId = PRODUCT_SKUS[0].id

    const initialBin = store.clinics.find(c => c.id === clinicId)?.binCount || 0
    const initialStockItem = store.stockItems.find(s => s.clinicId === clinicId && s.skuId === skuId)
    const initialRefillsOnHand = initialStockItem?.refillsOnHand || 10
    const initialTxCount = store.transactions.length

    const res = store.processRefill({
      clinicId,
      patientId,
      skuId,
      batchCode: 'TEST-BATCH-001',
      paymentMode: 'upi',
      staffPin: '1234',
    })

    expect(res.success).toBe(true)

    const updatedStore = useAppStore.getState()
    expect(updatedStore.transactions.length).toBe(initialTxCount + 1)

    // Stock should decrement
    const updatedStock = updatedStore.stockItems.find(s => s.clinicId === clinicId && s.skuId === skuId)
    expect(updatedStock?.refillsOnHand).toBe(initialRefillsOnHand - 1)

    // Returns bin should increment
    const updatedClinic = updatedStore.clinics.find(c => c.id === clinicId)
    expect(updatedClinic?.binCount).toBe(initialBin + 1)
  })

  it('rejects a duplicate batch code to prevent fraud', () => {
    const store = useAppStore.getState()
    const clinicId = 'clinic-1'
    const patientId = 'pat-1'
    const skuId = PRODUCT_SKUS[0].id

    // First transaction succeeds
    const firstRes = store.processRefill({
      clinicId,
      patientId,
      skuId,
      batchCode: 'DUP-CODE-777',
      paymentMode: 'cash',
      staffPin: '1234',
    })
    expect(firstRes.success).toBe(true)

    // Second transaction with the identical batch code must fail with anti-fraud warning
    const secondRes = store.processRefill({
      clinicId,
      patientId,
      skuId,
      batchCode: 'DUP-CODE-777',
      paymentMode: 'cash',
      staffPin: '1234',
    })
    expect(secondRes.success).toBe(false)
    expect(secondRes.message).toContain('FRAUD ALERT')
  })

  it('allows voiding / undoing an accidental transaction and restores clinic inventory', () => {
    const store = useAppStore.getState()
    const clinicId = 'clinic-1'
    const patientId = 'pat-1'
    const skuId = PRODUCT_SKUS[0].id

    const initialStock = store.stockItems.find(s => s.clinicId === clinicId && s.skuId === skuId)?.refillsOnHand || 10

    const res = store.processRefill({
      clinicId,
      patientId,
      skuId,
      batchCode: 'UNDO-CODE-101',
      paymentMode: 'upi',
      staffPin: '1234',
    })
    expect(res.success).toBe(true)
    const txId = res.transaction?.id!

    // Undo transaction
    const undoRes = useAppStore.getState().undoTransaction(txId, 'Receptionist typo')
    expect(undoRes.success).toBe(true)

    const revertedStock = useAppStore.getState().stockItems.find(s => s.clinicId === clinicId && s.skuId === skuId)?.refillsOnHand
    expect(revertedStock).toBe(initialStock)
  })
})

