import { 
  Clinic, 
  ProductSKU, 
  RefillTransaction, 
  ReturnPack, 
  StockItem, 
  ReplenishmentOrder, 
  PickupTask, 
  Patient, 
  StaffMember, 
  ActionTask, 
  Visit, 
  AppNotification, 
  PatientFeedback, 
  DoctorArchetype, 
  HealthStatus 
} from '../types'
import { PRODUCT_SKUS, TERRITORIES } from './seedConstants'
import { subDays, formatISO } from 'date-fns'

// Seeded PRNG (Mulberry32) for reproducible data
export class SeededRNG {
  private s: number

  constructor(seed: number = 20260315) {
    this.s = seed
  }

  // Returns number between 0 and 1
  next(): number {
    let t = (this.s += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)]
  }

  pickWeighted<T>(items: { item: T; weight: number }[]): T {
    const total = items.reduce((sum, i) => sum + i.weight, 0)
    let rand = this.next() * total
    for (const item of items) {
      if (rand < item.weight) return item.item
      rand -= item.weight
    }
    return items[0].item
  }
}

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Pari', 'Anushka', 'Navya', 'Avani', 'Myra', 'Ira',
  'Rohan', 'Amit', 'Sunil', 'Kunal', 'Nikhil', 'Pooja', 'Sneha', 'Tanvi', 'Ritu', 'Kavita',
  'Meera', 'Radhika', 'Deepak', 'Manish', 'Sanjay', 'Pooja', 'Shweta', 'Rashmi', 'Divya', 'Gaurav'
]

const LAST_NAMES = [
  'Mehta', 'Shah', 'Patil', 'Kulkarni', 'Deshmukh', 'Joshi', 'Agarwal', 'Sharma', 'Verma', 'Gupta',
  'Nair', 'Menon', 'Rao', 'Reddy', 'Kamath', 'Bhat', 'Shetty', 'Pawar', 'Shinde', 'Chavan',
  'Tambe', 'Gokhale', 'Savant', 'Bhide', 'Modi', 'Kapoor', 'Malhotra', 'Singhania', 'Merchant', 'D\'Souza'
]

const LOCALITIES_MUMBAI_THANE = [
  { name: 'Thane West (Panchpakhadi)', lat: 19.1982, lng: 72.9644 },
  { name: 'Thane West (Majiwada)', lat: 19.2183, lng: 72.9781 },
  { name: 'Thane West (Ghodbunder Rd)', lat: 19.2625, lng: 72.9496 },
  { name: 'Vashi Sector 17, Navi Mumbai', lat: 19.0771, lng: 72.9986 },
  { name: 'Nerul Sector 20, Navi Mumbai', lat: 19.0330, lng: 73.0297 },
  { name: 'Kharghar Sector 7, Navi Mumbai', lat: 19.0473, lng: 73.0699 },
  { name: 'Belapur CBD, Navi Mumbai', lat: 19.0178, lng: 73.0400 },
  { name: 'Bandra West (Linking Road)', lat: 19.0596, lng: 72.8295 },
  { name: 'Bandra West (Turner Road)', lat: 19.0544, lng: 72.8350 },
  { name: 'Khar West (14th Road)', lat: 19.0688, lng: 72.8340 },
  { name: 'Santacruz West', lat: 19.0818, lng: 72.8422 },
  { name: 'Andheri West (Lokhandwala)', lat: 19.1363, lng: 72.8277 },
  { name: 'Andheri West (Four Bungalows)', lat: 19.1245, lng: 72.8260 },
  { name: 'Andheri East (Chakala)', lat: 19.1136, lng: 72.8697 },
  { name: 'Juhu Tara Road', lat: 19.1025, lng: 72.8266 },
  { name: 'Goregaon West (SV Road)', lat: 19.1550, lng: 72.8490 },
  { name: 'Malad West (Link Road)', lat: 19.1860, lng: 72.8485 },
  { name: 'Borivali West (Shimpoli)', lat: 19.2307, lng: 72.8567 },
  { name: 'Mulund West (LBS Marg)', lat: 19.1726, lng: 72.9425 },
  { name: 'Ghatkopar East (Tilak Road)', lat: 19.0860, lng: 72.9090 },
  { name: 'Chembur East (Diamond Garden)', lat: 19.0522, lng: 72.8994 },
  { name: 'Powai (Hiranandani Gardens)', lat: 19.1197, lng: 72.9051 },
  { name: 'Dadar West (Shivaji Park)', lat: 19.0269, lng: 72.8378 },
  { name: 'Kalyan West (Syndicate)', lat: 19.2403, lng: 73.1305 },
  { name: 'Dombivli East (Manpada)', lat: 19.2184, lng: 73.0867 }
]

