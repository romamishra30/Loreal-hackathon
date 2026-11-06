import { 
  Notification, 
  Clinic, 
  Doctor, 
  RefillTransaction, 
  StockItem, 
  ReturnedPack, 
  PickupTask, 
  ReplenishmentOrder, 
  Feedback, 
  PersonaRole 
} from '../entities'
import { ProgramConfig } from '../config'
import { subDays, parseISO, isAfter, formatISO } from 'date-fns'
import { selectClinicBinCount } from './clinicSelectors'

export function generateDynamicNotifications(
  clinics: Clinic[],
  doctors: Doctor[],
  txs: RefillTransaction[],
  stockItems: StockItem[],
  returns: ReturnedPack[],
  pickups: PickupTask[],
  orders: ReplenishmentOrder[],
  feedbacks: Feedback[],
  config: ProgramConfig,
  currentPersona: PersonaRole,
  readNotificationIds: Set<string>
): Notification[] {
  const notifs: Notification[] = []
  const now = new Date()

  // 1. Territory Milestone: if main territory has > 1,000 refills
  const completed = txs.filter(t => t.status === 'completed')
  if (completed.length >= 1000) {
    notifs.push({
      id: 'notif-milestone-1000',
      targetRoles: ['rep', 'manager'],
      title: 'Territory Target Achieved: 42.4% Refill Rate',
      message: 'Mumbai-Thane territory crossed the 40% target refill rate milestone for 3 consecutive weeks!',
      timestamp: formatISO(subDays(now, 0)),
      read: readNotificationIds.has('notif-milestone-1000'),
      type: 'success',
      actionUrl: '/territory',
    })
  }

  // 2. Returns Bin Full alert
  clinics.forEach(c => {
    const binCount = selectClinicBinCount(returns, pickups, c.id)

    if (binCount >= config.returnsBinThreshold) {
      notifs.push({
        id: `notif-bin-full-${c.id}`,
        targetRoles: ['rep', 'staff', 'doctor'],
        title: `Action Required: ${c.name} Returns Bin Full`,
        message: `Returns bin at ${c.name} has ${binCount}/${config.returnsBinThreshold} empties awaiting courier pickup.`,
        timestamp: formatISO(subDays(now, 1)),
        read: readNotificationIds.has(`notif-bin-full-${c.id}`),
        type: 'warning',
        actionUrl: '/counter',
      })
    }
  })

  // 3. Low Stock alert
  stockItems.forEach(item => {
    if (item.refillsOnHand <= item.minThreshold) {
      const c = clinics.find(cl => cl.id === item.clinicId)
      if (c) {
        notifs.push({
          id: `notif-low-stock-${item.id}`,
          targetRoles: ['rep', 'staff', 'manager'],
          title: `Low Refill Stock Alert: ${c.name}`,
          message: `Inventory down to ${item.refillsOnHand} units. One-tap replenishment recommended.`,
          timestamp: formatISO(subDays(now, 1)),
          read: readNotificationIds.has(`notif-low-stock-${item.id}`),
          type: 'alert',
          actionUrl: '/counter',
        })
      }
    }
  })

  // 4. Recent replenishment orders
  orders.slice(0, 3).forEach(order => {
    const c = clinics.find(cl => cl.id === order.clinicId)
    notifs.push({
      id: `notif-order-${order.id}`,
      targetRoles: ['rep', 'manager', 'staff'],
      title: `Replenishment Order ${order.status.toUpperCase()}`,
      message: `${order.refillUnits} refill pods for ${c?.name || 'Clinic'}: ${order.trackingNote || 'Processing with distributor'}`,
      timestamp: order.updatedAt,
      read: readNotificationIds.has(`notif-order-${order.id}`),
      type: 'info',
      actionUrl: '/brand-admin',
    })
  })

  // 5. Negative feedback alert (rating <= 2)
  feedbacks.filter(f => f.rating <= 2).slice(0, 2).forEach(f => {
    const c = clinics.find(cl => cl.id === f.clinicId)
    notifs.push({
      id: `notif-feedback-${f.id}`,
      targetRoles: ['rep', 'doctor'],
      title: `Patient Experience Follow-Up: ${c?.name}`,
      message: `Patient reported: "${f.comments}". Rep review recommended.`,
      timestamp: f.timestamp,
      read: readNotificationIds.has(`notif-feedback-${f.id}`),
      type: 'warning',
      actionUrl: '/territory',
    })
  })

  // 6. Recent Refills (last 24 hours)
  const recentRefills = completed.filter(t => {
    try {
      return isAfter(parseISO(t.timestamp), subDays(now, 1))
    } catch {
      return false
    }
  }).slice(0, 5)

  recentRefills.forEach(tx => {
    notifs.push({
      id: `notif-tx-${tx.id}`,
      targetRoles: ['rep', 'doctor', 'staff', 'manager'],
      title: 'Refill Processed Successfully',
      message: `A refill transaction was completed at ${tx.clinicId}. +1 container diverted.`,
      timestamp: tx.timestamp,
      read: readNotificationIds.has(`notif-tx-${tx.id}`),
      type: 'success',
      actionUrl: '/counter',
    })
  })

  // Filter by persona
  return notifs.filter(n => n.targetRoles.includes(currentPersona))
}

