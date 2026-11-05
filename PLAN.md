# RefillRx - Master Build Plan & Architecture

RefillRx is a complete, production-grade Refill-Program Operating Platform designed for Dispensing Dermatologists for the **L'Oréal Sustainability Challenge 2026 (Medical Track: Engaging Dispensing Dermatologists)**.

---

## 1. Core Architecture & Philosophy

- **Zero-Backend Architecture**: 100% client-side executable, deterministic seeded mock data generator, fully reactive Zustand store with `localStorage` persistence and cross-tab synchronization.
- **Data Service Layer (`src/services/`)**: Decoupled async interface abstraction mimicking REST/GraphQL endpoints (`clinicService`, `refillService`, `stockService`, `patientService`, `analyticsService`) allowing seamless backend drop-in.
- **PWA & Offline Capability**: Service worker (`vite-plugin-pwa`) with indexed/queued offline transactions and background sync simulation with visual offline badges.
- **Design System & Aesthetics**: Clinical-meets-luxury green palette (`#14532d`, `#1f9d5f`, `#d1f0dc`, `#f7fbf8`, `#1f2937`, `#e8b04a`), custom Tailwind tokens, dark/light modes, accessible WCAG AA contrast, micro-animations via `framer-motion`, SVG territory mapping, and printable PDF/standee canvas generation.
- **Multilingual Support (`i18next`)**: English (en), Hindi (hi), and Marathi (mr) with dynamic UI translation and patient WhatsApp notification formatting.

---

## 2. Target Folder Structure

```text
refill-rx/
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── common/         # Button, Input, Modal, Drawer, Tabs, Badge, Toast, Dropdown, StatCard
│   │   ├── layout/         # Topbar, Sidebar, PersonaSwitcher, LanguageSwitcher, ThemeToggle, NotificationCenter
│   │   ├── tour/           # 3-Minute Guided Demo Tour Overlay
│   │   ├── copilot/        # RefillRx AI Copilot Chat & Intent Engine
│   │   ├── palette/        # Command Palette (Cmd+K / Ctrl+K)
│   │   ├── print/          # Green Clinic Certificate, Counter Standee, Patient Flyer Generator
│   │   └── charts/         # Recharts wrappers (Area, Bar, Radar, Donut, Heatmap)
│   ├── views/
│   │   ├── landing/        # Problem-to-Solution Story Landing Page & Persona Selector
│   │   ├── doctor-matrix/  # Module A: Prescriber vs Dispenser Matrix, Archetype Quiz & Motivation Radar
│   │   ├── pitch-studio/   # Module B: Clinic Economics Calculator, Sensitivity, Deck Mode, Objection Roleplay
│   │   ├── onboarding/     # Module C: 5-Step Clinic Enrolment Wizard & Starter Kit Checklist
│   │   ├── academy/        # Module D: Staff Micro-Learning, 3-Question Quizzes, Leaderboard, Practice Sandbox
│   │   ├── counter/        # Module E: 3-Tap Refill Counter Flow, Stock Replenishment, Returns Bin, Offline Queue
│   │   ├── patient/        # Module F: Patient Experience, Loyalty Tiers, WhatsApp Reminders, QR Pass
│   │   ├── levers/         # Module G: Levers Engine, Incentive Calculator, Staff Points, What-If Simulator
│   │   ├── territory/      # Module H: Territory Dashboard, SVG Map, Clinic 360, Action Centre, Visit Planner
│   │   ├── doctor-dash/    # Module I: Dispensing Dermatologist Personal Practice Dashboard & Impact Card
│   │   └── brand-admin/    # Module J: Roll-up Heatmap, Pilot Scorecard, Logistics Kanban, Scale-up Simulator
│   ├── store/
│   │   ├── useAppStore.ts  # Master reactive Zustand store with persist middleware
│   │   └── slices/         # Clinics, Transactions, Stock, Patients, Tasks, Levers, Config
│   ├── services/           # Data access layer mimicking real API
│   ├── data/
│   │   ├── seededGenerator.ts # Seeded pseudo-RNG generating ~100 clinics, 1500 patients, 6000 txs
│   │   ├── seedConstants.ts   # SKUs, Territories, Archetypes, Objections, Quiz questions
│   │   └── defaultData.ts
│   ├── types/              # Comprehensive TypeScript interfaces & Zod validation schemas
│   ├── hooks/              # useOffline, useMediaQuery, useCalculations, useTour
│   ├── i18n/               # en, hi, mr translation dictionaries
│   ├── lib/                # utils, cn, formatters, calculations, exportUtils
│   └── tests/              # Vitest test suites (Economics, Health Score, Fraud/Batch validation, Flow tests)
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
├── netlify.toml
├── README.md
├── ASSUMPTIONS.md
├── DEMO_SCRIPT.md
├── SCREENSHOTS.md
└── PLAN.md
```

