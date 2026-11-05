import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  Award, 
  MessageSquare, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Gift, 
  Send, 
  Flame, 
  ChevronRight,
  Share2,
  Lock
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { PRODUCT_SKUS } from '../../data/seedConstants'
import { formatINR } from '../../lib/utils'

export const PatientView: React.FC = () => {
  const { 
    selectedPatientId, 
    patients, 
    clinics, 
    addPatientFeedback,
  } = useAppStore()

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0]
  const clinic = clinics.find(c => c.id === patient?.primaryClinicId) || clinics[0]
  const sku = PRODUCT_SKUS.find(s => s.id === patient?.activeSkuId) || PRODUCT_SKUS[0]

  // Feedback State
  const [rating, setRating] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>(['Super Fast Checkout', 'Loved the Savings'])
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // WhatsApp simulation state
  const [waReplies, setWaReplies] = useState<string[]>([
    'Hi! I will visit the clinic tomorrow at 4 PM to return my empty moisturizer.',
  ])
  const [newReply, setNewReply] = useState('')

  const daysRemaining = Math.max(0, sku.usageCycleDays - patient.usageDaysElapsed)
  const percentElapsed = Math.min(100, Math.round((patient.usageDaysElapsed / sku.usageCycleDays) * 100))
  const gramsPlasticSaved = patient.packsSavedTotal * sku.plasticWeightGrams

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    addPatientFeedback({
      clinicId: clinic.id,
      patientId: patient.id,
      rating,
      tags: selectedTags,
      comments: feedbackComment || 'Great service at the clinic counter.',
    })
    setFeedbackSubmitted(true)
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      
      {/* Patient Header Pass */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-brand-900 to-brand-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
              {patient.name.charAt(0)}
            </span>
            <div>
              <p className="font-semibold text-sm">{patient.name}</p>
              <p className="text-[10px] text-emerald-300">Prescribed by {clinic.doctorName}</p>
            </div>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-gold-400 text-charcoal-900 shadow-sm">
            {patient.loyaltyTier} Tier
          </span>
        </div>

        {/* QR Pass Box */}
        <div className="bg-white p-4 rounded-2xl shadow-inner text-charcoal-900 text-center my-3">
          <div className="inline-block p-1 bg-white">
            <QRCodeSVG
              value={patient.qrCodeValue}
              size={130}
              level="M"
            />
          </div>
          <p className="text-[11px] font-mono font-semibold text-gray-500 mt-1">
            {patient.qrCodeValue}
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Show this QR code at clinic reception for 20% refill discount
          </p>
        </div>

        {/* Personal Ecological Impact */}
        <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-brand-700/60 text-xs">
          <div>
            <p className="text-brand-200 text-[10px] uppercase">Refill Streak</p>
            <p className="font-bold text-lg text-emerald-300 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              {patient.refillStreak} Bottles
            </p>
          </div>
          <div>
            <p className="text-brand-200 text-[10px] uppercase">Plastic Saved</p>
            <p className="font-bold text-lg text-emerald-300">
              {gramsPlasticSaved}g
            </p>
          </div>
        </div>
      </div>

      {/* Adherence & Days Remaining Countdown Ring */}
      <div className="rounded-3xl p-5 bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-white">
              Daily Regimen Status
            </h3>
            <p className="text-xs text-gray-500">{sku.name}</p>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {daysRemaining} Days Left
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-charcoal-600 dark:text-gray-400">
            <span>Day {patient.usageDaysElapsed} of {sku.usageCycleDays}</span>
            <span>{percentElapsed}% Used</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-charcoal-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                daysRemaining <= 5 ? 'bg-amber-500' : 'bg-brand-600'
              }`}
              style={{ width: `${percentElapsed}%` }}
            />
          </div>
        </div>

        {daysRemaining <= 7 ? (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>Refill Due Soon!</strong> Bring your empty container to {clinic.name} to save ₹270 on your fresh sealed pod.
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Keep using daily as prescribed by {clinic.doctorName}. We will remind you 5 days before your bottle runs out!
          </p>
        )}
      </div>

      {/* Simulated Automated WhatsApp Reminder Thread */}
      <div className="rounded-3xl p-5 bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-charcoal-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-xs text-charcoal-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp Reminder Simulator (Day 25 Alert)
            </h3>
          </div>
          <span className="text-[10px] text-gray-400">Automated Bot</span>
        </div>

        {/* WhatsApp Chat Bubble Mock */}
        <div className="p-3 bg-emerald-50/70 dark:bg-charcoal-800 rounded-2xl space-y-2 text-xs">
          <div className="bg-white dark:bg-charcoal-700 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[92%] border border-emerald-100 dark:border-charcoal-600">
            <p className="font-bold text-brand-900 dark:text-emerald-300 text-[11px] mb-1">
              {clinic.name} • Dermatology Care
            </p>
            <p className="text-charcoal-800 dark:text-gray-200 leading-relaxed text-xs">
              Namaste {patient.name}! You are on Day 25 of your <strong>{sku.name}</strong>. 
              To avoid interrupting your skin barrier recovery, your <strong>20% circular refill voucher ({formatINR(sku.refillPriceINR)})</strong> is ready at the clinic.
            </p>
            <p className="text-[10px] text-gray-400 mt-2 text-right">10:15 AM ✓✓</p>
          </div>

          {waReplies.map((reply, idx) => (
            <div key={idx} className="flex justify-end">
              <div className="bg-emerald-600 text-white p-2.5 rounded-2xl rounded-tr-none text-xs max-w-[85%] shadow-sm">
                <p>{reply}</p>
                <p className="text-[9px] text-emerald-200 text-right mt-1">10:18 AM</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Simulation Form */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type WhatsApp reply..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl text-xs text-charcoal-900 dark:text-white border border-gray-200 dark:border-charcoal-700 focus:outline-none"
          />
          <button
            onClick={() => {
              if (!newReply.trim()) return
              setWaReplies([...waReplies, newReply.trim()])
              setNewReply('')
            }}
            className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Patient Experience Feedback (Flows to NPS) */}
      <div className="rounded-3xl p-5 bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-white">
          Rate Your Refill Experience
        </h3>

        {feedbackSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
            <p className="font-bold">Thank you for your review!</p>
            <p className="text-emerald-700">Your feedback updates the clinic's NPS rating in real-time.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-3">
            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300 dark:text-charcoal-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                'Super Fast Checkout',
                'Loved the Savings',
                'Sterile Sealed Pod',
                'Proud to Save Plastic',
                'Friendly Reception',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-emerald-300 border-brand-300 dark:border-emerald-800 font-semibold'
                      : 'border-gray-200 dark:border-charcoal-700 text-gray-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              placeholder="Any comments on the clinic dispenser or refill pod?"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-charcoal-800 rounded-xl text-xs text-charcoal-900 dark:text-white border border-gray-200 dark:border-charcoal-700 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors"
            >
              Submit Feedback (Updates Clinic NPS)
            </button>
          </form>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
        <Lock className="w-3 h-3 text-gray-400" />
        <span>Medical Data Privacy Protected • No Advertising Spam Guarantee</span>
      </div>
    </div>
  )
}

