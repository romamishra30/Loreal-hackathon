import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, MapPin, Calculator, QrCode, Stethoscope, Award, GraduationCap, Sliders, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { clinics, setSelectedClinicId, setPersona } = useAppStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Trigger handled in parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const actions = [
    { label: 'Territory Operations & Map', path: '/territory', icon: MapPin, role: 'rep' },
    { label: '3-Tap Clinic Refill Counter', path: '/counter', icon: QrCode, role: 'staff' },
    { label: 'Clinic Economics & Calculator', path: '/pitch-studio', icon: Calculator, role: 'rep' },
    { label: 'Prescriber vs Dispenser Matrix & Archetypes', path: '/doctor-matrix', icon: Stethoscope, role: 'rep' },
    { label: 'Doctor Practice Dashboard & Impact Card', path: '/doctor-dash', icon: Award, role: 'doctor' },
    { label: 'Staff Micro-Learning & Quizzes', path: '/academy', icon: GraduationCap, role: 'staff' },
    { label: 'Levers & Incentive Simulator', path: '/levers', icon: Sliders, role: 'rep' },
  ]

  const filteredClinics = query
    ? clinics.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        (c.doctorName && c.doctorName.toLowerCase().includes(query.toLowerCase())) ||
        c.locality.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : clinics.slice(0, 4)

  const filteredActions = query
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions

  const handleSelectAction = (path: string, role?: string) => {
    if (role) setPersona(role as any)
    navigate(path)
    onClose()
  }

  const handleSelectClinic = (clinicId: string) => {
    setSelectedClinicId(clinicId)
    setPersona('staff')
    navigate('/counter')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-charcoal-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-charcoal-800 overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-charcoal-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Type a command, clinic name, doctor, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-charcoal-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          
          {/* Quick Actions */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
              Quick Navigation
            </p>
            <div className="space-y-1">
              {filteredActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.path}
                    onClick={() => handleSelectAction(action.path, action.role)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-charcoal-800 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-brand-600" />
                      <span>{action.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Clinics */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
              Participating Practices
            </p>
            <div className="space-y-1">
              {filteredClinics.map((clinic) => (
                <button
                  key={clinic.id}
                  onClick={() => handleSelectClinic(clinic.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-brand-50 dark:hover:bg-charcoal-800 transition-colors text-left"
                >
                  <div>
                    <p className="font-semibold text-charcoal-900 dark:text-white">{clinic.name}</p>
                    <p className="text-[11px] text-gray-500">{clinic.doctorName} • {clinic.locality}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                    Score {clinic.healthScore ?? 85}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-2 bg-gray-50 dark:bg-charcoal-950/50 border-t border-gray-100 dark:border-charcoal-800 text-[11px] text-gray-400 flex justify-between items-center">
          <span>Use <strong>Esc</strong> to close</span>
          <span>Tip: Press <strong>⌘K</strong> anytime</span>
        </div>
      </div>
    </div>
  )
}

