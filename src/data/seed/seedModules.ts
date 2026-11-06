import { TrainingModule } from '../../domain/entities'

export const SEED_MODULES: TrainingModule[] = [
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

