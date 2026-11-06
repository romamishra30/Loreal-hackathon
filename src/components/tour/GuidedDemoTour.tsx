import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2, Award, ArrowRight, Zap, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useUiStore } from '../../store/useUiStore'
import { PersonaRole } from '../../types'

interface TourStep {
  title: string
  subtitle: string
  deliverableBadge: string
  targetRole: PersonaRole
  targetPath: string
  targetSelector?: string
  description: string
  keyHighlights: string[]
  isInteractiveRefill?: boolean
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'The Challenge & The Dispensing Dermatologist',
    subtitle: "L'Oréal Sustainability Challenge 2026 – Medical Track",
    deliverableBadge: 'Context & Foundation',
    targetRole: 'rep',
    targetPath: '/',
    targetSelector: 'h1',
    description: '45% of dermatologists in key markets are dispensing dermatologists: they stock and sell skincare directly from their clinics. A dispensing doctor thinks like a small-business owner (margins, inventory, staff bandwidth) AND like a clinician (efficacy, safety, patient trust).',
    keyHighlights: [
      'Refill must be pitched as Practice-Growth + Patient-Loyalty',
      'Sustainability is framed as a prestige value-add',
      'In-clinic execution must be so fast staff need zero training',
    ],
  },
  {
    title: 'Deliverable (a): Understand the Doctor',
    subtitle: 'Prescriber vs Dispenser Matrix & Archetype Quiz',
    deliverableBadge: 'Deliverable (a)',
    targetRole: 'rep',
    targetPath: '/doctor-matrix',
    targetSelector: 'h1',
    description: 'Discover how dispensing dermatologists weigh margins, stock risks, and clinic footfall differently from prescribing purists. Use the 8-question diagnostic quiz to classify a doctor into 5 distinct archetypes.',
    keyHighlights: [
      'Side-by-side Decision-Driver Weight comparison (1 to 5)',
      'Diagnostic Archetype Quiz with radar motivation mapping',
      'Tailored pitch angles and objection predictions per doctor',
    ],
  },
  {
    title: 'Deliverable (c): Pitch Studio & Economics',
    subtitle: 'P&L Calculator, Deck Mode & Objection Library',
    deliverableBadge: 'Deliverable (c)',
    targetRole: 'rep',
    targetPath: '/pitch-studio',
    targetSelector: 'h1',
    description: 'Prove the business case with live sliders: how 32% refill margins and 2.2x repeat purchase lift generate ₹1.2L+ incremental practice profit. Test objection handling against 12+ tough doctor doubts.',
    keyHighlights: [
      'Live Unit Economics calculator & 12-month cumulative cash curve',
      'Preset scenarios: Conservative, Base, Optimistic',
      '12+ Searchable objections with 3-part answers (Acknowledge, Evidence, Offer)',
    ],
  },
  {
    title: 'Deliverable (b): 3-Tap Clinic Refill Counter',
    subtitle: 'Ultra-Fast In-Clinic Execution for Busy Staff',
    deliverableBadge: 'Deliverable (b)',
    targetRole: 'staff',
    targetPath: '/counter',
    targetSelector: 'header',
    description: 'Refill transactions must never slow down the clinic OPD. Experience the 3-tap counter flow: scan patient QR, verify empty bottle & anti-fraud batch code, dispense sealed pod in under 25 seconds.',
    isInteractiveRefill: true,
    keyHighlights: [
      '3-tap flow completed in ~22 seconds with zero paperwork',
      'Duplicate batch-code anti-fraud protection',
      'Threshold-based returns bin (20 packs) with 1-tap courier pickup',
    ],
  },
  {
    title: 'Patient Experience & WhatsApp Adherence',
    subtitle: 'Driving Patient Pull & Circular Loyalty',
    deliverableBadge: 'Patient Retention',
    targetRole: 'patient',
    targetPath: '/patient',
    targetSelector: 'header',
    description: 'Patients receive automated WhatsApp reminders on day 25 of their 30-day cycle with their digital Refill Pass. They save 20% on price while seeing their personal plastic diversion metrics grow.',
    keyHighlights: [
      'Usage countdown ring & automated WhatsApp adherence chat preview',
      'Loyalty tiers (Starter, Green, Gold) with streak milestones',
      'Personal impact tracker: grams of virgin plastic saved',
    ],
  },
  {
    title: 'Deliverable (d): Territory Dashboard & Health Score',
    subtitle: 'Tracking & Sustaining Execution Across 25 Clinics',
    deliverableBadge: 'Deliverable (d)',
    targetRole: 'rep',
    targetPath: '/territory',
    targetSelector: 'h1',
    description: 'The Medical Rep monitors the Mumbai–Thane territory. Clinics are scored from 0–100 using a multi-factor Adoption Health Score, with automated rule-based tasks in the Action Centre.',
    keyHighlights: [
      'Adoption Health Score formula (Rate, Consistency, Stock, Staff)',
      'Stylized SVG Territory Map with health-coded clinic pins',
      'Prioritized Action Centre auto-detecting stockouts & dormant streaks',
    ],
  },
  {
    title: 'Regional Brand Executive Roll-Up',
    subtitle: 'Multi-Territory Oversight & National Scale-Up',
    deliverableBadge: 'Brand Strategy',
    targetRole: 'manager',
    targetPath: '/brand-admin',
    targetSelector: 'h1',
    description: 'Regional management tracks performance across 100 clinics in 4 metro territories. Inspect pilot go/no-go scorecards and simulate nationwide rollout to 2,000+ clinics.',
    keyHighlights: [
      'Multi-territory adoption heatmap & rep performance ranking',
      'Pilot go/no-go decision scorecard (Pilot → Learn → Scale)',
      'National Scale-up Simulator with projected plastic and margin ROI',
    ],
  },
]

