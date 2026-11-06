# RefillRx – Comprehensive Fix & Connect Report

**Event:** L'Oréal Sustainability Challenge 2026, Medical Track: *Case "Engaging Dispensing Dermatologists"*  
**Deliverable:** End-to-End Reactive Connected Platform Verification & Audit Report

---

## 1. Executive Summary

This report documents the architectural upgrade and end-to-end data connection of the **RefillRx** platform. Prior to this release, various views contained mock string literals, overlapping popover panels, unlinked language strings, and static dates. 

Following this implementation:
1. **Single Source of Truth**: All domain entities reside in a normalized client-side store with typed models (`src/domain/entities.ts`).
2. **Event-Driven Architecture**: Every operational action (processing a refill, voiding a transaction, requesting replenishment, scheduling a pickup, onboarding a clinic, toggling an incentive lever) emits an append-only domain event (`src/domain/events.ts`).
3. **Pure Memoized Selectors**: All numbers, KPI tiles, percentages, leaderboards, and charts across Territory, Doctor, Counter, Patient, and Brand views are derived reactively from current events and state (`src/domain/selectors/`).
4. **Instant Cross-View Propagation**: Processing a single refill at the Counter immediately updates:
   - **Territory Ops**: Refills (30d) increments by +1, MoM and WoW percentages recompute, Adoption Health Score updates.
   - **Doctor Portal**: Refill practice margin increments by the SKU doctor margin, returns bin level increases by +1, practice rank updates.
   - **Patient Experience**: Patient refill streak increments by +1, tier upgrades (Starter → Green → Gold), timeline updates.
   - **Brand Administration**: Multi-territory aggregate rollup and pilot scorecard gates update in real time.
5. **Zero Hardcoded Data Outside Seed**: An automated guardrail test (`src/tests/no-hardcoded-data.test.ts`) verifies no static dates, static doctor names, or direct seed imports exist in components or views.

---

## 2. Hardcoded Values Converted to Derived Selectors

