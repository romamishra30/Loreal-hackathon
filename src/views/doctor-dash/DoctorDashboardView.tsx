import React, { useState } from 'react'
import { 
  Award, 
  TrendingUp, 
  Users, 
  Share2, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Star,
  Building2,
  Gift,
  Flame,
  ArrowUpRight
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { formatINR, formatNumber } from '../../lib/utils'
import { StatCard } from '../../components/common/StatCard'
import { Badge } from '../../components/common/Badge'

export const DoctorDashboardView: React.FC = () => {
  const { selectedClinicId, clinics, staffMembers, transactions } = useAppStore()
  const clinic = clinics.find(c => c.id === selectedClinicId) || clinics[0]
  const staff = staffMembers.filter(s => s.clinicId === clinic.id)
  const clinicTxs = transactions.filter(t => t.clinicId === clinic.id && t.status === 'completed')

  const totalMarginEarned = clinicTxs.reduce((sum, t) => sum + t.doctorMargin, 0)
  const totalPacksSaved = clinic.totalPacksSavedAllTime
  const kgPlasticSaved = ((totalPacksSaved * 42) / 1000).toFixed(1)

  const [cardCopied, setCardCopied] = useState(false)

  const handleShareImpact = () => {
    navigator.clipboard.writeText(`Proud to share that ${clinic.name} has diverted ${kgPlasticSaved} kg of plastic waste through our circular RefillRx dermatological program! #SustainableDermatology #GreenClinic`)
    setCardCopied(true)
    setTimeout(() => setCardCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Doctor Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Dispensing Dermatologist Dashboard
            </span>
            <span className="text-xs text-gray-400">Personal Practice View</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white mt-1">
            {clinic.doctorName}'s Practice Portal
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-gray-400">
            {clinic.name} • {clinic.locality} • Rank: <strong>#4 of 25</strong> in Mumbai–Thane Cohort
          </p>
        </div>

        <button
          onClick={handleShareImpact}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{cardCopied ? 'Impact Story Copied! ✓' : 'Share Green Practice Story'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Refill Practice Margin"
          value={formatINR(totalMarginEarned || 34200)}
          subtext="Earned on repeat refills"
          trend={{ value: '+24%', isPositive: true }}
          highlight={true}
        />
        <StatCard
          title="Repeat Adherence"
          value="64.2%"
          subtext="Baseline was 28%"
          trend={{ value: '2.3x', isPositive: true }}
        />
        <StatCard
          title="Plastic Saved"
          value={`${kgPlasticSaved} kg`}
          subtext={`${totalPacksSaved} containers diverted`}
        />
        <StatCard
          title="Returns Bin Level"
          value={`${clinic.binCount} / 20`}
          subtext="Courier pickup at 20"
        />
      </div>

      {/* Main Grid: Social Impact Card & Staff Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Shareable "My Green Clinic" Social Impact Card */}
        <div className="bg-gradient-to-br from-[#14532d] to-[#0f3d20] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-300">
                Official ESG Verification
              </span>
              <span className="text-xs font-serif italic text-emerald-200">RefillRx Certified</span>
            </div>

            <div>
              <p className="text-xs text-brand-200 uppercase font-sans">Practice Sustainability Milestone</p>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-300 mt-1">
                {clinic.name}
              </h2>
              <p className="text-xs text-brand-100">{clinic.doctorName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-brand-800 text-xs">
              <div className="p-3 bg-brand-900/50 rounded-2xl border border-brand-700/60">
                <span className="text-emerald-300 font-bold text-xl sm:text-2xl block">{kgPlasticSaved} kg</span>
                <span className="text-[11px] text-brand-200">Virgin Plastic Diverted</span>
              </div>
              <div className="p-3 bg-brand-900/50 rounded-2xl border border-brand-700/60">
                <span className="text-emerald-300 font-bold text-xl sm:text-2xl block">{totalPacksSaved}</span>
                <span className="text-[11px] text-brand-200">Packs Saved from Landfills</span>
              </div>
            </div>

            <p className="text-[11px] text-brand-200 leading-relaxed italic">
              "We believe dermatological health and environmental responsibility go hand in hand. Thank you to our patients for choosing circular skincare."
            </p>
          </div>

          <div className="pt-4 border-t border-brand-800 flex items-center justify-between text-[10px] text-brand-300">
            <span>Verified by PCR India Reverse Logistics</span>
            <span>L'Oréal Medical Affairs</span>
          </div>
        </div>

        {/* Staff Dispenser Leaderboard & Points */}
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900 dark:text-white">
                Clinic Staff Engagement & Leaderboard
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Staff earn ₹10 / 10 points per refill processed with correct verification.
              </p>
            </div>
            <Award className="w-5 h-5 text-gold-500" />
          </div>

          <div className="space-y-3">
            {staff.map((s, idx) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl border border-gray-100 dark:border-charcoal-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-emerald-300 font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-charcoal-900 dark:text-white">{s.name}</p>
                    <p className="text-gray-400 text-[10px]">{s.role} • {s.completedModules.length}/6 Training Modules</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-brand-700 dark:text-emerald-400 text-sm">
                    {s.points} pts
                  </span>
                  <p className="text-[10px] text-gray-400">{s.refillsCompleted} Refills Dispensed</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quarterly Tier Perks Callout */}
          <div className="p-4 rounded-2xl bg-gold-50/70 dark:bg-charcoal-800 border border-gold-200 dark:border-gold-800/60 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-gold-900 dark:text-gold-300">
              <Gift className="w-4 h-4 text-gold-600" />
              <span>Current Clinic Reward Tier: GOLD</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
              Achieved 60+ monthly refills and 4 weeks consistency. Practice bonus: ₹3,000 monthly credit + staff shopping vouchers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

