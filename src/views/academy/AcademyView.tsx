import React, { useState } from 'react'
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Award, 
  BookOpen, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Download, 
  Play, 
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  FileText
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { TRAINING_MODULES } from '../../data/seedConstants'
import { TrainingModule } from '../../types'
import confetti from 'canvas-confetti'
import { formatINR } from '../../lib/utils'

export const AcademyView: React.FC = () => {
  const { selectedClinicId, clinics, staffMembers, completeTrainingModule } = useAppStore()
  const clinic = clinics.find(c => c.id === selectedClinicId) || clinics[0]
  const staff = staffMembers.find(s => s.clinicId === clinic.id) || staffMembers[0]

  const [activeModuleId, setActiveModuleId] = useState<string>(TRAINING_MODULES[0].id)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [showSandbox, setShowSandbox] = useState(false)

  // Sandbox State
  const [sandboxStep, setSandboxStep] = useState(1)
  const [sandboxBatch, setSandboxBatch] = useState('TEST-999')

  const currentModule = TRAINING_MODULES.find(m => m.id === activeModuleId) || TRAINING_MODULES[0]
  const isModuleDone = staff?.completedModules?.includes(currentModule.id)

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: optIndex })
  }

  const handleGradeQuiz = () => {
    setQuizSubmitted(true)
    let correctCount = 0
    currentModule.quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++
      }
    })

    if (correctCount >= 2 && staff) {
      completeTrainingModule(staff.id, currentModule.id)
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1f9d5f', '#86efac', '#e8b04a']
        })
      } catch {}
    }
  }

  const handleSelectModule = (id: string) => {
    setActiveModuleId(id)
    setSelectedAnswers({})
    setQuizSubmitted(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Execution Lever: Training
            </span>
            <span className="text-xs text-gray-400">Micro-Learning Academy</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 dark:text-white mt-1">
            Clinic Staff Refill Certification Academy
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-gray-400">
            6 bite-sized modules (&lt;3 min each). Certified staff ensure reliable in-clinic execution and earn {formatINR(10)} per refill.
          </p>
        </div>

        {/* Practice Sandbox Toggle */}
        <button
          onClick={() => setShowSandbox(!showSandbox)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            showSandbox
              ? 'bg-amber-500 text-charcoal-950 font-bold'
              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>{showSandbox ? 'Exit Practice Sandbox' : 'Practice Simulator Sandbox'}</span>
        </button>
      </div>

      {/* Staff Certification Progress Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-charcoal-900 dark:text-white">{staff?.name}</h3>
              {staff?.isCertified && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Refill Certified ✓
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{clinic.name} • {staff?.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div>
            <p className="text-gray-400 text-[10px] uppercase">Completed</p>
            <p className="text-brand-700 dark:text-emerald-400 font-bold text-sm">
              {staff?.completedModules?.length || 0} / 6 Modules
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase">Reward Points</p>
            <p className="text-gold-600 font-bold text-sm">{staff?.points} pts</p>
          </div>
        </div>
      </div>

      {/* SANDBOX COUNTER SIMULATOR (PRACTICE MODE) */}
      {showSandbox ? (
        <div className="bg-amber-50/70 dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 dark:border-amber-700 shadow-xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-charcoal-700">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                Safe Training Sandbox
              </span>
              <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white mt-1">
                Zero-Risk Counter Rehearsal Simulator
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Practice the 3-tap workflow with fake test patients. Will not affect actual clinic inventory or live data.
              </p>
            </div>
            <button
              onClick={() => setSandboxStep(1)}
              className="text-xs text-amber-800 dark:text-amber-300 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Sandbox
            </button>
          </div>

          <div className="max-w-md mx-auto bg-white dark:bg-charcoal-800 p-6 rounded-3xl shadow-sm space-y-4 text-xs">
            {sandboxStep === 1 && (
              <div className="space-y-4 text-center">
                <p className="font-bold text-sm text-charcoal-900 dark:text-white">Step 1: Test Patient Tap</p>
                <div className="p-4 bg-gray-50 dark:bg-charcoal-700 rounded-2xl">
                  <p className="font-bold">Test Patient: Simran Kaur</p>
                  <p className="text-gray-500">Day 28 of 30 • Ceramide Moisturiser 50ml</p>
                </div>
                <button
                  onClick={() => setSandboxStep(2)}
                  className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold"
                >
                  Simulate QR Scan (Proceed to Step 2)
                </button>
              </div>
            )}

            {sandboxStep === 2 && (
              <div className="space-y-4">
                <p className="font-bold text-sm text-charcoal-900 dark:text-white text-center">Step 2: Inspect & Code</p>
                <div className="space-y-2">
                  <label className="block text-gray-500">Test Lot Code on Base:</label>
                  <input
                    type="text"
                    value={sandboxBatch}
                    onChange={(e) => setSandboxBatch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono text-center"
                  />
                </div>
                <button
                  onClick={() => setSandboxStep(3)}
                  className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold"
                >
                  Verify & Proceed (Step 3)
                </button>
              </div>
            )}

            {sandboxStep === 3 && (
              <div className="space-y-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-base text-charcoal-900 dark:text-white">Rehearsal Complete!</p>
                <p className="text-gray-500">
                  Great job! You executed the 3-tap workflow in 21 seconds.
                </p>
                <button
                  onClick={() => setSandboxStep(1)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold"
                >
                  Practice Again
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 6 MICRO-COURSES GRID & QUIZ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Module Selector Sidebar */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Course Curriculum
            </p>
            {TRAINING_MODULES.map((mod) => {
              const isDone = staff?.completedModules?.includes(mod.id)
              const isActive = mod.id === activeModuleId

              return (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(mod.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-colors flex items-center justify-between ${
                    isActive
                      ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/70 font-semibold text-brand-900 dark:text-emerald-300 shadow-sm'
                      : 'border-gray-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:bg-gray-50 text-charcoal-800 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-charcoal-800 text-gray-600 dark:text-gray-400 font-bold flex items-center justify-center text-[10px]">
                      {mod.number}
                    </span>
                    <div>
                      <p className="truncate font-semibold max-w-[170px]">{mod.title}</p>
                      <p className="text-[10px] text-gray-400">{mod.durationMins} mins</p>
                    </div>
                  </div>

                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Active Module Content & 3-Question Quiz */}
          <div className="lg:col-span-2 bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-charcoal-800 shadow-sm space-y-6 text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Module {currentModule.number} of 6
                </span>
                <h2 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white mt-0.5">
                  {currentModule.title}
                </h2>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {currentModule.durationMins} mins
              </span>
            </div>

            {/* Content Summary & Paragraphs */}
            <div className="space-y-3 text-charcoal-700 dark:text-gray-300 leading-relaxed font-sans">
              <p className="font-semibold text-brand-800 dark:text-emerald-300 bg-brand-50/50 dark:bg-brand-950/40 p-3 rounded-2xl border border-brand-100 dark:border-emerald-900">
                {currentModule.summary}
              </p>
              {currentModule.contentParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* 3-Question Micro-Quiz */}
            <div className="pt-4 border-t border-gray-100 dark:border-charcoal-800 space-y-4">
              <h3 className="font-serif font-bold text-base text-charcoal-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-600" />
                <span>Knowledge Check (Pass 2 of 3 to certify)</span>
              </h3>

              <div className="space-y-4">
                {currentModule.quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-gray-50 dark:bg-charcoal-850 space-y-2">
                    <p className="font-bold text-charcoal-900 dark:text-white">
                      Q{qIdx + 1}: {q.question}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx
                        const isCorrect = q.correctIndex === optIdx

                        let optStyle = 'border-gray-200 dark:border-charcoal-700 text-charcoal-800 dark:text-gray-200'
                        if (quizSubmitted) {
                          if (isCorrect) optStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold'
                          else if (isSelected) optStyle = 'bg-rose-100 border-rose-500 text-rose-900'
                        } else if (isSelected) {
                          optStyle = 'bg-brand-50 border-brand-500 text-brand-900 font-semibold'
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors ${optStyle}`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 italic pt-1">
                        Explanation: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleGradeQuiz}
                  disabled={Object.keys(selectedAnswers).length < 3}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  Submit Answers & Certify Module
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-2xl text-center text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  Module Completed! +50 Points Awarded to Staff Profile ✓
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