---

## 3. Data Model Hierarchy & Schema Overview

1. **Territory & Clinic Model**:
   - `Territory`: ID, Name (Mumbai Central, Thane-Navi Mumbai, Pune Metro, Bengaluru South), Target Refill Rate, Rep.
   - `Clinic`: ID, Name, DoctorName, Address, Locality, Lat/Lng coordinates, Archetype, PatientsPerMonth, DispensingShare, EnrolledDate, HealthScore (0-100), Status (`champion`, `on_track`, `at_risk`, `dormant`), ActiveLevers, BinThreshold, BinCount.
2. **Catalog & Stock Model**:
   - `ProductSKU`: ID, Name, Category, Volume, FullPriceINR, RefillPriceINR, DoctorFullMarginPct, DoctorRefillMarginPct, PlasticWeightGrams, CO2FactorGrams.
   - `StockItem`: ClinicID, SkuID, QuantityOnHand, MinimumThreshold, DaysOfCover.
   - `ReplenishmentOrder`: ID, ClinicID, SkuID, Units, Status (`requested`, `approved`, `dispatched`, `delivered`), CreatedAt.
3. **Transaction & Reverse Logistics Model**:
   - `RefillTransaction`: ID, ClinicID, PatientID, SkuID, BatchCode, FullPrice, DiscountPrice, MarginEarned, StaffID, Timestamp, PaymentMode (`upi`, `cash`, `card`), Status (`completed`, `voided`), VoidReason.
   - `ReturnPack`: ID, ClinicID, BatchCode, ScannedAt, VerificationChecks, DuplicateFlag.
   - `PickupTask`: ID, ClinicID, PackCount, Status (`scheduled`, `picked_up`, `recycled`), RequestedDate, CompletedDate.
4. **Patient & Loyalty Model**:
   - `Patient`: ID, Name, Phone, Email, PrimaryClinicId, EnrolledDate, ActiveSkuId, UsageDaysElapsed, UsageCycleDays, RefillStreak, LoyaltyTier (`starter`, `green`, `gold`), PointsBalance, PacksSavedTotal.
5. **Operational Levers & Training Model**:
   - `Lever`: ID, Name, Category, CostMonthly, TargetMetric, LiftMultiplier.
   - `TrainingModule`: ID, Title, DurationMins, Content, QuizQuestions, BadgeId.
   - `StaffMember`: ID, ClinicID, Name, Role, Certifications, PointsEarned, RefillsCompleted.
   - `ActionTask`: ID, ClinicID, Priority (`urgent`, `high`, `medium`), Title, Description, TriggerRule, Status (`pending`, `completed`, `snoozed`), DueDate.

---

## 4. Build Sequence (End-to-End Execution Order)

1. **Scaffolding & Tooling**:
   - Initialize Vite + React + TypeScript app in workspace root.
   - Install core libraries: `zustand`, `lucide-react`, `recharts`, `react-router-dom`, `zod`, `date-fns`, `canvas-confetti`, `qrcode.react`, `i18next`, `react-i18next`, `framer-motion`, `clsx`, `tailwind-merge`, `jspdf`, `html2canvas`, `papaparse`.
   - Setup Tailwind CSS, custom design tokens, fonts, and dark mode classes.
