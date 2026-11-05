import { DoctorArchetype, Lever, ProductSKU, Territory, TrainingModule } from '../types'

export const PRODUCT_SKUS: ProductSKU[] = [
  {
    id: 'sku-moisturiser-50',
    name: 'Daily Ceramide Barrier Moisturiser',
    subtitle: 'Lipid-Replenishing Emulsion for Dry/Compromised Skin',
    category: 'Moisturiser',
    volume: '50 ml',
    fullPriceINR: 1350,
    refillPriceINR: 1080, // 20% discount to patient
    doctorFullMarginPct: 0.25, // ₹337.50
    doctorRefillMarginPct: 0.32, // ₹345.60
    plasticWeightGrams: 38,
    co2FactorGrams: 110,
    usageCycleDays: 30,
    heroColor: '#1f9d5f',
  },
  {
    id: 'sku-cleanser-200',
    name: 'Gentle Foaming Amino Cleanser',
    subtitle: 'Sulfate-Free Balancing Cleanser for Sensitive Skin',
    category: 'Cleanser',
    volume: '200 ml',
    fullPriceINR: 1150,
    refillPriceINR: 920,
    doctorFullMarginPct: 0.24, // ₹276
    doctorRefillMarginPct: 0.30, // ₹276
    plasticWeightGrams: 55,
    co2FactorGrams: 160,
    usageCycleDays: 45,
    heroColor: '#3b82f6',
  },
  {
    id: 'sku-sunscreen-50',
    name: 'Photoprotect UV Invisible Fluid SPF 50+',
    subtitle: 'Ultra-Light Broad Spectrum PA++++ Shield',
    category: 'Sunscreen',
    volume: '50 ml',
    fullPriceINR: 1450,
    refillPriceINR: 1160,
    doctorFullMarginPct: 0.26, // ₹377
    doctorRefillMarginPct: 0.34, // ₹394.40
    plasticWeightGrams: 32,
    co2FactorGrams: 95,
    usageCycleDays: 30,
    heroColor: '#e8b04a',
  },
]

export const TERRITORIES: Territory[] = [
  {
    id: 'terr-mumbai-thane',
    name: 'Mumbai–Thane–Navi Mumbai (Pilot Territory)',
    code: 'MUM-THN-01',
    targetRefillRate: 0.40,
    repName: 'Vikram Salunkhe',
    repPhone: '+91 98201 44520',
    clinicCount: 25,
  },
  {
    id: 'terr-mumbai-south',
    name: 'South & Central Mumbai',
    code: 'MUM-SOU-02',
    targetRefillRate: 0.40,
    repName: 'Ananya Deshmukh',
    repPhone: '+91 98205 11928',
    clinicCount: 25,
  },
  {
    id: 'terr-pune-metro',
    name: 'Pune Metro & PCMC',
    code: 'PUN-MET-01',
    targetRefillRate: 0.38,
    repName: 'Rohan Kulkarni',
    repPhone: '+91 98902 33411',
    clinicCount: 25,
  },
  {
    id: 'terr-bengaluru-central',
    name: 'Bengaluru Central & Indiranagar',
    code: 'BLR-CEN-01',
    targetRefillRate: 0.42,
    repName: 'Karthik Rao',
    repPhone: '+91 98450 78219',
    clinicCount: 25,
  },
]

export interface ArchetypeDefinition {
  type: DoctorArchetype
  title: string
  tagline: string
  description: string
  primaryMotivators: string[]
  topObjections: string[]
  recommendedPitchAngle: string
  recommendedLevers: string[]
  radarWeights: {
    clinicalTrust: number
    margin: number
    patientLoyalty: number
    staffSimplicity: number
    sustainability: number
  }
}

