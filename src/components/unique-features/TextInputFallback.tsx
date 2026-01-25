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
  submitButtonText = "Send",
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
    <Card className={`text-input-fallback ${className}`}>
      <CardContent className="p-4 space-y-3">
        {/* Fallback reason display */}
        {fallbackReason && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {fallbackReason}
              </p>
              {canRetryVoice && onRetryVoice && (
                <Button
                  onClick={onRetryVoice}
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry Voice
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Text input form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Keyboard className="w-3 h-3 mr-1" />
              Text Mode
            </Badge>
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isSubmitting}
              className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
            
            <Button
              type="submit"
              disabled={!inputValue.trim() || disabled || isSubmitting}
              size="sm"
              className="px-3"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  {submitButtonText}
                </>
              )}
            </Button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => setInputValue(suggestion)}
                disabled={disabled || isSubmitting}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </form>

        {/* Help text */}
        <p className="text-xs text-muted-foreground">
          Press Enter to send, or click the quick suggestions above.
        </p>
      </CardContent>
    </Card>
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
                  className={`flex gap-2 ${
                    entry.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-md text-sm ${
                      entry.type === 'user'
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