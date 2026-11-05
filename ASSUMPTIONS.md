# RefillRx - Assumptions & Illustrative Data Model

**Event**: L'Oréal Sustainability Challenge 2026, Medical Track: "Engaging Dispensing Dermatologists"  
**Scope**: Simulation parameters, economic formulas, and ESG metrics.

> [!IMPORTANT]
> All quantitative metrics, clinic profiles, doctor names, pricing benchmarks, and reverse-logistics factors in RefillRx are illustrative assumptions synthesized for competition modeling. They do not disclose or reflect confidential L'Oréal operational data.

---

## 1. Practice & Market Baselines

| Parameter | Illustrative Assumption | Clinical / Operational Rationale |
| :--- | :--- | :--- |
| **Dispensing Share** | 45% of metro dermatologists | ~45% of Indian metro dermatologists stock & sell products directly from clinic reception (hybrid clinical + retail model). |
| **Monthly Patient Volume** | 350 patients / month | Typical private aesthetic & medical dermatology clinic in Mumbai/Thane. |
| **In-Clinic Conversion** | 55% of patients | ~55% of patients buy topicals directly from the clinic rather than an external pharmacy. |
| **Daily-Use Maintenance Regimen** | 45% of prescribed topicals | Fraction of patients prescribed daily long-term products (ceramide moisturizers, gentle cleansers, sunscreens). |
| **Baseline Repeat Adherence** | 28% after 30 days | Without clinic intervention or circular refill incentives, 72% of patients drop off treatment or buy unverified substitutes online. |
| **Refill-Lifted Repeat Rate** | 62% repeat rate | 2.2x lift driven by automated WhatsApp cycle reminders, 20% eco-discount, and frictionless in-clinic pod exchange. |

---

## 2. Product Portfolio & Unit Economics

| Product SKU | Volume | Full Pack MRP | Refill Pod MRP | Doctor Full Margin | Doctor Refill Margin | Plastic Avoided | CO2e Avoided |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Daily Ceramide Barrier Moisturiser** | 50 ml | ₹1,350 | ₹1,080 (-20%) | 25% (₹337.50) | 32% (₹345.60) | 38g | 110g |
| **Gentle Foaming Amino Cleanser** | 200 ml | ₹1,150 | ₹920 (-20%) | 24% (₹276.00) | 30% (₹276.00) | 55g | 160g |
| **Photoprotect UV Invisible Fluid SPF 50+** | 50 ml | ₹1,450 | ₹1,160 (-20%) | 26% (₹377.00) | 34% (₹394.40) | 32g | 95g |

### Key Economic Insights:
- **Patient Value**: Patients save 20% on every refill, removing price friction for continuous daily maintenance.
- **Doctor P&L**: While the retail price is 20% lower, the doctor's percentage margin increases from 25% to 32%, preserving absolute gross margin per unit (~₹345.60).
- **Lifetime Value Lift**: Because repeat transactions increase from 0 to 3.8 refills/year per compliant patient, total annual practice margin per patient expands from ₹337 to over ₹1,650.
- **Staff Handling Cost**: Refill counter transaction takes 22 seconds (1.2 min total interaction). At ₹2.5/min receptionist cost, staff friction is only ₹3.00/unit.
- **Net Practice Margin**: Standard clinic yields ₹10,000–₹14,000/month in net incremental profit, paying back starter setup within 1.2 months.

---

## 3. Adoption Health Score Formula (0–100)

The **Adoption Health Score** provides medical representatives with a deterministic, real-time health indicator for every dispensing clinic:

$$\text{Health Score} = S_{\text{rate}} + S_{\text{consistency}} + S_{\text{stock}} + S_{\text{staff}}$$

1. **Refill Rate vs Target ($S_{\text{rate}}$, 40 points max)**:
   $$\text{Ratio} = \min\left(1.2, \frac{\text{Refill Rate}}{\text{Target Rate (40\%)}}\right)$$
   $$S_{\text{rate}} = \min(40, \text{Ratio} \times 40)$$

2. **Weekly Consistency ($S_{\text{consistency}}$, 25 points max)**:
   Active dispensing weeks with $\ge 1$ refill out of the last 4 weeks:
   $$S_{\text{consistency}} = \left(\frac{\text{Active Weeks}}{4}\right) \times 25$$

3. **Stock Availability ($S_{\text{stock}}$, 20 points max)**:
   - Days of Cover $\ge 14$ days: 20 points
   - Days of Cover $7 - 13$ days: 12 points
   - Days of Cover $1 - 6$ days: 5 points
   - Stocked Out (0 days): 0 points

4. **Staff Engagement ($S_{\text{staff}}$, 15 points max)**:
   - Certified front-desk dispenser (completed all 6 micro-courses): 8 points
   - Counter app active within last 7 days: 7 points

### Status Thresholds:
- **Champion**: $85 \le \text{Score} \le 100$
- **On Track**: $65 \le \text{Score} < 85$
- **At Risk**: $40 \le \text{Score} < 65$
- **Dormant**: $\text{Score} < 40$

---

## 4. Sustainability & Environmental Metrics

- **Average Packaging Plastic Saved**: 42 grams per unit (eliminating outer heavy-wall acrylic jar, pump dispenser, dip tube, and secondary carton).
- **PET Bottle Equivalent**: Based on a standard 500 ml PET water bottle weighing 12 grams:
  $$\text{Bottles Equivalent} = \frac{\text{Total Grams Plastic}}{12\text{ g}}$$
- **Lifecycle CO2e Avoidance**: 125 grams CO2e per modular refill pod (savings from reduced transport weight and resin manufacturing).
- **Vehicle Kilometer Equivalent**: Based on an average passenger petrol car emitting 0.192 kg CO2/km:
  $$\text{Car Km Avoided} = \frac{\text{Total kg CO2e}}{0.192\text{ kg/km}}$$
- **Reverse-Logistics Threshold**: Collection bin alert triggers automatically at **20 empty containers** (~840g plastic), optimizing courier carbon footprint.

---

## 5. Territory & Network Distribution

- **Total Network**: 100 clinics across 4 metro territories (Mumbai–Thane, South Mumbai, Pune Metro, Bengaluru Central).
- **Main Pilot Territory**: Mumbai–Thane–Navi Mumbai (25 clinics managed by Rep Vikram Salunkhe).
- **Distribution Spread in Pilot**:
  - ~5 Champion Practices
  - ~10 On Track Practices
  - ~7 At Risk Practices (targeted for rep coaching visits)
  - ~3 Dormant Practices (triggering automated retraining workflows)

