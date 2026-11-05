import React, { useState } from 'react'
import { Info, X, ShieldAlert, Sparkles, BookOpen } from 'lucide-react'

export const IllustrativeDisclaimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={`flex items-center gap-2 text-xs text-charcoal-700 dark:text-gray-400 py-1 ${className}`}>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800/50">
          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Illustrative Data Model
        </span>
        <button
          onClick={() => setIsOpen(true)}
          className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 font-medium"
        >
          <Info className="w-3.5 h-3.5" />
          View Assumptions & Math
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-charcoal-900 h-full p-6 shadow-2xl overflow-y-auto flex flex-col border-l border-gray-200 dark:border-charcoal-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-charcoal-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-lg text-charcoal-900 dark:text-white">RefillRx Assumptions & Parameters</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-sm text-charcoal-700 dark:text-gray-300 flex-1">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                <div className="flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong>Competition Disclaimer:</strong> Built for L'Oréal Sustainability Challenge 2026 (Medical Track). All economic values, clinic profiles, patient counts, and margin percentages are illustrative assumptions synthesized for simulation and do not disclose proprietary corporate data.
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-charcoal-900 dark:text-white mb-1">1. Market & Practice Baseline</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>45% of Dermatologists</strong> dispense products directly from their clinics in key metro territories (Mumbai, Thane, Pune).</li>
                  <li>Average monthly patient footfall: <strong>350 patients / month</strong> per dispensing practice.</li>
                  <li>Dispensing conversion rate: <strong>55%</strong> purchase topical products directly in clinic.</li>
                  <li>Prescription of daily-use maintenance range: <strong>45%</strong>.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-charcoal-900 dark:text-white mb-1">2. Unit Economics & Margins</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Full packaging MRP: <strong>₹1,350</strong> (Daily Barrier Emulsion 50ml). Doctor full margin: <strong>25% (₹337.50)</strong>.</li>
                  <li>Refill pod MRP: <strong>₹1,080</strong> (20% patient eco-discount). Doctor refill margin: <strong>32% (₹345.60)</strong>.</li>
                  <li>Baseline repeat adherence without refill: <strong>28%</strong>.</li>
                  <li>Refill-lifted repeat adherence: <strong>62%</strong> (2.2x increase in return visits).</li>
                  <li>Staff handling time: <strong>1.2 minutes (22 seconds digital counter time)</strong>.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-charcoal-900 dark:text-white mb-1">3. Ecological Impact Factors</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Virgin polymer packaging avoided: <strong>38g to 55g</strong> per modular refill pod.</li>
                  <li>Lifecycle CO2e avoided: <strong>95g to 160g</strong> per refill unit.</li>
                  <li>Returns collection bin pickup triggered automatically at <strong>20 empty bottles</strong>.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-charcoal-900 dark:text-white mb-1">4. Adoption Health Score Formula (0–100)</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>40% Refill Rate</strong> vs 40% benchmark target.</li>
                  <li><strong>25% Weekly Consistency</strong> (active dispensing weeks over last 4).</li>
                  <li><strong>20% Stock Availability</strong> (inventory cover ≥ 14 days).</li>
                  <li><strong>15% Staff Engagement</strong> (training completed + counter app usage).</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-charcoal-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

