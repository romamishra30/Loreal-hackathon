import React, { useState } from 'react'
import { 
  MapPin, 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  Users, 
  Package, 
  Trash2, 
  Award, 
  Phone, 
  Plus, 
  X, 
  ChevronRight, 
  Sparkles,
  Download,
  ShieldAlert,
  Info
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Clinic, ActionTask, HealthStatus, DoctorArchetype } from '../../types'
import { Badge } from '../../components/common/Badge'
import { StatCard } from '../../components/common/StatCard'
import { formatINR, formatDate, formatDateTime } from '../../lib/utils'
import { calculateSustainabilityImpact } from '../../lib/calculations'
import Papa from 'papaparse'

export const TerritoryView: React.FC = () => {
  const {
    clinics,
    transactions,
    stockItems,
    actionTasks,
    visits,
    completeTask,
    snoozeTask,
    setSelectedClinicId,
    setPersona,
  } = useAppStore()

  // Main territory: Mumbai-Thane (25 clinics)
  const territoryClinics = clinics.filter(c => c.territoryId === 'terr-mumbai-thane')
  const completedTxs = transactions.filter(t => t.status === 'completed')

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [archetypeFilter, setArchetypeFilter] = useState<string>('all')
  const [selectedClinic360, setSelectedClinic360] = useState<Clinic | null>(null)
  const [activeTab, setActiveTab] = useState<'table' | 'map' | 'action_centre' | 'visits'>('table')
  const [showKpiDrawer, setShowKpiDrawer] = useState(false)
  const [showFormulaModal, setShowFormulaModal] = useState(false)

  // Filtered Clinics
  const filteredClinics = territoryClinics.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.locality.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.healthStatus === statusFilter
    const matchesArchetype = archetypeFilter === 'all' || c.archetype === archetypeFilter
    return matchesSearch && matchesStatus && matchesArchetype
  })

  // Aggregate KPI Calculations
  const totalRefills = territoryClinics.reduce((sum, c) => sum + c.totalRefillsAllTime, 0)
  const totalPacksSaved = territoryClinics.reduce((sum, c) => sum + c.totalPacksSavedAllTime, 0)
  const impact = calculateSustainabilityImpact(totalPacksSaved)
  const activeCount = territoryClinics.filter(c => c.healthStatus !== 'dormant').length
  const champions = territoryClinics.filter(c => c.healthStatus === 'champion').length
  const atRisk = territoryClinics.filter(c => c.healthStatus === 'at_risk' || c.healthStatus === 'dormant').length

  const handleExportClinicsCsv = () => {
    const csv = Papa.unparse(filteredClinics.map(c => ({
      ClinicID: c.id,
      Name: c.name,
      Doctor: c.doctorName,
      Locality: c.locality,
      Archetype: c.archetype,
      HealthScore: c.healthScore,
      HealthStatus: c.healthStatus,
      TotalRefills: c.totalRefillsAllTime,
      BinPacks: c.binCount,
      LastVisit: c.lastVisitDate,
    })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `territory-clinics-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Territory Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Pilot Territory (Main)
            </span>
            <span className="text-xs text-gray-400 font-mono">MUM-THN-01</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white mt-1">
            Mumbai–Thane–Navi Mumbai Territory Ops
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-gray-400">
            Medical Rep: <strong>Vikram Salunkhe</strong> • 25 Dispensing Dermatology Practices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKpiDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-gray-200 hover:bg-gray-50"
          >
            <Info className="w-3.5 h-3.5 text-brand-600" />
            <span>KPI Framework</span>
          </button>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-emerald-800 text-xs font-semibold text-brand-800 dark:text-emerald-300 hover:bg-brand-100"
          >
            <Award className="w-3.5 h-3.5 text-brand-600" />
            <span>Health Score Formula</span>
          </button>
        </div>
      </div>

      {/* KPI Row (10 Core Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Active Clinics"
          value={`${activeCount} / 25`}
          subtext={`${champions} Champions, ${atRisk} At Risk`}
          trend={{ value: '+2 this mo', isPositive: true }}
        />
        <StatCard
          title="Refills (30d)"
          value="1,480"
          subtext="MoM: +18.4% WoW: +4.2%"
          trend={{ value: '18.4%', isPositive: true }}
          highlight={true}
        />
        <StatCard
          title="Refill Rate"
          value="42.4%"
          subtext="Target: 40.0% (+2.4% lift)"
          trend={{ value: '+2.4%', isPositive: true }}
        />
        <StatCard
          title="Repeat Adherence"
          value="61.8%"
          subtext="Baseline was 28.0%"
          trend={{ value: '2.2x', isPositive: true }}
        />
        <StatCard
          title="Plastic Saved"
          value={`${impact.totalKgPlastic} kg`}
          subtext={`~${impact.waterBottlesEquivalent} PET bottles`}
        />
        <StatCard
          title="Patient NPS"
          value="+74"
          subtext="Based on 50+ reviews"
          trend={{ value: 'High', isPositive: true }}
        />
      </div>

      {/* Navigation Tabs: Table, Map, Action Centre, Visits */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-charcoal-800">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('table')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'table'
                ? 'border-brand-600 text-brand-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Clinics Directory (25)
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'map'
                ? 'border-brand-600 text-brand-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Territory Schematic Map
          </button>

          <button
            onClick={() => setActiveTab('action_centre')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'action_centre'
                ? 'border-brand-600 text-brand-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Prioritized Action Centre</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px]">
              {actionTasks.filter(t => t.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('visits')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'visits'
                ? 'border-brand-600 text-brand-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Rep Visit Planner
          </button>
        </div>

        <button
          onClick={handleExportClinicsCsv}
          className="hidden sm:flex items-center gap-1 text-xs text-brand-600 dark:text-emerald-400 hover:underline mb-2 font-medium"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Territory CSV</span>
        </button>
      </div>

      {/* VIEW 1: CLINICS TABLE */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          
          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search clinic, doctor or locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-charcoal-900 rounded-xl text-xs text-charcoal-900 dark:text-white border border-gray-200 dark:border-charcoal-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-charcoal-900 rounded-xl text-xs text-charcoal-800 dark:text-gray-200 border border-gray-200 dark:border-charcoal-800 focus:outline-none"
              >
                <option value="all">All Health Statuses</option>
                <option value="champion">Champions (85+)</option>
                <option value="on_track">On Track (65-84)</option>
                <option value="at_risk">At Risk (40-64)</option>
                <option value="dormant">Dormant (&lt;40)</option>
              </select>

              {/* Archetype Filter */}
              <select
                value={archetypeFilter}
                onChange={(e) => setArchetypeFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-charcoal-900 rounded-xl text-xs text-charcoal-800 dark:text-gray-200 border border-gray-200 dark:border-charcoal-800 focus:outline-none"
              >
                <option value="all">All Archetypes</option>
                <option value="clinician_first">Clinician-First</option>
                <option value="margin_driven">Margin-Driven</option>
                <option value="loyalty_builder">Loyalty Builder</option>
                <option value="eco_advocate">Eco Advocate</option>
                <option value="time_poor_skeptic">Time-Poor Skeptic</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/70 dark:bg-charcoal-800/50 text-gray-500 font-semibold border-b border-gray-100 dark:border-charcoal-800">
                  <tr>
                    <th className="py-3 px-4">Clinic & Doctor</th>
                    <th className="py-3 px-4">Locality</th>
                    <th className="py-3 px-4">Archetype</th>
                    <th className="py-3 px-4 text-center">Health Score</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">30d Refills</th>
                    <th className="py-3 px-4 text-center">Bin Gauge</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-charcoal-800">
                  {filteredClinics.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClinic360(c)}
                      className="hover:bg-brand-50/40 dark:hover:bg-charcoal-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-charcoal-900 dark:text-white">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.doctorName} • {c.doctorDegree}</p>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-700 dark:text-gray-300">
                        {c.locality.split('(')[0]}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-gray-300 capitalize">
                          {c.archetype.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-sm text-charcoal-900 dark:text-white">
                          {c.healthScore}
                        </span>
                        <span className="text-[10px] text-gray-400">/100</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge healthStatus={c.healthStatus} size="sm">
                          {c.healthStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-charcoal-900 dark:text-white">
                        {Math.round(c.totalRefillsAllTime * 0.35)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono text-xs font-semibold ${
                          c.binCount >= c.binThreshold ? 'text-rose-600 font-bold' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {c.binCount}/20
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedClinic360(c)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-charcoal-800 hover:bg-brand-50 text-[11px] font-semibold text-brand-600 dark:text-emerald-400"
                        >
                          Clinic 360 →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SVG TERRITORY MAP */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Mumbai–Thane Territory Geographic Distribution
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Pins color-coded by Adoption Health Score: Green (Champion), Blue (On Track), Amber (At Risk), Red (Dormant).
              </p>
            </div>
          </div>

          {/* SVG Map Schematic */}
          <div className="relative w-full h-[450px] bg-emerald-50/40 dark:bg-charcoal-950 rounded-2xl border border-emerald-100 dark:border-charcoal-800 overflow-hidden flex items-center justify-center p-4">
            <svg viewBox="0 0 800 500" className="w-full h-full">
              {/* Coastline schematic */}
              <path
                d="M 180,50 Q 220,120 200,200 Q 240,280 210,350 Q 250,420 220,480"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <text x="80" y="250" fill="#059669" fontSize="14" fontWeight="bold" opacity="0.4">
                ARABIAN SEA
              </text>
              <text x="380" y="80" fill="#059669" fontSize="14" fontWeight="bold" opacity="0.5">
                THANE DISTRICT
              </text>
              <text x="480" y="320" fill="#059669" fontSize="14" fontWeight="bold" opacity="0.5">
                NAVI MUMBAI
              </text>
              <text x="240" y="360" fill="#059669" fontSize="14" fontWeight="bold" opacity="0.5">
                MUMBAI SUBURBS
              </text>

              {/* Clinic Pins */}
              {territoryClinics.map((c, i) => {
                // Project lat/lng to svg coordinates
                const x = 240 + ((c.lng - 72.82) / 0.32) * 450
                const y = 440 - ((c.lat - 19.01) / 0.26) * 380

                let pinColor = '#10b981' // green
                if (c.healthStatus === 'on_track') pinColor = '#3b82f6' // blue
                else if (c.healthStatus === 'at_risk') pinColor = '#f59e0b' // amber
                else if (c.healthStatus === 'dormant') pinColor = '#f43f5e' // red

                return (
                  <g
                    key={c.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer hover:scale-125 transition-transform"
                    onClick={() => setSelectedClinic360(c)}
                  >
                    <circle r="9" fill={pinColor} fillOpacity="0.3" className="animate-ping" />
                    <circle r="7" fill={pinColor} stroke="#ffffff" strokeWidth="2" />
                    <text
                      x="10"
                      y="4"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#1f2937"
                      className="dark:fill-gray-200 pointer-events-none"
                    >
                      {c.name.split(' ')[0]}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Map Legend Floating Box */}
            <div className="absolute bottom-4 right-4 p-3 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur rounded-2xl border border-gray-200 dark:border-charcoal-800 text-[11px] space-y-1.5 shadow-md">
              <p className="font-bold text-charcoal-900 dark:text-white text-[10px] uppercase">Score Legend</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Champion (85–100)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>On Track (65–84)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>At Risk (40–64)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Dormant (&lt;40)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PRIORITIZED ACTION CENTRE */}
      {activeTab === 'action_centre' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Rule-Based Prioritized Action Centre
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Auto-generated tasks triggered by system alerts (10+ day dormancy, low inventory, full returns bin).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {actionTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  task.status === 'completed'
                    ? 'bg-gray-50/60 dark:bg-charcoal-800/40 border-gray-200 dark:border-charcoal-800 opacity-60'
                    : 'bg-white dark:bg-charcoal-850 border-gray-200 dark:border-charcoal-700 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      task.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="font-bold text-sm text-charcoal-900 dark:text-white">
                      {task.title}
                    </span>
                  </div>
                  <p className="text-gray-500">
                    Clinic: <strong>{task.clinicName}</strong> ({task.doctorName}) • Locality: {task.locality}
                  </p>
                  <p className="text-charcoal-700 dark:text-gray-300 leading-relaxed pt-1">
                    {task.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.status !== 'completed' ? (
                    <>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>
                      <button
                        onClick={() => snoozeTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 text-charcoal-700 dark:text-gray-300 font-medium text-xs"
                      >
                        Snooze 3d
                      </button>
                    </>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: REP VISIT PLANNER */}
      {activeTab === 'visits' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Weekly Route & Coaching Visit Planner
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Prioritized route visits based on clinic dormancy and stock-out risks.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {visits.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-charcoal-900 dark:text-white">{v.clinicName}</span>
                    <span className="text-gray-400">• {formatDate(v.date)} at {v.timeSlot}</span>
                    <Badge variant={v.status === 'completed' ? 'success' : 'warning'} size="sm">
                      {v.status}
                    </Badge>
                  </div>
                  <p className="text-gray-500 mt-0.5">Doctor: {v.doctorName} • Visit Type: {v.type}</p>
                  {v.notes && (
                    <p className="text-charcoal-700 dark:text-gray-300 italic mt-1 bg-gray-50 dark:bg-charcoal-800 p-2 rounded-xl">
                      "{v.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Checked in at ${v.clinicName} (GPS Lat/Lng verified: 19.1982, 72.9644)`)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 text-charcoal-800 dark:text-gray-200 font-semibold"
                  >
                    Check In (Mock GPS)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLINIC 360 DRAWER */}
      {selectedClinic360 && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-charcoal-900 h-full p-6 shadow-2xl overflow-y-auto flex flex-col border-l border-gray-200 dark:border-charcoal-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-charcoal-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal-900 dark:text-white">
                  Clinic 360 Deep-Dive
                </h3>
                <p className="text-xs text-gray-500">{selectedClinic360.name}</p>
              </div>
              <button
                onClick={() => setSelectedClinic360(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs text-charcoal-700 dark:text-gray-300 flex-1">
              
              {/* Health Score Summary Card */}
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-brand-700 dark:text-emerald-300">Adoption Health Score</p>
                  <p className="text-3xl font-extrabold text-brand-900 dark:text-emerald-400">{selectedClinic360.healthScore} / 100</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Status: {selectedClinic360.healthStatus.toUpperCase()}</p>
                </div>
                <Badge healthStatus={selectedClinic360.healthStatus}>
                  {selectedClinic360.healthStatus}
                </Badge>
              </div>

              {/* Recommended Next Best Action */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Recommended Next Best Action (Rule-Generated)
                </p>
                <p className="text-[11px] leading-relaxed">
                  {selectedClinic360.healthStatus === 'dormant'
                    ? 'Visit in person this Thursday: Doctor is concerned about receptionist time. Demonstrate 22-second counter flow and provide ₹10/refill staff voucher incentive.'
                    : selectedClinic360.binCount >= 18
                    ? 'Schedule immediate courier pickup for 20 returns to keep front desk clear.'
                    : 'Doctor is an Eco Advocate. Present framed Green Clinic Certificate to display on waiting room wall.'}
                </p>
              </div>

              {/* Practice Details */}
              <div className="space-y-2">
                <p className="font-bold text-charcoal-900 dark:text-white uppercase text-[10px] tracking-wider">Practice Profile</p>
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-charcoal-800 rounded-xl">
                  <div>
                    <span className="text-gray-400">Doctor:</span>
                    <p className="font-semibold">{selectedClinic360.doctorName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Archetype:</span>
                    <p className="font-semibold capitalize">{selectedClinic360.archetype.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Patient Volume:</span>
                    <p className="font-semibold">{selectedClinic360.patientVolumeMonthly} patients/mo</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Dispensing Share:</span>
                    <p className="font-semibold">{Math.round(selectedClinic360.dispensingSharePct * 100)}%</p>
                  </div>
                </div>
              </div>

              {/* Reverse Logistics & Bin */}
              <div className="p-3 bg-gray-50 dark:bg-charcoal-800 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold">Returns Bin Level:</span>
                  <span className="font-bold">{selectedClinic360.binCount} / {selectedClinic360.binThreshold} packs</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-charcoal-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(selectedClinic360.binCount / selectedClinic360.binThreshold) * 100}%` }}
                  />
                </div>
              </div>

              {/* Open in Counter as Staff */}
              <button
                onClick={() => {
                  setSelectedClinicId(selectedClinic360.id)
                  setPersona('staff')
                }}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors"
              >
                Open Counter as Dispenser Staff →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEALTH SCORE FORMULA MODAL */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-charcoal-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-charcoal-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
              <h3 className="font-serif font-bold text-lg text-charcoal-900 dark:text-white">
                Adoption Health Score Formula (0–100)
              </h3>
              <button onClick={() => setShowFormulaModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-charcoal-700 dark:text-gray-300">
              <div className="p-3 bg-brand-50 dark:bg-brand-950 rounded-xl">
                <p className="font-bold text-brand-900 dark:text-emerald-300">1. Refill Rate vs Target (40 Points)</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Calculated as (Refill Rate / Target 40%) * 40. Measures patient demand conversion.</p>
              </div>

              <div className="p-3 bg-brand-50 dark:bg-brand-950 rounded-xl">
                <p className="font-bold text-brand-900 dark:text-emerald-300">2. Weekly Consistency (25 Points)</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Active dispensing weeks with ≥1 refill out of the last 4 weeks. Prevents one-off batch bias.</p>
              </div>

              <div className="p-3 bg-brand-50 dark:bg-brand-950 rounded-xl">
                <p className="font-bold text-brand-900 dark:text-emerald-300">3. Stock Availability (20 Points)</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Days of cover ≥ 14 days earns full 20 pts. Prevents patient stock-out turnaways.</p>
              </div>

              <div className="p-3 bg-brand-50 dark:bg-brand-950 rounded-xl">
                <p className="font-bold text-brand-900 dark:text-emerald-300">4. Staff Engagement (15 Points)</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Reception micro-training completed (8 pts) + digital counter active within 7 days (7 pts).</p>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* KPI FRAMEWORK GLOSSARY DRAWER */}
      {showKpiDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-charcoal-900 h-full p-6 shadow-2xl overflow-y-auto flex flex-col border-l border-gray-200 dark:border-charcoal-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-charcoal-800">
              <h3 className="font-serif font-bold text-lg text-charcoal-900 dark:text-white">
                KPI Framework & Metric Glossary
              </h3>
              <button onClick={() => setShowKpiDrawer(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs text-charcoal-700 dark:text-gray-300 flex-1">
              <div>
                <h4 className="font-bold text-brand-700 dark:text-emerald-400 uppercase text-[10px] tracking-wider mb-1">
                  1. Leading Indicators (Execution Readiness)
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-300">
                  <li><strong>Trained Staff %:</strong> % of front-desk receptionists who completed all 6 modules. Target: &gt;90%.</li>
                  <li><strong>Days of Cover:</strong> Refills on shelf divided by average daily consumption. Target: 18-25 days.</li>
                  <li><strong>Visit Cadence:</strong> Medical Rep coaching visit at least once every 14 days for at-risk clinics.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-brand-700 dark:text-emerald-400 uppercase text-[10px] tracking-wider mb-1">
                  2. Execution Quality (Integrity & Speed)
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-300">
                  <li><strong>Batch Compliance:</strong> 100% of dispensed refills verified against anti-fraud registry.</li>
                  <li><strong>Void / Error Rate:</strong> &lt;2% of transactions voided within 5 minutes.</li>
                  <li><strong>Checkout Velocity:</strong> Under 30 seconds average counter transaction time.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-brand-700 dark:text-emerald-400 uppercase text-[10px] tracking-wider mb-1">
                  3. Core Outcomes (Practice & Planet)
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-300">
                  <li><strong>Refill Rate:</strong> Refills dispensed / Total eligible purchases. Target: 40%.</li>
                  <li><strong>Repeat Adherence Lift:</strong> Repeat rate jumps from 28% to 62%.</li>
                  <li><strong>Plastic Saved:</strong> 38g to 55g virgin plastic diverted per modular pod.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