| Screen / Component | Value Previously Hardcoded | Selector / Derived Entity Now Used | Impact & Behavior |
| :--- | :--- | :--- | :--- |
| **TerritoryView** (Header) | `25 Dispensing Dermatology Practices` | `territoryClinics.length` | Dynamically shows 25 clinics; expands to 26 upon new clinic onboarding. |
| **TerritoryView** (KPI Card 1) | `Active Clinics: "23 / 25"` | `activeCount / territoryClinics.length` | Evaluates dormant vs active clinics based on recent dispensing transactions. |
| **TerritoryView** (KPI Card 2) | `Refills (30d): "1,480"`, `MoM: +18.4% WoW: +4.2%` | `selectTerritoryRefills30d(txs, clinics, 'terr-mumbai-thane')`, `selectTerritoryMoM(...)`, `selectTerritoryWoW(...)` | Recalculates rolling 30-day, MoM, and WoW refill volume on every completed or voided refill. |
| **TerritoryView** (KPI Card 3) | `Refill Rate: "42.4%"` | `selectTerritoryRefillRate(txs, clinics, 'terr-mumbai-thane')` | Ratio of 30-day refills to estimated territory eligible purchases. |
| **TerritoryView** (KPI Card 4) | `Repeat Adherence: "61.8%"` | `selectTerritoryRepeatRate(txs, patients, clinics, 'terr-mumbai-thane')` | Evaluates % of territory patients with ≥1 repeat refill in history. |
| **TerritoryView** (KPI Card 5) | `Plastic Saved: "62.2 kg"` | `selectTerritoryPlasticKg(txs, clinics, skus, 'terr-mumbai-thane')` | Sum of SKU gram weights of diverted outer packaging divided by 1,000. |
| **TerritoryView** (KPI Card 6) | `Patient NPS: "+74"` | `selectTerritoryNps(feedback, clinics, 'terr-mumbai-thane')` | Computes Net Promoter Score `(Promoters - Detractors) / Total * 100` from verified patient feedback. |
| **TerritoryView** (Clinics Table) | `Total Refills: "120 * 0.35"` | `selectClinicRefills30d(transactions, c.id)` | Exact rolling 30-day completed refill count per clinic. |
| **TerritoryView** (Clinics Table) | `Bin Level: "x / 20"` | `c.binCount / (c.binThreshold \|\| 20)` | Real-time returns bin gauge based on returns minus completed pickups. |
| **DoctorDashboardView** (Header) | `Rank: "#4 of 25 in Mumbai–Thane Cohort"` | `selectClinicRank(clinic.id, clinics, transactions)` | Ranks clinic among cohort peers by 30-day refills (`#${rank} of ${total}`). |
| **DoctorDashboardView** (KPI Card 1) | `Refill Margin: "₹34,200"` | `selectClinicCumulativeMargin(transactions, clinic.id)` | Sum of `doctorMarginINR` across all completed refills for this clinic. |
| **DoctorDashboardView** (KPI Card 3) | `Plastic Saved: "42.0 kg"` | `selectClinicPlasticKg(transactions, skus, clinic.id)` | Diverted plastic computed from SKU weights of clinic transactions. |
| **DoctorDashboardView** (KPI Card 4) | `Returns Bin Level: "12 / 20"` | `selectClinicBinCount(returns, pickups, clinic.id)` | Returns bin counter tracking empty packaging awaiting courier pickup. |
| **DoctorDashboardView** (Rewards Tier) | `Current Tier: "GOLD"`, `₹3,000 credit` | `selectClinicIncentiveTier(clinic.id, transactions, config)` | Computes Bronze / Silver / Gold tier and practice bonus from 30d refills. |
| **PitchStudioView** (Calculator) | `DEFAULT_ECONOMICS` static inputs | `selectClinicDefaultEconomics(clinic.id, patients, transactions, config, skus)` | Initializes sliders from selected clinic's OPD volume, dispensing share, and SKUs. |
| **OnboardingView** (Submit) | Mock string ID generation without state save | `useAppStore.getState().enrollClinic(...)` | Adds clinic, doctor, staff, and initial stock into state, selecting new clinic and incrementing count to 26. |
| **BrandAdminView** (KPI Cards) | `100 Clinics`, `Total Refills`, `Plastic`, `Readiness: "88 / 100"` | `selectRegionalRollup(...)`, `selectScaleReadiness(clinics, transactions)` | Multi-territory aggregated roll-up computed from raw transaction log. |
| **BrandAdminView** (Scorecard) | Static `42.4%`, `3.1%`, `+74 NPS`, `94.2% Pickups` | `selectPilotScorecardGates(clinics, txs, feedback, stocks, returns, pickups)` | Dynamically evaluates Go/No-Go decision gate thresholds. |
| **Topbar & Notifications** | Static date `"14 Mar 2026"` | `formatDateTime(n.timestamp)`, `generateDynamicNotifications` | Relative timestamps generated from system clock with persona-specific filtering. |

---

## 3. List of Modified & Added Files

### Added Files
- `AUDIT.md`: Complete audit of all hardcoded values, currency strings, dates, and target selectors.
- `src/domain/entities.ts`: Normalized domain models with optional convenience fields for backwards-compatibility.
- `src/domain/events.ts`: Strongly typed domain events and payloads.
- `src/domain/config.ts`: Central program configuration with editable weights, thresholds, margins, and benchmarks.
- `src/domain/selectors/clinicSelectors.ts`: Pure selectors for individual clinic KPIs, health scores, ranks, and economics.
- `src/domain/selectors/territorySelectors.ts`: Pure selectors for territory aggregate metrics (refills, refill rate, repeat rate, NPS, MoM, WoW).
- `src/domain/selectors/patientSelectors.ts`: Pure selectors for patient timeline, streak, tier, and personal environmental impact.
- `src/domain/selectors/brandSelectors.ts`: Pure selectors for regional rollups, scale readiness, and pilot scorecard gates.
- `src/domain/selectors/notificationSelectors.ts`: Dynamic event-driven notification generator.
- `src/domain/selectors/taskSelectors.ts`: Rule-based rep action task generator.
- `src/domain/selectors/index.ts`: Central barrel export for all pure selectors.
- `src/data/seed/rawGenerator.ts`: Deterministic seeded PRNG data generator producing 100 clinics, 100 doctors, 100 staff, 1,500 patients, and 12 weeks of historical transactions relative to `new Date()`.
- `src/data/seed/seedSkus.ts`, `seedTerritories.ts`, `seedLevers.ts`, `seedObjections.ts`, `seedModules.ts`, `seedQuestions.ts`, `index.ts`: Seed data constants.
- `src/store/useUiStore.ts`: Global Popover Manager managing exclusive popover states.
- `src/hooks/usePopoverManager.ts`: Popover lifecycle hook handling outside clicks, Escape key, window blur, and route change.
- `src/components/common/WhyThisNumberDrawer.tsx`: Transparency drawer explaining plain & LaTeX formulas, live inputs, benchmarks, and data sources.
- `src/tests/no-hardcoded-data.test.ts`: Automated regression guardrail against hardcoded dates, doctor names, and raw seed imports.
- `src/tests/integration.test.ts`: Cross-entity end-to-end integration tests (counter -> territory -> doctor -> patient -> brand, duplicate batch fraud rejection, transaction voiding, clinic onboarding, and i18n switching).
- `REPORT.md`: This comprehensive verification report.

