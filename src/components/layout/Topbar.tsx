import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  Search, 
  Share2, 
  RefreshCw, 
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Check,
  ChevronDown,
  Building2,
  Bot
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { PersonaRole } from '../../types'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '../../lib/utils'

export const Topbar: React.FC<{ onOpenCopilot: () => void; onOpenPalette: () => void; onOpenShare: () => void }> = ({
  onOpenCopilot,
  onOpenPalette,
  onOpenShare,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const {
    persona,
    setPersona,
    selectedClinicId,
    setSelectedClinicId,
    clinics,
    theme,
    toggleTheme,
    language,
    setLanguage,
    isOnline,
    setOnline,
    offlineQueue,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    startTour,
    resetDemoData,
    reseedData,
  } = useAppStore()

  const [showPersonaMenu, setShowPersonaMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showClinicMenu, setShowClinicMenu] = useState(false)
  const [showNotifMenu, setShowNotifMenu] = useState(false)

  const unreadNotifs = notifications.filter(n => !n.read)
  const currentClinic = clinics.find(c => c.id === selectedClinicId) || clinics[0]

  const handlePersonaChange = (p: PersonaRole) => {
    setPersona(p)
    setShowPersonaMenu(false)
    if (p === 'staff') navigate('/counter')
    else if (p === 'patient') navigate('/patient')
    else if (p === 'doctor') navigate('/doctor-dash')
    else if (p === 'manager') navigate('/brand-admin')
    else navigate('/territory')
  }

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    setShowLangMenu(false)
  }

  const roleLabels: Record<PersonaRole, string> = {
    rep: 'Medical Rep (Mumbai-Thane)',
    staff: 'Clinic Staff / Dispenser',
    doctor: 'Dispensing Dermatologist',
    patient: 'Patient (Mobile)',
    manager: 'Regional Brand Admin',
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md border-b border-gray-200 dark:border-charcoal-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Tour Button */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-900 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-900/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M21 21v-5h-5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg tracking-tight text-brand-900 dark:text-emerald-400">
                  Refill<span className="text-brand-500 dark:text-emerald-300">Rx</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  L'Oréal 2026
                </span>
              </div>
              <p className="text-[10px] text-charcoal-600 dark:text-gray-400 leading-tight hidden md:block">
                Dermatology Refill Operating Platform
              </p>
            </div>
          </Link>

          {/* 3-Min Tour Trigger */}
          <button
            onClick={startTour}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-100 dark:bg-gold-950/70 text-gold-800 dark:text-gold-300 border border-gold-300/60 hover:bg-gold-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
            3-Min Demo Tour
          </button>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-2">
          <button
            onClick={onOpenPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-charcoal-600 dark:text-gray-400 bg-gray-100 dark:bg-charcoal-800/80 hover:bg-gray-200 dark:hover:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search clinics, patients, pitch...</span>
            </span>
            <kbd className="text-[10px] bg-white dark:bg-charcoal-700 px-1.5 py-0.5 rounded border border-gray-300 dark:border-charcoal-600 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          
          {/* Clinic Switcher (When Staff / Doctor persona) */}
          {(persona === 'staff' || persona === 'doctor') && (
            <div className="relative">
              <button
                onClick={() => setShowClinicMenu(!showClinicMenu)}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-gray-200 border border-gray-200 dark:border-charcoal-700 max-w-[140px] sm:max-w-[180px] truncate"
              >
                <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="truncate">{currentClinic.name.split(',')[0]}</span>
                <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
              </button>

              {showClinicMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-charcoal-900 rounded-2xl shadow-xl border border-gray-200 dark:border-charcoal-800 p-2 z-50 animate-fade-in max-h-80 overflow-y-auto">
                  <p className="text-[11px] font-semibold text-gray-400 px-2 py-1 uppercase">Select Participating Practice</p>
                  {clinics.slice(0, 15).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedClinicId(c.id)
                        setShowClinicMenu(false)
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-brand-50 dark:hover:bg-charcoal-800 flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-charcoal-900 dark:text-white truncate">{c.name}</p>
                        <p className="text-[10px] text-gray-500">{c.doctorName}</p>
                      </div>
                      {c.id === selectedClinicId && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Persona Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/70 text-brand-900 dark:text-emerald-300 border border-brand-200 dark:border-emerald-800/60 hover:bg-brand-100 transition-colors shadow-sm"
            >
              <Users className="w-3.5 h-3.5 text-brand-600 dark:text-emerald-400" />
              <span className="hidden sm:inline font-medium text-charcoal-600 dark:text-gray-300">Role:</span>
              <span className="font-bold">{roleLabels[persona].split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-brand-600" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-charcoal-800 p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-charcoal-800">
                  <p className="text-xs font-bold text-charcoal-900 dark:text-white">Switch Persona (No Login)</p>
                  <p className="text-[11px] text-gray-500">Explore different perspectives</p>
                </div>
                <div className="py-1">
                  {(Object.keys(roleLabels) as PersonaRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handlePersonaChange(r)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        persona === r
                          ? 'bg-brand-50 dark:bg-brand-950 text-brand-900 dark:text-emerald-300 font-semibold'
                          : 'text-charcoal-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoal-800'
                      }`}
                    >
                      <span>{roleLabels[r]}</span>
                      {persona === r && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Copilot Button */}
          <button
            onClick={onOpenCopilot}
            className="p-2 rounded-xl bg-gray-100 dark:bg-charcoal-800 hover:bg-brand-50 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-gray-300 border border-gray-200 dark:border-charcoal-700 transition-colors relative"
            title="RefillRx Copilot Assistant"
          >
            <Bot className="w-4 h-4 text-brand-600 dark:text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Offline / Online toggle button */}
          <button
            onClick={() => setOnline(!isOnline)}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs border font-medium transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
            }`}
            title={isOnline ? 'Online (Click to simulate offline)' : 'Offline mode active (Click to reconnect)'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline text-[11px]">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="text-[11px] font-bold">Offline ({offlineQueue.length})</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-xl text-charcoal-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-charcoal-900 rounded-2xl shadow-xl border border-gray-200 dark:border-charcoal-800 p-1.5 z-50 animate-fade-in">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                    language === 'en' ? 'font-bold text-brand-600 bg-brand-50 dark:bg-charcoal-800' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  English
                  {language === 'en' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                    language === 'hi' ? 'font-bold text-brand-600 bg-brand-50 dark:bg-charcoal-800' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  हिन्दी (Hindi)
                  {language === 'hi' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleLanguageChange('mr')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                    language === 'mr' ? 'font-bold text-brand-600 bg-brand-50 dark:bg-charcoal-800' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  मराठी (Marathi)
                  {language === 'mr' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-charcoal-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-charcoal-600" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl text-charcoal-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-charcoal-800 p-3 z-50 animate-fade-in max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-charcoal-800 mb-2">
                  <span className="text-xs font-bold text-charcoal-900 dark:text-white">Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-brand-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-gray-50/60 dark:bg-charcoal-800/40 text-gray-500'
                          : 'bg-emerald-50/70 dark:bg-emerald-950/40 text-charcoal-900 dark:text-gray-100 border border-emerald-200/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-semibold text-[11px]">{n.title}</p>
                        <span className="text-[9px] text-gray-400">{formatDateTime(n.timestamp)}</span>
                      </div>
                      <p className="text-[11px] mt-1 text-charcoal-600 dark:text-gray-300">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Share Prototype Link & QR */}
          <button
            onClick={onOpenShare}
            className="p-2 rounded-xl text-charcoal-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors"
            title="Share Prototype QR / Link"
          >
            <Share2 className="w-4 h-4 text-brand-600" />
          </button>
        </div>
      </div>
    </header>
  )
}

