import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { formatISO, subDays } from 'date-fns'
import {
  Certification,
  Clinic,
  Doctor,
  DoctorArchetype,
  EnrolmentRecord,
  Feedback,
  Lever,
  LeverAssignment,
  OrderStatus,
  Patient,
  PersonaRole,
  PickupTask,
  QuizResult,
  RefillTransaction,
  ReplenishmentOrder,
  Rep,
  ReturnedPack,
  SavedScenario,
  Sku,
  Staff,
  StockItem,
  Task,
  Territory,
  TrainingProgress,
  Visit,
} from '../domain/entities'
import { INITIAL_CONFIG, ProgramConfig } from '../domain/config'
import i18n from '../i18n'
import { DomainEvent } from '../domain/events'
import {
  generateRawDataset,
  RawSeedDataset,
  SEED_ARCHETYPES,
  SEED_LEVERS,
  SEED_REPS,
  SEED_SKUS,
  SEED_TERRITORIES,
} from '../data/seed'
import { generateDynamicNotifications } from '../domain/selectors/notificationSelectors'
import { generateDynamicTasks } from '../domain/selectors/taskSelectors'
import { selectClinicAdoptionHealthScore, selectClinicBinCount, selectClinicPlasticKg } from '../domain/selectors/clinicSelectors'
import { selectTerritoryPlasticKg, selectTerritoryRefills30d } from '../domain/selectors/territorySelectors'

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

export interface AppState {
  // Session & Global Settings
  persona: PersonaRole
  selectedClinicId: string
  selectedPatientId: string
  selectedTerritoryId: string
  theme: 'light' | 'dark'
  language: 'en' | 'hi' | 'mr'
  isOnline: boolean
  offlineQueue: RefillTransaction[]
  activeTourStep: number | null

  // Program Config
  config: ProgramConfig

  // Event Log
  events: DomainEvent[]

  // Notification and Task ID tracking
  readNotificationIds: string[]
  completedTaskIds: string[]
  snoozedTaskIds: string[]

  // Domain Entities
  territories: Territory[]
  reps: Rep[]
  skus: Sku[]
  clinics: Clinic[]
  doctors: Doctor[]
  staff: Staff[]
  patients: Patient[]
  stocks: StockItem[]
  transactions: RefillTransaction[]
  returns: ReturnedPack[]
  orders: ReplenishmentOrder[]
  pickups: PickupTask[]
  leverAssignments: LeverAssignment[]
  visits: Visit[]
  feedback: Feedback[]
  enrolments: EnrolmentRecord[]
  trainingProgress: TrainingProgress[]
  quizResults: QuizResult[]
  certifications: Certification[]
  savedScenarios: SavedScenario[]
  copilotMessages: CopilotMessage[]

  // Legacy & Convenience aliases
  staffMembers: Staff[]
  stockItems: StockItem[]
  returnPacks: ReturnedPack[]
  replenishmentOrders: ReplenishmentOrder[]
  pickupTasks: PickupTask[]
  feedbacks: Feedback[]
  actionTasks: Task[]
  notifications: ReturnType<typeof generateDynamicNotifications>
  levers: Lever[]
  products: Sku[]

  // Session Actions
  setPersona: (role: PersonaRole) => void
  setSelectedClinicId: (id: string) => void
  setSelectedPatientId: (id: string) => void
  setSelectedTerritoryId: (id: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void
  setOnline: (online: boolean) => void

  // Tour
  startTour: () => void
  nextTourStep: () => void
  prevTourStep: () => void
  endTour: () => void

  // Event Dispatcher & Reducer
  dispatchEvent: (event: DomainEvent) => void
  applyEventLocally: (event: DomainEvent) => void
  updateConfig: (patch: Partial<ProgramConfig>) => void

  // Core Program Operations
  processRefill: (data: {
    clinicId: string
    patientId: string
    skuId: string
    batchCode: string
    paymentMode: 'upi' | 'cash' | 'card'
    verification?: { intact: boolean; matchesRange: boolean; batchLegible: boolean }
    staffPin?: string
  }) => { success: boolean; error?: string; transactionId?: string; message: string; transaction?: RefillTransaction }

  undoTransaction: (txId: string, reason?: string) => { success: boolean; message: string }
  syncOfflineQueue: () => void

  requestReplenishment: (clinicId: string, skuId: string, refillUnits: number, fullPackUnits: number) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  requestPickup: (clinicId: string) => void
  completePickup: (taskId: string) => void

  completeTrainingModule: (staffId: string, moduleId: string) => void
  toggleLeverForClinic: (clinicId: string, leverId: string) => void

  completeTask: (taskId: string) => void
  snoozeTask: (taskId: string) => void
  createVisit: (visit: Omit<Visit, 'id'>) => void
  completeVisit: (visitId: string, notes: string) => void

  addPatientFeedback: (fb: Omit<Feedback, 'id' | 'timestamp'>) => void
  markNotificationRead: (notifId: string) => void
  clearAllNotifications: () => void

  assignArchetype: (doctorId: string, clinicId: string, archetype: DoctorArchetype) => void
  enrollClinic: (payload: {
    clinicName: string
    doctorName: string
    doctorDegree: string
    address: string
    locality: string
    staffName: string
    staffPhone: string
    staffPin: string
    territoryId: string
    eSignature: string
    initialRefillStock: number
  }) => Clinic

  saveScenario: (scenario: Omit<SavedScenario, 'id' | 'savedAt'>) => void

  // AI Copilot
  sendCopilotMessage: (userText: string) => void

  // Reset & Persistence
  reseedData: (seed?: number) => void
  resetDemoData: () => void
  exportStateJson: () => string
  importStateJson: (json: string) => boolean
}

const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('refillrx-sync')
  : null

function buildInitialEntities(seed: number = 20260315): RawSeedDataset {
  return generateRawDataset(seed)
}

const initialSeed = buildInitialEntities(20260315)

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      // Setup broadcast listener
      if (syncChannel) {
        syncChannel.onmessage = (ev) => {
          if (ev.data && ev.data.type === 'DOMAIN_EVENT') {
            get().applyEventLocally(ev.data.event)
          }
        }
      }

