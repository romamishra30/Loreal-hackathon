# RefillRx - Comprehensive Data Audit & Disconnection Report

**Audit Date**: November 6, 2026  
**Auditor**: Lead Full-Stack Product Engineer  
**Objective**: Catalog all hardcoded strings, static literals, decoupled models, and UI inconsistencies in preparation for Phase 1 (Bug Fixes) and Phase 2/3 (Single Source of Truth & Full Reactive Wiring).

---

## 1. Executive Summary of Audit Findings

The initial prototype proved all UX modules, layout flows, and styling tokens. However, across `src/views/` and `src/components/`, several critical numbers, names, thresholds, and labels were statically embedded inside JSX or mock arrays instead of being dynamically computed from the centralized domain model:

1. **Territory Dashboard (`TerritoryView.tsx`)**: Headline KPI cards displayed static strings (`"1,480"` refills, `"42.4%"` refill rate, `"61.8%"` repeat rate, `"+74"` NPS) rather than calculating them over the 25 clinics and their actual transactions.
2. **Doctor Practice View (`DoctorDashboardView.tsx`)**: Rank was hardcoded to `"#4 of 25"`, repeat adherence to `"64.2%"`, and reward tier to `"GOLD"` with static bonus text `"₹3,000"`, irrespective of the selected clinic's real refill count.
3. **Refill Counter (`CounterView.tsx`)**: Rep contact name was hardcoded (`"Vikram Salunkhe"`), patient saving was fixed to `"₹270"`, and staff points had a fallback literal (`120`).
4. **Onboarding Wizard (`OnboardingView.tsx`)**: Form was pre-filled with `"Dr. Sanjay Gupta"` and `"Kavita Shinde"` instead of starting blank with real Zod validation and injecting newly enrolled clinics into the shared store.
5. **Pitch Studio (`PitchStudioView.tsx`)**: Default sliders used static numbers (`350` patients, `55%` dispensing) rather than reading the active clinic's real metrics. Leave-behind decks and copy text contained hardcoded references (`"150 kg"`, `"400 packaging bottles"`).
6. **Brand Admin (`BrandAdminView.tsx`)**: Multi-territory rollups had hardcoded pilot gate values (`"42.4% Achieved"`, `"22 seconds verified"`, `"3.1% Incidents"`, `"88 / 100"` readiness).
7. **Direct Imports of Seed Constants**: Views imported `PRODUCT_SKUS`, `LEVERS`, `TERRITORIES`, and `OBJECTIONS_LIBRARY` directly from `src/data/seedConstants.ts` instead of querying the domain service/selector layer.

---

## 2. Granular Findings Matrix

