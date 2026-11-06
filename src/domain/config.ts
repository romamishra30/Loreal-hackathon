export interface ProgramConfig {
  targetRefillRate: number // e.g. 0.40 (40%)
  baselineRepeatRate: number // e.g. 0.28 (28%)
  refillLiftedRepeatRate: number // e.g. 0.62 (62%)
  refillDiscountPct: number // e.g. 0.20 (20%)
  defaultDoctorFullMarginPct: number // 0.25 (25%)
  defaultDoctorRefillMarginPct: number // 0.32 (32%)
  returnsBinThreshold: number // 20 packs
  minCoverDaysThreshold: number // 14 days
  staffHandlingTimeMin: number // 1.2 min
  staffCostPerMinINR: number // ₹2.50
  staffIncentivePerRefillINR: number // ₹10.00
  starterKitCostINR: number // ₹12,000
  scoreWeights: {
    refillRate: number // 40
    consistency: number // 25
    stock: number // 20
    staff: number // 15
  }
  tierThresholds: {
    goldRefills: number // 60
    goldConsistencyWeeks: number // 4
    silverRefills: number // 30
    silverConsistencyWeeks: number // 3
    bronzeRefills: number // 15
    bronzeConsistencyWeeks: number // 2
  }
}

export const INITIAL_CONFIG: ProgramConfig = {
  targetRefillRate: 0.40,
  baselineRepeatRate: 0.28,
  refillLiftedRepeatRate: 0.62,
  refillDiscountPct: 0.20,
  defaultDoctorFullMarginPct: 0.25,
  defaultDoctorRefillMarginPct: 0.32,
  returnsBinThreshold: 20,
  minCoverDaysThreshold: 14,
  staffHandlingTimeMin: 1.2,
  staffCostPerMinINR: 2.5,
  staffIncentivePerRefillINR: 10,
  starterKitCostINR: 12000,
  scoreWeights: {
    refillRate: 40,
    consistency: 25,
    stock: 20,
    staff: 15,
  },
  tierThresholds: {
    goldRefills: 60,
    goldConsistencyWeeks: 4,
    silverRefills: 30,
    silverConsistencyWeeks: 3,
    bronzeRefills: 15,
    bronzeConsistencyWeeks: 2,
  },
}

