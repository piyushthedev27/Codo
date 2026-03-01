'use client'

import { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _voiceRecognition, startVoiceCoaching, stopVoiceRecognition } from './speech-recognition'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _voiceSynthesis, speakCoachingResponse, stopSpeaking } from './speech-synthesis'
import { checkSpeechSupport } from './speech-config'
import { getSupabaseClient } from '../database/supabase-client'

export interface VoiceCoachingState {
  isListening: boolean
  isSpeaking: boolean
  isSupported: boolean
  fallbackMode: boolean
  currentTranscript: string
  error: string | null
}

export interface VoiceCoachingActions {
  startListening: () => Promise<void>
  stopListening: () => void
  stopSpeaking: () => void
  speakResponse: (text: string) => Promise<void>
  clearError: () => void
}

export function useVoiceCoaching(
  onVoiceQuestion?: (question: string) => void,
  onCoachingResponse?: (response: string) => void
) {
  const [state, setState] = useState<VoiceCoachingState>({
    isListening: false,
    isSpeaking: false,
    isSupported: false,
    fallbackMode: false,
    currentTranscript: '',
    error: null
  })

  const supabase = getSupabaseClient()

  // Check browser support on mount
  useEffect(() => {
    const support = checkSpeechSupport()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(prev => ({
      ...prev,
      isSupported: support.supported,
      fallbackMode: !support.supported
    }))
  }, [])

  const speakResponse = useCallback(async (text: string) => {
    try {
      setState(prev => ({ ...prev, isSpeaking: true }))
      await speakCoachingResponse(
        text,
        () => setState(prev => ({ ...prev, isSpeaking: true })),
        () => setState(prev => ({ ...prev, isSpeaking: false }))
      )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setState(prev => ({ ...prev, isSpeaking: false }))
    }
  }, [])

  // Handle voice question
  const handleVoiceQuestion = useCallback(async (question: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      onVoiceQuestion?.(question)

      // Fetch dynamic response from database
      const response = await fetchCoachingResponse(question, supabase)
      onCoachingResponse?.(response)

      // Speak the response if supported
      if (state.isSupported && !state.fallbackMode) {
        await speakResponse(response)
      }
    } catch (err) {
      console.error('Voice coaching error:', err)
      setState(prev => ({
        ...prev,
        error: 'Failed to process voice question'
      }))
    }
  }, [state.isSupported, state.fallbackMode, onVoiceQuestion, onCoachingResponse, supabase, speakResponse])

  const startListening = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, fallbackMode: true }))
      return
    }

    try {
      setState(prev => ({ ...prev, error: null }))

      await startVoiceCoaching(
        handleVoiceQuestion,
        () => setState(prev => ({
          ...prev,
          isListening: true,
          currentTranscript: ''
        })),
        () => setState(prev => ({
          ...prev,
          isListening: false,
          currentTranscript: ''
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any) => {
          setState(prev => ({
            ...prev,
            isListening: false,
            error: `Voice recognition error: ${err.error}`,
            fallbackMode: err.error === 'not-allowed'
          }))
        }
      )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start voice recognition',
        fallbackMode: true
      }))
    }
  }, [state.isSupported, handleVoiceQuestion])

  const stopListening = useCallback(() => {
    stopVoiceRecognition()
    setState(prev => ({
      ...prev,
      isListening: false,
      currentTranscript: ''
    }))
  }, [])

  const stopSpeakingHandler = useCallback(() => {
    stopSpeaking()
    setState(prev => ({ ...prev, isSpeaking: false }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const actions: VoiceCoachingActions = {
    startListening,
    stopListening,
    stopSpeaking: stopSpeakingHandler,
    speakResponse,
    clearError
  }

  return [state, actions] as const
}

interface CoachingResponse {
  keyword: string
  response: string
}

// Database-driven response fetcher
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCoachingResponse(question: string, supabase: any): Promise<string> {
  const questionLower = question.toLowerCase()

  // Get all coaching responses from database
   
  const { data: responses, error } = await supabase
    .from('coaching_responses')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('keyword, response') as { data: CoachingResponse[] | null, error: any }

  if (error || !responses) {
    console.error('Error fetching coaching responses:', error)
    return "I'm having trouble connecting to my knowledge base right now."
  }

  // Find matching keyword
  for (const item of responses) {
    if (questionLower.includes(item.keyword.toLowerCase())) {
      return item.response
    }
  }

  // Fallback to default response
  const defaultItem = responses.find((r: CoachingResponse) => r.keyword === 'default')
  return defaultItem?.response || "That's an interesting question! Let's focus on the core logic first."
}
