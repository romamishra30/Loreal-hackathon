import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Copy, Check, Share2, Sparkles, ExternalLink } from 'lucide-react'

export const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-charcoal-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-charcoal-800 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 mb-3">
          <Share2 className="w-6 h-6 text-brand-600 dark:text-emerald-400" />
        </div>

        <h3 className="font-serif font-bold text-lg text-charcoal-900 dark:text-white">
          Share Prototype
        </h3>
        <p className="text-xs text-charcoal-600 dark:text-gray-400 mt-1 mb-4">
          Scan with your phone to test the mobile Clinic Counter or Patient Pass directly.
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner inline-block mx-auto mb-4">
          <QRCodeSVG
            value={shareUrl}
            size={180}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/favicon.svg',
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        {/* URL Box & Copy Button */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 text-xs text-left mb-4">
          <span className="flex-1 truncate font-mono text-charcoal-700 dark:text-gray-300 px-1">
            {shareUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium shrink-0 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-gray-400">
          Ready for competition slide decks and live mobile judging evaluations.
        </p>
      </div>
    </div>
  )
}

