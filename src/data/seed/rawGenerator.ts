import { formatISO, subDays, parseISO } from 'date-fns'
import {
  Certification,
  Clinic,
  Doctor,
  DoctorArchetype,
  EnrolmentRecord,
  Feedback,
  LeverAssignment,
  Patient,
  PickupTask,
  QuizResult,
  RefillTransaction,
  ReplenishmentOrder,
  ReturnedPack,
  Staff,
  StockItem,
  TrainingProgress,
  Visit,
} from '../../domain/entities'
import { SEED_SKUS } from './seedSkus'
import { SEED_REPS, SEED_TERRITORIES } from './seedTerritories'
import { SEED_LEVERS } from './seedLevers'

export class SeededRNG {
  private s: number

  constructor(seed: number = 20260315) {
    this.s = seed
  }

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
  'Meera', 'Radhika', 'Deepak', 'Manish', 'Sanjay', 'Shweta', 'Rashmi', 'Divya', 'Gaurav', 'Vikram'
]

const LAST_NAMES = [
  'Mehta', 'Shah', 'Patil', 'Kulkarni', 'Deshmukh', 'Joshi', 'Agarwal', 'Sharma', 'Verma', 'Gupta',
  'Nair', 'Menon', 'Rao', 'Reddy', 'Kamath', 'Bhat', 'Shetty', 'Pawar', 'Shinde', 'Chavan',
  'Tambe', 'Gokhale', 'Savant', 'Bhide', 'Modi', 'Kapoor', 'Malhotra', 'Singhania', 'Merchant', "D'Souza"
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
  { name: 'Dombivli East (Manpada)', lat: 19.2184, lng: 73.0867 },
]

const CLINIC_PREFIXES = [
  'SkinFirst', 'Aura Derma', 'Apex Skin & Laser', 'Dermacare', 'Kaya Aesthetics',
  'ClearSkin Centre', 'PureDerm', 'Radiance Skin', 'Lumina Clinic', 'SkinVogue',
  'DermaCrest', 'Vitality Skin', 'Renaissance Aesthetics', 'SkinMatrix', 'PrimeDerma'
]

const ARCHETYPES: DoctorArchetype[] = [
  'clinician_first',
  'margin_driven',
  'loyalty_builder',
  'eco_advocate',
  'time_poor_skeptic',
]

export interface RawSeedDataset {
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
}

