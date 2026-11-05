import React, { useState } from 'react'
import { 
  BarChart3, 
  MapPin, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  Users, 
  Layers, 
  Sliders, 
  ShieldCheck,
  Package,
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { TERRITORIES } from '../../data/seedConstants'
import { formatINR, formatNumber } from '../../lib/utils'
import { StatCard } from '../../components/common/StatCard'
import { Badge } from '../../components/common/Badge'

export const BrandAdminView: React.FC = () => {
  const { 
    clinics, 
    transactions, 
    replenishmentOrders, 
    pickupTasks, 
    updateOrderStatus, 
    completePickup 
  } = useAppStore()

  // Sub-tabs: 'rollup' | 'scorecard' | 'kanban' | 'scaleup'
  const [activeTab, setActiveTab] = useState<'rollup' | 'scorecard' | 'kanban' | 'scaleup'>('rollup')

  // Scale-up simulator state
  const [targetClinicsCount, setTargetClinicsCount] = useState(1500)
  const [projectedRefillRateTarget, setProjectedRefillRateTarget] = useState(42)

  const completedTxs = transactions.filter(t => t.status === 'completed')
  const totalRefillsAcrossRegions = completedTxs.length
  const totalKgPlasticAcrossRegions = ((totalRefillsAcrossRegions * 42) / 1000).toFixed(1)
  const totalClinics = clinics.length

  // Simulated Scale-up calculation
  const nationalAnnualRefills = Math.round(targetClinicsCount * 350 * 0.50 * 0.40 * (projectedRefillRateTarget / 100) * 12)
  const nationalKgPlastic = ((nationalAnnualRefills * 42) / 1000).toFixed(0)
  const nationalPracticeIncrementalMargin = Math.round(nationalAnnualRefills * 345)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              Executive View
            </span>
            <span className="text-xs text-gray-400">Regional & Brand Management</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white mt-1">
            Regional Roll-Up & Multi-Territory Governance
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-gray-400">
            Oversight across 4 metro territories (100 dispensing dermatology clinics) • Pilot phase validation.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-charcoal-800 rounded-2xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('rollup')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'rollup'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Multi-Territory Heatmap
          </button>
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'scorecard'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Pilot Scorecard
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Logistics & Orders ({replenishmentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('scaleup')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'scaleup'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            National Scale Simulator
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Participating Clinics"
          value="100 Clinics"
          subtext="Across 4 Regional Territories"
        />
        <StatCard
          title="Total Refills Processed"
          value={totalRefillsAcrossRegions.toLocaleString('en-IN')}
          subtext="12-Week Pilot Cumulative"
          highlight={true}
        />
        <StatCard
          title="Virgin Plastic Diverted"
          value={`${totalKgPlasticAcrossRegions} kg`}
          subtext="PCR closed-loop audit ready"
        />
        <StatCard
          title="Scale Readiness Index"
          value="88 / 100"
          subtext="Green Light for Phase 2"
          trend={{ value: 'Ready', isPositive: true }}
        />
      </div>

      {/* TAB 1: MULTI-TERRITORY HEATMAP & COMPARISON */}
      {activeTab === 'rollup' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Territory Performance & Adoption Comparison
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Evaluating refill rate adoption and rep execution across metro medical clusters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TERRITORIES.map((terr, idx) => {
                const terrClinics = clinics.filter(c => c.territoryId === terr.id)
                const avgScore = Math.round(
                  terrClinics.reduce((sum, c) => sum + c.healthScore, 0) / (terrClinics.length || 1)
                )
                const isLeader = terr.id === 'terr-mumbai-thane'

                return (
                  <div
                    key={terr.id}
                    className={`p-5 rounded-3xl border-2 text-xs flex flex-col justify-between space-y-4 ${
                      isLeader
                        ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 shadow-sm'
                        : 'border-gray-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-gray-400">{terr.code}</span>
                        {isLeader && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Pilot Leader
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-charcoal-900 dark:text-white">
                        {terr.name.split('(')[0]}
                      </h3>
                      <p className="text-gray-500 text-[11px] mt-0.5">Rep: {terr.repName}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-charcoal-800">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Avg Health Score:</span>
                        <span className="font-bold text-brand-800 dark:text-emerald-400">{avgScore} / 100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Refill Target:</span>
                        <span className="font-semibold">{Math.round(terr.targetRefillRate * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Clinics Enrolled:</span>
                        <span className="font-semibold">25 Clinics</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PILOT DESIGN & GO/NO-GO SCORECARD */}
      {activeTab === 'scorecard' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6 text-xs">
          <div>
            <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
              Pilot Scorecard & Go / No-Go Decision Gate
            </h2>
            <p className="text-gray-500">
              Evaluated against pre-agreed criteria for progressing from Pilot (100 clinics) to National Scale (1,500 clinics).
            </p>
          </div>

          <div className="space-y-3">
            {[
              { criteria: 'Refill Adoption Rate ≥ 40%', current: '42.4% Achieved', status: 'Passed', pass: true },
              { criteria: 'Clinic Checkout Duration < 30 seconds', current: '22 seconds verified', status: 'Passed', pass: true },
              { criteria: 'Zero Stock-Out Rate (< 5% incidents)', current: '3.1% Incidents', status: 'Passed', pass: true },
              { criteria: 'Doctor NPS Satisfaction Score ≥ +50', current: '+74 NPS', status: 'Passed', pass: true },
              { criteria: 'Reverse Logistics Collection Reliability ≥ 90%', current: '94.2% Pickups on Schedule', status: 'Passed', pass: true },
            ].map((gate, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-gray-100 dark:border-charcoal-800 flex items-center justify-between bg-gray-50/50 dark:bg-charcoal-850"
              >
                <div>
                  <p className="font-bold text-sm text-charcoal-900 dark:text-white">{gate.criteria}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">Current Pilot Measurement: {gate.current}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {gate.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOGISTICS & REPLENISHMENT ORDERS KANBAN */}
      {activeTab === 'kanban' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6 text-xs">
          <div>
            <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
              Logistics Board: Replenishment Orders & Empties Pickups
            </h2>
            <p className="text-gray-500">
              Advance order statuses: Requested → Approved → Dispatched → Delivered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Column 1: Requested */}
            <div className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-2xl space-y-3">
              <span className="font-bold uppercase tracking-wider text-gray-500 text-[10px] block">
                Requested Orders ({replenishmentOrders.filter(o => o.status === 'requested').length})
              </span>
              {replenishmentOrders.filter(o => o.status === 'requested').map(order => (
                <div key={order.id} className="p-3 bg-white dark:bg-charcoal-700 rounded-xl shadow-sm border space-y-2">
                  <p className="font-bold text-xs">{order.clinicId}</p>
                  <p className="text-[11px] text-gray-500">{order.refillUnits} Refill Pods</p>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'approved')}
                    className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[11px] font-semibold"
                  >
                    Approve Order →
                  </button>
                </div>
              ))}
            </div>

            {/* Column 2: Approved / Dispatched */}
            <div className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-2xl space-y-3">
              <span className="font-bold uppercase tracking-wider text-gray-500 text-[10px] block">
                Dispatched ({replenishmentOrders.filter(o => o.status === 'dispatched' || o.status === 'approved').length})
              </span>
              {replenishmentOrders.filter(o => o.status === 'dispatched' || o.status === 'approved').map(order => (
                <div key={order.id} className="p-3 bg-white dark:bg-charcoal-700 rounded-xl shadow-sm border space-y-2">
                  <p className="font-bold text-xs">{order.clinicId}</p>
                  <p className="text-[11px] text-gray-500">{order.trackingNote || 'In transit via BlueDart'}</p>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold"
                  >
                    Mark Delivered & Restock
                  </button>
                </div>
              ))}
            </div>

            {/* Column 3: Empties Pickups Awaiting Courier */}
            <div className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-2xl space-y-3">
              <span className="font-bold uppercase tracking-wider text-gray-500 text-[10px] block">
                Returns Bin Pickups ({pickupTasks.filter(t => t.status !== 'recycled').length})
              </span>
              {pickupTasks.filter(t => t.status !== 'recycled').map(pickup => (
                <div key={pickup.id} className="p-3 bg-white dark:bg-charcoal-700 rounded-xl shadow-sm border space-y-2">
                  <p className="font-bold text-xs">{pickup.clinicId}</p>
                  <p className="text-[11px] text-gray-500">{pickup.packCount} empty containers</p>
                  <button
                    onClick={() => completePickup(pickup.id)}
                    className="w-full py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-[11px] font-semibold"
                  >
                    Confirm Recycled at PCR
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NATIONAL SCALE-UP SIMULATOR */}
      {activeTab === 'scaleup' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6 text-xs">
          <div>
            <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
              National Scale-Up Simulator
            </h2>
            <p className="text-gray-500">
              Project nationwide rollout impact across Indian metro dispensing dermatologists.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-semibold">
                  <span>Target Enrolled Dispensing Clinics:</span>
                  <span className="text-brand-600 font-bold">{targetClinicsCount.toLocaleString()} Clinics</span>
                </div>
                <input
                  type="range"
                  min="250"
                  max="3000"
                  step="50"
                  value={targetClinicsCount}
                  onChange={(e) => setTargetClinicsCount(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold">
                  <span>Projected National Refill Rate:</span>
                  <span className="text-brand-600 font-bold">{projectedRefillRateTarget}%</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="60"
                  step="1"
                  value={projectedRefillRateTarget}
                  onChange={(e) => setProjectedRefillRateTarget(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-900 to-brand-800 text-white space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Projected National ESG & Economic Scale
              </span>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-brand-200 text-[11px]">Annual Refills Dispensed</span>
                  <p className="text-2xl font-bold text-emerald-300">{nationalAnnualRefills.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-brand-200 text-[11px]">Virgin Plastic Diverted</span>
                  <p className="text-2xl font-bold text-emerald-300">{Number(nationalKgPlastic).toLocaleString('en-IN')} kg</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-brand-700">
                  <span className="text-brand-200 text-[11px]">Total Practice Incremental Margins</span>
                  <p className="text-3xl font-extrabold text-white">{formatINR(nationalPracticeIncrementalMargin)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