const CLINIC_PREFIXES = ['SkinFirst', 'Aura Derma', 'Apex Skin & Laser', 'Dermacare', 'Kaya Aesthetics', 'Dr. Mehta\'s', 'ClearSkin Centre', 'PureDerm', 'Radiance Skin', 'Lumina Clinic', 'SkinVogue', 'DermaCrest', 'Vitality Skin', 'Renaissance Aesthetics', 'SkinMatrix']

export function generateSeedData(seed: number = 20260315) {
  const rng = new SeededRNG(seed)
  const now = new Date(2026, 2, 15, 14, 30) // March 15, 2026 (baseline date)

  const archetypesList: DoctorArchetype[] = [
    'clinician_first', 'margin_driven', 'loyalty_builder', 'eco_advocate', 'time_poor_skeptic'
  ]

  // Generate 100 clinics (25 per territory)
  const clinics: Clinic[] = []
  const staffMembers: StaffMember[] = []
  const stockItems: StockItem[] = []
  const replenishmentOrders: ReplenishmentOrder[] = []
  const pickupTasks: PickupTask[] = []

  let clinicIndex = 0

  for (const terr of TERRITORIES) {
    const isMainTerritory = terr.id === 'terr-mumbai-thane'

    for (let i = 0; i < 25; i++) {
      clinicIndex++
      const cId = `clinic-${clinicIndex}`
      const docFirst = rng.pick(FIRST_NAMES)
      const docLast = rng.pick(LAST_NAMES)
      const docName = `Dr. ${docFirst} ${docLast}`
      const prefix = rng.pick(CLINIC_PREFIXES)
      
      const loc = isMainTerritory 
        ? LOCALITIES_MUMBAI_THANE[i] 
        : { 
            name: `${terr.name.split(' ')[0]} Sector ${i + 1}`, 
            lat: 18.5204 + (rng.next() - 0.5) * 0.2, 
            lng: 73.8567 + (rng.next() - 0.5) * 0.2 
          }

      const clinicName = `${prefix} Clinic, ${loc.name.split('(')[0].trim()}`

      // Desired distribution in main territory:
      // ~5 Champions (score >= 85), ~10 On Track (65-84), ~7 At Risk (40-64), ~3 Dormant (<40)
      let targetHealth: HealthStatus = 'on_track'
      let healthScore = 72

      if (isMainTerritory) {
        if (i < 5) {
          targetHealth = 'champion'
          healthScore = rng.nextInt(86, 96)
        } else if (i < 15) {
          targetHealth = 'on_track'
          healthScore = rng.nextInt(67, 84)
        } else if (i < 22) {
          targetHealth = 'at_risk'
          healthScore = rng.nextInt(42, 63)
        } else {
          targetHealth = 'dormant'
          healthScore = rng.nextInt(18, 38)
        }
      } else {
        const randHealth = rng.next()
        if (randHealth < 0.20) { targetHealth = 'champion'; healthScore = rng.nextInt(85, 94) }
        else if (randHealth < 0.60) { targetHealth = 'on_track'; healthScore = rng.nextInt(65, 84) }
        else if (randHealth < 0.88) { targetHealth = 'at_risk'; healthScore = rng.nextInt(40, 64) }
        else { targetHealth = 'dormant'; healthScore = rng.nextInt(15, 39) }
      }

      const archetype = isMainTerritory 
        ? archetypesList[i % archetypesList.length]
        : rng.pick(archetypesList)

      const patientVolume = rng.nextInt(220, 520)
      const dispensingShare = Number((0.40 + rng.next() * 0.35).toFixed(2))
      const binThreshold = 20
      const binCount = targetHealth === 'at_risk' && rng.next() > 0.5 ? rng.nextInt(18, 22) : rng.nextInt(3, 17)

      // Active levers
      const activeLevers = ['lev-counter-app', 'lev-training']
      if (targetHealth === 'champion') {
        activeLevers.push('lev-margin-boost', 'lev-sale-or-return', 'lev-signage-kit', 'lev-green-cert', 'lev-whatsapp-bot')
      } else if (targetHealth === 'on_track') {
        activeLevers.push('lev-margin-boost', 'lev-whatsapp-bot')
      }

      const clinic: Clinic = {
        id: cId,
        name: clinicName,
        doctorName: docName,
        doctorDegree: rng.pick(['MD (Dermatology)', 'DVD (Cosmetology)', 'MD, DNB (Derm)', 'DDVL, FAM']),
        phone: `+91 98${rng.nextInt(10000000, 99999999)}`,
        email: `dr.${docLast.toLowerCase()}@${prefix.toLowerCase().replace(/[^a-z]/g, '')}.in`,
        address: `${rng.nextInt(101, 804)}, ${rng.pick(['Heritage Plaza', 'Imperial Heights', 'Crystal Point', 'Metro Medical Enclave'])}, ${loc.name}`,
        locality: loc.name,
        territoryId: terr.id,
        lat: loc.lat,
        lng: loc.lng,
        archetype,
        patientVolumeMonthly: patientVolume,
        dispensingSharePct: dispensingShare,
        brandsStocked: ['The Brand (Refill Range)', 'Cetaphil', 'Sebamed', 'Glenmark', 'Avene'],
        enrolledDate: formatISO(subDays(now, rng.nextInt(60, 110))),
        healthScore,
        healthStatus: targetHealth,
        activeLevers,
        binCount,
        binThreshold,
        lastVisitDate: formatISO(subDays(now, rng.nextInt(2, 28))),
        lastRefillDate: targetHealth === 'dormant' 
          ? formatISO(subDays(now, rng.nextInt(12, 25))) 
          : formatISO(subDays(now, rng.nextInt(0, 3))),
        totalRefillsAllTime: rng.nextInt(80, 480),
        totalPacksSavedAllTime: rng.nextInt(75, 460),
        counterPin: `${rng.nextInt(1000, 9999)}`,
      }
      clinics.push(clinic)

      // Staff member for this clinic
      const staffFirst = rng.pick(FIRST_NAMES)
      const staffLast = rng.pick(LAST_NAMES)
      const staffId = `staff-${cId}`
      const isCertified = targetHealth === 'champion' || targetHealth === 'on_track' || rng.next() > 0.4
      const staff: StaffMember = {
        id: staffId,
        clinicId: cId,
        name: `${staffFirst} ${staffLast}`,
        role: rng.pick(['Lead Dispenser', 'Reception Head', 'Clinic Coordinator']),
        phone: `+91 97${rng.nextInt(10000000, 99999999)}`,
        completedModules: isCertified ? ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6'] : ['mod-1', 'mod-2'],
        isCertified,
        certifiedDate: isCertified ? formatISO(subDays(now, rng.nextInt(20, 60))) : undefined,
        points: isCertified ? rng.nextInt(180, 650) : rng.nextInt(40, 120),
        refillsCompleted: rng.nextInt(20, 340),
      }
      staffMembers.push(staff)

      // Stock for each product SKU
      for (const sku of PRODUCT_SKUS) {
        const isLow = targetHealth === 'at_risk' && rng.next() > 0.4
        const refillsOnHand = isLow ? rng.nextInt(1, 4) : rng.nextInt(8, 28)
        const fullPacksOnHand = rng.nextInt(6, 20)
        const daysOfCover = Math.round((refillsOnHand / (patientVolume * dispensingShare * 0.02 || 1)) * 30)

        stockItems.push({
          clinicId: cId,
          skuId: sku.id,
          fullPacksOnHand,
          refillsOnHand,
          minThreshold: 5,
          daysOfCover: Math.max(2, Math.min(45, daysOfCover)),
        })
      }

      // Replenishment order if low stock or active
      if (targetHealth === 'at_risk' || rng.next() > 0.6) {
        replenishmentOrders.push({
          id: `ord-${cId}-${rng.nextInt(100, 999)}`,
          clinicId: cId,
          skuId: PRODUCT_SKUS[0].id,
          refillUnits: 25,
          fullPackUnits: 10,
          status: rng.pick(['requested', 'approved', 'dispatched']),
          requestedAt: formatISO(subDays(now, rng.nextInt(1, 4))),
          updatedAt: formatISO(subDays(now, rng.nextInt(0, 1))),
          trackingNote: 'BlueDart Express: In Transit from Bhiwandi Warehouse',
        })
      }

      // Pickup task if bin high
      if (binCount >= 18) {
        pickupTasks.push({
          id: `pickup-${cId}-${rng.nextInt(100, 999)}`,
          clinicId: cId,
          packCount: binCount,
          status: rng.pick(['requested', 'scheduled']),
          requestedAt: formatISO(subDays(now, rng.nextInt(0, 2))),
          scheduledDate: formatISO(subDays(now, -1)),
        })
      }
    }
  }

  // Generate ~1,500 Patients
  const patients: Patient[] = []
  const patientCount = 1500

  for (let p = 1; p <= patientCount; p++) {
    const pFirst = rng.pick(FIRST_NAMES)
    const pLast = rng.pick(LAST_NAMES)
    const assignedClinic = rng.pick(clinics)
    const activeSku = rng.pick(PRODUCT_SKUS)
    const daysElapsed = rng.nextInt(4, 38)
    const cycleDays = activeSku.usageCycleDays
    const streak = rng.nextInt(1, 8)
    const packsSaved = streak

    let tier: 'starter' | 'green' | 'gold' = 'starter'
    if (streak >= 5) tier = 'gold'
    else if (streak >= 2) tier = 'green'

    patients.push({
      id: `pat-${p}`,
      name: `${pFirst} ${pLast}`,
      phone: `+91 9${rng.nextInt(800000000, 999999999)}`,
      email: `${pFirst.toLowerCase()}.${pLast.toLowerCase()}${rng.nextInt(10, 99)}@gmail.com`,
      primaryClinicId: assignedClinic.id,
      enrolledDate: formatISO(subDays(now, rng.nextInt(30, 120))),
      activeSkuId: activeSku.id,
      usageDaysElapsed: daysElapsed,
      usageCycleDays: cycleDays,
      refillStreak: streak,
      loyaltyTier: tier,
      pointsBalance: streak * 100 + rng.nextInt(0, 50),
      packsSavedTotal: packsSaved,
      lastRefillDate: formatISO(subDays(now, daysElapsed)),
      qrCodeValue: `REFILLRX-PAT-${p}-${assignedClinic.id}`,
    })
  }

  // Generate ~6,000 Refill Transactions across 12 weeks (84 days)
  const transactions: RefillTransaction[] = []
  const returnPacks: ReturnPack[] = []

  let txCounter = 0
  const totalWeeks = 12
  const mainTerritoryClinics = clinics.filter(c => c.territoryId === 'terr-mumbai-thane')

  for (let dayOffset = 84; dayOffset >= 0; dayOffset--) {
    const txDate = subDays(now, dayOffset)
    const dayOfWeek = txDate.getDay() // 0 is Sunday
    const weekNumber = Math.floor((84 - dayOffset) / 7) + 1

    // Ramp-up volume curve: Week 1 ~30 tx/day, Week 12 ~95 tx/day across all 100 clinics
    const rampFactor = 0.35 + (weekNumber / totalWeeks) * 0.65
    // Weekday pattern: Sunday clinics are often closed or low OPD, Mon/Wed/Sat are peak
    const weekdayMultiplier = dayOfWeek === 0 ? 0.35 : dayOfWeek === 6 ? 1.25 : 1.05

    const txsToday = Math.round(rng.nextInt(55, 90) * rampFactor * weekdayMultiplier)

    for (let t = 0; t < txsToday; t++) {
      txCounter++
      // 45% weight to main territory so demo charts look rich and deep
      const clinic = rng.next() < 0.45 
        ? rng.pick(mainTerritoryClinics) 
        : rng.pick(clinics)
      
      const sku = rng.pick(PRODUCT_SKUS)
      const patient = rng.pick(patients)
      const batchCode = `B${rng.nextInt(20, 26)}-${rng.nextInt(100, 999)}`

      // 1.5% void rate for realism
      const isVoided = rng.next() < 0.015
      const paymentMode = rng.pickWeighted([
        { item: 'upi' as const, weight: 65 },
        { item: 'card' as const, weight: 25 },
        { item: 'cash' as const, weight: 10 },
      ])

      const fullPrice = sku.fullPriceINR
      const refillPrice = sku.refillPriceINR
      const discountPct = Number(((fullPrice - refillPrice) / fullPrice).toFixed(2))
      const doctorMargin = Math.round(refillPrice * sku.doctorRefillMarginPct)

      const txTimestamp = formatISO(new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate(), rng.nextInt(10, 19), rng.nextInt(0, 59)))

      const tx: RefillTransaction = {
        id: `tx-${txCounter}`,
        clinicId: clinic.id,
        patientId: patient.id,
        skuId: sku.id,
        batchCode,
        fullPrice,
        refillPrice,
        discountPct,
        doctorMargin,
        staffId: `staff-${clinic.id}`,
        staffName: 'Clinic Staff',
        paymentMode,
        timestamp: txTimestamp,
        status: isVoided ? 'voided' : 'completed',
        voidReason: isVoided ? rng.pick(['Accidental duplicate entry', 'Patient card declined', 'Wrong SKU selected by reception']) : undefined,
      }
      transactions.push(tx)

      if (!isVoided) {
        returnPacks.push({
          id: `ret-${txCounter}`,
          clinicId: clinic.id,
          batchCode,
          skuId: sku.id,
          scannedAt: txTimestamp,
          verifiedChecks: { intact: true, matchesRange: true, batchCodeReadable: true },
          duplicateFlag: false,
        })
      }
    }
  }

  // Generate Prioritized Action Tasks for Rep
  const actionTasks: ActionTask[] = []
  let taskCounter = 0

  for (const clinic of mainTerritoryClinics) {
    if (clinic.healthStatus === 'dormant') {
      taskCounter++
      actionTasks.push({
        id: `task-${taskCounter}`,
        clinicId: clinic.id,
        clinicName: clinic.name,
        doctorName: clinic.doctorName,
        locality: clinic.locality,
        priority: 'urgent',
        title: 'Zero refills for 10+ days – Retrain & Revive Clinic',
        description: `${clinic.doctorName} had no refill transactions in 14 days. Visit in person to resolve receptionist friction, check standee placement, and restock.`,
        triggerRule: 'dormant_streak',
        status: 'pending',
        dueDate: formatISO(subDays(now, -1)),
        createdAt: formatISO(subDays(now, 2)),
      })
    } else if ((clinic.binCount || 0) >= (clinic.binThreshold || 20)) {
      taskCounter++
      actionTasks.push({
        id: `task-${taskCounter}`,
        clinicId: clinic.id,
        clinicName: clinic.name,
        doctorName: clinic.doctorName,
        locality: clinic.locality,
        priority: 'high',
        title: `Returns bin threshold exceeded (${clinic.binCount}/20 packs)`,
        description: `Returns bin at ${clinic.name} is full. Coordinate immediate reverse-logistics pickup to keep reception counter clean.`,
        triggerRule: 'bin_threshold',
        status: 'pending',
        dueDate: formatISO(subDays(now, -2)),
        createdAt: formatISO(subDays(now, 1)),
      })
    } else if (clinic.healthStatus === 'champion') {
      taskCounter++
      actionTasks.push({
        id: `task-${taskCounter}`,
        clinicId: clinic.id,
        clinicName: clinic.name,
        doctorName: clinic.doctorName,
        locality: clinic.locality,
        priority: 'medium',
        title: 'Nominate for Quarterly Green Practice Leader Award',
        description: `${clinic.doctorName} achieved 88% refill rate. Present framed Green Clinic Certificate and feature in the regional L\'Oréal medical newsletter.`,
        triggerRule: 'champion_nomination',
        status: 'pending',
        dueDate: formatISO(subDays(now, -5)),
        createdAt: formatISO(subDays(now, 3)),
      })
    }
  }

  // Generate Rep Visits
  const visits: Visit[] = []
  for (let v = 0; v < 15; v++) {
    const cl = mainTerritoryClinics[v % mainTerritoryClinics.length]
    visits.push({
      id: `visit-${v + 1}`,
      repId: 'rep-vikram',
      clinicId: cl.id,
      clinicName: cl.name,
      doctorName: cl.doctorName,
      date: formatISO(subDays(now, v - 3)), // past and upcoming
      timeSlot: `${11 + (v % 5)}:00 AM`,
      type: v % 3 === 0 ? 'urgent' : v % 2 === 0 ? 'training' : 'routine',
      status: v < 5 ? 'completed' : 'planned',
      notes: v < 5 ? 'Doctor enthusiastic about 20% patient circular reward. Receptionist trained on 3-tap counter flow.' : undefined,
      checklist: [
        { task: 'Inspect counter standee visibility', done: v < 5 },
        { task: 'Audit refill stock and expiry codes', done: v < 5 },
        { task: 'Check returns bin fill level', done: v < 5 },
        { task: 'Review monthly margin earnings with doctor', done: v < 5 },
      ]
    })
  }

  // Generate Patient Feedback
  const feedbacks: PatientFeedback[] = []
  for (let f = 1; f <= 50; f++) {
    const cl = rng.pick(mainTerritoryClinics)
    const pat = rng.pick(patients)
    const rating = rng.pickWeighted([
      { item: 5, weight: 65 },
      { item: 4, weight: 25 },
      { item: 3, weight: 8 },
      { item: 2, weight: 2 },
    ])

    feedbacks.push({
      id: `fb-${f}`,
      clinicId: cl.id,
      patientId: pat.id,
      rating,
      tags: rating >= 4 
        ? ['Quick 20s Checkout', 'Loved the ₹270 Savings', 'Sterile Sealed Pod', 'Proud to Save Plastic']
        : ['Wait time at desk', 'Had to ask receptionist for refill'],
      comments: rating >= 4 
        ? 'Super convenient! My empty moisturizer bottle was accepted instantly and I got a fresh sealed pod in under a minute.'
        : 'Doctor recommended it, but staff took a while to find the refill box.',
      timestamp: formatISO(subDays(now, rng.nextInt(1, 30))),
    })
  }

  // Initial Notifications
  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      targetRoles: ['rep', 'manager'],
      title: 'Territory Target Achieved: 42.4% Refill Rate',
      message: 'Mumbai-Thane territory crossed the 40% target refill rate milestone for 3 consecutive weeks!',
      timestamp: formatISO(subDays(now, 0)),
      read: false,
      type: 'success',
      actionUrl: '/territory',
    },
    {
      id: 'notif-2',
      targetRoles: ['rep'],
      title: 'Action Required: SkinFirst Clinic Returns Bin Full',
      message: 'Returns bin at SkinFirst Clinic, Thane has 20 empties awaiting pickup.',
      timestamp: formatISO(subDays(now, 1)),
      read: false,
      type: 'warning',
      actionUrl: '/territory',
    },
    {
      id: 'notif-3',
      targetRoles: ['doctor', 'staff'],
      title: 'New Monthly Margin Milestone: ₹34,200',
      message: 'Your practice earned ₹34,200 in incremental refill margins this month.',
      timestamp: formatISO(subDays(now, 2)),
      read: true,
      type: 'info',
      actionUrl: '/doctor-dash',
    },
    {
      id: 'notif-4',
      targetRoles: ['patient'],
      title: 'Your Daily Moisturiser is 80% Finished',
      message: 'Time for your eco-refill! Bring your empty bottle to SkinFirst Clinic to save ₹270 and 38g plastic.',
      timestamp: formatISO(subDays(now, 0)),
      read: false,
      type: 'info',
      actionUrl: '/patient',
    }
  ]

  return {
    clinics,
    staffMembers,
    stockItems,
    replenishmentOrders,
    pickupTasks,
    patients,
    transactions,
    returnPacks,
    actionTasks,
    visits,
    feedbacks,
    notifications,
  }
}

