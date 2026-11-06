import { Sku } from '../../domain/entities'

export const SEED_SKUS: Sku[] = [
  {
    id: 'sku-moisturiser-50',
    name: 'Daily Ceramide Barrier Moisturiser',
    subtitle: 'Lipid-Replenishing Emulsion for Dry/Compromised Skin',
    category: 'Moisturiser',
    volume: '50 ml',
    fullPriceINR: 1350,
    refillPriceINR: 1080, // 20% discount
    doctorFullMarginPct: 0.25, // ₹337.50
    doctorRefillMarginPct: 0.32, // ₹345.60
    plasticWeightGrams: 38,
    co2FactorGrams: 110,
    usageCycleDays: 30,
    heroColor: '#1f9d5f',
  },
  {
    id: 'sku-cleanser-200',
    name: 'Gentle Foaming Amino Cleanser',
    subtitle: 'Sulfate-Free Balancing Cleanser for Sensitive Skin',
    category: 'Cleanser',
    volume: '200 ml',
    fullPriceINR: 1150,
    refillPriceINR: 920,
    doctorFullMarginPct: 0.24,
    doctorRefillMarginPct: 0.30,
    plasticWeightGrams: 55,
    co2FactorGrams: 160,
    usageCycleDays: 45,
    heroColor: '#3b82f6',
  },
  {
    id: 'sku-sunscreen-50',
    name: 'Photoprotect UV Invisible Fluid SPF 50+',
    subtitle: 'Ultra-Light Broad Spectrum PA++++ Shield',
    category: 'Sunscreen',
    volume: '50 ml',
    fullPriceINR: 1450,
    refillPriceINR: 1160,
    doctorFullMarginPct: 0.26,
    doctorRefillMarginPct: 0.34,
    plasticWeightGrams: 32,
    co2FactorGrams: 95,
    usageCycleDays: 30,
    heroColor: '#e8b04a',
  },
]

