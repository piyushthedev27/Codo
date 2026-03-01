'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Keyboard, RefreshCw, AlertCircle } from 'lucide-react'

export interface TextInputFallbackProps {
  onSubmit: (text: string) => void
  placeholder?: string
  submitButtonText?: string
  disabled?: boolean
  className?: string
  fallbackReason?: string | null
  onRetryVoice?: () => void
  canRetryVoice?: boolean
}

export function TextInputFallback({
  onSubmit,
  placeholder = "Type your question or message here...",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _submitButtonText = "Send",
  disabled = false,
  className = "",
  fallbackReason,
  onRetryVoice,
  canRetryVoice = false
}: TextInputFallbackProps) {
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || disabled || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(inputValue.trim())
      setInputValue('')
    } catch (error) {
      console.error('Error submitting text:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Fallback reason display (Redesigned for context) */}
      {fallbackReason && (
        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-200/90 leading-relaxed">
              {fallbackReason}
            </p>
            {canRetryVoice && onRetryVoice && (
              <Button
                onClick={onRetryVoice}
                variant="ghost"
                size="sm"
                className="mt-2 h-7 px-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 hover:text-white border border-red-500/20"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Retry Voice
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Text input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest bg-slate-800/50 text-slate-400 border-slate-700">
            <Keyboard className="w-3 h-3 mr-1.5" />
            Text Mode
          </Badge>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Enter to send</span>
        </div>

        <div className="flex gap-2 items-center bg-slate-900/40 p-1 rounded-2xl border border-slate-700/50 focus-within:border-blue-500/50 transition-all shadow-inner">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            className="flex-1 min-w-0 px-4 py-2 bg-transparent text-sm placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />

          <Button
            type="submit"
            disabled={!inputValue.trim() || disabled || isSubmitting}
            size="icon"
            className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick suggestions - Refined for a cleaner look */}
        <div className="flex flex-wrap gap-2 pt-1 px-1">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-3 font-bold rounded-full border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all active:scale-95"
              onClick={() => setInputValue(suggestion)}
              disabled={disabled || isSubmitting}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </form>
    </div>
  )
}

// Quick suggestion phrases for common coding questions
const QUICK_SUGGESTIONS = [
  "Help me debug this",
  "Explain this code",
  "How can I optimize this?",
  "What's wrong here?",
  "Give me a hint",
  "Best practices?"
]

// Enhanced version with conversation history
export interface ConversationEntry {
  id: string
  timestamp: Date
  type: 'user' | 'assistant'
  content: string
}

export interface TextConversationFallbackProps extends TextInputFallbackProps {
  conversation?: ConversationEntry[]
  maxHistoryItems?: number
  showTimestamps?: boolean
}

export function TextConversationFallback({
  conversation = [],
  maxHistoryItems = 5,
  showTimestamps = false,
  ...props
}: TextConversationFallbackProps) {
  const conversationEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const displayConversation = conversation.slice(-maxHistoryItems)

  return (
    <div className="text-conversation-fallback space-y-4">
      {/* Conversation history */}
      {displayConversation.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Conversation</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {displayConversation.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex gap-2 ${entry.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-md text-sm ${entry.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                      }`}
                  >
                    <p>{entry.content}</p>
                    {showTimestamps && (
                      <p className="text-xs opacity-70 mt-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text input */}
      <TextInputFallback {...props} />
    </div>
  )
}