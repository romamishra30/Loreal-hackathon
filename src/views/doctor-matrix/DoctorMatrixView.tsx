import React, { useState } from 'react'
import { 
  Stethoscope, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Save, 
  Building2,
  ChevronRight,
  Info
} from 'lucide-react'
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts'
import { useAppStore } from '../../store/useAppStore'
import { ARCHETYPES, DOCTOR_QUIZ_QUESTIONS } from '../../data/seedConstants'
import { DoctorArchetype } from '../../types'
import { Badge } from '../../components/common/Badge'

export const DoctorMatrixView: React.FC = () => {
  const { selectedClinicId, clinics, assignArchetype } = useAppStore()
  const clinic = clinics.find(c => c.id === selectedClinicId) || clinics[0]

  // Active view: 'matrix' | 'quiz' | 'profile'
  const [activeTab, setActiveTab] = useState<'matrix' | 'quiz' | 'profile'>('matrix')

  // Archetype Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, DoctorArchetype>>({})
  const [diagnosedArchetype, setDiagnosedArchetype] = useState<DoctorArchetype | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)

  // Side-by-side Decision Drivers
  const decisionDrivers = [
    {
      driver: 'Clinical Trust & Efficacy',
      desc: 'Formulation purity, clinical trial data, and peer credibility.',
      prescriberWeight: 5,
      dispenserWeight: 5,
      prescriberReason: 'Only primary criterion. Will not prescribe unless double-blind safety is proven.',
      dispenserReason: 'Equal priority. A bad product destroys medical reputation for their entire practice.',
    },
    {
      driver: 'Commercial Margin & Revenue',
      desc: 'Absolute gross profit per unit and wholesale pricing tiers.',
      prescriberWeight: 1,
      dispenserWeight: 5,
      prescriberReason: 'Irrelevant. Prescribers do not handle retail transactions or clinic inventory.',
      dispenserReason: 'Crucial small-business P&L lever to offset clinic rent, nursing staff, and lasers.',
    },
    {
      driver: 'Working Capital & Inventory Risk',
      desc: 'Dead-stock exposure, credit terms, and cash conversion cycle.',
      prescriberWeight: 1,
      dispenserWeight: 5,
      prescriberReason: 'Zero risk. The retail chemist down the road absorbs all inventory holding risk.',
      dispenserReason: 'Huge concern. Capital tied up in slow-moving creams hurts monthly practice cash flow.',
    },
    {
      driver: 'Staff Workload & Reception Queue',
      desc: 'Time taken per transaction during busy OPD clinic hours.',
      prescriberWeight: 1,
      dispenserWeight: 4,
      prescriberReason: 'Doctor writes prescription; reception only schedules follow-up visits.',
      dispenserReason: 'Reception is often swamped with billing, calls, and queues. Speed is mandatory.',
    },
    {
      driver: 'Patient Retention & Footfall',
      desc: 'Returning patients scheduling peels, laser reviews, and follow-ups.',
      prescriberWeight: 2,
      dispenserWeight: 5,
      prescriberReason: 'Relies on chronic disease review dates; patient buys product anywhere.',
      dispenserReason: 'Monthly refill visits keep patient inside practice ecosystem, boosting LTV.',
    },
    {
      driver: 'Competing Brand Scheme Pressure',
      desc: 'Local pharma companies pushing 40-50% bonus deals.',
      prescriberWeight: 2,
      dispenserWeight: 4,
      prescriberReason: 'Influenced by medical symposiums, rarely by trade volume bonus margins.',
      dispenserReason: 'Subjected to intense commercial pitches daily from domestic derma distributors.',
    },
    {
      driver: 'Counterfeit & Sterility Integrity',
      desc: 'Risk of contaminated refills or reused unsterile bottles.',
      prescriberWeight: 4,
      dispenserWeight: 5,
      prescriberReason: 'Worries about grey-market substitution at retail chemists.',
      dispenserReason: 'Direct liability: doctor cannot allow unsterile bulk pouring inside their clinic.',
    },
    {
      driver: 'Sustainability & Green Practice Appeal',
      desc: 'Measurable plastic avoided, prestige ESG recognition, and patient pride.',
      prescriberWeight: 3,
      dispenserWeight: 4,
      prescriberReason: 'Intellectually values sustainability, but lacks operational levers to act.',
      dispenserReason: 'High value-add! Turns clinic into a modern, forward-thinking "Green Certified Practice".',
    },
  ]

  const handleSelectQuizAnswer = (qId: string, archetype: DoctorArchetype) => {
    const updated = { ...quizAnswers, [qId]: archetype }
    setQuizAnswers(updated)

    if (currentQuestionIndex < DOCTOR_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate winning archetype
      const counts: Record<string, number> = {}
      Object.values(updated).forEach(arch => {
        counts[arch] = (counts[arch] || 0) + 1
      })
      let topArch: DoctorArchetype = 'clinician_first'
      let maxCount = 0
      Object.entries(counts).forEach(([arch, count]) => {
        if (count > maxCount) {
          maxCount = count
          topArch = arch as DoctorArchetype
        }
      })
      setDiagnosedArchetype(topArch)
      assignArchetype(clinic.doctorId, clinic.id, topArch)
    }
  }

  const archKey: DoctorArchetype = diagnosedArchetype || clinic.archetype || 'clinician_first'
  const currentArchetypeDef = ARCHETYPES[archKey]

  // Radar Data for Motivation Mapping
  const radarData = [
    { subject: 'Clinical Trust', value: currentArchetypeDef.radarWeights.clinicalTrust, fullMark: 5 },
    { subject: 'Margin P&L', value: currentArchetypeDef.radarWeights.margin, fullMark: 5 },
    { subject: 'Patient Loyalty', value: currentArchetypeDef.radarWeights.patientLoyalty, fullMark: 5 },
    { subject: 'Staff Speed', value: currentArchetypeDef.radarWeights.staffSimplicity, fullMark: 5 },
    { subject: 'Sustainability', value: currentArchetypeDef.radarWeights.sustainability, fullMark: 5 },
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Deliverable (a)
            </span>
            <span className="text-xs text-gray-400">Doctor Decision Dynamics</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white mt-1">
            Understand the Dispensing Dermatologist
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-gray-400">
            A dispensing derm thinks like a <strong>Small-Business Owner</strong> AND a <strong>Clinician</strong>. A prescriber thinks only as a clinician.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-charcoal-800 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'matrix'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Decision Matrix
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'quiz'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Doctor Quiz (8Q)
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === 'profile'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Doctor 360 Profile
          </button>
        </div>
      </div>

      {/* TAB 1: PRESCRIBER VS DISPENSER SIDE-BY-SIDE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50/70 dark:bg-charcoal-900 rounded-3xl border border-emerald-200 dark:border-emerald-800 text-xs text-charcoal-800 dark:text-gray-200">
            <h3 className="font-bold text-sm text-brand-900 dark:text-emerald-300 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Strategic Insight: Why Standard FMCG/Prescribing Refill Programs Fail
            </h3>
            <p className="leading-relaxed">
              When brands approach dispensing doctors with pure eco-slogans ("Help us cut plastic"), doctors disengage. 
              The dispensing dermatologist must manage clinic working capital, inventory holding space, and staff bandwidth. 
              RefillRx bridges this gap by proving that <strong>refills generate +32% margin and +121% repeat visits</strong>, with zero dead-stock risk via sale-or-return.
            </p>
          </div>

          <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-charcoal-800/60 text-gray-500 font-semibold border-b border-gray-100 dark:border-charcoal-800">
                  <tr>
                    <th className="py-3 px-4 w-1/4">Decision Driver</th>
                    <th className="py-3 px-4 w-1/3 text-center bg-gray-100/50 dark:bg-charcoal-800/30">
                      Prescribing-Only Derm (Clinician Mindset)
                    </th>
                    <th className="py-3 px-4 w-1/3 text-center bg-brand-50/40 dark:bg-brand-950/30 text-brand-900 dark:text-emerald-300 font-bold">
                      Dispensing Derm (Clinician + Small-Business Owner)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-charcoal-800">
                  {decisionDrivers.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-charcoal-800/30">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-charcoal-900 dark:text-white">{item.driver}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                      </td>

                      {/* Prescriber Side */}
                      <td className="py-3.5 px-4 bg-gray-50/20 dark:bg-charcoal-800/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Weight:</span>
                          <span className="font-bold text-xs">{item.prescriberWeight} / 5</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-charcoal-700 rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full bg-gray-400"
                            style={{ width: `${(item.prescriberWeight / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight">
                          {item.prescriberReason}
                        </p>
                      </td>

                      {/* Dispenser Side */}
                      <td className="py-3.5 px-4 bg-brand-50/20 dark:bg-brand-950/10 border-l border-brand-100 dark:border-brand-900/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-emerald-300">Weight:</span>
                          <span className="font-bold text-xs text-brand-800 dark:text-emerald-400">{item.dispenserWeight} / 5</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-100 dark:bg-brand-950 rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full bg-brand-600"
                            style={{ width: `${(item.dispenserWeight / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-charcoal-800 dark:text-gray-200 leading-tight font-medium">
                          {item.dispenserReason}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR ARCHETYPE QUIZ (8 QUESTIONS) */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {!diagnosedArchetype ? (
            <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm max-w-2xl mx-auto space-y-6">
              
              {/* Quiz Stepper */}
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400 pb-3 border-b border-gray-100 dark:border-charcoal-800">
                <span>Question {currentQuestionIndex + 1} of {DOCTOR_QUIZ_QUESTIONS.length}</span>
                <span className="text-brand-600 font-bold">Rep Diagnostic Mode</span>
              </div>

              {/* Question Text */}
              <div>
                <h3 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white leading-relaxed">
                  {DOCTOR_QUIZ_QUESTIONS[currentQuestionIndex].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {DOCTOR_QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuizAnswer(DOCTOR_QUIZ_QUESTIONS[currentQuestionIndex].id, opt.archetype as DoctorArchetype)}
                    className="w-full text-left p-4 rounded-2xl border border-gray-200 dark:border-charcoal-700 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-charcoal-800 transition-all text-xs text-charcoal-800 dark:text-gray-200 font-medium flex items-center justify-between group"
                  >
                    <span>{opt.text}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Quiz Result & Tailored Pitch Angle */
            <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-md space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-charcoal-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Diagnosis Result
                  </span>
                  <h2 className="font-serif font-bold text-2xl text-charcoal-900 dark:text-white mt-1">
                    {currentArchetypeDef.title}
                  </h2>
                  <p className="text-xs text-brand-600 dark:text-emerald-400 font-medium mt-0.5">
                    {currentArchetypeDef.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDiagnosedArchetype(null)
                      setCurrentQuestionIndex(0)
                      setQuizAnswers({})
                    }}
                    className="px-3 py-1.5 rounded-xl border text-xs text-gray-500 hover:bg-gray-50"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => {
                      assignArchetype(clinic.doctorId, clinic.id, archKey)
                      setProfileSaved(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{profileSaved ? 'Saved to Profile ✓' : 'Save to Doctor Profile'}</span>
                  </button>
                </div>
              </div>

              {/* Grid: Pitch Strategy & Radar Motivation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left: Recommended Pitch Angle & Objections */}
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-mint-50 dark:bg-charcoal-800 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <p className="font-bold text-brand-900 dark:text-emerald-300 uppercase text-[10px]">
                      Recommended Pitch Angle for Rep:
                    </p>
                    <p className="text-sm font-serif font-semibold text-charcoal-900 dark:text-white leading-relaxed">
                      "{currentArchetypeDef.recommendedPitchAngle}"
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-charcoal-900 dark:text-white uppercase text-[10px] tracking-wider mb-2">
                      Top 3 Motivators to Emphasize:
                    </p>
                    <div className="space-y-1.5">
                      {currentArchetypeDef.primaryMotivators.map((m: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-charcoal-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-charcoal-900 dark:text-white uppercase text-[10px] tracking-wider mb-2">
                      Anticipated Objections & Doubts:
                    </p>
                    <div className="space-y-1.5">
                      {currentArchetypeDef.topObjections.map((obj: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 border border-rose-200/50">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Radar Chart */}
                <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-charcoal-800/40 border border-gray-200 dark:border-charcoal-700 flex flex-col items-center justify-center">
                  <p className="font-bold text-xs text-charcoal-800 dark:text-gray-200 mb-2">
                    Motivation Profile Radar Chart
                  </p>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar name="Motivators" dataKey="value" stroke="#1f9d5f" fill="#1f9d5f" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCTOR PROFILE 360 */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-2xl text-charcoal-900 dark:text-white">
                {clinic.doctorName}
              </h2>
              <p className="text-xs text-gray-500">
                {clinic.name} • {clinic.locality} • Phone: {clinic.phone || '+91 98201 44520'}
              </p>
            </div>
            <Badge healthStatus={clinic.healthStatus || 'on_track'}>
              {clinic.healthStatus || 'on_track'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-2xl space-y-1">
              <span className="text-gray-400 uppercase text-[10px] font-bold">Monthly Patient Footfall</span>
              <p className="font-bold text-xl text-charcoal-900 dark:text-white">{clinic.patientVolumeMonthly || 450}</p>
              <p className="text-gray-500 text-[11px]">~{Math.round((clinic.patientVolumeMonthly || 450) * 0.6)} purchase in clinic</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-2xl space-y-1">
              <span className="text-gray-400 uppercase text-[10px] font-bold">Dispensing Share</span>
              <p className="font-bold text-xl text-brand-700 dark:text-emerald-400">
                {(clinic.dispensingSharePct || 60) > 1 ? clinic.dispensingSharePct : Math.round((clinic.dispensingSharePct || 0.6) * 100)}%
              </p>
              <p className="text-gray-500 text-[11px]">Hybrid clinical + retail model</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-2xl space-y-1">
              <span className="text-gray-400 uppercase text-[10px] font-bold">Diagnosed Archetype</span>
              <p className="font-bold text-xl text-gold-600 capitalize">{(clinic.archetype || 'clinician_first').replace('_', ' ')}</p>
              <p className="text-gray-500 text-[11px]">Diagnostic verified by Rep</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

