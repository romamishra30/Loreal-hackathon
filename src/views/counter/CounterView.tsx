import React, { useState } from 'react'
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Trash2, 
  RotateCcw, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Share2, 
  Download, 
  Plus, 
  Check, 
  X, 
  Camera, 
  HelpCircle, 
  Truck, 
  AlertCircle,
  Sparkles,
  Phone,
  User,
  CreditCard,
  Building2
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { PRODUCT_SKUS } from '../../data/seedConstants'
import { checkRefillEligibility, isDuplicateBatch, calculateSustainabilityImpact } from '../../lib/calculations'
import { formatINR, formatDateTime, formatDate } from '../../lib/utils'
import { Badge } from '../../components/common/Badge'
import confetti from 'canvas-confetti'
import Papa from 'papaparse'

export const CounterView: React.FC = () => {
  const {
    selectedClinicId,
    clinics,
    stockItems,
    transactions,
    returnPacks,
    patients,
    staffMembers,
    processRefill,
    undoTransaction,
    requestReplenishment,
    requestPickup,
    isOnline,
    offlineQueue,
  } = useAppStore()

  const clinic = clinics.find(c => c.id === selectedClinicId) || clinics[0]
  const clinicStaff = staffMembers.find(s => s.clinicId === clinic.id) || staffMembers[0]
  const clinicStock = stockItems.filter(s => s.clinicId === clinic.id)
  const clinicTxs = transactions.filter(t => t.clinicId === clinic.id)
  const todayTxs = clinicTxs.slice(0, 15) // Recent / today's transactions

  // Tabs: 'counter' | 'stock' | 'bin' | 'history' | 'patients' | 'help'
  const [activeTab, setActiveTab] = useState<'counter' | 'stock' | 'bin' | 'history' | 'patients' | 'help'>('counter')

  // Refill Wizard State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 4 is success state
  const [searchPhone, setSearchPhone] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '')
  const [selectedSkuId, setSelectedSkuId] = useState<string>(PRODUCT_SKUS[0].id)
  
  // Verification checks
  const [checkIntact, setCheckIntact] = useState(true)
  const [checkMatchesRange, setCheckMatchesRange] = useState(true)
  const [checkBatchLegible, setCheckBatchLegible] = useState(true)
  const [batchCodeInput, setBatchCodeInput] = useState('')
  const [batchError, setBatchError] = useState<string | null>(null)
  const [photoUploaded, setPhotoUploaded] = useState(false)

  // Step 3
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'card'>('upi')
  const [staffPin, setStaffPin] = useState('1234')
  const [lastCompletedTx, setLastCompletedTx] = useState<any>(null)
  const [supportSubmitted, setSupportSubmitted] = useState(false)

  // New Patient Quick-Add Modal
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0]
  const activeSku = PRODUCT_SKUS.find(s => s.id === selectedSkuId) || PRODUCT_SKUS[0]

  const eligibility = checkRefillEligibility(
    activePatient?.usageDaysElapsed ?? 25, 
    activeSku?.usageCycleDays ?? 30
  )

  const handleSimulateScan = () => {
    // Pick a realistic patient from the list
    const randomPat = patients[Math.floor(Math.random() * 20)]
    setSelectedPatientId(randomPat.id)
    setSelectedSkuId(randomPat.activeSkuId || PRODUCT_SKUS[0].id)
    setBatchCodeInput(`B25-${Math.floor(Math.random() * 800 + 100)}`)
    setStep(2)
  }

  const handleStep2Verify = () => {
    setBatchError(null)
    const cleanCode = batchCodeInput.trim().toUpperCase()
    if (!cleanCode || cleanCode.length < 4) {
      setBatchError('Please enter a valid lot code (at least 4 characters)')
      return
    }

    // Check duplicate fraud
    if (isDuplicateBatch(cleanCode, returnPacks)) {
      setBatchError(`DUPLICATE PACK FRAUD DETECTED: Batch ${cleanCode} was already returned previously!`)
      return
    }

    setStep(3)
  }

  const handleConfirmRefill = () => {
    const res = processRefill({
      clinicId: clinic.id,
      patientId: activePatient.id,
      skuId: activeSku.id,
      batchCode: batchCodeInput || `B25-${Math.floor(Math.random() * 800 + 100)}`,
      paymentMode,
      staffPin,
    })

    if (!res.success) {
      alert(res.message)
      return
    }

    setLastCompletedTx(res.transaction)
    setStep(4)

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1f9d5f', '#86efac', '#e8b04a']
      })
    } catch {
      // Ignored in non-DOM test env
    }
  }

  const resetFlow = () => {
    setStep(1)
    setBatchCodeInput('')
    setBatchError(null)
    setPhotoUploaded(false)
    setLastCompletedTx(null)
  }

  const handleExportCsv = () => {
    const csv = Papa.unparse(todayTxs.map(t => ({
      TransactionId: t.id,
      Date: t.timestamp,
      ClinicId: t.clinicId,
      PatientId: t.patientId,
      SKU: t.skuId,
      BatchCode: t.batchCode,
      RefillPriceINR: t.refillPrice,
      DoctorMarginINR: t.doctorMargin,
      PaymentMode: t.paymentMode,
      Status: t.status,
    })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `refills-${clinic.id}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Clinic Header Snapshot Banner */}
      <div className="rounded-3xl p-5 bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-emerald-400">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                {clinic.name}
              </h1>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Dispenser: <span className="font-semibold text-charcoal-900 dark:text-gray-200">{clinicStaff?.name}</span> ({clinicStaff?.role}) • PIN: {clinic.counterPin}
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Counter Stats */}
        <div className="flex items-center gap-3">
          <div className="text-center px-3 py-1.5 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/50">
            <p className="text-[10px] font-bold uppercase text-brand-700 dark:text-emerald-300">Today</p>
            <p className="text-lg font-bold text-brand-900 dark:text-emerald-400">{todayTxs.filter(t => t.status === 'completed').length}</p>
          </div>
          <div className="text-center px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50">
            <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Bin Gauge</p>
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-400">{clinic.binCount}/{clinic.binThreshold}</p>
          </div>
          <div className="text-center px-3 py-1.5 rounded-2xl bg-gold-50 dark:bg-gold-950/60 border border-gold-200/50">
            <p className="text-[10px] font-bold uppercase text-gold-700 dark:text-gold-300">Staff Pts</p>
            <p className="text-lg font-bold text-gold-900 dark:text-gold-400">{clinicStaff?.points || 120}</p>
          </div>
        </div>
      </div>

      {/* Counter Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-charcoal-800 rounded-2xl overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => { setActiveTab('counter'); resetFlow(); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'counter'
              ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
              : 'text-charcoal-700 dark:text-gray-300 hover:text-charcoal-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>New Refill</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'stock'
              ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
              : 'text-charcoal-700 dark:text-gray-300 hover:text-charcoal-900'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Clinic Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('bin')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'bin'
              ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
              : 'text-charcoal-700 dark:text-gray-300 hover:text-charcoal-900'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Returns Bin ({clinic.binCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
              : 'text-charcoal-700 dark:text-gray-300 hover:text-charcoal-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Daily Log</span>
        </button>

        <button
          onClick={() => setActiveTab('help')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'help'
              ? 'bg-brand-900 text-white shadow-sm dark:bg-brand-800'
              : 'text-charcoal-700 dark:text-gray-300 hover:text-charcoal-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Staff Help & Tickets</span>
        </button>
      </div>

      {/* TAB 1: 3-TAP REFILL WIZARD */}
      {activeTab === 'counter' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-md">
          
          {/* Progress Bar (Steps 1, 2, 3) */}
          {step < 4 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-charcoal-700 dark:text-gray-300 mb-2">
                <span className={step >= 1 ? 'text-brand-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>
                  1. Patient ID
                </span>
                <span className={step >= 2 ? 'text-brand-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>
                  2. Verify Empty Pack
                </span>
                <span className={step >= 3 ? 'text-brand-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>
                  3. Dispense & Bill
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-charcoal-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-300 ease-out"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: IDENTIFY PATIENT */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center max-w-sm mx-auto space-y-2">
                <h2 className="font-serif font-bold text-2xl text-charcoal-900 dark:text-white">
                  Identify Patient
                </h2>
                <p className="text-xs text-charcoal-600 dark:text-gray-400">
                  Scan the patient's WhatsApp Refill Pass QR or look up their mobile number.
                </p>
              </div>

              {/* Primary Action: QR Scanner Simulation */}
              <div className="p-6 bg-mint-50 dark:bg-charcoal-800/50 rounded-3xl border-2 border-dashed border-brand-300 dark:border-brand-800 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-charcoal-700 shadow-sm flex items-center justify-center text-brand-600">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <button
                    onClick={handleSimulateScan}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all hover:scale-105"
                  >
                    Simulate Camera QR Scan
                  </button>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    1-Tap Instant Recognition (Takes ~2 seconds)
                  </p>
                </div>
              </div>

              {/* Or Search by Mobile Number */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Or enter patient 10-digit mobile number..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-charcoal-800 rounded-xl text-xs text-charcoal-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-charcoal-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Patient Quick Select Grid */}
                <div className="border border-gray-200 dark:border-charcoal-800 rounded-2xl p-3 space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Registered Clinic Patients
                  </p>
                  {patients
                    .filter(p => !searchPhone || p.phone.includes(searchPhone) || p.name.toLowerCase().includes(searchPhone.toLowerCase()))
                    .slice(0, 5)
                    .map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPatientId(p.id)
                          setSelectedSkuId(p.activeSkuId)
                          setBatchCodeInput(`B25-${Math.floor(Math.random() * 800 + 100)}`)
                          setStep(2)
                        }}
                        className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          selectedPatientId === p.id
                            ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-300 dark:border-emerald-800'
                            : 'hover:bg-gray-50 dark:hover:bg-charcoal-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-charcoal-900 dark:text-white">{p.name}</p>
                            <p className="text-[10px] text-gray-400">{p.phone} • Streak: {p.refillStreak} refills</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                            {p.loyaltyTier.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Patient Eligibility Preview Notice */}
              {activePatient && (
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 flex items-start gap-3">
                  <User className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-900 dark:text-white">{activePatient.name}</span>
                      <span className="text-[10px] text-gray-500">Day {activePatient.usageDaysElapsed} of 30 day cycle</span>
                    </div>
                    {eligibility.warning ? (
                      <p className="text-amber-600 dark:text-amber-400 text-[11px] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {eligibility.warning}
                      </p>
                    ) : (
                      <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                        ✓ Eligible for 20% Circular Refill Discount (Day 25+ regular cadence)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: VERIFY EMPTY PACK */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
                <div>
                  <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                    Verify Empty Packaging
                  </h2>
                  <p className="text-xs text-charcoal-600 dark:text-gray-400">
                    Patient: <span className="font-bold text-charcoal-900 dark:text-white">{activePatient.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              {/* Product SKU Selector */}
              <div>
                <label className="text-xs font-semibold text-charcoal-700 dark:text-gray-300 mb-1.5 block">
                  Product Returned & Refill Requested:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PRODUCT_SKUS.map((sku) => (
                    <div
                      key={sku.id}
                      onClick={() => setSelectedSkuId(sku.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedSkuId === sku.id
                          ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/50 shadow-sm'
                          : 'border-gray-200 dark:border-charcoal-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-xs text-charcoal-900 dark:text-white truncate">{sku.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{sku.volume} • Saves {sku.plasticWeightGrams}g plastic</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-charcoal-700">
                        <span className="text-xs font-bold text-brand-700 dark:text-emerald-400">{formatINR(sku.refillPriceINR)}</span>
                        <span className="text-[10px] line-through text-gray-400">{formatINR(sku.fullPriceINR)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Checklist (3-checks) */}
              <div className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-2xl border border-gray-200 dark:border-charcoal-700 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-gray-300">
                  Physical Safety Checklist (Under 5 seconds)
                </p>

                <label className="flex items-center gap-2.5 text-xs text-charcoal-800 dark:text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkIntact}
                    onChange={(e) => setCheckIntact(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <span>Outer container is intact, unbroken, and dry</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-charcoal-800 dark:text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkMatchesRange}
                    onChange={(e) => setCheckMatchesRange(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <span>Matches official Brand range (not competitor unapproved packaging)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-charcoal-800 dark:text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkBatchLegible}
                    onChange={(e) => setCheckBatchLegible(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <span>Lot / Batch code laser etching on container base is readable</span>
                </label>
              </div>

              {/* Batch Code Entry with Fraud Detection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-charcoal-700 dark:text-gray-300">
                    Empty Pack Lot / Batch Code:
                  </label>
                  <span className="text-[10px] text-gray-400">Printed on base or crimp seal</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={batchCodeInput}
                    onChange={(e) => {
                      setBatchCodeInput(e.target.value)
                      setBatchError(null)
                    }}
                    placeholder="e.g. B25-419"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl text-xs font-mono text-charcoal-900 dark:text-white border border-gray-200 dark:border-charcoal-700 focus:outline-none focus:border-brand-500 uppercase"
                  />
                  <button
                    onClick={() => setBatchCodeInput(`B25-${Math.floor(Math.random() * 800 + 100)}`)}
                    className="px-3 py-2 bg-gray-100 dark:bg-charcoal-700 hover:bg-gray-200 rounded-xl text-xs font-medium text-charcoal-700 dark:text-gray-300"
                  >
                    Auto-Fill
                  </button>
                </div>

                {batchError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{batchError}</span>
                  </div>
                )}
              </div>

              {/* Next Step Action */}
              <button
                onClick={handleStep2Verify}
                disabled={!checkIntact || !checkMatchesRange || !checkBatchLegible || !batchCodeInput.trim()}
                className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Dispense</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: DISPENSE REFILL & BILL */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
                <div>
                  <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                    Dispense Sterile Refill Pod
                  </h2>
                  <p className="text-xs text-charcoal-600 dark:text-gray-400">
                    Step 3 of 3 • Under 10 seconds to complete
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              {/* Order Summary Receipt Box */}
              <div className="p-4 rounded-2xl bg-mint-50/70 dark:bg-charcoal-800/80 border border-brand-200 dark:border-charcoal-700 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-charcoal-700">
                  <div>
                    <p className="font-bold text-sm text-charcoal-900 dark:text-white">{activeSku.name}</p>
                    <p className="text-xs text-gray-500">Refill Modular Pod • {activeSku.volume}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Batch: {batchCodeInput.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Full Packaging MRP:</span>
                    <span className="line-through">{formatINR(activeSku.fullPriceINR)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Circular Refill Discount (20%):</span>
                    <span>- {formatINR(activeSku.fullPriceINR - activeSku.refillPriceINR)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-charcoal-900 dark:text-white pt-2 border-t border-gray-200/60 dark:border-charcoal-700">
                    <span>Amount Due from Patient:</span>
                    <span className="text-brand-700 dark:text-emerald-400">{formatINR(activeSku.refillPriceINR)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                    <span>Doctor Practice Margin Earned:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatINR(Math.round(activeSku.refillPriceINR * activeSku.doctorRefillMarginPct))} (32%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="text-xs font-semibold text-charcoal-700 dark:text-gray-300 mb-1.5 block">
                  Patient Payment Mode:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['upi', 'card', 'cash'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-colors ${
                        paymentMode === mode
                          ? 'bg-brand-900 text-white border-brand-900 dark:bg-brand-800'
                          : 'bg-gray-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-gray-300 border-gray-200 dark:border-charcoal-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff PIN Authorization */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Staff PIN / Initials:</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={staffPin}
                    onChange={(e) => setStaffPin(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl text-xs font-mono text-center tracking-widest text-charcoal-900 dark:text-white border border-gray-200 dark:border-charcoal-700"
                  />
                </div>
                <div className="flex-1 pt-4 text-[11px] text-gray-400">
                  Logged by: <strong>{clinicStaff?.name}</strong> (+10 pts reward)
                </div>
              </div>

              {/* Big Confirm Refill Action Button */}
              <button
                onClick={handleConfirmRefill}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <Check className="w-5 h-5" />
                <span>Confirm & Dispense Refill ({formatINR(activeSku.refillPriceINR)})</span>
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION & RECEIPT */}
          {step === 4 && (
            <div className="space-y-6 text-center animate-fade-in py-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="font-serif font-bold text-2xl text-charcoal-900 dark:text-white">
                  Refill Completed Successfully!
                </h2>
                <p className="text-xs text-charcoal-600 dark:text-gray-400 mt-1">
                  Transaction #{lastCompletedTx?.id} • 1 plastic container diverted from landfill
                </p>
              </div>

              {/* Impact Callout */}
              <div className="p-4 rounded-2xl bg-mint-50 dark:bg-charcoal-800 border border-emerald-200 dark:border-emerald-800 max-w-sm mx-auto text-xs text-charcoal-700 dark:text-gray-200 space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>38g Virgin Plastic Saved Today</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Patient saved ₹270 • Doctor earned ₹345.60 margin • Returns bin at {clinic.binCount}/20
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={resetFlow}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Process Another Refill
                </button>

                <button
                  onClick={() => alert(`Simulated WhatsApp Receipt sent to ${activePatient.phone}:\n"Thank you for choosing circular care at ${clinic.name}! Your ₹270 discount has been applied. 38g plastic saved."`)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 text-charcoal-800 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Receipt</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINIC STOCK & REPLENISHMENT */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Clinic Refill Inventory & Days of Cover
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                100% Sale-or-Return stock guarantee: zero dead-stock risk for the clinic.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {clinicStock.map((stock) => {
              const sku = PRODUCT_SKUS.find(s => s.id === stock.skuId)
              const isLow = stock.refillsOnHand <= stock.minThreshold

              return (
                <div
                  key={stock.skuId}
                  className="p-4 rounded-2xl border border-gray-200 dark:border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-charcoal-850"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-charcoal-900 dark:text-white">{sku?.name}</p>
                      {isLow && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                          Low Stock Alert
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {sku?.volume} • Category: {sku?.category}
                    </p>
                    <div className="flex items-center gap-4 text-xs mt-2 text-charcoal-700 dark:text-gray-300">
                      <span>Refills on Hand: <strong>{stock.refillsOnHand} units</strong></span>
                      <span>Full Packs: <strong>{stock.fullPacksOnHand} units</strong></span>
                      <span>Days of Cover: <strong>{stock.daysOfCover} days</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        requestReplenishment(clinic.id, stock.skuId, 25, 10)
                        alert(`Replenishment order for 25 refills + 10 full packs raised for ${clinic.name}. Status: Requested.`)
                      }}
                      className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Request Restock (25 Pods)</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RETURNS BIN & PICKUP LOGISTICS */}
      {activeTab === 'bin' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Under-Counter Returns Collection Bin
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Automatic courier collection triggered when bin reaches {clinic.binThreshold} empty containers.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-mint-50 dark:bg-charcoal-800/60 border border-emerald-200 dark:border-emerald-800/50 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-white dark:bg-charcoal-700 shadow-inner flex flex-col items-center justify-center border-4 border-emerald-500">
              <span className="font-bold text-2xl text-emerald-800 dark:text-emerald-300">{clinic.binCount}</span>
              <span className="text-[10px] text-gray-400 uppercase">/ {clinic.binThreshold}</span>
            </div>

            <div>
              <h3 className="font-bold text-base text-charcoal-900 dark:text-white">
                {clinic.binCount >= clinic.binThreshold ? 'Bin is Full – Ready for Courier Collection' : 'Returns Accumulating Normally'}
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                {clinic.binCount * 42}g of medical-grade packaging plastic ready for closed-loop PCR recycling.
              </p>
            </div>

            <button
              onClick={() => {
                requestPickup(clinic.id)
                alert(`Pickup scheduled! Courier dispatched to collect ${clinic.binCount} containers from ${clinic.name}.`)
              }}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 mx-auto shadow-md"
            >
              <Truck className="w-4 h-4" />
              <span>Schedule Reverse-Logistics Courier Pickup</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: DAILY TRANSACTION LOG & UNDO */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
                Today's Dispensing Log
              </h2>
              <p className="text-xs text-charcoal-600 dark:text-gray-400">
                Full digital audit trail. Transactions can be undone within 5 minutes.
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 text-xs font-semibold text-charcoal-800 dark:text-gray-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="space-y-2 overflow-x-auto">
            {todayTxs.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl border border-gray-100 dark:border-charcoal-800 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-charcoal-800/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900 dark:text-white">#{tx.id}</span>
                    <span className="text-gray-400">• {formatDateTime(tx.timestamp)}</span>
                    <Badge variant={tx.status === 'completed' ? 'success' : 'danger'} size="sm">
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="text-gray-500 mt-0.5">
                    Batch: <span className="font-mono">{tx.batchCode}</span> • Mode: {tx.paymentMode.toUpperCase()} • Dr. Margin: {formatINR(tx.doctorMargin)}
                  </p>
                  {tx.voidReason && (
                    <p className="text-[10px] text-rose-600 mt-0.5">Voided: {tx.voidReason}</p>
                  )}
                </div>

                {tx.status === 'completed' && (
                  <button
                    onClick={() => {
                      const res = undoTransaction(tx.id, 'Staff 5-minute correction')
                      alert(res.message)
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-charcoal-800"
                    title="Undo transaction within 5 minutes"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STAFF HELP & FAQ */}
      {activeTab === 'help' && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
              Reception Desk Support & Tickets
            </h2>
            <p className="text-xs text-charcoal-600 dark:text-gray-400">
              Instant answers and rapid resolution support for clinic dispensers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 space-y-2">
              <h4 className="font-bold text-charcoal-900 dark:text-white">4-Step Quick Flow Guide</h4>
              <ol className="list-decimal pl-4 space-y-1 text-gray-600 dark:text-gray-300">
                <li>Ask patient for their empty outer container.</li>
                <li>Tap "Simulate Scan" or enter their 10-digit mobile number.</li>
                <li>Inspect bottle integrity and verify lot code on base.</li>
                <li>Hand over sealed modular pod and collect 20% discounted price.</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Direct Medical Rep Contact</h4>
              <p className="text-emerald-800 dark:text-emerald-400">
                Territory Rep: <strong>Vikram Salunkhe</strong><br />
                Phone: +91 98201 44520<br />
                WhatsApp: Available 9 AM – 7 PM for instant courier queries.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

