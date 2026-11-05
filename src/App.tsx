import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Topbar } from './components/layout/Topbar'
import { Sidebar } from './components/layout/Sidebar'
import { CopilotDrawer } from './components/copilot/CopilotDrawer'
import { CommandPalette } from './components/palette/CommandPalette'
import { ShareModal } from './components/common/ShareModal'
import { GuidedDemoTour } from './components/tour/GuidedDemoTour'

// Views
import { LandingView } from './views/landing/LandingView'
import { TerritoryView } from './views/territory/TerritoryView'
import { CounterView } from './views/counter/CounterView'
import { PatientView } from './views/patient/PatientView'
import { DoctorMatrixView } from './views/doctor-matrix/DoctorMatrixView'
import { PitchStudioView } from './views/pitch-studio/PitchStudioView'
import { DoctorDashboardView } from './views/doctor-dash/DoctorDashboardView'
import { AcademyView } from './views/academy/AcademyView'
import { LeversView } from './views/levers/LeversView'
import { OnboardingView } from './views/onboarding/OnboardingView'
import { BrandAdminView } from './views/brand-admin/BrandAdminView'

export function App() {
  const [showCopilot, setShowCopilot] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showShare, setShowShare] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-mint-50 dark:bg-charcoal-950 text-charcoal-800 dark:text-gray-100 transition-colors">
      
      {/* Global Topbar */}
      <Topbar 
        onOpenCopilot={() => setShowCopilot(true)} 
        onOpenPalette={() => setShowPalette(true)}
        onOpenShare={() => setShowShare(true)}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Dynamic Nav Sidebar */}
        <Sidebar />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/territory" element={<TerritoryView />} />
            <Route path="/counter" element={<CounterView />} />
            <Route path="/patient" element={<PatientView />} />
            <Route path="/doctor-matrix" element={<DoctorMatrixView />} />
            <Route path="/pitch-studio" element={<PitchStudioView />} />
            <Route path="/doctor-dash" element={<DoctorDashboardView />} />
            <Route path="/academy" element={<AcademyView />} />
            <Route path="/levers" element={<LeversView />} />
            <Route path="/onboarding" element={<OnboardingView />} />
            <Route path="/brand-admin" element={<BrandAdminView />} />
            <Route path="*" element={<LandingView />} />
          </Routes>
        </main>
      </div>

      {/* Floating Modals, Tour & Copilot */}
      <CopilotDrawer isOpen={showCopilot} onClose={() => setShowCopilot(false)} />
      <CommandPalette isOpen={showPalette} onClose={() => setShowPalette(false)} />
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
      <GuidedDemoTour />
    </div>
  )
}
export default App