### Modified Files
- `src/store/useAppStore.ts`: Master store with event dispatching, local event reducer, BroadcastChannel sync, and core workflows.
- `src/components/layout/Topbar.tsx`: Integrated UI store popover manager, click-outside/Escape lifecycle, persona switcher, language switcher, clinic selector, and notification bell.
- `src/components/layout/Sidebar.tsx`: Dynamic territory clinic count (`Main (${territoryClinics.length})`) and localized `t()` navigation labels.
- `src/components/common/StatCard.tsx`: Added `kpiId` and `onInfoClick` triggering the `WhyThisNumberDrawer`.
- `src/components/tour/GuidedDemoTour.tsx`: Spotlight overlay, click-outside to close, popover cleanup on step change, and interactive live refill demo step that dispatches real refills and increments KPIs.
- `src/views/territory/TerritoryView.tsx`: Full selector wiring for KPI tiles, clinics directory table, action centre, and clinic 360 drawer.
- `src/views/doctor-dash/DoctorDashboardView.tsx`: Selector wiring for doctor margin, practice rank, bin level, and rewards tier perks.
- `src/views/pitch-studio/PitchStudioView.tsx`: Dynamic slider initialization from selected clinic economics.
- `src/views/onboarding/OnboardingView.tsx`: Enrolment submission directly to store via `enrollClinic()`.
- `src/views/brand-admin/BrandAdminView.tsx`: Full selector wiring for multi-territory rollup, pilot scorecard gates, and scale readiness index.
- `src/i18n/index.ts`: Complete translation dictionaries for `en`, `hi`, and `mr` with missing key fallback warning and named export helpers `t()`, `setLanguage()`, and `getLanguage()`.
- `src/index.css`: Semantic tokens for light and dark themes, Devanagari font fallbacks, and z-index hierarchy.
- `eslint.config.js`: Flat configuration with TypeScript rules.

---

## 4. Test & Verification Results

All tests, type-checks, and builds pass cleanly:

```bash
# TypeScript Type Check
npx tsc --noEmit
# Exit code: 0 (Zero errors)

# ESLint Check
npm run lint
# Exit code: 0 (Zero errors, zero warnings)

# Vitest Test Suite (Unit, Smoke, Integration, Guardrails)
npm test
# 5 test files passed (5/5)
# 22 tests passed (22/22)
# ✓ src/tests/no-hardcoded-data.test.ts  (3 tests)
# ✓ src/tests/calculations.test.ts       (10 tests)
# ✓ src/tests/smoke.test.ts              (1 test)
# ✓ src/tests/refillFlow.test.ts         (3 tests)
# ✓ src/tests/integration.test.ts        (5 tests)

# Production Build
npm run build
# Exit code: 0
# ✓ 2477 modules transformed.
# dist/index.html                   1.63 kB
# dist/assets/index-BBt1oCL0.css   54.77 kB
# dist/assets/icons-CXb0qq9s.js    26.00 kB
# dist/assets/vendor-D32DxZ4q.js  167.01 kB
# dist/assets/charts-IOtrrs6g.js  424.29 kB
# dist/assets/index-D1yt6kOW.js   498.63 kB
# ✓ built in 9.63s
```

---

## 5. Deployment Instructions

RefillRx is configured for zero-backend static deployment with SPA routing fallback:

### Vercel
```bash
# Push to Git repository connected to Vercel, or run:
npx vercel --prod
```
*Configured in `vercel.json` with SPA rewrite to `/index.html`.*

### Netlify
```bash
# Push to Git repository connected to Netlify, or run:
npx netlify deploy --prod --dir=dist
```
*Configured in `netlify.toml` with `/* -> /index.html 200`.*

### Local Preview
```bash
npm run preview
# Serves production build locally at http://localhost:4173
```

