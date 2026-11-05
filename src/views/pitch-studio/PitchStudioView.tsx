import React, { useState } from 'react'
import { 
  Calculator, 
  HelpCircle, 
  Sliders, 
  TrendingUp, 
  FileText, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  X,
  Presentation,
  Printer,
  Search,
  RotateCcw
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { useAppStore } from '../../store/useAppStore'
import { 
  calculateClinicEconomics, 
  DEFAULT_ECONOMICS, 
  EconomicsInput, 
  PRESET_SCENARIOS, 
  calculateSustainabilityImpact 
} from '../../lib/calculations'
import { OBJECTIONS_LIBRARY } from '../../data/seedConstants'
import { formatINR, formatPercent } from '../../lib/utils'
import { QRCodeSVG } from 'qrcode.react'

export const PitchStudioView: React.FC = () => {
  const { selectedClinicId, clinics } = useAppStore()
  const clinic = clinics.find(c => c.id === selectedClinicId) || clinics[0]

  // Sub-navigation tabs: 'economics' | 'pitch' | 'objections' | 'deck' | 'print'
  const [activeTab, setActiveTab] = useState<'economics' | 'pitch' | 'objections' | 'deck' | 'print'>('economics')

  // Economics Calculator Live Sliders State
  const [econInput, setEconInput] = useState<EconomicsInput>(DEFAULT_ECONOMICS)
  const econOutput = calculateClinicEconomics(econInput)

  // Pitch Builder State
  const [doctorNameInput, setDoctorNameInput] = useState(clinic.doctorName)
  const [clinicNameInput, setClinicNameInput] = useState(clinic.name)
  const [pitchFormat, setPitchFormat] = useState<'30sec' | '2min' | 'whatsapp' | 'email'>('30sec')
  const [copiedPitch, setCopiedPitch] = useState(false)

  // Objection Library State
  const [objectionSearch, setObjectionSearch] = useState('')
  const [selectedObjectionId, setSelectedObjectionId] = useState(OBJECTIONS_LIBRARY[0].id)
  const [roleplayMode, setRoleplayMode] = useState(false)
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({})

  // Pitch Deck Slide State (6 slides)
  const [deckSlide, setDeckSlide] = useState(0)

  // Chart Data for 12-Month Cumulative Cash Flow
  const cashData = econOutput.cumulativeCashFlow.map((cash, i) => ({
    month: `M${i + 1}`,
    cash: cash,
    monthlyMargin: econOutput.monthlyCashFlow[i],
  }))

  // Apply Presets
  const applyPreset = (presetKey: 'conservative' | 'base' | 'optimistic') => {
    setEconInput(PRESET_SCENARIOS[presetKey])
  }

  const selectedObjection = OBJECTIONS_LIBRARY.find(o => o.id === selectedObjectionId) || OBJECTIONS_LIBRARY[0]

  // Copy Pitch to Clipboard
  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPitch(true)
    setTimeout(() => setCopiedPitch(false), 2000)
  }

  // Generate Personalized Pitches
  const generatePitchText = () => {
    const netAnn = formatINR(econOutput.annualNetIncrementalMargin)
    const netMo = formatINR(econOutput.monthlyNetIncrementalMargin)
    const repeatLift = Math.round(econOutput.repeatLiftPct * 100)

    if (pitchFormat === '30sec') {
      return `"${doctorNameInput}, what if we could lift your daily treatment repeat rate by +${repeatLift}% while increasing your practice margin to 32% with zero inventory risk? Under RefillRx, patients bring empty packaging to ${clinicNameInput} for a 20% discount on sterile pods. You earn ${netMo}/month incremental profit, and your practice diverts over 150 kg of plastic annually under a 100% sale-or-return guarantee."`
    }
    if (pitchFormat === 'whatsapp') {
      return `Dear ${doctorNameInput},\n\nHope your OPD went well! Based on our practice analysis for ${clinicNameInput}:\n• Projected repeat adherence lift: +${repeatLift}%\n• Practice incremental margin: ${netMo}/month (${netAnn}/year)\n• Inventory safety: 100% Sale-or-Return stock buyback\n• Reception speed: 22-second 3-tap counter flow\n\nCan I drop off the starter kit and framed Green Practice Certificate this Thursday at 2 PM?\n\nBest regards,\nVikram (Medical Rep, RefillRx)`
    }
    if (pitchFormat === '2min') {
      return `"${doctorNameInput}, thank you for your time. Today, nearly 68% of patients drop off their prescribed barrier skincare after the first bottle—either switching to online discounts or abandoning therapy. That represents lost clinical compliance AND lost clinic revenue.\n\nWith RefillRx, we solve both. By providing patients with an in-clinic 20% circular discount when they return their empty outer container, we turn a single one-time transaction into 4 to 6 physical clinic visits every year. Your clinic earns 32% margin on refills versus 25% on full packs. Operationally, our mobile counter takes exactly 22 seconds per transaction, meaning zero reception friction. Most importantly, all refill inventory is provided on a 100% Sale-or-Return guarantee. Your clinic generates ${netAnn} in net incremental margin while becoming recognized as an official L'Oréal Green Certified Practice."`
    }
    return `Subject: Practice Adherence & Refill Program Proposal for ${clinicNameInput}\n\nDear ${doctorNameInput},\n\nThank you for discussing patient compliance during our recent visit. Attached is the customized practice economics projection for RefillRx:\n\n1. Clinical Adherence: +${repeatLift}% increase in patient regimen continuity.\n2. Practice P&L: Estimated annual incremental margin of ${netAnn} net of all staff time.\n3. Risk Elimination: 100% consignment & sale-or-return stock exchange.\n4. Circular ESG: Annual diversion of over 400 packaging bottles from local landfills.\n\nWe would be honored to enroll ${clinicNameInput} in our Mumbai–Thane pilot cohort.\n\nWarm regards,\nVikram Salunkhe\nMedical Representative`
  }

  // 6 Pitch Deck Slides
  const deckSlides = [
    {
      title: 'The Challenge in Dispensing Dermatology',
      subtitle: 'Slide 1 of 6 • Patient Drop-Off & Margin Pressure',
      content: '68% of dermatological patients drop off prescribed daily-maintenance topical therapy after 30 days. Patients seek online discounts on unverified e-commerce portals, leading to therapeutic failure and clinic revenue erosion.',
      takeaway: 'RefillRx transforms one-time buyers into enduring circular clinic footfall.',
    },
    {
      title: 'The RefillRx Opportunity',
      subtitle: 'Slide 2 of 6 • Dual Alignment: Clinician + Practice Owner',
      content: 'Instead of choosing between medical ethics and retail profit, RefillRx bridges both. The patient receives a factory-sterile modular pod; the doctor secures guaranteed repeat footfall (+62% repeat rate) with higher per-unit margins (+32%).',
      takeaway: 'Patient Adherence Engine disguised as a circular sustainability initiative.',
    },
    {
      title: 'Practice Economics & Guaranteed ROI',
      subtitle: 'Slide 3 of 6 • Unit P&L & Working Capital Safety',
      content: `Your clinic earns ${formatINR(econOutput.monthlyNetIncrementalMargin)}/month net incremental profit (${formatINR(econOutput.annualNetIncrementalMargin)}/year). All stock is 100% backed by Sale-or-Return guarantee—zero dead stock risk.`,
      takeaway: 'Payback period is under 1.5 months with zero upfront capital risk.',
    },
    {
      title: 'In-Clinic Execution: The 3-Tap Flow',
      subtitle: 'Slide 4 of 6 • Zero Staff Burden',
      content: 'Designed specifically for busy reception counters. 3 taps, QR barcode scan, anti-fraud lot validation, sealed pod dispense. Takes under 25 seconds—faster than standard credit card terminal billing.',
      takeaway: 'Reception staff need near-zero training and earn direct reward points.',
    },
    {
      title: 'Turnkey Support from The Brand',
      subtitle: 'Slide 5 of 6 • Everything Supplied Free of Charge',
      content: 'The Brand provides: surgical-grade counter display standee, patient take-home brochures, framed Green Practice certificate, automated WhatsApp reminder engine, and scheduled reverse-logistics courier pickups.',
      takeaway: 'Complete operational support with zero clinic overhead.',
    },
    {
      title: 'Measurable Sustainability Value-Add',
      subtitle: 'Slide 6 of 6 • Prestige Recognition for Your Practice',
      content: 'Every refill diverts 38g to 55g of virgin packaging plastic from Indian landfills. Your clinic receives an annual audited ESG Certificate to share with eco-conscious patients and on clinic social media.',
      takeaway: 'A progressive, green practice that patients are proud to champion.',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Deliverable (c)
            </span>
            <span className="text-xs text-gray-400">Core Pitch & Practice Economics</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white mt-1">
            Pitch Studio & Economics Simulator
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-gray-400">
            Framing refills as a <strong>Practice-Growth & Patient-Loyalty Tool</strong> with sustainability as a prestige value-add.
          </p>
        </div>

        {/* Studio Sub-Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-charcoal-800 rounded-2xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('economics')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'economics'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            P&L Calculator
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'pitch'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Pitch Generator
          </button>
          <button
            onClick={() => setActiveTab('objections')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'objections'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Objections & Roleplay
          </button>
          <button
            onClick={() => setActiveTab('deck')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'deck'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            6-Slide Deck Mode
          </button>
          <button
            onClick={() => setActiveTab('print')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'print'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Printable Assets
          </button>
        </div>
      </div>

      {/* TAB 1: CLINIC ECONOMICS CALCULATOR */}
      {activeTab === 'economics' && (
        <div className="space-y-6">
          
          {/* Preset Buttons */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-charcoal-900 rounded-2xl border border-gray-200 dark:border-charcoal-800 text-xs">
            <span className="font-semibold text-charcoal-800 dark:text-gray-200">
              Scenario Presets:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => applyPreset('conservative')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-charcoal-700 text-xs font-medium"
              >
                Conservative
              </button>
              <button
                onClick={() => applyPreset('base')}
                className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 font-bold text-xs"
              >
                Base Case
              </button>
              <button
                onClick={() => applyPreset('optimistic')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-charcoal-700 text-xs font-medium"
              >
                Optimistic
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Sliders & Live Inputs */}
            <div className="lg:col-span-2 bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-5 text-xs">
              <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-white">
                Live Practice Parameters & Economics Sliders
              </h3>

              {/* Slider 1: Monthly Patients */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Monthly Patient Footfall:</span>
                  <span className="text-brand-600 font-bold">{econInput.patientsPerMonth} patients</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="800"
                  step="25"
                  value={econInput.patientsPerMonth}
                  onChange={(e) => setEconInput({ ...econInput, patientsPerMonth: Number(e.target.value) })}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: In-Clinic Dispensing Share */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>In-Clinic Dispensing Conversion:</span>
                  <span className="text-brand-600 font-bold">{Math.round(econInput.dispensingSharePct * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={econInput.dispensingSharePct}
                  onChange={(e) => setEconInput({ ...econInput, dispensingSharePct: Number(e.target.value) })}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Daily-Use Maintenance Range % */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Patients on Daily Maintenance Regimen:</span>
                  <span className="text-brand-600 font-bold">{Math.round(econInput.dailyUseRangePct * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.7"
                  step="0.05"
                  value={econInput.dailyUseRangePct}
                  onChange={(e) => setEconInput({ ...econInput, dailyUseRangePct: Number(e.target.value) })}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 4: Refill Margin % to Doctor */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Doctor Refill Margin % (Brand Incentive):</span>
                  <span className="text-brand-600 font-bold">{Math.round(econInput.doctorRefillMarginPct * 100)}% (vs 25% Full Pack)</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="0.40"
                  step="0.01"
                  value={econInput.doctorRefillMarginPct}
                  onChange={(e) => setEconInput({ ...econInput, doctorRefillMarginPct: Number(e.target.value) })}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Slider 5: Repeat Adherence Rate with Refills */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Projected Repeat Adherence Rate:</span>
                  <span className="text-brand-600 font-bold">{Math.round(econInput.refillLiftedRepeatRate * 100)}% (Baseline: {Math.round(econInput.baselineRepeatRate * 100)}%)</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.85"
                  step="0.05"
                  value={econInput.refillLiftedRepeatRate}
                  onChange={(e) => setEconInput({ ...econInput, refillLiftedRepeatRate: Number(e.target.value) })}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* 12-Month Cumulative Cash Flow Chart */}
              <div className="pt-4 border-t border-gray-100 dark:border-charcoal-800">
                <p className="font-bold text-xs text-charcoal-900 dark:text-white mb-2">
                  12-Month Cumulative Cash Flow Projection (₹)
                </p>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${Math.round(val / 1000)}k`} />
                      <Tooltip formatter={(value: any) => [formatINR(value), 'Cumulative Cash']} />
                      <Area type="monotone" dataKey="cash" stroke="#1f9d5f" fill="#d1f0dc" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Col: Executive Outputs Card */}
            <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-700/80 text-emerald-300">
                  Doctor P&L Impact
                </span>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-brand-200">Annual Net Incremental Margin</p>
                    <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300 mt-1">
                      {formatINR(econOutput.annualNetIncrementalMargin)}
                    </p>
                    <p className="text-[11px] text-brand-200 mt-0.5">
                      {formatINR(econOutput.monthlyNetIncrementalMargin)} / month net of staff costs
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-brand-700/70 text-xs">
                    <div>
                      <p className="text-brand-300">Repeat Lift</p>
                      <p className="text-xl font-bold text-white mt-0.5">
                        +{Math.round(econOutput.repeatLiftPct * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-brand-300">Payback Period</p>
                      <p className="text-xl font-bold text-white mt-0.5">
                        {econOutput.paybackPeriodMonths} mo
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-brand-800/60 border border-brand-700 text-xs text-brand-100 space-y-1">
                    <p className="font-bold text-emerald-300">Working Capital Guarantee:</p>
                    <p className="text-[11px]">
                      100% Sale-or-Return stock buyback ensures zero stuck inventory risk for the practice.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('pitch')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-brand-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <span>Generate Doctor Pitch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PITCH GENERATOR */}
      {activeTab === 'pitch' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Personalized Practice Pitch Builder
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Auto-populated with {clinic.doctorName}'s practice metrics and economic outputs.
              </p>
            </div>

            {/* Pitch Format Pills */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-charcoal-800 rounded-2xl text-xs font-semibold">
              {(['30sec', '2min', 'whatsapp', 'email'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setPitchFormat(fmt)}
                  className={`px-3 py-1.5 rounded-xl uppercase tracking-wider text-[11px] transition-colors ${
                    pitchFormat === fmt
                      ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Names Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">Doctor Name:</label>
              <input
                type="text"
                value={doctorNameInput}
                onChange={(e) => setDoctorNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl text-xs text-charcoal-900 dark:text-white border border-gray-200 dark:border-charcoal-700"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">Clinic Name:</label>
              <input
                type="text"
                value={clinicNameInput}
                onChange={(e) => setClinicNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl text-xs text-charcoal-900 dark:text-white border border-gray-200 dark:border-charcoal-700"
              />
            </div>
          </div>

          {/* Generated Pitch Box */}
          <div className="p-6 rounded-3xl bg-mint-50/70 dark:bg-charcoal-850 border border-emerald-200 dark:border-emerald-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950">
                {pitchFormat.toUpperCase()} Personalized Script
              </span>
              <button
                onClick={() => handleCopyPitch(generatePitchText())}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-charcoal-800 hover:bg-gray-50 border border-gray-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-800 dark:text-gray-200"
              >
                {copiedPitch ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm font-sans text-charcoal-800 dark:text-gray-100 whitespace-pre-line leading-relaxed">
              {generatePitchText()}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: OBJECTION HANDLING & ROLEPLAY */}
      {activeTab === 'objections' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-charcoal-800">
              <div>
                <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                  Objection Library (12+ Real Clinic Scenarios)
                </h2>
                <p className="text-xs text-charcoal-600 dark:text-gray-400">
                  3-Part Medical Pitch Method: <strong>Acknowledge</strong> → <strong>Evidence</strong> → <strong>Commercial Offer</strong>.
                </p>
              </div>

              {/* Roleplay Toggle */}
              <button
                onClick={() => setRoleplayMode(!roleplayMode)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  roleplayMode
                    ? 'bg-gold-500 text-charcoal-950 font-bold shadow-sm'
                    : 'bg-gray-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-gray-200'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>{roleplayMode ? 'Exit Practice Mode' : 'Enter Roleplay Mode'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Objection Picker List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {OBJECTIONS_LIBRARY.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => {
                      setSelectedObjectionId(obj.id)
                      setCheckedChecklist({})
                    }}
                    className={`w-full text-left p-3 rounded-2xl border text-xs transition-colors ${
                      selectedObjectionId === obj.id
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/60 font-semibold text-brand-900 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-charcoal-700 hover:bg-gray-50 dark:hover:bg-charcoal-800 text-charcoal-800 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{obj.title}</span>
                      <span className="text-[10px] text-gray-400 uppercase">{obj.category}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Objection Solution Card */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs">
                  <p className="font-bold text-rose-900 dark:text-rose-200 uppercase text-[10px] mb-1">
                    What Doctor Says:
                  </p>
                  <p className="font-serif text-sm font-semibold text-rose-950 dark:text-rose-100 italic">
                    "{selectedObjection.doctorSays}"
                  </p>
                </div>

                {!roleplayMode ? (
                  /* 3-Part Solution Structure */
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 space-y-1">
                      <span className="font-bold text-brand-700 dark:text-emerald-400 uppercase text-[10px]">
                        1. Acknowledge & Validate Concern
                      </span>
                      <p className="text-charcoal-800 dark:text-gray-200 leading-relaxed">
                        {selectedObjection.acknowledge}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 space-y-1">
                      <span className="font-bold text-brand-700 dark:text-emerald-400 uppercase text-[10px]">
                        2. Clinical & Market Evidence
                      </span>
                      <p className="text-charcoal-800 dark:text-gray-200 leading-relaxed">
                        {selectedObjection.evidence}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-mint-50 dark:bg-charcoal-800 border border-emerald-200 dark:border-emerald-800 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase text-[10px]">
                        3. The Risk-Free Commercial Offer
                      </span>
                      <p className="text-charcoal-900 dark:text-gray-100 leading-relaxed font-medium">
                        {selectedObjection.offer}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Roleplay Scored Checklist */
                  <div className="p-5 rounded-2xl bg-gold-50/70 dark:bg-charcoal-800 border border-gold-300 dark:border-gold-800 space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-sm text-gold-950 dark:text-gold-200">
                        Interactive Pitch Roleplay Practice
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                        Say your answer aloud to doctor objection. Check off each criteria you delivered:
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedChecklist['ack'] || false}
                          onChange={(e) => setCheckedChecklist({ ...checkedChecklist, ack: e.target.checked })}
                          className="w-4 h-4 text-brand-600 rounded"
                        />
                        <span>Did you acknowledge the doctor's perspective without arguing?</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedChecklist['evi'] || false}
                          onChange={(e) => setCheckedChecklist({ ...checkedChecklist, evi: e.target.checked })}
                          className="w-4 h-4 text-brand-600 rounded"
                        />
                        <span>Did you cite the 68% drop-off data or 22-second counter speed?</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedChecklist['off'] || false}
                          onChange={(e) => setCheckedChecklist({ ...checkedChecklist, off: e.target.checked })}
                          className="w-4 h-4 text-brand-600 rounded"
                        />
                        <span>Did you emphasize the 100% Sale-or-Return safety net?</span>
                      </label>
                    </div>

                    <div className="pt-2 border-t border-gold-200 dark:border-charcoal-700 flex justify-between items-center">
                      <span className="font-bold">
                        Score: {Object.values(checkedChecklist).filter(Boolean).length} / 3 criteria met
                      </span>
                      {Object.values(checkedChecklist).filter(Boolean).length === 3 && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Ready for Clinic Visit!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 6-SLIDE PITCH DECK MODE */}
      {activeTab === 'deck' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-charcoal-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Interactive Leave-Behind Deck
              </span>
              <p className="text-xs text-gray-500">{deckSlides[deckSlide].subtitle}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {deckSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDeckSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    deckSlide === i ? 'bg-brand-600 w-6' : 'bg-gray-200 dark:bg-charcoal-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slide Body */}
          <div className="py-8 px-4 text-center max-w-xl mx-auto space-y-4 min-h-[220px] flex flex-col justify-center">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white">
              {deckSlides[deckSlide].title}
            </h2>
            <p className="text-sm text-charcoal-700 dark:text-gray-300 leading-relaxed font-sans">
              {deckSlides[deckSlide].content}
            </p>
            <div className="pt-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-xs font-semibold">
                Key Takeaway: {deckSlides[deckSlide].takeaway}
              </span>
            </div>
          </div>

          {/* Slide Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-charcoal-800">
            <button
              onClick={() => setDeckSlide(Math.max(0, deckSlide - 1))}
              disabled={deckSlide === 0}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 disabled:opacity-40 text-xs font-semibold text-charcoal-800 dark:text-gray-200"
            >
              Previous Slide
            </button>

            <span className="text-xs text-gray-400 font-mono">
              Slide {deckSlide + 1} of 6
            </span>

            <button
              onClick={() => setDeckSlide(Math.min(deckSlides.length - 1, deckSlide + 1))}
              disabled={deckSlide === deckSlides.length - 1}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-xs font-semibold text-white shadow-sm"
            >
              Next Slide →
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: PRINTABLE / PDF ASSETS */}
      {activeTab === 'print' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
              <div>
                <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                  In-Browser Printable Clinic Collateral
                </h2>
                <p className="text-xs text-charcoal-600 dark:text-gray-400">
                  Ready-to-print Green Clinic Certificate and Counter Standee generated directly in browser.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>

            {/* Framed Green Clinic Certificate Preview */}
            <div className="p-8 sm:p-12 bg-[#faf9f5] border-8 border-[#14532d] rounded-2xl shadow-xl text-center space-y-4 max-w-xl mx-auto text-charcoal-900 print:shadow-none">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Award className="w-7 h-7 text-[#14532d]" />
              </div>

              <div>
                <span className="text-[11px] font-serif uppercase tracking-[0.2em] text-[#14532d] font-bold">
                  Official Recognition of Circular Dermatology
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#14532d] mt-1">
                  GREEN CERTIFIED CLINIC
                </h2>
              </div>

              <p className="text-xs font-serif italic text-gray-600">
                This certifies that the practice of
              </p>

              <h3 className="font-serif text-2xl font-bold text-charcoal-900 border-b-2 border-brand-200 pb-2 inline-block px-6">
                {clinic.doctorName}
              </h3>
              <p className="text-xs font-semibold text-gray-700">{clinic.name}</p>

              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed pt-2">
                has successfully operationalized closed-loop packaging return & refilling, diverting over <strong>150 kg of medical-grade virgin plastic</strong> from regional landfills.
              </p>

              <div className="pt-6 flex items-center justify-between border-t border-gray-300 text-left text-[11px]">
                <div>
                  <p className="font-bold">L'Oréal Medical Affairs</p>
                  <p className="text-gray-500">Global Sustainability Track</p>
                </div>
                <div className="p-1 bg-white rounded border">
                  <QRCodeSVG value={`https://refillrx.loreal.com/cert/${clinic.id}`} size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

