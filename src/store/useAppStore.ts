import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  ActionTask, 
  AppNotification, 
  Clinic, 
  CopilotMessage, 
  Lever, 
  OrderStatus, 
  Patient, 
  PatientFeedback, 
  PersonaRole, 
  PickupStatus, 
  PickupTask, 
  ProductSKU, 
  RefillTransaction, 
  ReplenishmentOrder, 
  ReturnPack, 
  StaffMember, 
  StockItem, 
  Visit 
} from '../types'
import { LEVERS, PRODUCT_SKUS } from '../data/seedConstants'
import { generateSeedData } from '../data/seededGenerator'
import { isDuplicateBatch, calculateHealthScore } from '../lib/calculations'
import { formatISO } from 'date-fns'

const INITIAL_DATA = generateSeedData()

export interface AppState {
  // Session & Global Settings
  persona: PersonaRole
  selectedClinicId: string
  selectedPatientId: string
  theme: 'light' | 'dark'
  language: 'en' | 'hi' | 'mr'
  isOnline: boolean
  offlineQueue: RefillTransaction[]
  activeTourStep: number | null
  
  // Data Collections
  clinics: Clinic[]
  staffMembers: StaffMember[]
  stockItems: StockItem[]
  replenishmentOrders: ReplenishmentOrder[]
  pickupTasks: PickupTask[]
  patients: Patient[]
  transactions: RefillTransaction[]
  returnPacks: ReturnPack[]
  actionTasks: ActionTask[]
  visits: Visit[]
  feedbacks: PatientFeedback[]
  notifications: AppNotification[]
  levers: Lever[]
  copilotMessages: CopilotMessage[]

