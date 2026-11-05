import React, { useState } from 'react'
import { 
  UserPlus, 
  CheckCircle2, 
  FileText, 
  Package, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Award,
  Check
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { PRODUCT_SKUS } from '../../data/seedConstants'
import { formatINR } from '../../lib/utils'
import confetti from 'canvas-confetti'

export const OnboardingView: React.FC = () => {
  const { clinics, selectedClinicId } = useAppStore()
  const clinic = clinics.find(c => c.id === selectedClinicId) || clinics[0]

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1) // 6 is success completion

  // Form Fields
  const [docName, setDocName] = useState('Dr. Sanjay Gupta')
  const [docDegree, setDocDegree] = useState('MD (Dermatology), DNB')
  const [clinicName, setClinicName] = useState('Apex Skin & Aesthetic Centre')
  const [clinicLocality, setClinicLocality] = useState('Kharghar Sector 7, Navi Mumbai')
  const [patientVolume, setPatientVolume] = useState('400')
  const [staffName, setStaffName] = useState('Kavita Shinde')
  const [staffPhone, setStaffPhone] = useState('+91 98204 88129')
  const [staffPin, setStaffPin] = useState('4582')
  const [eSignature, setESignature] = useState('')
  const [generatedClinicId, setGeneratedClinicId] = useState('')

  // Checklist for current clinic
  const [checklist, setChecklist] = useState({
    kitDelivered: true,
    staffTrained: true,
    counterInstalled: true,
    firstRefillDone: true,
    signagePlaced: true,
    firstPickupDone: false,
  })

  const handleFinishWizard = () => {
    const newId = `clinic-MUM-${Math.floor(Math.random() * 800 + 100)}`
    setGeneratedClinicId(newId)
    setStep(6)
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1f9d5f', '#86efac', '#e8b04a']
      })
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Module C: Onboarding
            </span>
            <span className="text-xs text-gray-400">Clinic Enrolment Wizard</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white mt-1">
            New Clinic Enrolment & Onboarding Flow
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-gray-400">
            5-step digital agreement: Clinic profile → Terms → Stock order → Staff nomination → E-sign.
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      {step < 6 && (
        <div className="bg-white dark:bg-charcoal-900 p-4 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-700 dark:text-gray-300">
            <span className={step >= 1 ? 'text-brand-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>1. Details</span>
            <span className={step >= 2 ? 'text-brand-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>2. Terms</span>
            <span className={step >= 3 ? 'text-brand-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>3. Starter Stock</span>
            <span className={step >= 4 ? 'text-brand-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>4. Staff</span>
            <span className={step >= 5 ? 'text-brand-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>5. E-Sign</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-charcoal-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: CLINIC DETAILS */}
      {step === 1 && (
        <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4 text-xs animate-fade-in">
          <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
            Step 1: Practice & Doctor Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">Doctor Full Name:</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl border text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">Medical Qualifications:</label>
              <input
                type="text"
                value={docDegree}
                onChange={(e) => setDocDegree(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl border text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">Clinic Name:</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl border text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">Locality / Address:</label>
              <input
                type="text"
                value={clinicLocality}
                onChange={(e) => setClinicLocality(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl border text-xs"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Proceed to Program Terms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* STEP 2: PROGRAM TERMS */}
      {step === 2 && (
        <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4 text-xs animate-fade-in">
          <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
            Step 2: Commercial Terms & Guarantees
          </h2>

          <div className="space-y-3">
            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-emerald-800 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-charcoal-900 dark:text-white">32% Margin on Refills (+7% Over Full Pack)</p>
                <p className="text-gray-500 text-[11px]">Doctor earns ₹345.60 margin per refill unit compared to ₹337.50 on standard full packs.</p>
              </div>
            </div>

            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-emerald-800 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-charcoal-900 dark:text-white">100% Sale-or-Return Stock Guarantee</p>
                <p className="text-gray-500 text-[11px]">Zero dead-stock risk. Any slow-moving or unsold refill pods can be swapped or credited at any time.</p>
              </div>
            </div>

            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-emerald-800 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-charcoal-900 dark:text-white">20% Circular Eco-Discount to Patients</p>
                <p className="text-gray-500 text-[11px]">Guarantees patient adherence and incentivizes container return.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border text-gray-500 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Accept Terms & Order Starter Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INITIAL REFILL STOCK ORDER */}
      {step === 3 && (
        <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4 text-xs animate-fade-in">
          <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
            Step 3: RefillRx Starter Kit Order
          </h2>
          <p className="text-gray-500">
            Consignment stock delivered within 48 hours to clinic reception.
          </p>

          <div className="space-y-2 border border-gray-200 dark:border-charcoal-800 rounded-2xl p-4">
            <div className="flex justify-between font-semibold pb-2 border-b">
              <span>Included in Free Starter Kit:</span>
              <span className="text-brand-600 font-bold">100% Consignment (₹0 Upfront)</span>
            </div>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li>• 25x Daily Ceramide Barrier Refill Pods (50 ml)</li>
              <li>• 15x Gentle Amino Cleanser Refill Pouches (200 ml)</li>
              <li>• 20x Photoprotect UV Fluid Refill Pods (50 ml)</li>
              <li>• 1x Matte Surgical-Grade Counter Standee with Patient QR</li>
              <li>• 1x Under-Counter Returns Collection Bin (20-Pack Capacity)</li>
              <li>• 100x Patient Circular Skincare Take-Home Flyers</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(2)} className="px-4 py-2.5 rounded-xl border text-gray-500">
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Nominate Staff Dispenser</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: STAFF NOMINATION */}
      {step === 4 && (
        <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4 text-xs animate-fade-in">
          <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
            Step 4: Nominate Lead Reception Dispenser
          </h2>
          <p className="text-gray-500">
            This staff member receives micro-training access and earns ₹10 per refill.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">Staff Name:</label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl border text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">Staff Mobile:</label>
              <input
                type="text"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl border text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-500 mb-1 block">4-Digit Counter PIN:</label>
              <input
                type="text"
                maxLength={4}
                value={staffPin}
                onChange={(e) => setStaffPin(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl border font-mono text-center text-xs"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(3)} className="px-4 py-2.5 rounded-xl border text-gray-500">
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Proceed to E-Signature</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: E-SIGNATURE */}
      {step === 5 && (
        <div className="bg-white dark:bg-charcoal-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4 text-xs animate-fade-in">
          <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white">
            Step 5: Practice Agreement E-Signature
          </h2>

          <div className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-2xl border space-y-2 text-gray-600 dark:text-gray-300">
            <p>
              I, <strong>{docName}</strong>, representing <strong>{clinicName}</strong>, hereby agree to participate in the RefillRx Dermatological Circular Pilot Program under the stated 32% margin structure and 100% Sale-or-Return stock guarantee.
            </p>
            <p className="text-[11px] text-gray-400">Timestamp: {new Date().toLocaleString()}</p>
          </div>

          <div>
            <label className="font-semibold text-gray-500 mb-1 block">Type Full Legal Name as E-Signature:</label>
            <input
              type="text"
              placeholder={`Type "${docName}" to sign...`}
              value={eSignature}
              onChange={(e) => setESignature(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal-800 rounded-xl border text-xs font-serif font-bold"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(4)} className="px-4 py-2.5 rounded-xl border text-gray-500">
              Back
            </button>
            <button
              onClick={handleFinishWizard}
              disabled={!eSignature.trim()}
              className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Complete Enrolment & Generate Clinic ID</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: ENROLMENT SUCCESS & CHECKLIST */}
      {step === 6 && (
        <div className="bg-white dark:bg-charcoal-900 p-8 rounded-3xl border border-gray-200 dark:border-charcoal-800 shadow-xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-serif font-bold text-2xl text-charcoal-900 dark:text-white">
              Clinic Enrolment Completed!
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Generated Clinic ID: <span className="font-mono font-bold text-brand-600 text-sm">{generatedClinicId}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-mint-50 dark:bg-charcoal-800 border border-emerald-200 text-left max-w-md mx-auto text-xs space-y-2">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Onboarding Activation Checklist:</p>
            <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Agreement signed by {docName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Starter kit dispatched via BlueDart Express</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Staff {staffName} registered for micro-learning</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs"
          >
            Enrol Another Practice
          </button>
        </div>
      )}
    </div>
  )
}

