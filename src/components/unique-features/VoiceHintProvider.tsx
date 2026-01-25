'use client'

import React, { useEffect, useCallback, useRef } from 'react'
import { analyzeCodeForHints, requestVoiceHint, CodingContext } from '@/lib/voice/voice-hints'
import { Button } from '@/components/ui/button'
import { HelpCircle, Volume2 } from 'lucide-react'

interface VoiceHintProviderProps {
  code: string
  language: string
  challengeType: string
  errorCount: number
  lastError?: string
  children: React.ReactNode
  onHintRequested?: () => void
}

export function VoiceHintProvider({
  code,
  language,
  challengeType,
  errorCount,
  lastError,
  children,
  onHintRequested
}: VoiceHintProviderProps) {
  const startTimeRef = useRef<number>(Date.now())
  const lastAnalysisRef = useRef<string>('')

  // Create coding context
  const createContext = useCallback((): CodingContext => ({
    code,
    language,
    challenge_type: challengeType,
    time_spent_ms: Date.now() - startTimeRef.current,
    error_count: errorCount,
    last_error: lastError
  }), [code, language, challengeType, errorCount, lastError])

  // Analyze code for hints when code changes
  useEffect(() => {
    const context = createContext()
    const codeHash = `${code}_${errorCount}_${lastError}`
    
    // Only analyze if something meaningful changed
    if (codeHash !== lastAnalysisRef.current) {
      lastAnalysisRef.current = codeHash
      
      // Debounce analysis to avoid too frequent calls
      const timeoutId = setTimeout(() => {
        analyzeCodeForHints(context).catch(console.warn)
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [code, errorCount, lastError, createContext])

  // Handle manual hint request
  const handleHintRequest = useCallback(async () => {
    const context = createContext()
    onHintRequested?.()
    await requestVoiceHint(context)
  }, [createContext, onHintRequested])

  return (
    <div className="voice-hint-provider">
      {children}
      
      {/* Voice Hint Request Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleHintRequest}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm border-2 hover:bg-accent"
          title="Request voice hint"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Hook for using voice hints in coding components
export function useVoiceHints(
  code: string,
  language: string,
  challengeType: string,
  errorCount: number,
  lastError?: string
) {
  const startTimeRef = useRef<number>(Date.now())

  const requestHint = useCallback(async () => {
    const context: CodingContext = {
      code,
      language,
      challenge_type: challengeType,
      time_spent_ms: Date.now() - startTimeRef.current,
      error_count: errorCount,
      last_error: lastError
    }

    await requestVoiceHint(context)
  }, [code, language, challengeType, errorCount, lastError])

  const analyzeForHints = useCallback(async () => {
    const context: CodingContext = {
      code,
      language,
      challenge_type: challengeType,
      time_spent_ms: Date.now() - startTimeRef.current,
      error_count: errorCount,
      last_error: lastError
    }

    await analyzeCodeForHints(context)
  }, [code, language, challengeType, errorCount, lastError])

  return {
    requestHint,
    analyzeForHints,
    timeSpent: Date.now() - startTimeRef.current
  }
}