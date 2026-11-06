import { DoctorQuizQuestion } from '../../domain/entities'

export const SEED_DOCTOR_QUESTIONS: DoctorQuizQuestion[] = [
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

