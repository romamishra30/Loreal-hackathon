import { create } from 'zustand'

export type ActivePopover = 
  | 'lang' 
  | 'persona' 
  | 'clinic' 
  | 'notifications' 
  | 'share' 
  | 'palette' 
  | 'assumptions' 
  | 'formula' 
  | 'kpi_glossary'
  | 'why_this_number'
  | null

interface UiState {
  activePopover: ActivePopover
  activeFormulaKpiId: string | null
  openPopover: (popover: ActivePopover, extraId?: string) => void
  closePopover: () => void
  togglePopover: (popover: ActivePopover) => void
}

export const useUiStore = create<UiState>((set) => ({
  activePopover: null,
  activeFormulaKpiId: null,

  openPopover: (popover, extraId) => set({
    activePopover: popover,
    activeFormulaKpiId: extraId || null,
  }),

  closePopover: () => set({
    activePopover: null,
    activeFormulaKpiId: null,
  }),

  togglePopover: (popover) => set((state) => ({
    activePopover: state.activePopover === popover ? null : popover,
  })),
}))