export const ARCHETYPES: Record<DoctorArchetype, ArchetypeDefinition> = {
  clinician_first: {
    type: 'clinician_first',
    title: 'Clinician-First Purist',
    tagline: 'Prioritises therapeutic efficacy, zero counterfeit risk & patient compliance',
    description: 'Relies primarily on peer-reviewed evidence and rigorous hygiene standards. Only dispenses what they deem medically essential and worries about tamper-evident integrity of refill containers.',
    primaryMotivators: ['Clinical formula purity', 'Patient adherence tracking', 'Medical credibility of the brand'],
    topObjections: ['Hygiene & tamper contamination', 'Perception of commercialization', 'Prescribing vs dispensing conflict'],
    recommendedPitchAngle: 'Position the refill mechanism as an Adherence Guarantee: patients stay on therapeutic regimen 2.2x longer when refills are secured directly through the clinic.',
    recommendedLevers: ['Tamper-evident sealed refill pods', 'Medical-grade counter standee', 'Adherence tracking portal'],
    radarWeights: { clinicalTrust: 5, margin: 2, patientLoyalty: 4, staffSimplicity: 3, sustainability: 3 },
  },
  margin_driven: {
    type: 'margin_driven',
    title: 'Margin-Driven Entrepreneur',
    tagline: 'Runs clinic with strict P&L discipline; evaluates every square foot of shelf space',
    description: 'Thinks like an astute retail proprietor. Constantly compares brand margins, return policies, credit terms, and cash conversion cycles.',
    primaryMotivators: ['High absolute gross margin', 'Sale-or-return guarantee', 'Zero dead-stock risk'],
    topObjections: ['Margin too low compared to local compounding/derma brands', 'Capital tied up in refill pods', 'Risk of unsold refill inventory'],
    recommendedPitchAngle: 'Refill yields +32% margin on repeat transactions with zero cannibalisation, backed by a 100% Sale-or-Return stock buyback guarantee.',
    recommendedLevers: ['Consignment / Sale-or-return stock', 'Tiered quarterly cash bonuses', 'Staff dispenser commission'],
    radarWeights: { clinicalTrust: 3, margin: 5, patientLoyalty: 4, staffSimplicity: 3, sustainability: 2 },
  },
  loyalty_builder: {
    type: 'loyalty_builder',
    title: 'Patient Loyalty Builder',
    tagline: 'Focuses on long-term lifetime patient retention and recurring clinic footfall',
    description: 'Sees the clinic as an enduring wellness hub. Understands that a patient walking in for a monthly refill also schedules routine peeling sessions, consultations, and aesthetic maintenance.',
    primaryMotivators: ['Clinic footfall frequency', 'Patient lifetime value', 'Word-of-mouth differentiation'],
    topObjections: ['Staff resistance due to time required', 'Patients forgetting to bring empties', 'Discount erosion of prestige'],
    recommendedPitchAngle: 'Refill is an automated clinic footfall driver: turning a one-time product sale into 4 to 6 physical clinic visits every single year.',
    recommendedLevers: ['Automated WhatsApp refill nudges', 'Clinic branded loyalty card', '30-second 3-tap counter flow'],
    radarWeights: { clinicalTrust: 4, margin: 4, patientLoyalty: 5, staffSimplicity: 4, sustainability: 4 },
  },
  eco_advocate: {
    type: 'eco_advocate',
    title: 'Eco-Conscious Pioneer',
    tagline: 'Deeply passionate about planetary health, conscious dermatology & modern ESG',
    description: 'Eagerly seeks green credentials and wants their clinic to look progressive and sustainable. Wants visible ESG recognition that impresses educated urban patients.',
    primaryMotivators: ['Measurable plastic avoided', 'Green Clinic Certificate', 'Patient pride & positive PR'],
    topObjections: ['Is it genuine circularity or greenwashing?', 'Where do the returned empties actually go?', 'Recycling certification proof'],
    recommendedPitchAngle: 'RefillRx transforms your clinic into a recognized "Green Certified Practice", showing real-time plastic and carbon reductions on an in-clinic display.',
    recommendedLevers: ['L\'Oréal Green Clinic Plaque & Certificate', 'Transparent Reverse-Logistics tracking', 'Patient-facing Impact Dashboard'],
    radarWeights: { clinicalTrust: 4, margin: 3, patientLoyalty: 5, staffSimplicity: 3, sustainability: 5 },
  },
  time_poor_skeptic: {
    type: 'time_poor_skeptic',
    title: 'Time-Poor Pragmatist',
    tagline: 'Overwhelmed with 40+ patients a day; rejects any system that strains front-desk staff',
    description: 'Has a bustling, hectic OPD. Front desk staff are already juggling appointment queues, phone calls, and billing. Any workflow that takes over 45 seconds will be abandoned immediately.',
    primaryMotivators: ['Zero staff friction', 'Under 30-second transaction', 'No complicated software'],
    topObjections: ['My receptionist does not have time', 'Lines will back up at reception', 'Too many steps to check bottles'],
    recommendedPitchAngle: 'Designed specifically for peak rush hours: 3 taps on an offline mobile tablet, QR barcode scan, done in under 30 seconds with no data entry.',
    recommendedLevers: ['3-Tap Counter App', 'Staff micro-training (<3 min)', 'Ready-to-dispense pre-packed pouches'],
    radarWeights: { clinicalTrust: 4, margin: 3, patientLoyalty: 3, staffSimplicity: 5, sustainability: 2 },
  },
}

