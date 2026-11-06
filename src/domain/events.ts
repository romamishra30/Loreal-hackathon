import { DoctorArchetype, OrderStatus, PersonaRole, PickupStatus, TaskPriority } from './entities'
import { ProgramConfig } from './config'

export type DomainEventType =
  | 'REFILL_COMPLETED'
  | 'REFILL_VOIDED'
  | 'PACK_RETURNED'
  | 'DUPLICATE_PACK_BLOCKED'
  | 'STOCK_REQUESTED'
  | 'ORDER_STATUS_CHANGED'
  | 'PICKUP_REQUESTED'
  | 'PICKUP_COMPLETED'
  | 'TRAINING_MODULE_PASSED'
  | 'STAFF_CERTIFIED'
  | 'QUIZ_SUBMITTED'
  | 'ARCHETYPE_ASSIGNED'
  | 'CLINIC_ENROLLED'
  | 'VISIT_LOGGED'
  | 'VISIT_CHECKED_IN'
  | 'TASK_COMPLETED'
  | 'TASK_SNOOZED'
  | 'FEEDBACK_SUBMITTED'
  | 'LEVER_TOGGLED'
  | 'SCENARIO_SAVED'
  | 'CONFIG_UPDATED'

export interface DomainEvent<T = any> {
  id: string
  type: DomainEventType
  timestamp: string
  payload: T
  actorRole: PersonaRole
}

// Payload interfaces
export interface RefillCompletedPayload {
  transactionId: string
  clinicId: string
  patientId: string
  skuId: string
  batchCode: string
  fullPriceINR: number
  refillPriceINR: number
  doctorMarginINR: number
  discountPct: number
  staffId: string
  paymentMode: 'upi' | 'cash' | 'card'
}

export interface RefillVoidedPayload {
  transactionId: string
  clinicId: string
  skuId: string
  reason: string
}

export interface DuplicatePackBlockedPayload {
  clinicId: string
  batchCode: string
  patientId: string
}

export interface StockRequestedPayload {
  orderId: string
  clinicId: string
  skuId: string
  refillUnits: number
  fullPackUnits: number
}

export interface OrderStatusChangedPayload {
  orderId: string
  clinicId: string
  skuId: string
  newStatus: OrderStatus
  refillUnits: number
  fullPackUnits: number
}

export interface PickupRequestedPayload {
  taskId: string
  clinicId: string
  packCount: number
}

export interface PickupCompletedPayload {
  taskId: string
  clinicId: string
  packCount: number
}

export interface TrainingPassedPayload {
  progressId: string
  staffId: string
  clinicId: string
  moduleId: string
}

export interface StaffCertifiedPayload {
  certificationId: string
  staffId: string
  clinicId: string
  badgeName: string
}

export interface ArchetypeAssignedPayload {
  doctorId: string
  clinicId: string
  archetype: DoctorArchetype
}

export interface ClinicEnrolledPayload {
  clinicId: string
  clinicName: string
  doctorId: string
  doctorName: string
  doctorDegree: string
  address: string
  locality: string
  staffId: string
  staffName: string
  staffPhone: string
  staffPin: string
  territoryId: string
  eSignature: string
  initialRefillStock: number
}

export interface FeedbackSubmittedPayload {
  feedbackId: string
  clinicId: string
  patientId: string
  rating: number
  tags: string[]
  comments: string
}

export interface LeverToggledPayload {
  clinicId: string
  leverId: string
  active: boolean
}

export interface ScenarioSavedPayload {
  scenarioId: string
  clinicId: string
  doctorId: string
  title: string
  inputs: Record<string, number>
  outputs: Record<string, number>
}