2. **Data Generator, Store & Types**:
   - Build Zod schemas & TypeScript definitions (`src/types/index.ts`).
   - Implement deterministic PRNG seeded generator (`src/data/seededGenerator.ts`) to populate 100 clinics, 1,500 patients, 6,000 realistic historical transactions across 12 weeks, replenishment orders, and tasks.
   - Create reactive Zustand store with persistence, reset, and reseed functionality.
3. **Core Services & Business Logic**:
   - Unit-tested calculation utilities: Clinic economics, plastic saved, health scores, duplicate batch protection, tier rules.
4. **Module E: Clinic Refill Counter (Mobile-First Core Execution)**:
   - 3-Tap Refill Workflow with patient lookup/QR scan, pack batch validation, instant price/margin calculation.
   - Returns Bin tracking, threshold alert, and 1-tap pickup logistics trigger.
   - Clinic Stock inventory view with low-stock warnings and replenishment orders.
   - Offline queue simulator with offline badge & auto-sync when online.
5. **Module F: Patient Experience (Mobile-First)**:
   - Personal refill lifecycle ring, plastic saved metric, loyalty tier perks, simulated WhatsApp reminder thread, and patient QR pass.
6. **Module H: Territory Dashboard & Clinic 360 (Desktop/Tablet)**:
   - Executive KPI cards with MoM/WoW indicators and interactive KPI glossary drawer.
   - Mumbai/Thane/Navi Mumbai interactive SVG schematic map with health score pins.
   - Filterable & sortable clinic table with Adoption Health Scores (0-100).
   - Deep Clinic 360 view with timeline, refill cadence, stock-out correlations, and action plans.
   - Prioritized Action Centre with rule-based task triggers (e.g. stock-outs, dormant streaks).
   - Route and visit planner with mock check-in and visit note logging.
7. **Module A & B: Understand the Doctor & Pitch Studio**:
   - Prescriber vs Dispenser interactive comparison matrix with driver weights.
   - 8-Question Doctor Archetype Quiz with instant archetype diagnosis and profile saving.
   - Full Clinic Economics live calculator with sliders, cash flow charts, presets, and sensitivity matrix.
   - Fullscreen 6-Slide Pitch Deck presentation mode.
   - 12+ Searchable Objections Library with interactive Roleplay Practice Mode.
   - Printable "Green Clinic" Certificate, Counter Standee, and Patient Flyer.
8. **Module C, D, G: Onboarding, Training & Levers Engine**:
   - 5-Step Clinic Enrolment Wizard with e-signature.
   - Staff Training Academy with 6 micro-courses, interactive quizzes, and practice counter sandbox.
   - Configurable Levers Engine, Incentive Tier Calculator, and What-If adoption simulator.
9. **Module I & J: Doctor Dashboard & Regional Brand Admin**:
   - Dispensing Doctor personal performance dashboard with social "Green Clinic" impact card.
   - Regional Brand Admin roll-up with multi-territory heatmaps, pilot scorecard, and national scale-up simulator.
10. **Module K & Cross-Cutting Polish**:
    - RefillRx Copilot rule-based natural language assistant with intent matcher and screen deep-links.
    - 3-minute Guided Demo Tour stepper overlay.
    - Cmd+K Command Palette.
    - Multilingual i18n switcher (EN, HI, MR).
    - Notification bell & notification center with realistic trigger history.
    - Public sharing modal with QR code.
11. **Verification & Delivery**:
    - Comprehensive Vitest unit & component tests.
    - Clean typecheck (`tsc --noEmit`), lint check, and production build (`npm run build`).
    - Final documentation: `README.md`, `ASSUMPTIONS.md`, `DEMO_SCRIPT.md`, `SCREENSHOTS.md`.

