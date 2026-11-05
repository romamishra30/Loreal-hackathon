import { z } from 'zod'

export type PersonaRole = 'rep' | 'staff' | 'doctor' | 'patient' | 'manager'

export type DoctorArchetype = 
  | 'clinician_first' 
  | 'margin_driven' 
  | 'loyalty_builder' 
  | 'eco_advocate' 
  | 'time_poor_skeptic'

export type HealthStatus = 'champion' | 'on_track' | 'at_risk' | 'dormant'

export interface Territory {
  id: string
  name: string
  code: string
  targetRefillRate: number // e.g. 40%
  repName: string
  repPhone: string
  clinicCount: number
}

export interface Clinic {
  id: string
  name: string
  doctorName: string
  doctorDegree: string
  phone: string
  email: string
  address: string
  locality: string
  territoryId: string
  lat: number
  lng: number
  archetype: DoctorArchetype
  patientVolumeMonthly: number
  dispensingSharePct: number // e.g. 60%
  brandsStocked: string[]
  enrolledDate: string
  healthScore: number // 0-100
  healthStatus: HealthStatus
  activeLevers: string[]
  binCount: number
  binThreshold: number
  lastVisitDate: string
  lastRefillDate: string
  totalRefillsAllTime: number
  totalPacksSavedAllTime: number
  counterPin: string
}

export interface ProductSKU {
  id: string
  name: string
  subtitle: string
  category: string
  volume: string
  fullPriceINR: number
  refillPriceINR: number
  doctorFullMarginPct: number // e.g. 25%
  doctorRefillMarginPct: number // e.g. 32%
  plasticWeightGrams: number // e.g. 38g saved
  co2FactorGrams: number // e.g. 110g CO2e saved
  usageCycleDays: number // e.g. 30 days
  heroColor: string
}

export interface RefillTransaction {
  id: string
  clinicId: string
  patientId: string
  skuId: string
  batchCode: string
  fullPrice: number
  refillPrice: number
  discountPct: number
  doctorMargin: number
  staffId: string
  staffName: string
  paymentMode: 'upi' | 'cash' | 'card'
  timestamp: string
  status: 'completed' | 'voided'
  voidReason?: string
}

export interface ReturnPack {
  id: string
  clinicId: string
  batchCode: string
  skuId: string
  scannedAt: string
  verifiedChecks: {
    intact: boolean
    matchesRange: boolean
    batchCodeReadable: boolean
  }
  duplicateFlag: boolean
}

export interface StockItem {
  clinicId: string
  skuId: string
  fullPacksOnHand: number
  refillsOnHand: number
  minThreshold: number
  daysOfCover: number
}

export type OrderStatus = 'requested' | 'approved' | 'dispatched' | 'delivered'

export interface ReplenishmentOrder {
  id: string
  clinicId: string
  skuId: string
  refillUnits: number
  fullPackUnits: number
  status: OrderStatus
  requestedAt: string
  updatedAt: string
  trackingNote?: string
}

export type PickupStatus = 'requested' | 'scheduled' | 'picked_up' | 'recycled'

export interface PickupTask {
  id: string
  clinicId: string
  packCount: number
  status: PickupStatus
  requestedAt: string
  scheduledDate?: string
  completedAt?: string
}

export type LoyaltyTier = 'starter' | 'green' | 'gold'

export interface Patient {
  id: string
  name: string
  phone: string
  email: string
  primaryClinicId: string
  enrolledDate: string
  activeSkuId: string
  usageDaysElapsed: number
  usageCycleDays: number
  refillStreak: number
  loyaltyTier: LoyaltyTier
  pointsBalance: number
  packsSavedTotal: number
  lastRefillDate: string
  qrCodeValue: string
}

export interface StaffMember {
  id: string
  clinicId: string
  name: string
  role: string
  phone: string
  completedModules: string[]
  isCertified: boolean
  certifiedDate?: string
  points: number
  refillsCompleted: number
}

export interface TrainingModule {
  id: string
  number: number
  title: string
  durationMins: number
  summary: string
  objectives: string[]
  contentParagraphs: string[]
  quizQuestions: {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }[]
  badgeName: string
}

export interface Lever {
  id: string
  name: string
  category: 'financial' | 'operational' | 'training' | 'marketing'
  description: string
  defaultActive: boolean
  costPerMonthINR: number
  estimatedLiftPct: number
  iconName: string
}

export interface IncentiveTierConfig {
  tier: 'bronze' | 'silver' | 'gold'
  name: string
  minRefillsMonthly: number
  minConsistencyWeeks: number
  doctorRewardPerRefillINR: number
  staffRewardPerRefillINR: number
  clinicBonusMonthlyINR: number
  perks: string[]
}

export type TaskPriority = 'urgent' | 'high' | 'medium'

export interface ActionTask {
  id: string
  clinicId: string
  clinicName: string
  doctorName: string
  locality: string
  priority: TaskPriority
  title: string
  description: string
  triggerRule: 'stock_out' | 'dormant_streak' | 'bin_threshold' | 'untrained_staff' | 'high_void_rate' | 'champion_nomination' | 'negative_feedback'
  status: 'pending' | 'completed' | 'snoozed'
  dueDate: string
  createdAt: string
  notes?: string
}

export interface Visit {
  id: string
  repId: string
  clinicId: string
  clinicName: string
  doctorName: string
  date: string
  timeSlot: string
  type: 'routine' | 'urgent' | 'training' | 'onboarding'
  status: 'planned' | 'completed' | 'missed'
  notes?: string
  checklist: {
    task: string
    done: boolean
  }[]
}

export interface AppNotification {
  id: string
  targetRoles: PersonaRole[]
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  type: 'info' | 'success' | 'warning' | 'alert'
}

export interface PatientFeedback {
  id: string
  clinicId: string
  patientId: string
  rating: number // 1 to 5
  tags: string[]
  comments: string
  timestamp: string
}

export interface SupportTicket {
  id: string
  clinicId: string
  staffName: string
  category: 'hardware' | 'stock' | 'patient_issue' | 'batch_error' | 'other'
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  createdAt: string
}

export interface CopilotMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  suggestedPrompts?: string[]
  links?: {
    label: string
    path: string
  }[]
}

// Zod schemas for runtime validation
export const RefillValidationSchema = z.object({
  clinicId: z.string().min(1, 'Clinic is required'),
  patientId: z.string().min(1, 'Patient is required'),
  skuId: z.string().min(1, 'Product SKU is required'),
  batchCode: z.string().min(4, 'Batch code must be at least 4 alphanumeric characters').regex(/^[A-Z0-9-]+$/i, 'Invalid batch code format'),
  staffPin: z.string().min(2, 'Staff PIN or initials required'),
  paymentMode: z.enum(['upi', 'cash', 'card']),
})

export const BatchCodeSchema = z.string().min(4, 'Enter valid lot code').max(12, 'Lot code too long')

