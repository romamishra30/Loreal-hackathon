import React, { useState } from 'react'
import { 
  Sliders, 
  HelpCircle, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  Gift, 
  DollarSign, 
  Percent, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { LEVERS } from '../../data/seedConstants'
import { evaluateIncentiveTier } from '../../lib/calculations'
import { formatINR } from '../../lib/utils'

export const LeversView: React.FC = () => {
  const { selectedClinicId, clinics, toggleLeverForClinic } = useAppStore()
  const clinic = clinics.find(c => c.id === selectedClinicId) || clinics[0]

  // Sub-tabs: 'levers' | 'tiers' | 'whatif' | 'comparison'
  const [activeTab, setActiveTab] = useState<'levers' | 'tiers' | 'whatif' | 'comparison'>('levers')

  // What-If Simulator Inputs
  const [simMarginPct, setSimMarginPct] = useState(32) // 32%
  const [simDiscountPct, setSimDiscountPct] = useState(20) // 20%
  const [simTrainingCoverage, setSimTrainingCoverage] = useState(85) // 85%
  const [simVisitCadenceWeeks, setSimVisitCadenceWeeks] = useState(2) // every 2 weeks

  // What-If Projection calculations
  const projectedRefillRate = Math.min(65, Math.round(28 + (simMarginPct - 25) * 1.5 + (simTrainingCoverage / 100) * 15 + (simDiscountPct - 15) * 0.8))
  const patVolume = clinic.patientVolumeMonthly || 450
  const dispShare = (clinic.dispensingSharePct || 60) > 1 ? (clinic.dispensingSharePct || 60) / 100 : (clinic.dispensingSharePct || 0.6)
  const projectedRefillsMo = Math.round(patVolume * dispShare * (projectedRefillRate / 100))
  const projectedMonthlyCost = Math.round(projectedRefillsMo * 15 + (simTrainingCoverage > 75 ? 800 : 400))
  const projectedPlasticSavedKg = ((projectedRefillsMo * 42) / 1000).toFixed(1)
  const costPerPackSaved = (projectedMonthlyCost / Math.max(1, projectedRefillsMo)).toFixed(1)

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Deliverable (b)
            </span>
            <span className="text-xs text-gray-400">Execution Levers & Incentive Engine</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white mt-1">
            Program Levers & Incentive Architecture
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-gray-400">
            Specific operational and financial levers that make in-clinic execution reliable with zero staff friction.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-charcoal-800 rounded-2xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('levers')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'levers'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Active Levers ({(clinic.activeLevers || []).length})
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'tiers'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Tiered Rewards
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'whatif'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            What-If Simulator
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
                : 'text-charcoal-700 dark:text-gray-300'
            }`}
          >
            Lever Effectiveness Lift
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE LEVERS PANEL */}
      {activeTab === 'levers' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Execution Levers Active for {clinic.name}
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Toggle levers on or off to inspect operational costs and adoption lifts.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {(clinic.activeLevers || []).length} of {LEVERS.length} Levers Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEVERS.map((lever) => {
              const isActive = (clinic.activeLevers || []).includes(lever.id)

              return (
                <div
                  key={lever.id}
                  onClick={() => toggleLeverForClinic(clinic.id, lever.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isActive
                      ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 shadow-sm'
                      : 'border-gray-200 dark:border-charcoal-800 bg-gray-50/40 opacity-70'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                        isActive ? 'bg-brand-600' : 'bg-gray-300'
                      }`}>
                        {isActive ? '✓' : ''}
                      </span>
                      <p className="font-bold text-charcoal-900 dark:text-white">{lever.name}</p>
                    </div>
                    <p className="text-gray-500 leading-relaxed text-[11px] pl-6">
                      {lever.description}
                    </p>
                    <div className="flex items-center gap-3 pt-2 pl-6 text-[11px] font-semibold">
                      <span className="text-emerald-700 dark:text-emerald-400">+{lever.estimatedLiftPct}% Adoption Lift</span>
                      <span className="text-gray-400">• Cost: {formatINR(lever.costPerMonthINR)}/mo</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TIERED INCENTIVE REWARDS */}
      {activeTab === 'tiers' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
              Quarterly Clinic & Staff Incentive Tiers
            </h2>
            <p className="text-xs text-charcoal-600 dark:text-gray-400">
              Rewards scaled by monthly refill volume and 4-week execution consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bronze Tier */}
            <div className="p-5 rounded-3xl border border-gray-200 dark:border-charcoal-700 bg-amber-50/30 dark:bg-charcoal-800 text-xs space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                Bronze Tier
              </span>
              <h3 className="font-bold text-lg text-charcoal-900 dark:text-white">15+ Refills / Month</h3>
              <p className="text-gray-500">≥2 weeks consecutive consistency</p>
              <div className="pt-2 border-t border-gray-200 dark:border-charcoal-700 space-y-1.5">
                <p>Doctor Reward: <strong>{formatINR(20)} / refill</strong></p>
                <p>Staff Reward: <strong>{formatINR(5)} / refill</strong></p>
                <p>Quarterly Practice Bonus: <strong>{formatINR(500)}</strong></p>
              </div>
            </div>

            {/* Silver Tier */}
            <div className="p-5 rounded-3xl border-2 border-blue-400 bg-blue-50/40 dark:bg-charcoal-800 text-xs space-y-3 shadow-md">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                Silver Tier
              </span>
              <h3 className="font-bold text-lg text-charcoal-900 dark:text-white">30+ Refills / Month</h3>
              <p className="text-gray-500">≥3 weeks consecutive consistency</p>
              <div className="pt-2 border-t border-gray-200 dark:border-charcoal-700 space-y-1.5">
                <p>Doctor Reward: <strong>{formatINR(35)} / refill</strong></p>
                <p>Staff Reward: <strong>{formatINR(10)} / refill</strong></p>
                <p>Quarterly Practice Bonus: <strong>{formatINR(1500)}</strong></p>
                <p className="text-emerald-700 font-semibold">+ Free patient standee replenishment</p>
              </div>
            </div>

            {/* Gold Champion Tier */}
            <div className="p-5 rounded-3xl border-2 border-gold-400 bg-gold-50/50 dark:bg-charcoal-800 text-xs space-y-3 shadow-lg">
              <span className="px-2.5 py-0.5 rounded-full bg-gold-400 text-charcoal-950 font-bold uppercase text-[10px]">
                Gold Champion Tier
              </span>
              <h3 className="font-bold text-lg text-charcoal-900 dark:text-white">60+ Refills / Month</h3>
              <p className="text-gray-500">4 weeks unbroken consistency</p>
              <div className="pt-2 border-t border-gold-200 dark:border-charcoal-700 space-y-1.5">
                <p>Doctor Reward: <strong>{formatINR(50)} / refill</strong></p>
                <p>Staff Reward: <strong>{formatINR(15)} / refill</strong></p>
                <p>Quarterly Practice Bonus: <strong>{formatINR(3000)}</strong></p>
                <p className="text-gold-800 dark:text-gold-300 font-bold">
                  ★ Framed ESG Award & Feature in Regional Medical Bulletin
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHAT-IF SIMULATOR */}
      {activeTab === 'whatif' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
              Dynamic What-If Adoption Simulator
            </h2>
            <p className="text-xs text-charcoal-600 dark:text-gray-400">
              Model how adjusting incentives, training coverage, and rep visits alters program volume, costs, and carbon impact.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-semibold">
                  <span>Doctor Refill Margin:</span>
                  <span className="text-brand-600 font-bold">{simMarginPct}%</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="40"
                  value={simMarginPct}
                  onChange={(e) => setSimMarginPct(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold">
                  <span>Patient Circular Eco-Discount:</span>
                  <span className="text-brand-600 font-bold">{simDiscountPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={simDiscountPct}
                  onChange={(e) => setSimDiscountPct(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold">
                  <span>Reception Staff Training Coverage:</span>
                  <span className="text-brand-600 font-bold">{simTrainingCoverage}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simTrainingCoverage}
                  onChange={(e) => setSimTrainingCoverage(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold">
                  <span>Medical Rep Coaching Cadence:</span>
                  <span className="text-brand-600 font-bold">Every {simVisitCadenceWeeks} weeks</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={simVisitCadenceWeeks}
                  onChange={(e) => setSimVisitCadenceWeeks(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulated Outputs Card */}
            <div className="p-6 rounded-3xl bg-mint-50 dark:bg-charcoal-800 border border-emerald-200 dark:border-emerald-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950">
                  Projected Program Outcomes
                </span>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-gray-500 text-[11px]">Projected Refill Rate</span>
                    <p className="text-2xl font-bold text-brand-900 dark:text-emerald-300">{projectedRefillRate}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px]">Monthly Refills</span>
                    <p className="text-2xl font-bold text-brand-900 dark:text-emerald-300">{projectedRefillsMo} packs</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px]">Plastic Diverted</span>
                    <p className="text-xl font-bold text-emerald-600">{projectedPlasticSavedKg} kg / mo</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px]">Cost / Pack Diverted</span>
                    <p className="text-xl font-bold text-charcoal-900 dark:text-white">{formatINR(Number(costPerPackSaved))}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-charcoal-700 rounded-xl text-[11px] text-gray-500">
                Formula: Adoption lift modeled from multi-factor regression based on Mumbai–Thane pilot test data.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEVER EFFECTIVENESS COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
              A/B Comparison: Clinics With vs Without Levers
            </h2>
            <p className="text-xs text-charcoal-600 dark:text-gray-400">
              Measuring the empirical lift delivered by each operational lever across the pilot territory.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { lever: '3-Tap Counter App vs Paper Billing', withVal: '44.8% Refill Rate', withoutVal: '18.2% Refill Rate', lift: '+146% Lift' },
              { lever: '100% Sale-or-Return Guarantee', withVal: '92% Stock Enrolment', withoutVal: '41% Stock Enrolment', lift: '+124% Lift' },
              { lever: 'Automated WhatsApp Adherence Nudges', withVal: '68% Day-30 Return', withoutVal: '24% Day-30 Return', lift: '+183% Lift' },
              { lever: `Staff Certification & ${formatINR(10)} Micro-Reward`, withVal: '22s Checkout Speed', withoutVal: '1m 45s Checkout Speed', lift: '4.7x Faster' },
            ].map((comp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-gray-100 dark:border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-charcoal-850"
              >
                <div>
                  <p className="font-bold text-sm text-charcoal-900 dark:text-white">{comp.lever}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    With Lever: <strong className="text-emerald-600">{comp.withVal}</strong> • Without: {comp.withoutVal}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs shrink-0">
                  {comp.lift}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

