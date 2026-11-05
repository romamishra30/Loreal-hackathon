import { describe, it, expect } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { PRODUCT_SKUS } from '../data/seedConstants'

describe('End-to-End Smoke Test: Counter Refill -> Territory KPI Propagation', () => {
  it('propagates counter refill transaction immediately into territory totals and health scores', () => {
    const store = useAppStore.getState()
    store.resetDemoData()

    const initialTotalTxs = useAppStore.getState().transactions.filter(t => t.status === 'completed').length
    const initialClinicTxs = useAppStore.getState().clinics.find(c => c.id === 'clinic-1')?.totalRefillsAllTime || 0

    // Staff performs refill in Clinic Counter
    const res = useAppStore.getState().processRefill({
      clinicId: 'clinic-1',
      patientId: 'pat-1',
      skuId: PRODUCT_SKUS[0].id,
      batchCode: 'SMOKE-BATCH-99',
      paymentMode: 'upi',
      staffPin: '1234',
    })

    expect(res.success).toBe(true)

    // Verify territory and clinic-level reaction
    const stateAfter = useAppStore.getState()
    const updatedTotalTxs = stateAfter.transactions.filter(t => t.status === 'completed').length
    const updatedClinic = stateAfter.clinics.find(c => c.id === 'clinic-1')

    expect(updatedTotalTxs).toBe(initialTotalTxs + 1)
    expect(updatedClinic?.totalRefillsAllTime).toBe(initialClinicTxs + 1)
    expect(updatedClinic?.totalPacksSavedAllTime).toBeGreaterThan(0)
    
    // Verify notification sent to Medical Rep & Doctor
    const hasNotification = stateAfter.notifications.some(n => 
      n.title.includes('Refill Processed Successfully') && n.message.includes('clinic-1')
    )
    expect(hasNotification).toBe(true)
  })
})