export const DOCTOR_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'When considering whether to stock a new skincare SKU, what is the doctor’s first question?',
    options: [
      { text: 'What is the double-blind clinical trial data and skin barrier efficacy?', archetype: 'clinician_first' },
      { text: 'What is my wholesale margin, payment credit term, and replacement policy?', archetype: 'margin_driven' },
      { text: 'Will this keep my patient coming back to my clinic instead of buying on Nykaa/Amazon?', archetype: 'loyalty_builder' },
      { text: 'How easy and fast is it for my receptionist to bill and dispense during OPD rush?', archetype: 'time_poor_skeptic' },
    ],
  },
  {
    id: 'q2',
    question: 'How does the doctor perceive in-clinic product dispensing?',
    options: [
      { text: 'A medical necessity to ensure genuine formulation and treatment compliance', archetype: 'clinician_first' },
      { text: 'A crucial revenue engine that offsets rising clinic rental and equipment capital', archetype: 'margin_driven' },
      { text: 'A key patient engagement touchpoint that builds long-term relationship trust', archetype: 'loyalty_builder' },
      { text: 'A forward-looking modern practice that aligns with environmental values', archetype: 'eco_advocate' },
    ],
  },
  {
    id: 'q3',
    question: 'What is the clinic’s biggest operational bottleneck today?',
    options: [
      { text: 'Reception staff is constantly overwhelmed handling billing and queue chaos', archetype: 'time_poor_skeptic' },
      { text: 'Patients drop off treatment regimens after the initial 30 days', archetype: 'loyalty_builder' },
      { text: 'Dead stock or slow-moving products tying up clinic working capital', archetype: 'margin_driven' },
      { text: 'Patients buying counterfeit or grey-market substitutes online', archetype: 'clinician_first' },
    ],
  },
  {
    id: 'q4',
    question: 'How does the doctor react to the topic of eco-friendly refill packaging?',
    options: [
      { text: 'Highly excited; wants the clinic recognized as a sustainability leader', archetype: 'eco_advocate' },
      { text: 'Interested, but only if the refill pod is 100% sterile and sealed against contamination', archetype: 'clinician_first' },
      { text: 'Good idea, but what is my incremental margin compared to selling a new pack?', archetype: 'margin_driven' },
      { text: 'Fine, as long as it does not add more than 30 seconds to the reception queue', archetype: 'time_poor_skeptic' },
    ],
  },
  {
    id: 'q5',
    question: 'What brand incentive scheme does the doctor currently value most?',
    options: [
      { text: 'Sale-or-return guarantee and quarterly volume rebate payouts', archetype: 'margin_driven' },
      { text: 'Sponsorship for scientific symposiums and academic journal subscriptions', archetype: 'clinician_first' },
      { text: 'Clinic branding, patient education brochures, and digital recall tools', archetype: 'loyalty_builder' },
      { text: 'Turnkey counter point-of-sale displays that staff can handle without supervision', archetype: 'time_poor_skeptic' },
    ],
  },
  {
    id: 'q6',
    question: 'What is the doctor’s attitude toward patient reminders and digital follow-ups?',
    options: [
      { text: 'Crucial: we actively message patients for follow-up appointments and treatment reviews', archetype: 'loyalty_builder' },
      { text: 'We only send clinical adherence reminders for chronic conditions (acne, psoriasis)', archetype: 'clinician_first' },
      { text: 'We don’t have staff bandwidth to send manual messages; must be 100% automated', archetype: 'time_poor_skeptic' },
      { text: 'We love sending educational content on clean beauty and skin health', archetype: 'eco_advocate' },
    ],
  },
  {
    id: 'q7',
    question: 'How does the clinic handle empty containers or packaging waste today?',
    options: [
      { text: 'Thrown directly into municipal waste; doctor feels guilty but has no system', archetype: 'eco_advocate' },
      { text: 'Discarded like normal trash; we don’t have space for storage', archetype: 'time_poor_skeptic' },
      { text: 'We crush biomedical bottles to prevent counterfeit refillers from reusing them', archetype: 'clinician_first' },
      { text: 'Never thought about it—has no impact on our practice revenue', archetype: 'margin_driven' },
    ],
  },
  {
    id: 'q8',
    question: 'If a competing derma brand offers a 5% higher margin, how will this doctor respond?',
    options: [
      { text: 'Switch or demand match immediately—margin rules', archetype: 'margin_driven' },
      { text: 'Refuse to switch unless clinical efficacy and tolerance are proven superior', archetype: 'clinician_first' },
      { text: 'Evaluate if the competitor’s brand has patient brand loyalty and pull', archetype: 'loyalty_builder' },
      { text: 'Ignore if the competitor requires complicated ordering and stock hurdles', archetype: 'time_poor_skeptic' },
    ],
  },
]