  // Actions
  setPersona: (role: PersonaRole) => void
  setSelectedClinicId: (id: string) => void
  setSelectedPatientId: (id: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void
  setOnline: (online: boolean) => void
  
  // Guided Tour
  startTour: () => void
  nextTourStep: () => void
  prevTourStep: () => void
  endTour: () => void

  // Refill Counter & Operations
  processRefill: (data: {
    clinicId: string
    patientId: string
    skuId: string
    batchCode: string
    paymentMode: 'upi' | 'cash' | 'card'
    staffPin: string
  }) => { success: boolean; message: string; transaction?: RefillTransaction }
  
  undoTransaction: (txId: string, reason?: string) => { success: boolean; message: string }
  syncOfflineQueue: () => void

  // Logistics & Inventory
  requestReplenishment: (clinicId: string, skuId: string, refillUnits: number, fullPackUnits: number) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  requestPickup: (clinicId: string) => void
  completePickup: (taskId: string) => void

  // Training & Levers
  completeTrainingModule: (staffId: string, moduleId: string) => void
  toggleLeverForClinic: (clinicId: string, leverId: string) => void
  
  // Action Tasks & Rep Visits
  completeTask: (taskId: string) => void
  snoozeTask: (taskId: string) => void
  createVisit: (visit: Omit<Visit, 'id'>) => void
  completeVisit: (visitId: string, notes: string) => void

  // Patient & Feedback
  addPatientFeedback: (fb: Omit<PatientFeedback, 'id' | 'timestamp'>) => void
  markNotificationRead: (notifId: string) => void
  clearAllNotifications: () => void

  // AI Copilot
  sendCopilotMessage: (userText: string) => void

  // Data & Reseed Controls
  reseedData: (seed?: number) => void
  resetDemoData: () => void
  exportStateJson: () => string
  importStateJson: (json: string) => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      persona: 'rep',
      selectedClinicId: 'clinic-1',
      selectedPatientId: 'pat-1',
      theme: 'light',
      language: 'en',
      isOnline: true,
      offlineQueue: [],
      activeTourStep: null,

      clinics: INITIAL_DATA.clinics,
      staffMembers: INITIAL_DATA.staffMembers,
      stockItems: INITIAL_DATA.stockItems,
      replenishmentOrders: INITIAL_DATA.replenishmentOrders,
      pickupTasks: INITIAL_DATA.pickupTasks,
      patients: INITIAL_DATA.patients,
      transactions: INITIAL_DATA.transactions,
      returnPacks: INITIAL_DATA.returnPacks,
      actionTasks: INITIAL_DATA.actionTasks,
      visits: INITIAL_DATA.visits,
      feedbacks: INITIAL_DATA.feedbacks,
      notifications: INITIAL_DATA.notifications,
      levers: LEVERS,
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

      setPersona: (role) => set({ persona: role }),
      setSelectedClinicId: (id) => set({ selectedClinicId: id }),
      setSelectedPatientId: (id) => set({ selectedPatientId: id }),
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
      setLanguage: (lang) => set({ language: lang }),
      setOnline: (online) => {
        set({ isOnline: online })
        if (online) {
          get().syncOfflineQueue()
        }
      },

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

      processRefill: ({ clinicId, patientId, skuId, batchCode, paymentMode, staffPin }) => {
        const state = get()
        const sku = PRODUCT_SKUS.find(s => s.id === skuId)
        if (!sku) return { success: false, message: 'Invalid product SKU' }

        // Duplicate batch check
        if (isDuplicateBatch(batchCode, state.returnPacks)) {
          return {
            success: false,
            message: `FRAUD ALERT: Batch code ${batchCode.toUpperCase()} was previously returned! Please inspect container integrity.`,
          }
        }

        const fullPrice = sku.fullPriceINR
        const refillPrice = sku.refillPriceINR
        const discountPct = Number(((fullPrice - refillPrice) / fullPrice).toFixed(2))
        const doctorMargin = Math.round(refillPrice * sku.doctorRefillMarginPct)
        const staff = state.staffMembers.find(s => s.clinicId === clinicId)
        const staffName = staff?.name || 'Staff'

        const newTx: RefillTransaction = {
          id: `tx-${Date.now()}`,
          clinicId,
          patientId,
          skuId,
          batchCode: batchCode.trim().toUpperCase(),
          fullPrice,
          refillPrice,
          discountPct,
          doctorMargin,
          staffId: staff?.id || 'staff-1',
          staffName,
          paymentMode,
          timestamp: formatISO(new Date()),
          status: 'completed',
        }

        // If offline, store in offlineQueue
        if (!state.isOnline) {
          set({ offlineQueue: [newTx, ...state.offlineQueue] })
          return {
            success: true,
            message: 'Refill saved to offline queue. Will sync when online.',
            transaction: newTx,
          }
        }

        // 1. Add transaction
        const updatedTxs = [newTx, ...state.transactions]

        // 2. Add return pack
        const newReturn: ReturnPack = {
          id: `ret-${Date.now()}`,
          clinicId,
          batchCode: batchCode.trim().toUpperCase(),
          skuId,
          scannedAt: formatISO(new Date()),
          verifiedChecks: { intact: true, matchesRange: true, batchCodeReadable: true },
          duplicateFlag: false,
        }
        const updatedReturns = [newReturn, ...state.returnPacks]

        // 3. Decrement clinic refill stock
        const updatedStock = state.stockItems.map(item => {
          if (item.clinicId === clinicId && item.skuId === skuId) {
            return {
              ...item,
              refillsOnHand: Math.max(0, item.refillsOnHand - 1),
            }
          }
          return item
        })

        // 4. Update clinic bin count and totals
        const updatedClinics = state.clinics.map(c => {
          if (c.id === clinicId) {
            const nextBin = c.binCount + 1
            const nextRefills = c.totalRefillsAllTime + 1
            const nextPacks = c.totalPacksSavedAllTime + 1
            
            // Recalculate health score dynamically
            const { score, status } = calculateHealthScore({
              refillRate: 0.42,
              targetRefillRate: 0.40,
              activeWeeksLast4: 4,
              daysOfCover: 16,
              hasTrainedStaff: staff?.isCertified ?? true,
              hasRecentCounterActivity: true,
            })

            return {
              ...c,
              binCount: nextBin,
              totalRefillsAllTime: nextRefills,
              totalPacksSavedAllTime: nextPacks,
              lastRefillDate: formatISO(new Date()),
              healthScore: score,
              healthStatus: status,
            }
          }
          return c
        })

        // 5. Update patient streak, points, packs
        const updatedPatients = state.patients.map(p => {
          if (p.id === patientId) {
            const nextStreak = p.refillStreak + 1
            const nextPacks = p.packsSavedTotal + 1
            let nextTier = p.loyaltyTier
            if (nextStreak >= 5) nextTier = 'gold'
            else if (nextStreak >= 2) nextTier = 'green'

            return {
              ...p,
              refillStreak: nextStreak,
              packsSavedTotal: nextPacks,
              pointsBalance: p.pointsBalance + 100,
              loyaltyTier: nextTier,
              usageDaysElapsed: 0,
              lastRefillDate: formatISO(new Date()),
            }
          }
          return p
        })

        // 6. Reward staff member
        const updatedStaff = state.staffMembers.map(s => {
          if (s.clinicId === clinicId) {
            return {
              ...s,
              points: s.points + 10,
              refillsCompleted: s.refillsCompleted + 1,
            }
          }
          return s
        })

        // 7. Add notification
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          targetRoles: ['rep', 'doctor'],
          title: 'Refill Processed Successfully',
          message: `${sku.name} dispensed at ${clinicId}. 1 pack (${sku.plasticWeightGrams}g plastic) diverted from landfill!`,
          timestamp: formatISO(new Date()),
          read: false,
          type: 'success',
        }

        set({
          transactions: updatedTxs,
          returnPacks: updatedReturns,
          stockItems: updatedStock,
          clinics: updatedClinics,
          patients: updatedPatients,
          staffMembers: updatedStaff,
          notifications: [newNotif, ...state.notifications],
        })

        return {
          success: true,
          message: `Refill confirmed! ${sku.name} dispensed. 1 plastic pack saved.`,
          transaction: newTx,
        }
      },

