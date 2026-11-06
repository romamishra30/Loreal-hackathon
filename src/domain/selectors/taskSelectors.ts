import { 
  Task, 
  Clinic, 
  Doctor, 
  RefillTransaction, 
  StockItem, 
  ReturnedPack, 
  PickupTask, 
  Feedback 
} from '../entities'
import { ProgramConfig } from '../config'
import { subDays, parseISO, isAfter, formatISO } from 'date-fns'
import { selectClinicBinCount } from './clinicSelectors'

export function generateDynamicTasks(
  clinics: Clinic[],
  doctors: Doctor[],
  txs: RefillTransaction[],
  stockItems: StockItem[],
  returns: ReturnedPack[],
  pickups: PickupTask[],
  feedbacks: Feedback[],
  config: ProgramConfig,
  completedTaskIds: Set<string>,
  snoozedTaskIds: Set<string>
): Task[] {
  const tasks: Task[] = []
  const now = new Date()

  clinics.forEach(c => {
    const doctor = doctors.find(d => d.primaryClinicId === c.id) || doctors[0]
    const clinicTxs = txs.filter(t => t.clinicId === c.id && t.status === 'completed')

    // Rule 1: Zero refills in 10+ days -> Urgent Retraining
    const tenDaysAgo = subDays(now, 10)
    const hasRecentTx = clinicTxs.some(t => {
      try { return isAfter(parseISO(t.timestamp), tenDaysAgo) } catch { return false }
    })

    if (!hasRecentTx && clinicTxs.length > 0) {
      const taskId = `task-dormant-${c.id}`
      tasks.push({
        id: taskId,
        clinicId: c.id,
        priority: 'urgent',
        title: `Zero refills for 10+ days – Retrain & Revive Practice`,
        description: `${c.name} (${doctor.name}) had no refill transactions in the past 10 days. Schedule an in-person coaching visit to review receptionist flow.`,
        triggerRule: 'dormant_streak',
        status: completedTaskIds.has(taskId) ? 'completed' : snoozedTaskIds.has(taskId) ? 'snoozed' : 'pending',
        dueDate: formatISO(subDays(now, -1)),
        createdAt: formatISO(subDays(now, 2)),
      })
    }

    // Rule 2: Returns Bin >= Threshold -> High Priority Pickup
    const binCount = selectClinicBinCount(returns, pickups, c.id)

    if (binCount >= config.returnsBinThreshold) {
      const taskId = `task-bin-${c.id}`
      tasks.push({
        id: taskId,
        clinicId: c.id,
        priority: 'high',
        title: `Returns bin threshold exceeded (${binCount}/${config.returnsBinThreshold} packs)`,
        description: `Returns bin at ${c.name} is full. Coordinate immediate reverse-logistics courier pickup to keep reception counter clean.`,
        triggerRule: 'bin_threshold',
        status: completedTaskIds.has(taskId) ? 'completed' : snoozedTaskIds.has(taskId) ? 'snoozed' : 'pending',
        dueDate: formatISO(subDays(now, -2)),
        createdAt: formatISO(subDays(now, 1)),
      })
    }

    // Rule 3: Champion Practice (>50 refills 30d) -> Award Nomination
    const recent30d = clinicTxs.filter(t => {
      try { return isAfter(parseISO(t.timestamp), subDays(now, 30)) } catch { return false }
    }).length

    if (recent30d >= 50) {
      const taskId = `task-champion-${c.id}`
      tasks.push({
        id: taskId,
        clinicId: c.id,
        priority: 'medium',
        title: `Nominate for Quarterly Green Practice Leader Award`,
        description: `${doctor.name} achieved ${recent30d} refills this month. Present framed Green Clinic Certificate and feature in the regional L'Oréal medical newsletter.`,
        triggerRule: 'champion_nomination',
        status: completedTaskIds.has(taskId) ? 'completed' : snoozedTaskIds.has(taskId) ? 'snoozed' : 'pending',
        dueDate: formatISO(subDays(now, -5)),
        createdAt: formatISO(subDays(now, 3)),
      })
    }
  })

  return tasks
}

