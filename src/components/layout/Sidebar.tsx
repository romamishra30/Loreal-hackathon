import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calculator, 
  UserPlus, 
  GraduationCap, 
  QrCode, 
  Smartphone, 
  Sliders, 
  MapPin, 
  Award, 
  BarChart3,
  HelpCircle,
  RotateCcw,
  RefreshCw,
  Download,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { PersonaRole } from '../../types'
import { useTranslation } from 'react-i18next'
import { IllustrativeDisclaimer } from '../common/IllustrativeDisclaimer'

export const Sidebar: React.FC = () => {
  const { t } = useTranslation()
  const { persona, resetDemoData, reseedData, exportStateJson } = useAppStore()

  // Dynamic nav items based on persona
  const navItems = [
    {
      to: '/',
      label: 'Platform Overview',
      icon: LayoutDashboard,
      roles: ['rep', 'staff', 'doctor', 'patient', 'manager'] as PersonaRole[],
    },
    {
      to: '/territory',
      label: 'Territory Dashboard',
      icon: MapPin,
      badge: 'Main (25)',
      roles: ['rep', 'manager'] as PersonaRole[],
    },
    {
      to: '/counter',
      label: 'Clinic Refill Counter',
      icon: QrCode,
      badge: '3-Tap',
      roles: ['staff', 'doctor', 'rep'] as PersonaRole[],
    },
    {
      to: '/patient',
      label: 'Patient Pass & Loyalty',
      icon: Smartphone,
      roles: ['patient', 'staff', 'doctor', 'rep'] as PersonaRole[],
    },
    {
      to: '/doctor-matrix',
      label: 'Understand Doctor',
      icon: Stethoscope,
      badge: 'Archetypes',
      roles: ['rep', 'doctor', 'manager'] as PersonaRole[],
    },
    {
      to: '/pitch-studio',
      label: 'Pitch & Economics Studio',
      icon: Calculator,
      roles: ['rep', 'doctor', 'manager'] as PersonaRole[],
    },
    {
      to: '/doctor-dash',
      label: 'Doctor Practice View',
      icon: Award,
      roles: ['doctor', 'rep', 'manager'] as PersonaRole[],
    },
    {
      to: '/academy',
      label: 'Staff Training Academy',
      icon: GraduationCap,
      roles: ['staff', 'rep', 'doctor'] as PersonaRole[],
    },
    {
      to: '/levers',
      label: 'Levers & Incentives Engine',
      icon: Sliders,
      roles: ['rep', 'manager'] as PersonaRole[],
    },
    {
      to: '/onboarding',
      label: 'Clinic Enrolment Wizard',
      icon: UserPlus,
      roles: ['rep', 'manager'] as PersonaRole[],
    },
    {
      to: '/brand-admin',
      label: 'Brand Executive View',
      icon: BarChart3,
      badge: 'Roll-up',
      roles: ['manager', 'rep'] as PersonaRole[],
    },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(persona))

  const handleExport = () => {
    const data = exportStateJson()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `refillrx-state-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-charcoal-900 border-r border-gray-200 dark:border-charcoal-800 flex flex-col justify-between hidden md:flex transition-colors">
      
      {/* Top Nav Section */}
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-600 dark:text-gray-400">
            Active Experience: <span className="text-brand-600 dark:text-emerald-400 capitalize">{persona}</span>
          </p>
        </div>

        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-900 text-white shadow-sm font-semibold dark:bg-brand-800'
                      : 'text-charcoal-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-brand-700 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: Developer Controls & Assumptions */}
      <div className="p-4 border-t border-gray-100 dark:border-charcoal-800 space-y-3 bg-gray-50/50 dark:bg-charcoal-950/40">
        
        <IllustrativeDisclaimer />

        <div className="pt-2 border-t border-gray-200/60 dark:border-charcoal-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Demo Tools</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => resetDemoData()}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white dark:bg-charcoal-800 hover:bg-gray-100 dark:hover:bg-charcoal-700 border border-gray-200 dark:border-charcoal-700 text-[11px] text-gray-700 dark:text-gray-300 font-medium"
              title="Reset state back to clean initial demo baseline"
            >
              <RotateCcw className="w-3 h-3 text-amber-500" />
              Reset Demo
            </button>
            <button
              onClick={() => reseedData()}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white dark:bg-charcoal-800 hover:bg-gray-100 dark:hover:bg-charcoal-700 border border-gray-200 dark:border-charcoal-700 text-[11px] text-gray-700 dark:text-gray-300 font-medium"
              title="Generate new random numbers with Seeded PRNG"
            >
              <RefreshCw className="w-3 h-3 text-brand-600" />
              Re-Seed
            </button>
          </div>
          <button
            onClick={handleExport}
            className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white dark:bg-charcoal-800 hover:bg-gray-100 dark:hover:bg-charcoal-700 border border-gray-200 dark:border-charcoal-700 text-[11px] text-gray-700 dark:text-gray-300 font-medium"
          >
            <Download className="w-3 h-3 text-sky-500" />
            Export State JSON
          </button>
        </div>
      </div>
    </aside>
  )
}