export const OBJECTIONS_LIBRARY = [
  {
    id: 'obj-cannibalisation',
    title: 'Cannibalisation of Full-Pack Sales',
    category: 'Commercial',
    doctorSays: 'If I sell refills at a lower price, won’t I just cannibalise my high-margin full pack sales?',
    acknowledge: 'That is a completely natural concern—every smart clinic owner looks at whether a lower-priced SKU eats into existing top-line revenue.',
    evidence: 'In pilot dermatological data, 68% of patients who finish a first bottle NEVER buy the second full pack from the clinic; they either drop off treatment entirely or switch to e-commerce. Refills capture repeat adherence: rather than 1 full pack and 0 repeats, you get 1 full pack + 3.8 refills per year.',
    offer: 'You earn 32% margin on refills versus 25% on full packs. Over 12 months, patient lifetime margin jumps from ₹337 to ₹1,650 per patient.',
  },
  {
    id: 'obj-staff-busy',
    title: 'Staff Are Already Overwhelmed',
    category: 'Operational',
    doctorSays: 'My front desk is already swamped with appointments, billing, and calls. They will not handle complex bottle-checking.',
    acknowledge: 'I completely respect how busy your front desk is—if this takes more than a minute, it will fail in practice.',
    evidence: 'That is why the RefillRx Counter app is built around a "3-Tap Flow". We tested it with clinic receptionists: scanning the QR code, checking the batch code, and dispensing takes exactly 22 seconds.',
    offer: 'Our medical rep will personally train your receptionist in 5 minutes and we provide a micro-incentive of ₹10 per refill directly credited to your staff member.',
  },
  {
    id: 'obj-hygiene-counterfeit',
    title: 'Hygiene, Sterility & Counterfeit Refills',
    category: 'Clinical',
    doctorSays: 'Patients might bring contaminated, washed, or counterfeit bottles. How do I maintain medical hygiene standards?',
    acknowledge: 'As a dermatologist, your clinical reputation and patient safety are completely non-negotiable.',
    evidence: 'Patients never pour liquids into old bottles! The patient returns their empty outer housing, and the clinic dispenses an airtight, gamma-sterilised, tamper-evident sealed inner refill pod manufactured in our ISO-certified cleanroom.',
    offer: 'The counter app validates every batch code against our central registry to guarantee authenticity before dispensing.',
  },
  {
    id: 'obj-stuck-stock',
    title: 'Risk of Stuck or Unsold Refill Inventory',
    category: 'Financial',
    doctorSays: 'What if patients don’t buy refills and I am stuck with capital tied up in refill pods on my shelf?',
    acknowledge: 'Working capital risk is the #1 pain point for dispensing clinics stocking retail lines.',
    evidence: 'Over 94% of clinics maintain a 18-day stock turnover for refill pods because refills are linked to prescribed daily treatment regimens.',
    offer: 'We provide RefillRx stock on a 100% Sale-or-Return guarantee. Any unopened refill pod can be swapped or returned for full credit at any time, zero risk to your working capital.',
  },
  {
    id: 'obj-patients-wont-return',
    title: 'Patients Won’t Remember to Bring Empties',
    category: 'Behavioral',
    doctorSays: 'Patients are lazy. They will throw the empty bottle away and just ask for the discount anyway.',
    acknowledge: 'Habit change is genuinely tough when patients don’t have immediate incentives.',
    evidence: 'With automated WhatsApp nudges at day 25 of their cycle reminding them of their ₹270 refill savings and loyalty points, return rates exceed 74% across active clinics.',
    offer: 'We provide patients with a sleek "Refill Pass" on WhatsApp and a branded organic cotton return pouch with their first purchase.',
  },
  {
    id: 'obj-margin-too-low',
    title: 'Margin Too Low vs Competing Local Derma Schemes',
    category: 'Commercial',
    doctorSays: 'Local pharma companies offer me 40% to 50% discount schemes. Why should I push your 32% refill?',
    acknowledge: 'Other brands certainly push high upfront distributor discount margins on paper.',
    evidence: 'High margin on zero repeat sales is zero profit. Local unbranded lines have an 18% repeat rate because patients don’t see results and switch. The Brand has a 62% refill repeat rate and genuine medical pull.',
    offer: 'With quarterly volume tiers, your effective net margin on this range reaches 38%, combined with 3x higher turnover velocity.',
  },
  {
    id: 'obj-i-only-prescribe',
    title: 'I Prefer to Prescribe, Not Dispense',
    category: 'Clinical',
    doctorSays: 'I don’t want my clinic to look like a cosmetic shop; I am a doctor, not a shopkeeper.',
    acknowledge: 'Your clinical objectivity and medical authority are paramount.',
    evidence: 'Dispensing dermatologists do not view this as retailing—they view it as guaranteeing therapy adherence. When patients walk into a retail chemist, 42% are substituted with an unverified OTC product.',
    offer: 'Our minimalist medical display is designed in matte surgical steel and frosted glass, branded strictly around "Treatment Adherence & Circular Care".',
  },
  {
    id: 'obj-space-constraints',
    title: 'Clinic Has Severe Space Constraints',
    category: 'Operational',
    doctorSays: 'My reception desk is tiny. I have nowhere to store bulky refill packs or return bins.',
    acknowledge: 'Real estate in Mumbai/Thane clinics is extremely premium; every centimeter counts.',
    evidence: 'Refill pods take 65% less volume than full jars and pump bottles. Our returns collection bin has a compact 18cm x 18cm footprint that fits neatly beneath the counter.',
    offer: 'We schedule automatic courier pickups the moment your returns bin reaches 20 bottles, keeping your clinic clutter-free.',
  },
  {
    id: 'obj-tamper-evidence',
    title: 'Tamper Evidence & Legal Liability',
    category: 'Regulatory',
    doctorSays: 'If a patient experiences contact dermatitis, could I be held liable for dispensing a refilled product?',
    acknowledge: 'Legal safety and compliance under CDSCO / Drugs & Cosmetics rules are essential.',
    evidence: 'Because the refill is a factory-sealed modular pod (not a loose bulk refill poured in clinic), the manufacturer bears 100% product liability under the verified batch code.',
    offer: 'Every refill transaction is digitally logged with batch verification, giving your clinic a tamper-proof digital audit trail.',
  },
  {
    id: 'obj-discount-erosion',
    title: 'Discount Erosion of Prestige Perception',
    category: 'Brand Image',
    doctorSays: 'If we offer 20% discounts on refills, won’t patients think our premium medical range is cheapened?',
    acknowledge: 'Maintaining the prestige, dermatological positioning of the range is critical.',
    evidence: 'Patients don’t see it as a clearance markdown; they see it as an eco-incentive. Global studies show 82% of premium skincare buyers respect brands that reward sustainable behaviour.',
    offer: 'All clinic materials frame the discount as "Circular Reward for Packaging Return", reinforcing your practice’s progressive values.',
  },
  {
    id: 'obj-data-privacy',
    title: 'Patient Phone Number & Privacy Concerns',
    category: 'Compliance',
    doctorSays: 'My patients value privacy; they won’t share their phone numbers for a brand marketing scheme.',
    acknowledge: 'Patient data confidentiality in medical practice must be preserved at all costs.',
    evidence: 'RefillRx does not sell data or spam patients with ads. The patient’s phone number is used exclusively for batch safety recalls and automated refill cycle reminders.',
    offer: 'Patients can also use an anonymous alphanumeric "Refill Pass ID" with zero personal data stored.',
  },
  {
    id: 'obj-greenwashing',
    title: 'Is This Just Corporate Greenwashing?',
    category: 'Sustainability',
    doctorSays: 'Multinationals talk about sustainability all the time. Does this packaging actually get recycled?',
    acknowledge: 'Skepticism about corporate greenwashing is completely justified—there are too many empty pledges.',
    evidence: 'Every batch of recovered empties is tracked via certified recycling partner PCR India with a transparent mass-balance audit certificate issued to your clinic.',
    offer: 'We provide your clinic with an annual audited certificate stating the exact kilograms of plastic diverted directly from Indian landfills.',
  },
]

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'mod-1',
    number: 1,
    title: 'Why Refills Matter for Our Practice',
    durationMins: 2.5,
    summary: 'Understand how the refill program drives patient retention, clinic revenue, and plastic reduction.',
    objectives: [
      'Learn why 68% of patients drop off treatment without clinic follow-up',
      'Discover how refills protect doctor revenue against online platforms',
      'Understand how 1 refill saves 38g-55g of virgin plastic',
    ],
    contentParagraphs: [
      'When patients complete their prescribed 30-day bottle, they face friction: either they stop using the barrier cream, or they search online where they are bombarded with conflicting ads. Refills create a seamless reason to return to our clinic.',
      'For our clinic, a returning patient is invaluable. Each refill visit brings the patient back into our care, building trust and generating high-margin repeat sales with zero marketing cost.',
    ],
    quizQuestions: [
      {
        question: 'Why do refills help patient treatment compliance?',
        options: [
          'They give an affordable, convenient incentive to continue daily therapy without switching brands',
          'They allow patients to dilute formulations at home',
          'They eliminate the need for doctor consultations',
          'They are only meant for emergency use',
        ],
        correctIndex: 0,
        explanation: 'Refills make continuous daily skincare affordable and habitual, preventing drop-off.',
      },
      {
        question: 'How does the clinic benefit commercially from the refill program?',
        options: [
          'Clinic earns 32% margin on repeat visits with guaranteed return policies and higher lifetime patient value',
          'Clinic pays a royalty fee to the distributor',
          'Clinic must purchase 1,000 units upfront',
          'Staff receives no incentives',
        ],
        correctIndex: 0,
        explanation: 'Higher repeat margins (+32%) with zero dead-stock risk create substantial net practice growth.',
      },
      {
        question: 'What is the environmental benefit of a single RefillRx pod?',
        options: [
          'Saves 38g to 55g of virgin packaging plastic and cuts lifecycle CO2 by over 60%',
          'Only saves paper labels',
          'Increases total plastic weight',
          'Has no measurable impact',
        ],
        correctIndex: 0,
        explanation: 'Modular sealed pods eliminate heavy outer bottles, pump mechanisms, and secondary cartons.',
      },
    ],
    badgeName: 'Refill Ambassador',
  },
  {
    id: 'mod-2',
    number: 2,
    title: 'The 3-Tap Counter Flow (Under 30 Seconds)',
    durationMins: 2.0,
    summary: 'Master the lightning-fast 3-step counter workflow designed for busy reception hours.',
    objectives: [
      'Identify patients in 3 seconds via phone or QR pass',
      'Verify empty pack and lot code eligibility',
      'Dispense sealed refill pod and collect payment',
    ],
    contentParagraphs: [
      'During peak clinic hours, speed is essential. The RefillRx counter app was designed to require zero keyboard typing.',
      'Step 1: Tap "New Refill" and scan the patient’s QR pass or enter their phone number. Step 2: Quickly verify the empty bottle and enter the 4-digit batch code. Step 3: Select payment mode and tap "Confirm Dispense". The receipt is automatically generated!',
    ],
    quizQuestions: [
      {
        question: 'What is the target maximum time for a refill transaction at the counter?',
        options: ['Under 30 seconds', '5 minutes', '10 minutes', '2 hours'],
        correctIndex: 0,
        explanation: 'The system is engineered for under 30-second completion to prevent front-desk queues.',
      },
      {
        question: 'How do you look up an existing patient in the counter app?',
        options: [
          'Scan their patient QR pass or search their 10-digit mobile number',
          'Ask for their government Aadhaar card',
          'Search paper register files',
          'Patients must create an email password',
        ],
        correctIndex: 0,
        explanation: 'Quick QR scan or mobile number lookup retrieves patient history instantly.',
      },
      {
        question: 'What happens immediately after tapping "Confirm Dispense"?',
        options: [
          'Stock decrements, returns bin increments, digital receipt appears, and impact metrics update',
          'The app shuts down',
          'The transaction is delayed until tomorrow',
          'Staff must print a 5-page invoice',
        ],
        correctIndex: 0,
        explanation: 'All clinic stock, returns bin, and territory metrics synchronize in real time.',
      },
    ],
    badgeName: 'Speed Dispenser',
  },
  {
    id: 'mod-3',
    number: 3,
    title: 'Checking an Empty Pack & Preventing Fraud',
    durationMins: 2.5,
    summary: 'Simple visual check rules: intact bottle, genuine batch code, and duplicate prevention.',
    objectives: [
      'Check that the empty pack belongs to the authentic Brand range',
      'Locate and verify the 4-8 character lot/batch code on the base or crimp',
      'Understand how the system flags duplicate batch returns',
    ],
    contentParagraphs: [
      'We do not accept damaged, bio-contaminated, or counterfeit containers. A quick 5-second physical check ensures the bottle is intact and empty.',
      'Always look for the printed lot code at the bottom of the bottle. The RefillRx app automatically checks whether this exact batch code was already returned in the past, ensuring complete integrity.',
    ],
    quizQuestions: [
      {
        question: 'Where is the product batch/lot code typically printed?',
        options: [
          'On the base of the bottle or crimp of the tube',
          'On the patient’s receipt only',
          'Inside the formulation liquid',
          'There is no batch code',
        ],
        correctIndex: 0,
        explanation: 'Batch codes are laser-etched or stamped on the container base or crimp seal.',
      },
      {
        question: 'What should you do if the app alerts "Duplicate Batch Code Detected"?',
        options: [
          'Politely inspect the pack; verify if the code was mistyped or if the pack was already processed previously',
          'Immediately call the police',
          'Ignore the warning and dispense anyway',
          'Throw the bottle away',
        ],
        correctIndex: 0,
        explanation: 'Double check typo errors first, and ensure the pack is an authentic, unreturned unit.',
      },
      {
        question: 'Can patients refill a bottle that is cracked or contains foreign liquids?',
        options: [
          'No, the outer container must be intact and free from external contamination for safety',
          'Yes, anything is acceptable',
          'Only if the patient pays double',
          'Yes, we clean it with tap water',
        ],
        correctIndex: 0,
        explanation: 'Physical integrity is essential to maintain medical cleanliness and hygiene.',
      },
    ],
    badgeName: 'Integrity Guardian',
  },
  {
    id: 'mod-4',
    number: 4,
    title: 'Handling Patient Questions Confidently',
    durationMins: 3.0,
    summary: 'Scripts and answers for common patient queries regarding discount, hygiene, and product freshness.',
    objectives: [
      'Explain the 20% circular discount in patient-friendly terms',
      'Reassure patients that the refill pod is factory-sterile and identical in efficacy',
      'Guide patients on how to use their WhatsApp Refill Pass',
    ],
    contentParagraphs: [
      'Patients often ask: "Is the refill formula exactly the same as the full bottle?" Reassure them: "Yes, it is the exact same dermatological formulation, hermetically sealed in a factory-fresh pod that snaps into your outer bottle."',
      'Frame the discount positively: "You save ₹270 today because you returned your empty pack, keeping plastic out of our oceans."',
    ],
    quizQuestions: [
      {
        question: 'How should you answer if a patient asks if the refill is lower quality?',
        options: [
          'Reassure them it is the identical medical-grade formula sealed in a sterile pod, saving 20% on price',
          'Tell them it is an economy formula',
          'Advise them to ask the doctor instead',
          'Say you don’t know',
        ],
        correctIndex: 0,
        explanation: 'The formula is 100% identical; only the packaging is modularized.',
      },
      {
        question: 'What is the best way to explain the patient discount?',
        options: [
          'It is a Circular Reward for returning packaging and continuing your healthy skin regimen',
          'It is a clearance discount because the batch is old',
          'It is a charity discount',
          'It is a price cut due to competition',
        ],
        correctIndex: 0,
        explanation: 'Framing as a circular loyalty reward builds prestige and pride.',
      },
      {
        question: 'What should you give a patient receiving their very first refill?',
        options: [
          'Their fresh sealed pod, digital receipt, and a brief walkthrough of how to snap it in',
          'A long survey form to fill out',
          'A reminder to pay extra charges',
          'Nothing',
        ],
        correctIndex: 0,
        explanation: 'A warm, fast interaction ensures positive word-of-mouth.',
      },
    ],
    badgeName: 'Patient Champion',
  },
  {
    id: 'mod-5',
    number: 5,
    title: 'Clinic Stock, Replenishment & Empties Pickup',
    durationMins: 2.0,
    summary: 'Managing inventory levels, avoiding stock-outs, and scheduling courier pickups for full return bins.',
    objectives: [
      'Monitor days-of-cover and refill inventory thresholds',
      'Request replenishment orders with a single tap',
      'Trigger return bin pickup when empties reach 20 packs',
    ],
    contentParagraphs: [
      'Running out of refill pods during an OPD rush is frustrating. The counter app warns you when stock falls below 5 units (7 days of cover).',
      'When your returns collection bin holds 20 empty bottles, tap "Request Pickup". Our authorized reverse-logistics courier will collect them within 48 hours and reset your bin gauge.',
    ],
    quizQuestions: [
      {
        question: 'When should a clinic request courier pickup for the returns bin?',
        options: [
          'When the bin counter reaches the 20-pack threshold (or full gauge)',
          'Only once a year',
          'When the bin has 1 empty pack',
          'Never',
        ],
        correctIndex: 0,
        explanation: 'Pickup at threshold maintains a tidy clinic and ensures reliable recycling batches.',
      },
      {
        question: 'How do you order more refill stock when inventory runs low?',
        options: [
          'Tap "Request Replenishment" in the Stock tab; your rep and distributor are notified instantly',
          'Write a handwritten letter to head office',
          'Wait until stock reaches zero',
          'Buy from a local retail pharmacy',
        ],
        correctIndex: 0,
        explanation: 'One-tap digital order triggers fast distributor fulfillment.',
      },
      {
        question: 'What happens to unsold refill stock under our program guarantee?',
        options: [
          'It is covered 100% by Sale-or-Return; can be swapped or returned anytime',
          'The clinic must discard it at a loss',
          'The doctor is fined',
          'It expires with no refund',
        ],
        correctIndex: 0,
        explanation: 'Sale-or-return guarantee completely eliminates inventory and working capital risk.',
      },
    ],
    badgeName: 'Logistics Master',
  },
  {
    id: 'mod-6',
    number: 6,
    title: 'Avoiding Common Operational Mistakes',
    durationMins: 2.0,
    summary: 'Best practices for keeping records clean, handling early refills, and maintaining staff points.',
    objectives: [
      'Handle early refills when patients request product before 18 days',
      'Use the 5-minute Undo feature if a transaction is keyed in error',
      'Track your monthly staff incentive points and badge rewards',
    ],
    contentParagraphs: [
      'Mistakes happen: if you accidentally select the wrong SKU or patient, tap "Undo" on the transaction within 5 minutes. You can also void a record with an explanatory reason.',
      'Check patient usage cycles: if a 30-day cream is brought in after only 10 days, verify with the patient if they are using it on their neck/body or had an accidental spill before proceeding.',
    ],
    quizQuestions: [
      {
        question: 'How long do you have to Undo an accidental transaction directly from the counter history?',
        options: ['Within 5 minutes', 'Within 24 hours', 'You cannot undo any transaction', '1 month'],
        correctIndex: 0,
        explanation: 'A 5-minute safety window allows quick rectification of typos or wrong selections.',
      },
      {
        question: 'What should you do if an "Early Refill" warning appears on screen?',
        options: [
          'Confirm with patient if they used more dosage or experienced a spill, then proceed with awareness',
          'Refuse to serve the patient',
          'Call the police',
          'Delete the patient record',
        ],
        correctIndex: 0,
        explanation: 'The warning is an adherence safety check to confirm usage habits.',
      },
      {
        question: 'How do clinic staff earn reward points in the RefillRx program?',
        options: [
          'By completing micro-training modules and processing correct refill transactions',
          'By logging in once a week',
          'Points are assigned randomly',
          'Only doctors earn points',
        ],
        correctIndex: 0,
        explanation: 'Staff are rewarded for training completion and operational diligence.',
      },
    ],
    badgeName: 'Master Operator',
  },
]