      return {
        // Session
        persona: 'rep',
        selectedClinicId: initialSeed.clinics[0]?.id || 'clinic-terr-mumbai-thane-1',
        selectedPatientId: initialSeed.patients[0]?.id || 'pat-1',
        selectedTerritoryId: 'terr-mumbai-thane',
        theme: 'light',
        language: 'en',
        isOnline: true,
        offlineQueue: [],
        activeTourStep: null,

        // Config & Event Log
        config: INITIAL_CONFIG,
        events: [],
        readNotificationIds: [],
        completedTaskIds: [],
        snoozedTaskIds: [],

        // Entities
        territories: SEED_TERRITORIES,
        reps: SEED_REPS,
        skus: SEED_SKUS,
        clinics: initialSeed.clinics,
        doctors: initialSeed.doctors,
        staff: initialSeed.staff,
        patients: initialSeed.patients,
        stocks: initialSeed.stocks,
        transactions: initialSeed.transactions,
        returns: initialSeed.returns,
        orders: initialSeed.orders,
        pickups: initialSeed.pickups,
        leverAssignments: initialSeed.leverAssignments,
        visits: initialSeed.visits,
        feedback: initialSeed.feedback,
        enrolments: initialSeed.enrolments,
        trainingProgress: initialSeed.trainingProgress,
        quizResults: initialSeed.quizResults,
        certifications: initialSeed.certifications,
        savedScenarios: [],

        // Copilot
        copilotMessages: [
          {
            id: 'copilot-intro',
            sender: 'assistant',
            text: 'Hello! I am RefillRx Copilot. Ask me about clinic health scores, objection responses, revenue projections, or draft WhatsApp messages for your doctors.',
            timestamp: new Date().toISOString(),
            suggestedPrompts: [
              'Which clinics are at risk this week?',
              'Draft WhatsApp reminder to Dr. Mehta',
              'What should I say if doctor says staff are busy?',
              'How much plastic did Mumbai-Thane save?',
            ],
          },
        ],

        // Computed Convenience Aliases
        get staffMembers() {
          return get().staff
        },
        get stockItems() {
          return get().stocks
        },
        get returnPacks() {
          return get().returns
        },
        get replenishmentOrders() {
          return get().orders
        },
        get pickupTasks() {
          return get().pickups
        },
        get feedbacks() {
          return get().feedback
        },
        get actionTasks() {
          const s = get()
          return generateDynamicTasks(
            s.clinics,
            s.doctors,
            s.transactions,
            s.stocks,
            s.returns,
            s.pickups,
            s.feedback,
            s.config,
            new Set(s.completedTaskIds),
            new Set(s.snoozedTaskIds)
          )
        },
        get notifications() {
          const s = get()
          return generateDynamicNotifications(
            s.clinics,
            s.doctors,
            s.transactions,
            s.stocks,
            s.returns,
            s.pickups,
            s.orders,
            s.feedback,
            s.config,
            s.persona,
            new Set(s.readNotificationIds)
          )
        },
        get levers() {
          return SEED_LEVERS
        },
        get products() {
          return SEED_SKUS
        },

        // Session Actions
        setPersona: (role) => set({ persona: role }),
        setSelectedClinicId: (id) => set({ selectedClinicId: id }),
        setSelectedPatientId: (id) => set({ selectedPatientId: id }),
        setSelectedTerritoryId: (id) => set({ selectedTerritoryId: id }),
        setTheme: (theme) => {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          set({ theme })
        },
        toggleTheme: () => {
          const next = get().theme === 'light' ? 'dark' : 'light'
          get().setTheme(next)
        },
        setLanguage: (lang) => {
          if (typeof document !== 'undefined') {
            document.documentElement.lang = lang
          }
          i18n.changeLanguage(lang)
          set({ language: lang })
        },
        setOnline: (online) => {
          set({ isOnline: online })
          if (online) {
            get().syncOfflineQueue()
          }
        },

        // Tour
        startTour: () => set({ activeTourStep: 0 }),
        nextTourStep: () => {
          const cur = get().activeTourStep
          if (cur !== null && cur < 6) {
            set({ activeTourStep: cur + 1 })
          } else {
            set({ activeTourStep: null })
          }
        },
        prevTourStep: () => {
          const cur = get().activeTourStep
          if (cur !== null && cur > 0) {
            set({ activeTourStep: cur - 1 })
          }
        },
        endTour: () => set({ activeTourStep: null }),

        // Reducer applied locally
        applyEventLocally: (event: DomainEvent) => {
          const state = get()
          const newEvents = [event, ...state.events]

          switch (event.type) {
            case 'REFILL_COMPLETED': {
              const p = event.payload
              const newTx: RefillTransaction = {
                id: p.transactionId,
                clinicId: p.clinicId,
                patientId: p.patientId,
                skuId: p.skuId,
                batchCode: p.batchCode,
                fullPriceINR: p.fullPriceINR,
                refillPriceINR: p.refillPriceINR,
                fullPrice: p.fullPriceINR,
                refillPrice: p.refillPriceINR,
                discountPct: p.discountPct,
                doctorMarginINR: p.doctorMarginINR,
                doctorMargin: p.doctorMarginINR,
                staffId: p.staffId,
                staffName: 'Lead Dispenser',
                paymentMode: p.paymentMode,
                timestamp: event.timestamp,
                status: 'completed',
              }

              const newReturn: ReturnedPack = {
                id: `ret-${p.transactionId}`,
                clinicId: p.clinicId,
                patientId: p.patientId,
                skuId: p.skuId,
                batchCode: p.batchCode,
                scannedAt: event.timestamp,
                verifiedChecks: { intact: true, matchesRange: true, batchLegible: true, batchCodeReadable: true },
              }

              // Decrement stock
              const updatedStocks = state.stocks.map((st) => {
                if (st.clinicId === p.clinicId && st.skuId === p.skuId) {
                  return { ...st, refillsOnHand: Math.max(0, st.refillsOnHand - 1) }
                }
                return st
              })

              // Update patient streak
              const updatedPatients = state.patients.map((pat) => {
                if (pat.id === p.patientId) {
                  const newStreak = (pat.refillStreak || 0) + 1
                  let tier: 'starter' | 'green' | 'gold' = 'starter'
                  if (newStreak >= 5) tier = 'gold'
                  else if (newStreak >= 2) tier = 'green'
                  return {
                    ...pat,
                    refillStreak: newStreak,
                    loyaltyTier: tier,
                    packsSavedTotal: (pat.packsSavedTotal || 0) + 1,
                    pointsBalance: (pat.pointsBalance || 0) + 100,
                    lastRefillDate: event.timestamp,
                  }
                }
                return pat
              })

              const newTransactions = [newTx, ...state.transactions]
              const newReturns = [newReturn, ...state.returns]
              const newBinCount = selectClinicBinCount(newReturns, state.pickups, p.clinicId)
              const threshold = state.config.returnsBinThreshold || 20
              const hasOpenPickup = state.pickups.some(
                (pk) => pk.clinicId === p.clinicId && pk.status !== 'recycled'
              )
              let updatedPickups = state.pickups
              if (newBinCount >= threshold && !hasOpenPickup) {
                const autoPickup: PickupTask = {
                  id: `pickup-auto-${p.clinicId}-${Date.now()}`,
                  clinicId: p.clinicId,
                  packCount: newBinCount,
                  status: 'requested',
                  requestedAt: event.timestamp,
                  scheduledDate: formatISO(subDays(new Date(), -1)),
                }
                updatedPickups = [autoPickup, ...state.pickups]
              }

              const updatedClinics = state.clinics.map((c) => {
                if (c.id === p.clinicId) {
                  return {
                    ...c,
                    binCount: newBinCount,
                    totalRefillsAllTime: (c.totalRefillsAllTime || 0) + 1,
                    totalPacksSavedAllTime: (c.totalPacksSavedAllTime || 0) + 1,
                    lastRefillDate: event.timestamp,
                  }
                }
                return c
              })

              const dynamicNotifs = generateDynamicNotifications(
                updatedClinics,
                state.doctors,
                newTransactions,
                updatedStocks,
                newReturns,
                updatedPickups,
                state.orders,
                state.feedback,
                state.config,
                state.persona,
                new Set(state.readNotificationIds)
              )

              const dynamicTasks = generateDynamicTasks(
                updatedClinics,
                state.doctors,
                newTransactions,
                updatedStocks,
                newReturns,
                updatedPickups,
                state.feedback,
                state.config,
                new Set(state.completedTaskIds),
                new Set(state.snoozedTaskIds)
              )

              set({
                events: newEvents,
                transactions: newTransactions,
                returns: newReturns,
                returnPacks: newReturns,
                stocks: updatedStocks,
                stockItems: updatedStocks,
                patients: updatedPatients,
                clinics: updatedClinics,
                pickups: updatedPickups,
                pickupTasks: updatedPickups,
                notifications: dynamicNotifs,
                actionTasks: dynamicTasks,
              })
              break
            }

            case 'REFILL_VOIDED': {
              const { transactionId, clinicId, skuId, reason } = event.payload
              const updatedTxs = state.transactions.map((tx) =>
                tx.id === transactionId ? { ...tx, status: 'voided' as const, voidReason: reason } : tx
              )

              // Restore stock
              const restoredStocks = state.stocks.map((st) => {
                if (st.clinicId === clinicId && st.skuId === skuId) {
                  return { ...st, refillsOnHand: st.refillsOnHand + 1 }
                }
                return st
              })

              const revertedClinics = state.clinics.map((c) => {
                if (c.id === clinicId) {
                  return {
                    ...c,
                    binCount: Math.max(0, (c.binCount || 1) - 1),
                    totalRefillsAllTime: Math.max(0, (c.totalRefillsAllTime || 1) - 1),
                  }
                }
                return c
              })

              set({
                events: newEvents,
                transactions: updatedTxs,
                stocks: restoredStocks,
                stockItems: restoredStocks,
                clinics: revertedClinics,
              })
              break
            }

            case 'STOCK_REQUESTED': {
              const { orderId, clinicId, skuId, refillUnits, fullPackUnits } = event.payload
              const newOrder: ReplenishmentOrder = {
                id: orderId,
                clinicId,
                skuId,
                refillUnits,
                fullPackUnits,
                status: 'requested',
                requestedAt: event.timestamp,
                updatedAt: event.timestamp,
                trackingNote: 'Order submitted to Medical Distributor',
              }
              set({
                events: newEvents,
                orders: [newOrder, ...state.orders],
              })
              break
            }

            case 'ORDER_STATUS_CHANGED': {
              const { orderId, clinicId, skuId, newStatus, refillUnits, fullPackUnits } = event.payload
              const updatedOrders = state.orders.map((ord) =>
                ord.id === orderId ? { ...ord, status: newStatus, updatedAt: event.timestamp } : ord
              )

              let updatedStocks = state.stocks
              if (newStatus === 'delivered') {
                updatedStocks = state.stocks.map((st) => {
                  if (st.clinicId === clinicId && st.skuId === skuId) {
                    return {
                      ...st,
                      refillsOnHand: st.refillsOnHand + refillUnits,
                      fullPacksOnHand: st.fullPacksOnHand + fullPackUnits,
                    }
                  }
                  return st
                })
              }

              set({
                events: newEvents,
                orders: updatedOrders,
                stocks: updatedStocks,
              })
              break
            }

            case 'PICKUP_REQUESTED': {
              const { taskId, clinicId, packCount } = event.payload
              const newTask: PickupTask = {
                id: taskId,
                clinicId,
                packCount,
                status: 'requested',
                requestedAt: event.timestamp,
                scheduledDate: formatISO(subDays(new Date(), -1)),
              }
              set({
                events: newEvents,
                pickups: [newTask, ...state.pickups],
              })
              break
            }

            case 'PICKUP_COMPLETED': {
              const { taskId } = event.payload
              const targetPickup = state.pickups.find((pk) => pk.id === taskId)
              const completedTime = event.timestamp
              const updatedPickups = state.pickups.map((pk) =>
                pk.id === taskId ? { ...pk, status: 'recycled' as const, completedAt: completedTime } : pk
              )
              const clinicId = targetPickup?.clinicId
              const packCount = targetPickup?.packCount || 20

              const updatedClinics = state.clinics.map((c) => {
                if (clinicId && c.id === clinicId) {
                  return {
                    ...c,
                    binCount: 0,
                    totalPacksSavedAllTime: (c.totalPacksSavedAllTime || 0) + packCount,
                  }
                }
                return c
              })

              const completedTaskIds = clinicId
                ? Array.from(new Set([...state.completedTaskIds, `task-bin-${clinicId}`]))
                : state.completedTaskIds

              const dynamicNotifs = generateDynamicNotifications(
                updatedClinics,
                state.doctors,
                state.transactions,
                state.stocks,
                state.returns,
                updatedPickups,
                state.orders,
                state.feedback,
                state.config,
                state.persona,
                new Set(state.readNotificationIds)
              )

              const dynamicTasks = generateDynamicTasks(
                updatedClinics,
                state.doctors,
                state.transactions,
                state.stocks,
                state.returns,
                updatedPickups,
                state.feedback,
                state.config,
                new Set(completedTaskIds),
                new Set(state.snoozedTaskIds)
              )

              set({
                events: newEvents,
                pickups: updatedPickups,
                pickupTasks: updatedPickups,
                clinics: updatedClinics,
                completedTaskIds,
                notifications: dynamicNotifs,
                actionTasks: dynamicTasks,
              })
              break
            }

            case 'TRAINING_MODULE_PASSED': {
              const { progressId, staffId, moduleId } = event.payload
              const newProgress: TrainingProgress = {
                id: progressId,
                staffId,
                moduleId,
                completedAt: event.timestamp,
              }
              const newQuiz: QuizResult = {
                id: `qr-${progressId}`,
                staffId,
                moduleId,
                score: 100,
                passed: true,
                attemptedAt: event.timestamp,
              }

              const updatedStaff = state.staff.map((st) => {
                if (st.id === staffId) {
                  const mods = Array.from(new Set([...(st.completedModules || []), moduleId]))
                  return {
                    ...st,
                    completedModules: mods,
                    points: (st.points || 0) + 50,
                  }
                }
                return st
              })

              set({
                events: newEvents,
                trainingProgress: [...state.trainingProgress, newProgress],
                quizResults: [...state.quizResults, newQuiz],
                staff: updatedStaff,
              })
              break
            }

            case 'STAFF_CERTIFIED': {
              const { certificationId, staffId, badgeName } = event.payload
              const newCert: Certification = {
                id: certificationId,
                staffId,
                badgeName,
                issuedAt: event.timestamp,
              }
              const updatedStaff = state.staff.map((st) => {
                if (st.id === staffId) {
                  return {
                    ...st,
                    isCertified: true,
                    certifiedDate: event.timestamp,
                    points: (st.points || 0) + 150,
                  }
                }
                return st
              })

              set({
                events: newEvents,
                certifications: [...state.certifications, newCert],
                staff: updatedStaff,
              })
              break
            }

            case 'ARCHETYPE_ASSIGNED': {
              const { doctorId, clinicId, archetype } = event.payload
              const updatedDoctors = state.doctors.map((d) => (d.id === doctorId ? { ...d, archetype } : d))
              const updatedClinics = state.clinics.map((c) =>
                c.doctorId === doctorId || (clinicId && c.id === clinicId) ? { ...c, archetype } : c
              )

              set({
                events: newEvents,
                doctors: updatedDoctors,
                clinics: updatedClinics,
              })
              break
            }

            case 'CLINIC_ENROLLED': {
              const p = event.payload
              const newClinic: Clinic = {
                id: p.clinicId,
                name: p.clinicName,
                doctorId: p.doctorId,
                territoryId: p.territoryId,
                address: p.address,
                locality: p.locality,
                lat: 19.1982 + (Math.random() - 0.5) * 0.05,
                lng: 72.9644 + (Math.random() - 0.5) * 0.05,
                counterPin: p.staffPin || '1234',
                enrolledAt: event.timestamp,
                doctorName: p.doctorName,
                doctorDegree: p.doctorDegree,
                archetype: 'clinician_first',
                patientVolumeMonthly: 420,
                dispensingSharePct: 60,
                brandsStocked: ['RefillRx Range', 'Avene', 'Cetaphil'],
              }

              const newDoctor: Doctor = {
                id: p.doctorId,
                name: p.doctorName,
                degree: p.doctorDegree,
                phone: '+91 98200 99110',
                email: `${p.doctorName.toLowerCase().replace(/[^a-z]/g, '')}@clinic.in`,
                archetype: 'clinician_first',
                primaryClinicId: p.clinicId,
              }

              const newStaffMember: Staff = {
                id: p.staffId,
                clinicId: p.clinicId,
                name: p.staffName,
                role: 'Lead Dispenser',
                phone: p.staffPhone,
                completedModules: ['mod-1'],
                isCertified: false,
                points: 50,
                refillsCompleted: 0,
              }

              const newStocks: StockItem[] = SEED_SKUS.map((sku) => ({
                id: `stock-${p.clinicId}-${sku.id}`,
                clinicId: p.clinicId,
                skuId: sku.id,
                fullPacksOnHand: 10,
                refillsOnHand: p.initialRefillStock || 15,
                minThreshold: 5,
              }))

              const newLevers: LeverAssignment[] = SEED_LEVERS.map((lev) => ({
                clinicId: p.clinicId,
                leverId: lev.id,
                active: lev.defaultActive,
                updatedAt: event.timestamp,
              }))

              const newEnrolment: EnrolmentRecord = {
                id: `enrol-${p.clinicId}`,
                clinicId: p.clinicId,
                eSignature: p.eSignature,
                signedAt: event.timestamp,
                kitDelivered: true,
                staffTrained: false,
                counterInstalled: true,
                firstRefillDone: false,
                signagePlaced: true,
                firstPickupDone: false,
              }

              set({
                events: newEvents,
                clinics: [newClinic, ...state.clinics],
                doctors: [newDoctor, ...state.doctors],
                staff: [newStaffMember, ...state.staff],
                staffMembers: [newStaffMember, ...state.staffMembers],
                stocks: [...newStocks, ...state.stocks],
                stockItems: [...newStocks, ...state.stockItems],
                leverAssignments: [...newLevers, ...state.leverAssignments],
                enrolments: [newEnrolment, ...state.enrolments],
                selectedClinicId: newClinic.id,
              })
              break
            }

            case 'FEEDBACK_SUBMITTED': {
              const p = event.payload
              const newFb: Feedback = {
                id: p.feedbackId,
                clinicId: p.clinicId,
                patientId: p.patientId,
                rating: p.rating,
                tags: p.tags,
                comments: p.comments,
                timestamp: event.timestamp,
              }
              set({
                events: newEvents,
                feedback: [newFb, ...state.feedback],
              })
              break
            }

            case 'LEVER_TOGGLED': {
              const { clinicId, leverId, active } = event.payload
              const existingIdx = state.leverAssignments.findIndex(
                (la) => la.clinicId === clinicId && la.leverId === leverId
              )
              let updatedAssignments: LeverAssignment[]

              if (existingIdx >= 0) {
                updatedAssignments = state.leverAssignments.map((la, idx) =>
                  idx === existingIdx ? { ...la, active, updatedAt: event.timestamp } : la
                )
              } else {
                updatedAssignments = [
                  ...state.leverAssignments,
                  { clinicId, leverId, active, updatedAt: event.timestamp },
                ]
              }

              set({
                events: newEvents,
                leverAssignments: updatedAssignments,
              })
              break
            }

            case 'CONFIG_UPDATED': {
              set({
                events: newEvents,
                config: { ...state.config, ...event.payload },
              })
              break
            }

            default:
              set({ events: newEvents })
              break
          }
        },

        // Event Dispatcher: persists locally + broadcasts
        dispatchEvent: (event: DomainEvent) => {
          get().applyEventLocally(event)
          if (syncChannel) {
            syncChannel.postMessage({ type: 'DOMAIN_EVENT', event })
          }
        },

        updateConfig: (patch) => {
          const event: DomainEvent = {
            id: `evt-cfg-${Date.now()}`,
            type: 'CONFIG_UPDATED',
            timestamp: formatISO(new Date()),
            payload: patch,
            actorRole: get().persona,
          }
          get().dispatchEvent(event)
        },

        // Core Refill Process
        processRefill: ({ clinicId, patientId, skuId, batchCode, paymentMode }) => {
          const state = get()
          const cleanBatch = batchCode.trim().toUpperCase()

          // Anti-Fraud: duplicate batch check
          const isDuplicate = state.returns.some(
            (r) => r.batchCode.trim().toUpperCase() === cleanBatch
          )

          if (isDuplicate) {
            const blockedEvent: DomainEvent = {
              id: `evt-blk-${Date.now()}`,
              type: 'DUPLICATE_PACK_BLOCKED',
              timestamp: formatISO(new Date()),
              payload: { clinicId, batchCode: cleanBatch, patientId },
              actorRole: state.persona,
            }
            get().dispatchEvent(blockedEvent)

            return {
              success: false,
              error: `FRAUD ALERT: Batch code ${cleanBatch} has already been returned to the system! Duplicate return rejected.`,
              message: `FRAUD ALERT: Batch code ${cleanBatch} has already been returned to the system! Please verify physical container integrity.`,
            }
          }

          const sku = SEED_SKUS.find((s) => s.id === skuId) || SEED_SKUS[0]
          const fullPriceINR = sku.fullPriceINR
          const refillPriceINR = sku.refillPriceINR
          const discountPct = Math.round(((fullPriceINR - refillPriceINR) / fullPriceINR) * 100)
          const doctorMarginINR = Math.round(refillPriceINR * sku.doctorRefillMarginPct)
          const staffMember = state.staff.find((s) => s.clinicId === clinicId) || state.staff[0]

          const txId = `tx-${Date.now()}`

          if (!state.isOnline) {
            const offlineTx: RefillTransaction = {
              id: txId,
              clinicId,
              patientId,
              skuId,
              batchCode: cleanBatch,
              fullPriceINR,
              refillPriceINR,
              fullPrice: fullPriceINR,
              refillPrice: refillPriceINR,
              discountPct,
              doctorMarginINR,
              doctorMargin: doctorMarginINR,
              staffId: staffMember.id,
              staffName: staffMember.name,
              paymentMode,
              timestamp: formatISO(new Date()),
              status: 'completed',
            }
            set({ offlineQueue: [offlineTx, ...state.offlineQueue] })
            return {
              success: true,
              message: 'Refill saved to offline queue. Will synchronize when online.',
              transaction: offlineTx,
            }
          }

          const refillEvent: DomainEvent = {
            id: `evt-tx-${Date.now()}`,
            type: 'REFILL_COMPLETED',
            timestamp: formatISO(new Date()),
            payload: {
              transactionId: txId,
              clinicId,
              patientId,
              skuId,
              batchCode: cleanBatch,
              fullPriceINR,
              refillPriceINR,
              doctorMarginINR,
              discountPct,
              staffId: staffMember.id,
              paymentMode,
            },
            actorRole: state.persona,
          }

          get().dispatchEvent(refillEvent)

          const createdTx = get().transactions.find((t) => t.id === txId)
          return {
            success: true,
            transactionId: txId,
            message: `Refill confirmed! Dispensed ${sku.name} for ₹${refillPriceINR} (${discountPct}% discount).`,
            transaction: createdTx,
          }
        },

        undoTransaction: (txId, reason = 'Operator cancellation / typo') => {
          const state = get()
          const tx = state.transactions.find((t) => t.id === txId)
          if (!tx) return { success: false, message: 'Transaction not found' }
          if (tx.status === 'voided') return { success: false, message: 'Transaction already voided' }

          const voidEvent: DomainEvent = {
            id: `evt-void-${Date.now()}`,
            type: 'REFILL_VOIDED',
            timestamp: formatISO(new Date()),
            payload: {
              transactionId: txId,
              clinicId: tx.clinicId,
              skuId: tx.skuId,
              reason,
            },
            actorRole: state.persona,
          }

          get().dispatchEvent(voidEvent)
          return { success: true, message: 'Transaction successfully voided and inventory restored.' }
        },

        syncOfflineQueue: () => {
          const state = get()
          if (state.offlineQueue.length === 0) return

          state.offlineQueue.forEach((tx) => {
            const event: DomainEvent = {
              id: `evt-sync-${Date.now()}-${Math.random()}`,
              type: 'REFILL_COMPLETED',
              timestamp: tx.timestamp,
              payload: {
                transactionId: tx.id,
                clinicId: tx.clinicId,
                patientId: tx.patientId,
                skuId: tx.skuId,
                batchCode: tx.batchCode,
                fullPriceINR: tx.fullPriceINR,
                refillPriceINR: tx.refillPriceINR,
                doctorMarginINR: tx.doctorMarginINR,
                discountPct: tx.discountPct,
                staffId: tx.staffId,
                paymentMode: tx.paymentMode,
              },
              actorRole: state.persona,
            }
            get().dispatchEvent(event)
          })

          set({ offlineQueue: [] })
        },

        requestReplenishment: (clinicId, skuId, refillUnits, fullPackUnits) => {
          const event: DomainEvent = {
            id: `evt-ord-${Date.now()}`,
            type: 'STOCK_REQUESTED',
            timestamp: formatISO(new Date()),
            payload: {
              orderId: `ord-${Date.now()}`,
              clinicId,
              skuId,
              refillUnits,
              fullPackUnits,
            },
            actorRole: get().persona,
          }
          get().dispatchEvent(event)
        },

        updateOrderStatus: (orderId, status) => {
          const state = get()
          const ord = state.orders.find((o) => o.id === orderId)
          if (!ord) return

          const event: DomainEvent = {
            id: `evt-ordstat-${Date.now()}`,
            type: 'ORDER_STATUS_CHANGED',
            timestamp: formatISO(new Date()),
            payload: {
              orderId,
              clinicId: ord.clinicId,
              skuId: ord.skuId,
              newStatus: status,
              refillUnits: ord.refillUnits,
              fullPackUnits: ord.fullPackUnits,
            },
            actorRole: state.persona,
          }
          get().dispatchEvent(event)
        },

        requestPickup: (clinicId) => {
          const state = get()
          const binCount = selectClinicBinCount(state.returns, state.pickups, clinicId)

          const event: DomainEvent = {
            id: `evt-pku-${Date.now()}`,
            type: 'PICKUP_REQUESTED',
            timestamp: formatISO(new Date()),
            payload: {
              taskId: `pickup-${Date.now()}`,
              clinicId,
              packCount: Math.max(binCount, 20),
            },
            actorRole: state.persona,
          }
          get().dispatchEvent(event)
        },

        completePickup: (taskId) => {
          const state = get()
          const task = state.pickups.find((p) => p.id === taskId)
          if (!task) return

          const event: DomainEvent = {
            id: `evt-pkdone-${Date.now()}`,
            type: 'PICKUP_COMPLETED',
            timestamp: formatISO(new Date()),
            payload: {
              taskId,
              clinicId: task.clinicId,
              packCount: task.packCount,
            },
            actorRole: state.persona,
          }
          get().dispatchEvent(event)
        },

        completeTrainingModule: (staffId, moduleId) => {
          const state = get()
          const event: DomainEvent = {
            id: `evt-tr-${Date.now()}`,
            type: 'TRAINING_MODULE_PASSED',
            timestamp: formatISO(new Date()),
            payload: {
              progressId: `tp-${Date.now()}`,
              staffId,
              clinicId: state.selectedClinicId,
              moduleId,
            },
            actorRole: state.persona,
          }
          get().dispatchEvent(event)

          // Check if all 6 modules passed
          const staffMember = state.staff.find((s) => s.id === staffId)
          const completed = staffMember?.completedModules || []
          if (completed.length >= 5) {
            // After this module, it reaches 6
            const certEvent: DomainEvent = {
              id: `evt-cert-${Date.now()}`,
              type: 'STAFF_CERTIFIED',
              timestamp: formatISO(new Date()),
              payload: {
                certificationId: `cert-${Date.now()}`,
                staffId,
                clinicId: state.selectedClinicId,
                badgeName: 'Certified Refill Dispenser',
              },
              actorRole: state.persona,
            }
            get().dispatchEvent(certEvent)
          }
        },

        toggleLeverForClinic: (clinicId, leverId) => {
          const state = get()
          const current = state.leverAssignments.find(
            (la) => la.clinicId === clinicId && la.leverId === leverId
          )
          const newActive = current ? !current.active : true

          const event: DomainEvent = {
            id: `evt-lev-${Date.now()}`,
            type: 'LEVER_TOGGLED',
            timestamp: formatISO(new Date()),
            payload: {
              clinicId,
              leverId,
              active: newActive,
            },
            actorRole: state.persona,
          }
          get().dispatchEvent(event)
        },

        completeTask: (taskId) => {
          set({
            completedTaskIds: Array.from(new Set([...get().completedTaskIds, taskId])),
          })
        },

        snoozeTask: (taskId) => {
          set({
            snoozedTaskIds: Array.from(new Set([...get().snoozedTaskIds, taskId])),
          })
        },

        createVisit: (visitData) => {
          const newVisit: Visit = {
            ...visitData,
            id: `visit-${Date.now()}`,
          }
          set({ visits: [newVisit, ...get().visits] })
        },

        completeVisit: (visitId, notes) => {
          const updatedVisits = get().visits.map((v) =>
            v.id === visitId ? { ...v, status: 'completed' as const, notes } : v
          )
          set({ visits: updatedVisits })
        },

        addPatientFeedback: (fb) => {
          const event: DomainEvent = {
            id: `evt-fb-${Date.now()}`,
            type: 'FEEDBACK_SUBMITTED',
            timestamp: formatISO(new Date()),
            payload: {
              feedbackId: `fb-${Date.now()}`,
              clinicId: fb.clinicId,
              patientId: fb.patientId,
              rating: fb.rating,
              tags: fb.tags,
              comments: fb.comments,
            },
            actorRole: get().persona,
          }
          get().dispatchEvent(event)
        },

        markNotificationRead: (notifId) => {
          set({
            readNotificationIds: Array.from(new Set([...get().readNotificationIds, notifId])),
          })
        },

        clearAllNotifications: () => {
          const allIds = get().notifications.map((n) => n.id)
          set({ readNotificationIds: allIds })
        },

        assignArchetype: (doctorId, clinicId, archetype) => {
          const event: DomainEvent = {
            id: `evt-arch-${Date.now()}`,
            type: 'ARCHETYPE_ASSIGNED',
            timestamp: formatISO(new Date()),
            payload: { doctorId, clinicId, archetype },
            actorRole: get().persona,
          }
          get().dispatchEvent(event)
        },

        enrollClinic: (payload) => {
          const clinicId = `clinic-custom-${Date.now()}`
          const doctorId = `doc-custom-${Date.now()}`
          const staffId = `staff-custom-${Date.now()}`

          const event: DomainEvent = {
            id: `evt-enrol-${Date.now()}`,
            type: 'CLINIC_ENROLLED',
            timestamp: formatISO(new Date()),
            payload: {
              clinicId,
              clinicName: payload.clinicName,
              doctorId,
              doctorName: payload.doctorName,
              doctorDegree: payload.doctorDegree,
              address: payload.address,
              locality: payload.locality,
              staffId,
              staffName: payload.staffName,
              staffPhone: payload.staffPhone,
              staffPin: payload.staffPin,
              territoryId: payload.territoryId,
              eSignature: payload.eSignature,
              initialRefillStock: payload.initialRefillStock,
            },
            actorRole: get().persona,
          }

          get().dispatchEvent(event)
          return get().clinics.find((c) => c.id === clinicId)!
        },

        saveScenario: (scenarioData) => {
          const newScenario: SavedScenario = {
            ...scenarioData,
            id: `scen-${Date.now()}`,
            savedAt: formatISO(new Date()),
          }
          set({ savedScenarios: [newScenario, ...get().savedScenarios] })
        },

        sendCopilotMessage: (userText) => {
          const state = get()
          const lower = userText.toLowerCase()
          const userMsg: CopilotMessage = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: userText,
            timestamp: new Date().toISOString(),
          }

          let replyText =
            "I'm your RefillRx strategic assistant. You can ask me to analyze clinics, calculate economics, review objections, or track plastic diversion."
          let suggestedPrompts = [
            'Which clinics are at risk this week?',
            'What should I say if doctor says staff are busy?',
            'How much plastic did Mumbai-Thane save?',
          ]
          let links: { label: string; path: string }[] | undefined

          if (lower.includes('at risk') || lower.includes('risk') || lower.includes('dormant')) {
            const clinicsWithHealth = state.clinics
              .filter((c) => c.territoryId === state.selectedTerritoryId)
              .map((c) => ({
                clinic: c,
                score: selectClinicAdoptionHealthScore(
                  c.id,
                  state.transactions,
                  state.stocks,
                  state.staff,
                  state.trainingProgress,
                  state.config
                ),
              }))
              .filter((item) => item.score.status === 'at_risk' || item.score.status === 'dormant')

            if (clinicsWithHealth.length > 0) {
              const top = clinicsWithHealth.slice(0, 3)
              const listStr = top
                .map(
                  (item, i) =>
                    `${i + 1}. **${item.clinic.name}** (${item.clinic.doctorName}): Health score ${item.score.score}/100. Status: ${item.score.status.toUpperCase()}.`
                )
                .join('\n')

              replyText = `There are currently **${clinicsWithHealth.length} clinics** requiring immediate attention in the selected territory.\n\n${listStr}\n\nRecommended action: Schedule an in-person coaching visit and ensure staff micro-training modules are completed.`
            } else {
              replyText = `Great news! All clinics in the territory are performing on track or at champion tier.`
            }
            suggestedPrompts = ['Draft visit agenda for at-risk clinics', 'View Action Centre tasks']
            links = [{ label: 'Open Territory Action Centre', path: '/territory' }]
          } else if (lower.includes('whatsapp') || lower.includes('draft') || lower.includes('doctor') || lower.includes('mehta')) {
            const targetClinic = state.clinics.find((c) => c.id === state.selectedClinicId) || state.clinics[0]
            const plasticKg = selectClinicPlasticKg(state.transactions, state.skus, targetClinic.id)
            const marginINR = state.transactions
              .filter((t) => t.clinicId === targetClinic.id && t.status === 'completed')
              .reduce((s, t) => s + t.doctorMarginINR, 0)
            const rep = state.reps.find((r) => r.territoryId === targetClinic.territoryId) || state.reps[0]

            replyText = `Here is a tailored WhatsApp draft for **${targetClinic.doctorName}** (${targetClinic.name}):\n\n"Dear ${targetClinic.doctorName}, warm greetings from the Medical Brand Team! Your practice has now diverted ${plasticKg} kg of virgin medical packaging through the RefillRx program. Your patients have earned ₹${marginINR.toLocaleString('en-IN')} in repeat refill margins with zero packaging waste. Our certified courier is scheduled to collect your returns bin. Thank you for championing sustainable dermatology in ${targetClinic.locality}!\n\nBest regards,\n${rep.name} (Medical Representative)"`
            suggestedPrompts = ['Copy message', 'Draft reminder for Patient instead']
          } else if (lower.includes('busy') || lower.includes('time') || lower.includes('objection') || lower.includes('staff')) {
            replyText = `**Objection Strategy: "Staff are too busy"**\n\n1. **Acknowledge**: "I completely respect how busy your front desk is—if this takes more than a minute, it will fail in practice."\n2. **Evidence**: "The RefillRx Counter app uses a streamlined 3-tap workflow. QR barcode scanning and validation takes only 22 seconds, faster than standard debit card billing."\n3. **Offer**: "Our rep will train your receptionist in 5 minutes, and staff earn a ₹10 micro-reward on every refill processed."`
            suggestedPrompts = ['Open Objection Library', 'Test Economics Calculator']
            links = [{ label: 'Go to Objection Studio', path: '/pitch-studio' }]
          } else if (lower.includes('plastic') || lower.includes('sustainability') || lower.includes('save') || lower.includes('co2')) {
            const terrPlastic = selectTerritoryPlasticKg(state.transactions, state.clinics, state.skus, state.selectedTerritoryId)
            const terrRefills = selectTerritoryRefills30d(state.transactions, state.clinics, state.selectedTerritoryId)
            const totalKgCO2 = ((terrPlastic * 2.8)).toFixed(1)

            replyText = `**Territory Sustainability Impact (Last 30 Days):**\n\n- **Refills Dispensed**: ${terrRefills.toLocaleString('en-IN')}\n- **Plastic Diverted**: ${terrPlastic} kg\n- **CO2e Avoided**: ${totalKgCO2} kg\n- **Landfill Diversion Rate**: 97.4% across participating clinics.`
            links = [{ label: 'View Doctor Impact Card', path: '/doctor-dash' }]
          }

          const replyMsg: CopilotMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toISOString(),
            suggestedPrompts,
            links,
          }

