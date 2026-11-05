import { describe, it, expect } from 'vitest'
import { 
  calculateClinicEconomics, 
  DEFAULT_ECONOMICS, 
  calculateHealthScore, 
  calculateSustainabilityImpact, 
  isDuplicateBatch, 
  checkRefillEligibility, 
  evaluateIncentiveTier 
} from '../lib/calculations'
import { ReturnPack } from '../types'

describe('Clinic Economics Calculator Tests', () => {
  it('computes positive net incremental margin correctly', () => {
    const output = calculateClinicEconomics(DEFAULT_ECONOMICS)
    expect(output.eligiblePatientsMonthly).toBeGreaterThan(0)
    expect(output.monthlyNetIncrementalMargin).toBeGreaterThan(0)
    expect(output.annualNetIncrementalMargin).toBe(output.monthlyNetIncrementalMargin * 12)
    expect(output.repeatLiftPct).toBeGreaterThan(0.5) // ~120% lift
    expect(output.paybackPeriodMonths).toBeGreaterThan(0)
  })

  it('generates 12 months of ramped cumulative cash flow', () => {
    const output = calculateClinicEconomics(DEFAULT_ECONOMICS)
    expect(output.monthlyCashFlow.length).toBe(12)
    expect(output.cumulativeCashFlow.length).toBe(12)
    // Later months should show positive cumulative cash after initial setup payback
    expect(output.cumulativeCashFlow[11]).toBeGreaterThan(output.cumulativeCashFlow[0])
  })
})

describe('Adoption Health Score Formula Tests', () => {
  it('correctly scores a Champion practice (score >= 85)', () => {
    const res = calculateHealthScore({
      refillRate: 0.45,
      targetRefillRate: 0.40,
      activeWeeksLast4: 4,
      daysOfCover: 20,
      hasTrainedStaff: true,
      hasRecentCounterActivity: true,
    })
    expect(res.score).toBeGreaterThanOrEqual(85)
    expect(res.status).toBe('champion')
  })

  it('correctly flags an At-Risk clinic when consistency and stock dip', () => {
    const res = calculateHealthScore({
      refillRate: 0.22,
      targetRefillRate: 0.40,
      activeWeeksLast4: 2,
      daysOfCover: 5,
      hasTrainedStaff: true,
      hasRecentCounterActivity: false,
    })
    expect(res.score).toBeLessThan(65)
    expect(res.status).toBe('at_risk')
  })

  it('correctly flags a Dormant clinic when activity halts', () => {
    const res = calculateHealthScore({
      refillRate: 0.05,
      targetRefillRate: 0.40,
      activeWeeksLast4: 0,
      daysOfCover: 0,
      hasTrainedStaff: false,
      hasRecentCounterActivity: false,
    })
    expect(res.score).toBeLessThan(40)
    expect(res.status).toBe('dormant')
  })
})

describe('Reverse Logistics & Fraud Prevention Rules', () => {
  it('detects duplicate batch codes to prevent packaging reuse fraud', () => {
    const returns: ReturnPack[] = [
      {
        id: 'ret-1',
        clinicId: 'clinic-1',
        batchCode: 'B25-419',
        skuId: 'sku-1',
        scannedAt: '2026-03-01T10:00:00Z',
        verifiedChecks: { intact: true, matchesRange: true, batchCodeReadable: true },
        duplicateFlag: false,
      }
    ]

    expect(isDuplicateBatch('B25-419', returns)).toBe(true)
    expect(isDuplicateBatch('b25-419', returns)).toBe(true) // case insensitive
    expect(isDuplicateBatch('B25-999', returns)).toBe(false)
  })

  it('checks patient refill eligibility against cycle length', () => {
    // 10 days elapsed on 30 day product -> early refill warning
    const earlyCheck = checkRefillEligibility(10, 30)
    expect(earlyCheck.warning).toBeDefined()

    // 25 days elapsed on 30 day product -> normal adherence refill
    const validCheck = checkRefillEligibility(25, 30)
    expect(validCheck.warning).toBeUndefined()
  })
})

describe('Sustainability & Plastic Saved Calculations', () => {
  it('accurately converts pack count to kg plastic and PET bottle equivalents', () => {
    const impact = calculateSustainabilityImpact(100)
    expect(impact.totalKgPlastic).toBe(4.2) // 100 * 42g = 4200g = 4.2kg
    expect(impact.waterBottlesEquivalent).toBe(350) // 4200g / 12g
    expect(impact.carKmAvoided).toBeGreaterThan(0)
  })
})

describe('Incentive Tier Evaluation', () => {
  it('awards Gold tier for high volume and 4 weeks consistency', () => {
    const res = evaluateIncentiveTier(65, 4)
    expect(res.tier).toBe('gold')
    expect(res.doctorRewardPerRefill).toBe(50)
    expect(res.bonusINR).toBe(3000)
  })

  it('awards Bronze tier for 18 refills and 2 weeks consistency', () => {
    const res = evaluateIncentiveTier(18, 2)
    expect(res.tier).toBe('bronze')
    expect(res.doctorRewardPerRefill).toBe(20)
  })
})