export const LEVERS: Lever[] = [
  {
    id: 'lev-training',
    name: 'Staff Micro-Training & Certification',
    category: 'training',
    description: '6 short modules (<3 min each) with digital certification badge and ₹10/refill staff reward',
    defaultActive: true,
    costPerMonthINR: 500,
    estimatedLiftPct: 24,
    iconName: 'GraduationCap',
  },
  {
    id: 'lev-counter-app',
    name: '3-Tap Counter App & Offline Tablet',
    category: 'operational',
    description: 'Pre-configured mobile counter flow with instant batch validation and 22-second checkout',
    defaultActive: true,
    costPerMonthINR: 800,
    estimatedLiftPct: 35,
    iconName: 'Smartphone',
  },
  {
    id: 'lev-margin-boost',
    name: 'Refill Margin Incentive (+7% Extra Margin)',
    category: 'financial',
    description: 'Provides 32% margin on refill packs versus 25% standard full pack margin',
    defaultActive: true,
    costPerMonthINR: 2200,
    estimatedLiftPct: 28,
    iconName: 'TrendingUp',
  },
  {
    id: 'lev-sale-or-return',
    name: '100% Sale-or-Return Stock Guarantee',
    category: 'financial',
    description: 'Brand buys back or exchanges unsold refill pods at any time, eliminating inventory risk',
    defaultActive: true,
    costPerMonthINR: 1200,
    estimatedLiftPct: 20,
    iconName: 'ShieldCheck',
  },
  {
    id: 'lev-signage-kit',
    name: 'Free Eco-Standee & Counter Display Kit',
    category: 'marketing',
    description: 'Matte surgical-grade counter standee, patient take-away brochures, and window decal',
    defaultActive: true,
    costPerMonthINR: 600,
    estimatedLiftPct: 18,
    iconName: 'LayoutTemplate',
  },
  {
    id: 'lev-green-cert',
    name: 'Green Certified Practice Wall Plaque',
    category: 'marketing',
    description: 'Framed official L\'Oréal Medical ESG plaque + personalized social media impact cards',
    defaultActive: false,
    costPerMonthINR: 400,
    estimatedLiftPct: 14,
    iconName: 'Award',
  },
  {
    id: 'lev-whatsapp-bot',
    name: 'Automated WhatsApp Adherence Reminders',
    category: 'operational',
    description: 'Sends gentle refill reminder at day 25 of patient usage cycle with 1-tap booking pass',
    defaultActive: true,
    costPerMonthINR: 750,
    estimatedLiftPct: 32,
    iconName: 'MessageSquare',
  },
  {
    id: 'lev-rep-cadence',
    name: 'Bi-Weekly Medical Rep Coaching Visits',
    category: 'operational',
    description: 'High-touch rep visits to inspect stock, resolve receptionist hurdles, and coach on new FAQs',
    defaultActive: false,
    costPerMonthINR: 1500,
    estimatedLiftPct: 22,
    iconName: 'UserCheck',
  },
]