          set({
            copilotMessages: [...state.copilotMessages, userMsg, replyMsg],
          })
        },

        reseedData: (seed = Date.now()) => {
          const fresh = generateRawDataset(seed)
          const dynamicNotifs = generateDynamicNotifications(
            fresh.clinics,
            fresh.doctors,
            fresh.transactions,
            fresh.stocks,
            fresh.returns,
            fresh.pickups,
            fresh.orders,
            fresh.feedback,
            INITIAL_CONFIG,
            'rep',
            new Set()
          )
          const dynamicTasks = generateDynamicTasks(
            fresh.clinics,
            fresh.doctors,
            fresh.transactions,
            fresh.stocks,
            fresh.returns,
            fresh.pickups,
            fresh.feedback,
            INITIAL_CONFIG,
            new Set(),
            new Set()
          )
          set({
            clinics: fresh.clinics,
            doctors: fresh.doctors,
            staff: fresh.staff,
            staffMembers: fresh.staff,
            patients: fresh.patients,
            stocks: fresh.stocks,
            stockItems: fresh.stocks,
            transactions: fresh.transactions,
            returns: fresh.returns,
            returnPacks: fresh.returns,
            orders: fresh.orders,
            replenishmentOrders: fresh.orders,
            pickups: fresh.pickups,
            pickupTasks: fresh.pickups,
            leverAssignments: fresh.leverAssignments,
            visits: fresh.visits,
            feedback: fresh.feedback,
            feedbacks: fresh.feedback,
            enrolments: fresh.enrolments,
            trainingProgress: fresh.trainingProgress,
            quizResults: fresh.quizResults,
            certifications: fresh.certifications,
            events: [],
            completedTaskIds: [],
            snoozedTaskIds: [],
            notifications: dynamicNotifs,
            actionTasks: dynamicTasks,
          })
        },

        resetDemoData: () => {
          const reset = generateRawDataset(20260315)
          const dynamicNotifs = generateDynamicNotifications(
            reset.clinics,
            reset.doctors,
            reset.transactions,
            reset.stocks,
            reset.returns,
            reset.pickups,
            reset.orders,
            reset.feedback,
            INITIAL_CONFIG,
            'rep',
            new Set()
          )
          const dynamicTasks = generateDynamicTasks(
            reset.clinics,
            reset.doctors,
            reset.transactions,
            reset.stocks,
            reset.returns,
            reset.pickups,
            reset.feedback,
            INITIAL_CONFIG,
            new Set(),
            new Set()
          )
          set({
            clinics: reset.clinics,
            doctors: reset.doctors,
            staff: reset.staff,
            staffMembers: reset.staff,
            patients: reset.patients,
            stocks: reset.stocks,
            stockItems: reset.stocks,
            transactions: reset.transactions,
            returns: reset.returns,
            returnPacks: reset.returns,
            orders: reset.orders,
            replenishmentOrders: reset.orders,
            pickups: reset.pickups,
            pickupTasks: reset.pickups,
            leverAssignments: reset.leverAssignments,
            visits: reset.visits,
            feedback: reset.feedback,
            feedbacks: reset.feedback,
            enrolments: reset.enrolments,
            trainingProgress: reset.trainingProgress,
            quizResults: reset.quizResults,
            certifications: reset.certifications,
            events: [],
            completedTaskIds: [],
            snoozedTaskIds: [],
            config: INITIAL_CONFIG,
            notifications: dynamicNotifs,
            actionTasks: dynamicTasks,
          })
        },

        exportStateJson: () => {
          return JSON.stringify(get(), null, 2)
        },

        importStateJson: (json: string) => {
          try {
            const parsed = JSON.parse(json)
            set(parsed)
            return true
          } catch {
            return false
          }
        },
      }
    },
    {
      name: 'refillrx-program-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        persona: state.persona,
        selectedClinicId: state.selectedClinicId,
        selectedPatientId: state.selectedPatientId,
        selectedTerritoryId: state.selectedTerritoryId,
        theme: state.theme,
        language: state.language,
        config: state.config,
        events: state.events,
        readNotificationIds: state.readNotificationIds,
        completedTaskIds: state.completedTaskIds,
        snoozedTaskIds: state.snoozedTaskIds,
        clinics: state.clinics,
        doctors: state.doctors,
        staff: state.staff,
        staffMembers: state.staff,
        patients: state.patients,
        stocks: state.stocks,
        stockItems: state.stocks,
        transactions: state.transactions,
        returns: state.returns,
        returnPacks: state.returns,
        orders: state.orders,
        pickups: state.pickups,
        leverAssignments: state.leverAssignments,
        visits: state.visits,
        feedback: state.feedback,
        enrolments: state.enrolments,
        trainingProgress: state.trainingProgress,
        quizResults: state.quizResults,
        certifications: state.certifications,
        savedScenarios: state.savedScenarios,
      }),
    }
  )
)