      undoTransaction: (txId, reason = 'Staff manual undo') => {
        const state = get()
        const tx = state.transactions.find(t => t.id === txId)
        if (!tx) return { success: false, message: 'Transaction not found' }
        if (tx.status === 'voided') return { success: false, message: 'Already voided' }

        const updatedTxs = state.transactions.map(t => {
          if (t.id === txId) {
            return {
              ...t,
              status: 'voided' as const,
              voidReason: reason,
            }
          }
          return t
        })

        // Decrement returns bin and restock
        const updatedClinics = state.clinics.map(c => {
          if (c.id === tx.clinicId) {
            return {
              ...c,
              binCount: Math.max(0, c.binCount - 1),
              totalRefillsAllTime: Math.max(0, c.totalRefillsAllTime - 1),
              totalPacksSavedAllTime: Math.max(0, c.totalPacksSavedAllTime - 1),
            }
          }
          return c
        })

        const updatedStock = state.stockItems.map(item => {
          if (item.clinicId === tx.clinicId && item.skuId === tx.skuId) {
            return {
              ...item,
              refillsOnHand: item.refillsOnHand + 1,
            }
          }
          return item
        })

        set({
          transactions: updatedTxs,
          clinics: updatedClinics,
          stockItems: updatedStock,
        })

        return { success: true, message: 'Transaction voided successfully and inventory restored.' }
      },

