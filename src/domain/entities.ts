export type PersonaRole = 'rep' | 'staff' | 'doctor' | 'patient' | 'manager'

export type DoctorArchetype = 
  | 'clinician_first' 
  | 'margin_driven' 
  | 'loyalty_builder' 
  | 'eco_advocate' 
  | 'time_poor_skeptic'

export type HealthStatus = 'champion' | 'on_track' | 'at_risk' | 'dormant'

export type OrderStatus = 'requested' | 'approved' | 'dispatched' | 'delivered'
export type PickupStatus = 'requested' | 'scheduled' | 'picked_up' | 'recycled'
export type LoyaltyTier = 'starter' | 'green' | 'gold'
export type TaskPriority = 'urgent' | 'high' | 'medium'

export interface Territory {
  id: string
  name: string
  code: string
  repId?: string
  repName?: string
  repPhone?: string
  repEmail?: string
  targetRefillRate?: number
  totalClinics?: number
  activeClinics?: number
  refillsAllTime?: number
  plasticSavedAllTimeKg?: number
}

export interface Rep {
  id: string
  name: string
  phone: string
  email: string
  territoryId: string
}

export interface Doctor {
  id: string
  name: string
  degree: string
  phone: string
  email: string
  archetype: DoctorArchetype
  primaryClinicId: string
  clinicName?: string
}

export interface Clinic {
  id: string
  name: string
  doctorId: string
  territoryId: string
  address: string
  locality: string
  lat: number
  lng: number
  counterPin: string
  enrolledAt: string
  // Optional convenience / backwards-compatible fields
  doctorName?: string
  doctorDegree?: string
  phone?: string
  archetype?: DoctorArchetype
  healthScore?: number
  healthStatus?: HealthStatus
  binCount?: number
  binThreshold?: number
  totalRefillsAllTime?: number
  totalPacksSavedAllTime?: number
  patientVolumeMonthly?: number
  dispensingSharePct?: number
  brandsStocked?: string[]
  activeLevers?: string[]
  lastVisitDate?: string
  lastRefillDate?: string
}

export interface Staff {
  id: string
  clinicId: string
  name: string
  role: string
  phone: string
  completedModules?: string[]
  points?: number
  refillsCompleted?: number
  isCertified?: boolean
  certifiedDate?: string
}

export interface Patient {
  id: string
  name: string
  phone: string
  email: string
  primaryClinicId: string
  activeSkuId: string
  enrolledAt: string
  enrolledDate?: string
  qrCodeValue: string
  refillStreak?: number
  packsSavedTotal?: number
  pointsBalance?: number
  usageDaysElapsed?: number
  usageCycleDays?: number
  lastRefillDate?: string
  loyaltyTier?: LoyaltyTier
}

export interface Sku {
  id: string
  name: string
  subtitle: string
  category: string
  volume: string
  fullPriceINR: number
  refillPriceINR: number
  doctorFullMarginPct: number
  doctorRefillMarginPct: number
  plasticWeightGrams: number
  co2FactorGrams: number
  usageCycleDays: number
  heroColor: string
}

export interface StockItem {
  id: string
  clinicId: string
  skuId: string
  fullPacksOnHand: number
  refillsOnHand: number
  minThreshold: number
  daysOfCover?: number
}

export interface RefillTransaction {
  id: string
  clinicId: string
  patientId: string
  skuId: string
  batchCode: string
  fullPriceINR: number
  refillPriceINR: number
  discountPct: number
  doctorMarginINR: number
  staffId: string
  paymentMode: 'upi' | 'cash' | 'card'
  timestamp: string
  status: 'completed' | 'voided'
  voidReason?: string
  fullPrice?: number
  refillPrice?: number
  doctorMargin?: number
  patientSavingsINR?: number
  staffName?: string
}

export interface ReturnedPack {
  id: string
  clinicId: string
  patientId: string
  skuId: string
  batchCode: string
  scannedAt: string
  verifiedChecks: {
    intact: boolean
    matchesRange: boolean
    batchLegible: boolean
    batchCodeReadable?: boolean
  }
}

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

