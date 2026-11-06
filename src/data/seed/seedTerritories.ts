import { Rep, Territory } from '../../domain/entities'

export const SEED_REPS: Rep[] = [
  {
    id: 'rep-vikram',
    name: 'Vikram Salunkhe',
    phone: '+91 98201 44520',
    email: 'vikram.salunkhe@brand-derma.com',
    territoryId: 'terr-mumbai-thane',
  },
  {
    id: 'rep-ananya',
    name: 'Ananya Deshmukh',
    phone: '+91 98205 11928',
    email: 'ananya.deshmukh@brand-derma.com',
    territoryId: 'terr-mumbai-south',
  },
  {
    id: 'rep-rohan',
    name: 'Rohan Kulkarni',
    phone: '+91 98902 33411',
    email: 'rohan.kulkarni@brand-derma.com',
    territoryId: 'terr-pune-metro',
  },
  {
    id: 'rep-karthik',
    name: 'Karthik Rao',
    phone: '+91 98450 78219',
    email: 'karthik.rao@brand-derma.com',
    territoryId: 'terr-bengaluru-central',
  },
]

export const SEED_TERRITORIES: Territory[] = [
  {
    id: 'terr-mumbai-thane',
    name: 'Mumbai–Thane–Navi Mumbai (Pilot Territory)',
    code: 'MUM-THN-01',
    repId: 'rep-vikram',
  },
  {
    id: 'terr-mumbai-south',
    name: 'South & Central Mumbai',
    code: 'MUM-SOU-02',
    repId: 'rep-ananya',
  },
  {
    id: 'terr-pune-metro',
    name: 'Pune Metro & PCMC',
    code: 'PUN-MET-01',
    repId: 'rep-rohan',
  },
  {
    id: 'terr-bengaluru-central',
    name: 'Bengaluru Central & Indiranagar',
    code: 'BLR-CEN-01',
    repId: 'rep-karthik',
  },
]

