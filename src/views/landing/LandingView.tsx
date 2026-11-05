import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  Stethoscope, 
  Calculator, 
  QrCode, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Recycle, 
  Award, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Smartphone,
  ChevronRight,
  Leaf
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { PersonaRole } from '../../types'
import { IllustrativeDisclaimer } from '../../components/common/IllustrativeDisclaimer'

export const LandingView: React.FC = () => {
  const navigate = useNavigate()
  const { setPersona, startTour, transactions, clinics } = useAppStore()

  const completedTxs = transactions.filter(t => t.status === 'completed')
  const totalRefills = completedTxs.length
  const totalKgPlastic = ((totalRefills * 42) / 1000).toFixed(1)
  const activeClinics = clinics.filter(c => c.healthStatus !== 'dormant').length

  const handleSelectRole = (role: PersonaRole, path: string) => {
    setPersona(role)
    navigate(path)
  }

  const steps = [
    {
      num: '01',
      title: 'The Dual Mindset Gap',
      desc: '45% of dermatologists dispense products directly from their clinics. They think as small-business owners (margins, working capital, staff load) AND as clinicians (safety, efficacy). Prescribing-only brands fail because they ignore the retail reality.',
      badge: 'Deliverable (a)',
      icon: Stethoscope,
    },
    {
      num: '02',
      title: 'Practice Growth + Circular Value',
      desc: 'Instead of pitching "save the planet", pitch refills as a patient-retention engine (+62% repeat rate) and +32% margin with zero dead-stock risk through 100% sale-or-return guarantee. Sustainability becomes a prestige practice differentiator.',
      badge: 'Deliverable (c)',
      icon: TrendingUp,
    },
    {
      num: '03',
      title: '3-Tap Frictionless In-Clinic Flow',
      desc: 'Clinic staff will abandon any tool that takes over 45 seconds. The RefillRx Counter operates in 3 taps / under 25 seconds: QR scan, anti-fraud batch verification, sealed pod dispense. Zero paperwork, zero training.',
      badge: 'Deliverable (b)',
      icon: QrCode,
    },
    {
      num: '04',
      title: 'Territory Adoption Tracking',
      desc: 'Reps track execution across 25 clinics with real-time Adoption Health Scores (0-100), automated Action Centre tasks (dormant streaks, low inventory, full returns bins), and weekly visit routing.',
      badge: 'Deliverable (d)',
      icon: MapPin,
    },
  ]

  const personas = [
    {
      role: 'rep' as PersonaRole,
      title: 'Medical Representative',
      subtitle: 'Territory: Mumbai–Thane (25 Clinics)',
      desc: 'Manage clinics, prioritize coaching visits, run economics calculator, and handle doctor objections.',
      path: '/territory',
      badge: 'Main Experience',
      color: 'border-brand-500/50 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/40 dark:to-charcoal-900',
    },
    {
      role: 'staff' as PersonaRole,
      title: 'Clinic Staff / Dispenser',
      subtitle: 'Practice: SkinFirst Clinic, Thane',
      desc: 'Process 3-tap refills in 22 seconds, check lot codes, monitor returns bin, and request stock pickups.',
      path: '/counter',
      badge: 'Mobile-First',
      color: 'border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-charcoal-900',
    },
    {
      role: 'doctor' as PersonaRole,
      title: 'Dispensing Dermatologist',
      subtitle: 'Dr. Vikram Patil, MD Derm',
      desc: 'Review practice margins, patient repeat-purchase lift, and export "My Green Clinic" ESG impact cards.',
      path: '/doctor-dash',
      badge: 'Doctor P&L',
      color: 'border-blue-500/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-charcoal-900',
    },
    {
      role: 'patient' as PersonaRole,
      title: 'Patient (Mobile Experience)',
      subtitle: 'Patient: Ananya Sharma',
      desc: 'Track usage cycle, WhatsApp refill reminders, 20% discount savings, and personal plastic diverted.',
      path: '/patient',
      badge: 'Consumer Pull',
      color: 'border-gold-500/50 bg-gradient-to-br from-gold-50 to-white dark:from-gold-950/40 dark:to-charcoal-900',
    },
    {
      role: 'manager' as PersonaRole,
      title: 'Regional Brand Admin',
      subtitle: 'West Region (100 Clinics / 4 Territories)',
      desc: 'Multi-territory roll-up heatmap, pilot scorecard, replenishment kanban, and national rollout simulator.',
      path: '/brand-admin',
      badge: 'Executive View',
      color: 'border-purple-500/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/40 dark:to-charcoal-900',
    },
  ]

  return (
    <div className="min-h-screen bg-mint-50 dark:bg-charcoal-950 transition-colors">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-gray-200/80 dark:border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>L'Oréal Sustainability Challenge 2026 • Medical Track</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 dark:text-white leading-[1.15]">
              The Operating System for <span className="text-brand-600 dark:text-emerald-400">Dispensing Dermatologists</span>.
            </h1>

            <p className="text-base sm:text-lg text-charcoal-700 dark:text-gray-300 leading-relaxed font-sans">
              Engaging the 45% of dermatologists who stock and sell products directly from their clinics. 
              Framing refills as a <strong>Practice-Growth and Patient-Retention engine</strong>, backed by an ultra-fast 3-tap counter flow and automated territory tracking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={startTour}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-900 hover:bg-brand-800 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-900/20 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Launch 3-Minute Guided Demo Tour</span>
              </button>

              <button
                onClick={() => handleSelectRole('rep', '/territory')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-charcoal-800 hover:bg-gray-50 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-gray-200 font-semibold text-sm border border-gray-200 dark:border-charcoal-700 transition-colors"
              >
                <span>Enter Medical Rep Workspace</span>
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </button>
            </div>

            <IllustrativeDisclaimer />
          </div>

          {/* Quick Stats Pill Grid */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-gray-200/80 dark:border-charcoal-800 shadow-sm">
              <p className="text-xs text-charcoal-600 dark:text-gray-400 font-medium">Refills Dispensed (Live)</p>
              <p className="text-2xl font-bold text-brand-700 dark:text-emerald-400 mt-1">{totalRefills.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Across 12 weeks of pilot data</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-gray-200/80 dark:border-charcoal-800 shadow-sm">
              <p className="text-xs text-charcoal-600 dark:text-gray-400 font-medium">Virgin Plastic Diverted</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{totalKgPlastic} kg</p>
              <p className="text-[11px] text-gray-400 mt-0.5">~{Math.round(Number(totalKgPlastic) * 83).toLocaleString('en-IN')} PET bottles saved</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-gray-200/80 dark:border-charcoal-800 shadow-sm">
              <p className="text-xs text-charcoal-600 dark:text-gray-400 font-medium">Average Repeat Lift</p>
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">+121%</p>
              <p className="text-[11px] text-gray-400 mt-0.5">From 28% to 62% repeat rate</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-gray-200/80 dark:border-charcoal-800 shadow-sm">
              <p className="text-xs text-charcoal-600 dark:text-gray-400 font-medium">Active Dispensing Clinics</p>
              <p className="text-2xl font-bold text-gold-600 dark:text-gold-400 mt-1">{activeClinics} / 100</p>
              <p className="text-[11px] text-gray-400 mt-0.5">25 in Mumbai-Thane main territory</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem to Solution Story (4 Animated Steps) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-emerald-400 mb-2">
            The Strategic Solution
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-white">
            How RefillRx Solves the 4 Core Deliverables
          </h2>
          <p className="text-sm text-charcoal-600 dark:text-gray-400 mt-2">
            Mapped directly to the competition brief requirements (a), (b), (c), and (d).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.num}
                className="rounded-3xl p-6 bg-white dark:bg-charcoal-900 border border-gray-200/80 dark:border-charcoal-800 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-extrabold text-brand-900/20 dark:text-emerald-400/20">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-emerald-400 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-charcoal-600 dark:text-gray-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Persona Entry Grid */}
      <section className="py-12 bg-white dark:bg-charcoal-900/60 border-t border-gray-200/80 dark:border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 dark:text-white">
              Explore by Role (No Login Required)
            </h2>
            <p className="text-sm text-charcoal-600 dark:text-gray-400 mt-2">
              Select any persona to experience the platform through their specialized workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((p) => (
              <div
                key={p.role}
                onClick={() => handleSelectRole(p.role, p.path)}
                className={`rounded-3xl p-6 border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-charcoal-800 text-charcoal-800 dark:text-gray-200 border border-gray-200 dark:border-charcoal-700">
                      {p.badge}
                    </span>
                    <span className="text-xs font-semibold text-brand-600 dark:text-emerald-400 flex items-center gap-0.5">
                      Enter <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-charcoal-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs font-medium text-brand-700 dark:text-emerald-300 mb-2">
                    {p.subtitle}
                  </p>
                  <p className="text-xs text-charcoal-600 dark:text-gray-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-charcoal-700 flex items-center justify-between text-xs font-semibold text-charcoal-800 dark:text-gray-200">
                  <span>Open Experience</span>
                  <ArrowRight className="w-4 h-4 text-brand-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-charcoal-800 bg-mint-50 dark:bg-charcoal-950 text-center text-xs text-charcoal-600 dark:text-gray-400">
        <p className="font-medium">
          RefillRx • Built for L'Oréal Sustainability Challenge 2026 (Medical Track: Engaging Dispensing Dermatologists)
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          Zero real backend • Client-side reactive Zustand architecture • Deterministic seeded simulation
        </p>
      </footer>
    </div>
  )
}