export interface PickupTask {
  id: string
  clinicId: string
  packCount: number
  status: PickupStatus
  requestedAt: string
  scheduledDate?: string
  completedAt?: string
}

export interface TrainingProgress {
  id: string
  staffId: string
  moduleId: string
  completedAt: string
}

export interface QuizResult {
  id: string
  staffId: string
  moduleId: string
  score: number
  passed: boolean
  attemptedAt: string
}

export interface Certification {
  id: string
  staffId: string
  badgeName: string
  issuedAt: string
}

export interface LeverAssignment {
  clinicId: string
  leverId: string
  active: boolean
  updatedAt: string
}

export interface Task {
  id: string
  clinicId: string
  priority: TaskPriority
  title: string
  description: string
  triggerRule: 'stock_out' | 'dormant_streak' | 'bin_threshold' | 'untrained_staff' | 'high_void_rate' | 'champion_nomination' | 'negative_feedback'
  status: 'pending' | 'completed' | 'snoozed'
  dueDate: string
  createdAt: string
  completedAt?: string
  notes?: string
  clinicName?: string
  doctorName?: string
  locality?: string
}

export interface Visit {
  id: string
  repId: string
  clinicId: string
  date: string
  timeSlot: string
  type: 'routine' | 'urgent' | 'training' | 'onboarding'
  status: 'planned' | 'completed' | 'missed'
  notes?: string
  checklist: {
    task: string
    done: boolean
  }[]
  clinicName?: string
  doctorName?: string
}

export interface Feedback {
  id: string
  clinicId: string
  patientId: string
  rating: number // 1 to 5
  tags: string[]
  comments: string
  timestamp: string
}

export interface Notification {
  id: string
  targetRoles: PersonaRole[]
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  type: 'info' | 'success' | 'warning' | 'alert'
}

export interface AuditEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  performedByRole: PersonaRole
  timestamp: string
  details: string
}

export interface SavedScenario {
  id: string
  clinicId: string
  doctorId: string
  title: string
  inputs: Record<string, number>
  outputs: Record<string, number>
  savedAt: string
}

export interface EnrolmentRecord {
  id: string
  clinicId: string
  eSignature: string
  signedAt: string
  kitDelivered: boolean
  staffTrained: boolean
  counterInstalled: boolean
  firstRefillDone: boolean
  signagePlaced: boolean
  firstPickupDone: boolean
}

export interface Lever {
  id: string
  name: string
  category: string
  description: string
  mechanism?: string
  impact?: string
  targetArchetypes?: DoctorArchetype[]
  defaultActive: boolean
  costPerMonthINR?: number
  estimatedLiftPct?: number
  iconName?: string
}

export interface TrainingModule {
  id: string
  number: number
  title: string
  durationMinutes?: number
  durationMins?: number
  role?: 'receptionist' | 'dispenser' | 'doctor'
  summary: string
  keyLearnings?: string[]
  objectives?: string[]
  contentParagraphs?: string[]
  badgeName?: string
  quizQuestion?: {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }
  quizQuestions?: any[]
}

export interface ArchetypeDefinition {
  id?: DoctorArchetype
  type?: string
  name?: string
  title?: string
  tagline: string
  description: string
  coreMotivation?: string
  mainHesitation?: string
  pitchAngle?: string
  recommendedPitchAngle?: string
  recommendedLevers: string[]
  toneOfVoice?: string
  primaryMotivators?: string[]
  topObjections?: string[]
  radarWeights?: Record<string, number>
}

export interface Objection {
  id: string
  doctorArchetype?: DoctorArchetype
  category: string
  title?: string
  doctorSays?: string
  acknowledge?: string
  offer?: string
  quote?: string
  shortLabel?: string
  clinicalCounter?: string
  businessCounter?: string
  evidencePoint?: string
  evidence?: string
  recommendedAction?: string
}

export interface DoctorQuizQuestion {
  id: string
  module?: string
  question: string
  options: (string | { text: string; archetype?: string })[]
  correctIndex?: number
  explanation?: string
}
