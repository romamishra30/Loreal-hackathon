import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Sparkles, ExternalLink, CornerDownLeft, RotateCcw } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Link } from 'react-router-dom'

export const CopilotDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('')
  const { copilotMessages, sendCopilotMessage } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [copilotMessages, isOpen])

  if (!isOpen) return null

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input
    if (!text.trim()) return
    sendCopilotMessage(text.trim())
    setInput('')
  }

  const latestSuggestions = copilotMessages[copilotMessages.length - 1]?.suggestedPrompts || [
    'Which clinics are at risk this week?',
    'Draft a WhatsApp to Dr. Mehta',
    'What should I say if doctor says staff are busy?',
    'How much plastic did we save?',
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-900 h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-charcoal-800">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-charcoal-800 flex items-center justify-between bg-gradient-to-r from-brand-900 to-brand-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-700/80 flex items-center justify-center text-emerald-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm">RefillRx Copilot</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-200 font-mono">
                  Live State
                </span>
              </div>
              <p className="text-[10px] text-brand-200">Decision Support for Medical Reps & Doctors</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-200 hover:text-white hover:bg-brand-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {copilotMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                    : 'bg-gray-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-gray-100 rounded-bl-none border border-gray-200/60 dark:border-charcoal-700'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans">
                  {msg.text}
                </div>

                {msg.links && msg.links.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-gray-200 dark:border-charcoal-700 flex flex-wrap gap-1.5">
                    {msg.links.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-emerald-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        {latestSuggestions.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-charcoal-950/60 border-t border-gray-100 dark:border-charcoal-800 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold-500" />
              Suggested Prompts
            </p>
            <div className="flex flex-wrap gap-1.5">
              {latestSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] text-left px-2.5 py-1 rounded-full bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 hover:border-brand-500 hover:text-brand-600 dark:hover:text-emerald-400 text-charcoal-700 dark:text-gray-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="p-3 border-t border-gray-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. at-risk clinics, pitch advice)..."
              className="flex-1 py-2 px-3 bg-gray-100 dark:bg-charcoal-800 rounded-xl text-xs text-charcoal-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 border border-transparent focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[9px] text-gray-400 text-center mt-1.5">
            Rule-based intent engine linked to live Zustand store. Drop in Gemini or OpenAI API key in .env to enable neural streaming.
          </p>
        </div>
      </div>
    </div>
  )
}

