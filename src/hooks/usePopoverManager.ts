import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useUiStore, ActivePopover } from '../store/useUiStore'

export function usePopoverManager(popoverKey: ActivePopover) {
  const { activePopover, closePopover } = useUiStore()
  const isOpen = activePopover === popoverKey
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      closePopover()
    }
  }, [location.pathname])

  // Close on click outside, Escape key, or window blur
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopover()
        triggerRef.current?.focus()
      }
    }

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        triggerRef.current && 
        !triggerRef.current.contains(target)
      ) {
        closePopover()
      }
    }

    const handleWindowBlur = () => {
      closePopover()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [isOpen, closePopover])

  return {
    isOpen,
    containerRef,
    triggerRef,
    closePopover,
  }
}