| File & Line | What It Shows (Hardcoded / Static) | Target Entity / Dynamic Selector |
| :--- | :--- | :--- |
| `src/views/territory/TerritoryView.tsx:116` | `"Vikram Salunkhe • 25 Dispensing Dermatology Practices"` | `selectTerritoryById(terrId).repName`, `selectClinicsByTerritory(terrId).length` |
| `src/views/territory/TerritoryView.tsx:149` | `value="1,480" subtext="MoM: +18.4% WoW: +4.2%"` | `selectTerritoryRefills30d(terrId)`, `selectTerritoryMoM(terrId)` |
| `src/views/territory/TerritoryView.tsx:156` | `value="42.4%" subtext="Target: 40.0%"` | `selectTerritoryRefillRate(terrId)`, `config.targetRefillRate` |
| `src/views/territory/TerritoryView.tsx:162` | `value="61.8%" subtext="Baseline was 28.0%"` | `selectTerritoryRepeatRate(terrId)`, `config.baselineRepeatRate` |
| `src/views/territory/TerritoryView.tsx:173` | `value="+74"` | `selectTerritoryNps(terrId)` |
| `src/views/doctor-dash/DoctorDashboardView.tsx:43` | `Rank: #4 of 25 in Mumbai–Thane Cohort` | `selectClinicRank(clinicId)`, `selectClinicsByTerritory(terrId).length` |
| `src/views/doctor-dash/DoctorDashboardView.tsx:64` | `value={formatINR(totalMarginEarned \|\| 34200)}` | `selectClinicCumulativeMargin(clinicId)` (no fallback literal) |
| `src/views/doctor-dash/DoctorDashboardView.tsx:71` | `value="64.2%" subtext="Baseline was 28%"` | `selectClinicRepeatRate(clinicId)` |
| `src/views/doctor-dash/DoctorDashboardView.tsx:149` | `Reward Tier: GOLD ... ₹3,000 monthly credit` | `selectClinicIncentiveTier(clinicId)` |
| `src/views/counter/CounterView.tsx:102` | `setBatchCodeInput('B25-' + ...)` | Seeded lot code from selected active patient's last issued batch |
| `src/views/counter/CounterView.tsx:162` | `clinicStaff?.points \|\| 120` | `selectStaffPoints(staffId)` |
| `src/views/counter/CounterView.tsx:899` | `Territory Rep: Vikram Salunkhe` | `selectTerritoryRep(clinic.territoryId).name` |
| `src/views/onboarding/OnboardingView.tsx:28-34` | Pre-filled `'Dr. Sanjay Gupta'`, `'Kavita Shinde'` | Empty form state requiring user input |
| `src/views/pitch-studio/PitchStudioView.tsx:37` | `setEconInput(DEFAULT_ECONOMICS)` | `selectClinicDefaultEconomics(clinicId)` (with "Using clinic data" indicator) |
| `src/views/pitch-studio/PitchStudioView.tsx:100` | `"diverts over 150 kg of plastic annually"` | `formatNumber(econOutput.annualKgPlastic)` |
| `src/views/pitch-studio/PitchStudioView.tsx:771` | `"diverting over 150 kg of medical-grade virgin plastic"` | `formatNumber(selectClinicPlasticKg(clinicId))` |
| `src/views/brand-admin/BrandAdminView.tsx:187` | `Scale Readiness Index: 88 / 100` | `selectRegionalScaleReadiness(clinics, txs)` |
| `src/views/brand-admin/BrandAdminView.tsx:216-220` | Static Pilot Scorecard measurements (`42.4%`, `22 seconds`, `3.1%`, `+74`) | `selectPilotScorecardGates(territories, transactions, feedbacks)` |
| `src/views/patient/PatientView.tsx:129` | `Day 25 Alert`, `"Day 25 of your Ceramide Moisturiser"` | `patient.usageDaysElapsed`, `activeSku.name` |
| `src/views/academy/AcademyView.tsx:87` | `staff?.completedModules.length / 6 Modules` | `selectStaffProgress(staff.id)` |
| `src/components/layout/Topbar.tsx:42` | `Medical Rep (Mumbai-Thane)` | `territory.name` from store |
| `src/components/copilot/CopilotDrawer.tsx:28` | `'Draft a WhatsApp to Dr. Mehta'` | `activeClinic.doctorName` |

---

## 3. Action Plan for Remediation

1. **Phase 1 (Immediate UI & Interaction Bugfixes)**:
   - Implement single active popover manager (`useUiStore`).
   - Complete missing translations in `hi` and `mr` dictionaries.
   - Refactor color system to semantic CSS variables with full dark mode WCAG AA compliance.
   - Build spotlight overlay tour with target highlight and live transaction demonstration.
2. **Phase 2 (Domain Architecture & Single Source of Truth)**:
   - Establish `src/domain/entities.ts`, `src/domain/events.ts`, `src/domain/selectors/`, and editable `src/domain/config.ts`.
   - Implement relative date generation (relative to `new Date()`) so all dates remain current.
   - Convert tasks and notifications to purely rule-generated collections.
3. **Phase 3 (End-to-End Screen Wiring)**:
   - Wire every screen to memoized selectors; remove all raw seed imports.
   - Connect Counter transaction to immediately propagate to Territory KPIs, Doctor P&L, Patient streak, Brand roll-up, and Action Centre.
4. **Phase 4 & 5 ("Why This Number?" & Automated Guardrails)**:
   - Add transparency formula drawer.
   - Add automated test `no-hardcoded-data.test.ts`.
   - Add Playwright / Vitest integration tests.