export const GuidedDemoTour: React.FC = () => {
  const navigate = useNavigate()
  const { activeTourStep, setPersona, nextTourStep, prevTourStep, endTour, processRefill, selectedClinicId, patients, skus } = useAppStore()
  const { closePopover } = useUiStore()
  const [liveRefillDone, setLiveRefillDone] = useState(false)

  useEffect(() => {
    if (activeTourStep === null || activeTourStep < 0 || activeTourStep >= TOUR_STEPS.length) return
    const current = TOUR_STEPS[activeTourStep]
    if (!current?.targetSelector) return

    const el = document.querySelector(current.targetSelector)
    if (el) {
      el.setAttribute('data-tour-target', 'true')
      return () => {
        el.removeAttribute('data-tour-target')
      }
    }
  }, [activeTourStep])

  if (activeTourStep === null || activeTourStep < 0 || activeTourStep >= TOUR_STEPS.length) {
    return null
  }

  const current = TOUR_STEPS[activeTourStep]

  const handleStepTransition = (direction: 'next' | 'prev') => {
    closePopover()
    setLiveRefillDone(false)
    const nextIndex = direction === 'next' ? activeTourStep + 1 : activeTourStep - 1
    if (nextIndex < 0 || nextIndex >= TOUR_STEPS.length) {
      endTour()
      return
    }
    const target = TOUR_STEPS[nextIndex]
    setPersona(target.targetRole)
    navigate(target.targetPath)
    if (direction === 'next') nextTourStep()
    else prevTourStep()
  }

  const handleTriggerLiveRefill = () => {
    const res = processRefill({
      clinicId: selectedClinicId,
      patientId: patients[0]?.id || 'pat-1',
      skuId: skus[0]?.id || 'sku-moisturiser-50',
      batchCode: `TOUR-${Math.floor(100 + Math.random() * 900)}`,
      paymentMode: 'upi',
    })
    if (res.success) {
      setLiveRefillDone(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end p-4 sm:p-6 animate-fade-in">
      {/* Dim Backdrop with Spotlight cutout overlay */}
      <div 
        className="fixed inset-0 bg-charcoal-950/60 dark:bg-black/75 pointer-events-auto backdrop-blur-[2px] transition-opacity"
        onClick={endTour}
      />

      {/* Floating Tour Stepper Card */}
      <div id="tour-card" data-testid="tour-card" className="relative z-10 w-full max-w-2xl mx-auto bg-white dark:bg-charcoal-900 rounded-3xl shadow-2xl border-2 border-brand-500/80 dark:border-emerald-500/80 p-5 sm:p-6 pointer-events-auto backdrop-blur-xl">
        
        {/* Stepper Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {current.deliverableBadge}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Step {activeTourStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={endTour}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-3 space-y-2">
          <h3 className="font-serif font-bold text-lg sm:text-xl text-charcoal-900 dark:text-white">
            {current.title}
          </h3>
          <p className="text-xs text-brand-600 dark:text-emerald-400 font-semibold">
            {current.subtitle}
          </p>
          <p className="text-xs text-charcoal-700 dark:text-gray-300 leading-relaxed">
            {current.description}
          </p>

          {/* Interactive Live Refill Demo Feature */}
          {current.isInteractiveRefill && (
            <div className="p-3 my-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                  Live Action: Dispense a Refill
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Simulate an instant refill. Watch clinic inventory decrement and territory KPI increment live!
                </p>
              </div>
              <button
                onClick={handleTriggerLiveRefill}
                disabled={liveRefillDone}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                  liveRefillDone
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md active:scale-95'
                }`}
              >
                {liveRefillDone ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Dispensed! +1 Refill</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Try 1-Tap Refill</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-charcoal-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {current.keyHighlights.map((hl, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-charcoal-600 dark:text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stepper Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-charcoal-800">
          <button
            onClick={endTour}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {activeTourStep > 0 && (
              <button
                onClick={() => handleStepTransition('prev')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 text-charcoal-800 dark:text-gray-200 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            <button
              onClick={() => handleStepTransition('next')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm"
            >
              {activeTourStep === TOUR_STEPS.length - 1 ? (
                <>
                  <span>Finish Tour</span>
                  <Award className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