export function generateRawDataset(seed: number = 20260315): RawSeedDataset {
  const rng = new SeededRNG(seed)
  const now = new Date()

  const clinics: Clinic[] = []
  const doctors: Doctor[] = []
  const staff: Staff[] = []
  const stocks: StockItem[] = []
  const orders: ReplenishmentOrder[] = []
  const pickups: PickupTask[] = []
  const leverAssignments: LeverAssignment[] = []
  const visits: Visit[] = []
  const enrolments: EnrolmentRecord[] = []
  const trainingProgress: TrainingProgress[] = []
  const quizResults: QuizResult[] = []
  const certifications: Certification[] = []

  let clinicGlobalIdx = 1

  for (const terr of SEED_TERRITORIES) {
    const isMainTerritory = terr.id === 'terr-mumbai-thane'
    const clinicCount = 25

    for (let c = 1; c <= clinicCount; c++) {
      const cId = (terr.id === 'terr-mumbai-thane' && c === 1) ? 'clinic-1' : `clinic-${terr.id}-${c}`
      const docId = `doc-${terr.id}-${c}`
      const staffId = `staff-${terr.id}-${c}`

      const docFirst = rng.pick(FIRST_NAMES)
      const docLast = rng.pick(LAST_NAMES)
      const docName = `Dr. ${docFirst} ${docLast}`
      const prefix = rng.pick(CLINIC_PREFIXES)
      const clinicName = `${prefix} (${docLast})`
      const archetype = rng.pick(ARCHETYPES)

      const locIdx = (c - 1) % LOCALITIES_MUMBAI_THANE.length
      const baseLoc = LOCALITIES_MUMBAI_THANE[locIdx]
      const latJitter = (rng.next() - 0.5) * 0.02
      const lngJitter = (rng.next() - 0.5) * 0.02

      const clinic: Clinic = {
        id: cId,
        name: clinicName,
        doctorId: docId,
        territoryId: terr.id,
        address: `Suite ${100 + c}, Platinum Medical Arcade, Opp. Station Rd`,
        locality: isMainTerritory ? baseLoc.name : `${terr.name} Sector ${c}`,
        lat: baseLoc.lat + latJitter,
        lng: baseLoc.lng + lngJitter,
        counterPin: `${1000 + (clinicGlobalIdx % 9000)}`,
        enrolledAt: formatISO(subDays(now, rng.nextInt(60, 180))),
        doctorName: docName,
        doctorDegree: rng.pick(['MD (Dermatology)', 'DVD, DNB (Derma)', 'MD (Skin & VD), FAAD', 'MBBS, DDVL']),
        archetype,
        patientVolumeMonthly: rng.nextInt(350, 950),
        dispensingSharePct: rng.nextInt(40, 75),
        brandsStocked: ['RefillRx Range', 'Avene', 'La Roche-Posay', 'Cetaphil', 'Bioderma'],
        binCount: rng.nextInt(6, 16),
        binThreshold: 20,
        totalRefillsAllTime: rng.nextInt(80, 240),
        totalPacksSavedAllTime: rng.nextInt(75, 220),
        healthScore: rng.nextInt(72, 94),
        healthStatus: 'on_track',
        activeLevers: ['lev-training', 'lev-counter-app', 'lev-margin-boost'],
        lastVisitDate: formatISO(subDays(now, rng.nextInt(2, 20))),
        lastRefillDate: formatISO(subDays(now, rng.nextInt(0, 3))),
      }
      clinics.push(clinic)

      const doctor: Doctor = {
        id: docId,
        name: docName,
        degree: rng.pick(['MD (Dermatology)', 'DVD, DNB (Derma)', 'MD (Skin & VD), FAAD', 'MBBS, DDVL']),
        phone: `+91 98${rng.nextInt(10000000, 99999999)}`,
        email: `${docFirst.toLowerCase()}.${docLast.toLowerCase()}@derma.in`,
        archetype,
        primaryClinicId: cId,
      }
      doctors.push(doctor)

      const staffFirst = rng.pick(FIRST_NAMES)
      const staffLast = rng.pick(LAST_NAMES)
      const isFreshStaffClinic = cId === 'clinic-1'
      const isStaffCert = isFreshStaffClinic ? false : rng.next() > 0.35
      const staffMember: Staff = {
        id: staffId,
        clinicId: cId,
        name: `${staffFirst} ${staffLast}`,
        role: rng.pick(['Lead Dispenser', 'Reception Head', 'Clinic Coordinator']),
        phone: `+91 97${rng.nextInt(10000000, 99999999)}`,
        completedModules: isFreshStaffClinic ? [] : (isStaffCert ? ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6'] : ['mod-1', 'mod-2']),
        isCertified: isStaffCert,
        certifiedDate: isStaffCert ? formatISO(subDays(now, rng.nextInt(20, 60))) : undefined,
        points: isFreshStaffClinic ? 0 : (isStaffCert ? rng.nextInt(180, 650) : rng.nextInt(40, 120)),
        refillsCompleted: rng.nextInt(20, 340),
      }
      staff.push(staffMember)

      // Initial Stock Items
      for (const sku of SEED_SKUS) {
        stocks.push({
          id: `stock-${cId}-${sku.id}`,
          clinicId: cId,
          skuId: sku.id,
          fullPacksOnHand: rng.nextInt(6, 22),
          refillsOnHand: rng.nextInt(4, 25),
          minThreshold: 5,
        })
      }

      // Initial Lever Assignments
      for (const lever of SEED_LEVERS) {
        leverAssignments.push({
          clinicId: cId,
          leverId: lever.id,
          active: lever.defaultActive ? rng.next() > 0.15 : rng.next() > 0.7,
          updatedAt: formatISO(subDays(now, rng.nextInt(10, 60))),
        })
      }

      // Training progress
      const completedCount = isFreshStaffClinic ? 0 : (isStaffCert ? 6 : rng.nextInt(1, 4))
      for (let m = 1; m <= completedCount; m++) {
        const modId = `mod-${m}`
        const compDate = formatISO(subDays(now, rng.nextInt(15, 60)))
        trainingProgress.push({
          id: `tp-${staffId}-${modId}`,
          staffId,
          moduleId: modId,
          completedAt: compDate,
        })
        quizResults.push({
          id: `qr-${staffId}-${modId}`,
          staffId,
          moduleId: modId,
          score: 100,
          passed: true,
          attemptedAt: compDate,
        })
      }
      if (isStaffCert) {
        certifications.push({
          id: `cert-${staffId}`,
          staffId,
          badgeName: 'Certified Refill Dispenser',
          issuedAt: formatISO(subDays(now, rng.nextInt(10, 40))),
        })
      }

      // Enrolment record
      enrolments.push({
        id: `enrol-${cId}`,
        clinicId: cId,
        eSignature: `Signed by ${docName}`,
        signedAt: clinic.enrolledAt,
        kitDelivered: true,
        staffTrained: isStaffCert,
        counterInstalled: true,
        firstRefillDone: true,
        signagePlaced: true,
        firstPickupDone: rng.next() > 0.4,
      })

      // Replenishment order if active
      if (rng.next() > 0.6) {
        orders.push({
          id: `ord-${cId}-${rng.nextInt(100, 999)}`,
          clinicId: cId,
          skuId: SEED_SKUS[0].id,
          refillUnits: 25,
          fullPackUnits: 10,
          status: rng.pick(['requested', 'approved', 'dispatched']),
          requestedAt: formatISO(subDays(now, rng.nextInt(1, 4))),
          updatedAt: formatISO(subDays(now, rng.nextInt(0, 1))),
          trackingNote: 'Express Logistics: Bhiwandi Warehouse Dispatch',
        })
      }



      // Visit by rep
      visits.push({
        id: `visit-${cId}`,
        repId: terr.repId || 'rep-1',
        clinicId: cId,
        clinicName,
        doctorName: docName,
        date: formatISO(subDays(now, rng.nextInt(1, 20))),
        timeSlot: rng.pick(['11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM']),
        type: rng.pick(['routine', 'training', 'urgent']),
        status: rng.pick(['completed', 'planned']),
        notes: `Checked counter standee and discussed refill inventory. Doctor responded positively.`,
        checklist: [
          { task: 'Check refill pod shelf stock', done: true },
          { task: 'Inspect returns bin seal', done: true },
          { task: 'Review receptionist counter flow', done: isStaffCert },
        ],
      })

      clinicGlobalIdx++
    }
  }

  // Generate 1,500 Patients
  const patients: Patient[] = []
  const patientCount = 1500

  for (let p = 1; p <= patientCount; p++) {
    const pFirst = rng.pick(FIRST_NAMES)
    const pLast = rng.pick(LAST_NAMES)
    const assignedClinic = rng.pick(clinics)
    const activeSku = rng.pick(SEED_SKUS)

    const daysElapsed = rng.nextInt(4, 38)
    const cycleDays = activeSku.usageCycleDays
    const streak = rng.nextInt(1, 8)
    let tier: 'starter' | 'green' | 'gold' = 'starter'
    if (streak >= 5) tier = 'gold'
    else if (streak >= 2) tier = 'green'

    patients.push({
      id: `pat-${p}`,
      name: `${pFirst} ${pLast}`,
      phone: `+91 9${rng.nextInt(800000000, 999999999)}`,
      email: `${pFirst.toLowerCase()}.${pLast.toLowerCase()}${rng.nextInt(10, 99)}@gmail.com`,
      primaryClinicId: assignedClinic.id,
      activeSkuId: activeSku.id,
      enrolledAt: formatISO(subDays(now, rng.nextInt(30, 120))),
      enrolledDate: formatISO(subDays(now, rng.nextInt(30, 120))),
      usageDaysElapsed: daysElapsed,
      usageCycleDays: cycleDays,
      refillStreak: streak,
      loyaltyTier: tier,
      pointsBalance: streak * 100 + rng.nextInt(0, 50),
      packsSavedTotal: streak,
      lastRefillDate: formatISO(subDays(now, daysElapsed)),
      qrCodeValue: `REFILLRX-PAT-${p}-${assignedClinic.id}`,
    })
  }

  // Generate 12 weeks of historical transactions (~5,500)
  const transactions: RefillTransaction[] = []
  const returns: ReturnedPack[] = []
  const feedback: Feedback[] = []

  let txCounter = 0
  const totalWeeks = 12
  const pilotClinics = clinics.filter((c) => c.territoryId === 'terr-mumbai-thane')

  for (let dayOffset = 84; dayOffset >= 0; dayOffset--) {
    const txDate = subDays(now, dayOffset)
    const dayOfWeek = txDate.getDay()
    const weekNumber = Math.floor((84 - dayOffset) / 7) + 1
    const rampFactor = 0.4 + (weekNumber / totalWeeks) * 0.6
    const weekdayMultiplier = dayOfWeek === 0 ? 0.35 : dayOfWeek === 6 ? 1.25 : 1.05

    const txsToday = Math.round(rng.nextInt(45, 80) * rampFactor * weekdayMultiplier)

    for (let t = 0; t < txsToday; t++) {
      txCounter++
      // 50% transactions in pilot territory for dense representative demo data
      const clinic = rng.next() < 0.5 ? rng.pick(pilotClinics) : rng.pick(clinics)
      const sku = rng.pick(SEED_SKUS)
      const patient = rng.pick(patients)
      const batchCode = `B${rng.nextInt(21, 26)}-${rng.nextInt(100, 999)}`

      const isVoided = rng.next() < 0.012
      const paymentMode = rng.pickWeighted([
        { item: 'upi' as const, weight: 65 },
        { item: 'card' as const, weight: 25 },
        { item: 'cash' as const, weight: 10 },
      ])

      const fullPriceINR = sku.fullPriceINR
      const refillPriceINR = sku.refillPriceINR
      const discountPct = Math.round(((fullPriceINR - refillPriceINR) / fullPriceINR) * 100)
      const doctorMarginINR = Math.round(refillPriceINR * sku.doctorRefillMarginPct)

      const txTimestamp = formatISO(
        new Date(
          txDate.getFullYear(),
          txDate.getMonth(),
          txDate.getDate(),
          rng.nextInt(10, 20),
          rng.nextInt(0, 59)
        )
      )

      const tx: RefillTransaction = {
        id: `tx-${txCounter}`,
        clinicId: clinic.id,
        patientId: patient.id,
        skuId: sku.id,
        batchCode,
        fullPriceINR,
        refillPriceINR,
        fullPrice: fullPriceINR,
        refillPrice: refillPriceINR,
        discountPct,
        doctorMarginINR,
        doctorMargin: doctorMarginINR,
        staffId: `staff-${clinic.territoryId}-${clinic.id.split('-').pop()}`,
        staffName: 'Lead Dispenser',
        paymentMode,
        timestamp: txTimestamp,
        status: isVoided ? 'voided' : 'completed',
        voidReason: isVoided ? 'Customer changed mind at POS' : undefined,
      }
      transactions.push(tx)

      // Returned pack corresponding to refill
      if (!isVoided) {
        returns.push({
          id: `ret-${txCounter}`,
          clinicId: clinic.id,
          patientId: patient.id,
          skuId: sku.id,
          batchCode,
          scannedAt: txTimestamp,
          verifiedChecks: {
            intact: true,
            matchesRange: true,
            batchLegible: true,
          },
        })

        // Sample patient feedback (1 in 15 transactions)
        if (rng.next() < 0.07) {
          feedback.push({
            id: `fb-${txCounter}`,
            clinicId: clinic.id,
            patientId: patient.id,
            rating: rng.pickWeighted([
              { item: 5, weight: 65 },
              { item: 4, weight: 25 },
              { item: 3, weight: 7 },
              { item: 2, weight: 2 },
              { item: 1, weight: 1 },
            ]),
            tags: rng.pick([
              ['Quick counter flow', 'Loving the discount'],
              ['Saves plastic', 'Great doctor advice'],
              ['Seamless WhatsApp pass', 'Helpful receptionist'],
              ['Formula is identical', 'Zero mess refill'],
            ]),
            comments: rng.pick([
              'Refilled in under 30 seconds, very impressed!',
              'Glad my doctor offers this, feels good not to throw bottles away.',
              'Saved ₹270 and got genuine cream directly from clinic.',
              'Very smooth process, staff was polite and efficient.',
            ]),
            timestamp: txTimestamp,
          })
        }
      }
    }
  }

  // Generate completed historical pickups & open pickups for 2-3 clinics at 20+
  const thresholdClinicIds = new Set([
    'clinic-terr-mumbai-thane-3',
    'clinic-terr-mumbai-thane-7',
    'clinic-terr-delhi-ncr-2',
  ])

  for (const clinic of clinics) {
    const clinicReturns = returns
      .filter((r) => r.clinicId === clinic.id)
      .sort((a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime())

    const isThreshold = thresholdClinicIds.has(clinic.id)
    const desiredBin = isThreshold ? 21 : rng.nextInt(5, 16)
    const pastCount = Math.max(0, clinicReturns.length - desiredBin)
    const pastReturns = clinicReturns.slice(0, pastCount)

    const batchSize = 20
    let pIdx = 1
    for (let i = 0; i < pastReturns.length; i += batchSize) {
      const batch = pastReturns.slice(i, i + batchSize)
      const lastRet = batch[batch.length - 1]
      const completedAt = lastRet.scannedAt
      const requestedAt = formatISO(subDays(parseISO(completedAt), 1))
      pickups.push({
        id: `pickup-hist-${clinic.id}-${pIdx++}`,
        clinicId: clinic.id,
        packCount: batch.length,
        status: 'recycled',
        requestedAt,
        completedAt,
      })
    }

    if (isThreshold) {
      pickups.push({
        id: `pickup-open-${clinic.id}`,
        clinicId: clinic.id,
        packCount: desiredBin,
        status: 'requested',
        requestedAt: formatISO(subDays(now, 1)),
        scheduledDate: formatISO(subDays(now, -1)),
      })
    }

    clinic.binCount = desiredBin
    clinic.binThreshold = 20
    clinic.totalPacksSavedAllTime = clinicReturns.length
  }

  return {
    clinics,
    doctors,
    staff,
    patients,
    stocks,
    transactions,
    returns,
    orders,
    pickups,
    leverAssignments,
    visits,
    feedback,
    enrolments,
    trainingProgress,
    quizResults,
    certifications,
  }
}