      syncOfflineQueue: () => {
        const state = get()
        if (state.offlineQueue.length === 0) return

        const queued = [...state.offlineQueue]
        set({
          transactions: [...queued, ...state.transactions],
          offlineQueue: [],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              targetRoles: ['staff', 'rep'],
              title: 'Offline Queue Synchronized',
              message: `Successfully synced ${queued.length} offline refill transactions to central ledger.`,
              timestamp: formatISO(new Date()),
              read: false,
              type: 'info',
            },
            ...state.notifications,
          ]
        })
      },

      requestReplenishment: (clinicId, skuId, refillUnits, fullPackUnits) => {
        const state = get()
        const newOrder: ReplenishmentOrder = {
          id: `ord-${Date.now()}`,
          clinicId,
          skuId,
          refillUnits,
          fullPackUnits,
          status: 'requested',
          requestedAt: formatISO(new Date()),
          updatedAt: formatISO(new Date()),
          trackingNote: 'Order acknowledged by distributor',
        }
        set({
          replenishmentOrders: [newOrder, ...state.replenishmentOrders],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              targetRoles: ['rep', 'manager'],
              title: 'Stock Replenishment Requested',
              message: `Clinic requested ${refillUnits} refill pods. Distributor notified.`,
              timestamp: formatISO(new Date()),
              read: false,
              type: 'info',
            },
            ...state.notifications,
          ]
        })
      },

      updateOrderStatus: (orderId, nextStatus) => {
        const state = get()
        const updated = state.replenishmentOrders.map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              status: nextStatus,
              updatedAt: formatISO(new Date()),
            }
          }
          return o
        })

        // If delivered, restock the clinic
        let updatedStock = state.stockItems
        const order = state.replenishmentOrders.find(o => o.id === orderId)
        if (nextStatus === 'delivered' && order) {
          updatedStock = state.stockItems.map(item => {
            if (item.clinicId === order.clinicId && item.skuId === order.skuId) {
              return {
                ...item,
                refillsOnHand: item.refillsOnHand + order.refillUnits,
                fullPacksOnHand: item.fullPacksOnHand + order.fullPackUnits,
              }
            }
            return item
          })
        }

        set({ replenishmentOrders: updated, stockItems: updatedStock })
      },

      requestPickup: (clinicId) => {
        const state = get()
        const clinic = state.clinics.find(c => c.id === clinicId)
        if (!clinic) return

        const newPickup: PickupTask = {
          id: `pickup-${Date.now()}`,
          clinicId,
          packCount: clinic.binCount,
          status: 'requested',
          requestedAt: formatISO(new Date()),
        }

        set({
          pickupTasks: [newPickup, ...state.pickupTasks],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              targetRoles: ['rep', 'manager'],
              title: 'Pickup Requested for Empties',
              message: `${clinic.name} requested pickup of ${clinic.binCount} returned containers.`,
              timestamp: formatISO(new Date()),
              read: false,
              type: 'info',
            },
            ...state.notifications,
          ]
        })
      },

      completePickup: (taskId) => {
        const state = get()
        const task = state.pickupTasks.find(t => t.id === taskId)
        if (!task) return

        const updatedTasks = state.pickupTasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'recycled' as PickupStatus,
              completedAt: formatISO(new Date()),
            }
          }
          return t
        })

        // Reset clinic bin count
        const updatedClinics = state.clinics.map(c => {
          if (c.id === task.clinicId) {
            return {
              ...c,
              binCount: 0,
            }
          }
          return c
        })

        set({
          pickupTasks: updatedTasks,
          clinics: updatedClinics,
          notifications: [
            {
              id: `notif-${Date.now()}`,
              targetRoles: ['doctor', 'staff', 'rep'],
              title: 'Empties Collected & Recycled',
              message: `${task.packCount} returned containers picked up and transferred to PCR recycling plant. Bin reset to 0.`,
              timestamp: formatISO(new Date()),
              read: false,
              type: 'success',
            },
            ...state.notifications,
          ]
        })
      },

      completeTrainingModule: (staffId, moduleId) => {
        const state = get()
        const updatedStaff = state.staffMembers.map(s => {
          if (s.id === staffId) {
            const hasModule = s.completedModules.includes(moduleId)
            const nextModules = hasModule ? s.completedModules : [...s.completedModules, moduleId]
            const isCertified = nextModules.length >= 6
            return {
              ...s,
              completedModules: nextModules,
              isCertified,
              certifiedDate: isCertified && !s.isCertified ? formatISO(new Date()) : s.certifiedDate,
              points: s.points + 50,
            }
          }
          return s
        })

        set({ staffMembers: updatedStaff })
      },

      toggleLeverForClinic: (clinicId, leverId) => {
        const state = get()
        const updatedClinics = state.clinics.map(c => {
          if (c.id === clinicId) {
            const active = c.activeLevers.includes(leverId)
            const nextLevers = active 
              ? c.activeLevers.filter(l => l !== leverId)
              : [...c.activeLevers, leverId]
            return { ...c, activeLevers: nextLevers }
          }
          return c
        })
        set({ clinics: updatedClinics })
      },

      completeTask: (taskId) => {
        const state = get()
        set({
          actionTasks: state.actionTasks.map(t => 
            t.id === taskId ? { ...t, status: 'completed' } : t
          )
        })
      },

      snoozeTask: (taskId) => {
        const state = get()
        set({
          actionTasks: state.actionTasks.map(t => 
            t.id === taskId ? { ...t, status: 'snoozed' } : t
          )
        })
      },

      createVisit: (visitData) => {
        const state = get()
        const newVisit: Visit = {
          ...visitData,
          id: `visit-${Date.now()}`,
        }
        set({ visits: [newVisit, ...state.visits] })
      },

      completeVisit: (visitId, notes) => {
        const state = get()
        const updated = state.visits.map(v => {
          if (v.id === visitId) {
            return {
              ...v,
              status: 'completed' as const,
              notes,
            }
          }
          return v
        })
        set({ visits: updated })
      },

      addPatientFeedback: (fb) => {
        const state = get()
        const newFeedback: PatientFeedback = {
          ...fb,
          id: `fb-${Date.now()}`,
          timestamp: formatISO(new Date()),
        }
        set({ feedbacks: [newFeedback, ...state.feedbacks] })
      },

      markNotificationRead: (notifId) => {
        const state = get()
        set({
          notifications: state.notifications.map(n => 
            n.id === notifId ? { ...n, read: true } : n
          )
        })
      },

      clearAllNotifications: () => {
        const state = get()
        set({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        })
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

        let replyText = "I'm your RefillRx strategic assistant. You can ask me to analyze clinics, calculate economics, review objections, or track plastic diversion."
        let suggestedPrompts = [
          'Which clinics are at risk this week?',
          'What should I say if doctor says staff are busy?',
          'How much plastic did Mumbai-Thane save?',
        ]
        let links: { label: string; path: string }[] | undefined

        if (lower.includes('at risk') || lower.includes('risk') || lower.includes('dormant')) {
          const atRisk = state.clinics.filter(c => c.territoryId === 'terr-mumbai-thane' && (c.healthStatus === 'at_risk' || c.healthStatus === 'dormant'))
          replyText = `There are currently ${atRisk.length} clinics requiring attention in the Mumbai–Thane territory. Top 3 priority actions:\n\n1. **${atRisk[0]?.name}** (${atRisk[0]?.doctorName}): Health score ${atRisk[0]?.healthScore}. Action: Schedule in-person coaching visit.\n2. **${atRisk[1]?.name}** (${atRisk[1]?.doctorName}): Low stock warning.\n3. **${atRisk[2]?.name}**: Zero refills in 10+ days.\n\nRecommended lever: Activate automated WhatsApp adherence reminders and verify receptionist training.`
          suggestedPrompts = ['Draft visit agenda for at-risk clinics', 'View Action Centre tasks']
          links = [{ label: 'Open Territory Action Centre', path: '/territory' }]
        } else if (lower.includes('whatsapp') || lower.includes('draft') || lower.includes('mehta')) {
          replyText = `Here is a tailored WhatsApp draft for **Dr. Mehta**:\n\n"Dear Dr. Mehta, warm greetings from The Brand Medical Team! Your clinic has now diverted 18.4 kg of medical-grade plastic through RefillRx this month. Over 48 of your patients actively used their 20% circular refill discount, earning your practice ₹16,320 in repeat margins. Our courier is scheduled for tomorrow at 2 PM to collect your full returns bin. Thank you for championing sustainable dermatology in Thane! Best regards, Vikram (Medical Rep)"`
          suggestedPrompts = ['Copy message', 'Draft reminder for Patient instead']
        } else if (lower.includes('busy') || lower.includes('time') || lower.includes('objection') || lower.includes('staff')) {
          replyText = `**Objection Strategy: "Staff are too busy"**\n\n1. **Acknowledge**: "I completely respect how busy your front desk is—if this takes more than a minute, it will fail in practice."\n2. **Evidence**: "The RefillRx Counter app uses a streamlined 3-tap workflow. QR barcode scanning and validation takes only 22 seconds, faster than standard debit card billing."\n3. **Offer**: "Our rep will train your receptionist in 5 minutes, and staff earn a ₹10 micro-reward on every refill processed."`
          suggestedPrompts = ['Open Objection Library', 'Test Economics Calculator']
          links = [{ label: 'Go to Objection Studio', path: '/pitch-studio' }]
        } else if (lower.includes('plastic') || lower.includes('sustainability') || lower.includes('save') || lower.includes('co2')) {
          const totalRefills = state.transactions.filter(t => t.status === 'completed').length
          const totalKgPlastic = ((totalRefills * 42) / 1000).toFixed(1)
          const totalKgCO2 = ((totalRefills * 125) / 1000).toFixed(1)
          const bottles = Math.round((totalRefills * 42) / 12)
          replyText = `**Pilot Sustainability Impact to Date:**\n\n- **Refills Dispensed**: ${totalRefills.toLocaleString('en-IN')}\n- **Plastic Diverted**: ${totalKgPlastic} kg (equivalent to ${bottles.toLocaleString('en-IN')} PET water bottles)\n- **CO2e Avoided**: ${totalKgCO2} kg\n- **Landfill Diversion Rate**: 96.2% across participating Mumbai-Thane clinics.`
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
          copilotMessages: [...state.copilotMessages, userMsg, replyMsg]
        })
      },

      reseedData: (seed = Date.now()) => {
        const fresh = generateSeedData(seed)
        set({
          clinics: fresh.clinics,
          staffMembers: fresh.staffMembers,
          stockItems: fresh.stockItems,
          replenishmentOrders: fresh.replenishmentOrders,
          pickupTasks: fresh.pickupTasks,
          patients: fresh.patients,
          transactions: fresh.transactions,
          returnPacks: fresh.returnPacks,
          actionTasks: fresh.actionTasks,
          visits: fresh.visits,
          feedbacks: fresh.feedbacks,
          notifications: fresh.notifications,
        })
      },

      resetDemoData: () => {
        const reset = generateSeedData(20260315)
        set({
          clinics: reset.clinics,
          staffMembers: reset.staffMembers,
          stockItems: reset.stockItems,
          replenishmentOrders: reset.replenishmentOrders,
          pickupTasks: reset.pickupTasks,
          patients: reset.patients,
          transactions: reset.transactions,
          returnPacks: reset.returnPacks,
          actionTasks: reset.actionTasks,
          visits: reset.visits,
          feedbacks: reset.feedbacks,
          notifications: reset.notifications,
          offlineQueue: [],
          persona: 'rep',
          selectedClinicId: 'clinic-1',
        })
      },

      exportStateJson: () => {
        const state = get()
        return JSON.stringify(state, null, 2)
      },

      importStateJson: (json: string) => {
        try {
          const parsed = JSON.parse(json)
          if (parsed && parsed.clinics && parsed.transactions) {
            set(parsed)
            return true
          }
          return false
        } catch {
          return false
        }
      },
    }),
    {
      name: 'refillrx-storage-v1',
      partialize: (state) => ({
        persona: state.persona,
        selectedClinicId: state.selectedClinicId,
        selectedPatientId: state.selectedPatientId,
        theme: state.theme,
        language: state.language,
        clinics: state.clinics,
        staffMembers: state.staffMembers,
        stockItems: state.stockItems,
        replenishmentOrders: state.replenishmentOrders,
        pickupTasks: state.pickupTasks,
        patients: state.patients,
        transactions: state.transactions,
        returnPacks: state.returnPacks,
        actionTasks: state.actionTasks,
        visits: state.visits,
        feedbacks: state.feedbacks,
        notifications: state.notifications,
        offlineQueue: state.offlineQueue,
      }),
    }
  )
)

