'use client'

import { useState, useEffect, useCallback } from 'react'
import { voiceRecognition, startVoiceCoaching, stopVoiceRecognition } from './speech-recognition'
import { voiceSynthesis, speakCoachingResponse, stopSpeaking } from './speech-synthesis'
import { checkSpeechSupport } from './speech-config'

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

  // Check browser support on mount
  useEffect(() => {
    const support = checkSpeechSupport()
    setState(prev => ({
      ...prev,
      isSupported: support.supported,
      fallbackMode: !support.supported
    }))
  }, [])

  // Handle voice question
  const handleVoiceQuestion = useCallback(async (question: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      onVoiceQuestion?.(question)
      
      // Generate mock response for demo
      const response = generateMockResponse(question)
      onCoachingResponse?.(response)

      // Speak the response if supported
      if (state.isSupported && !state.fallbackMode) {
        await speakResponse(response)
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to process voice question' 
      }))
    }
  }, [state.isSupported, state.fallbackMode, onVoiceQuestion, onCoachingResponse])

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
        (error) => {
          setState(prev => ({
            ...prev,
            isListening: false,
            error: `Voice recognition error: ${error.error}`,
            fallbackMode: error.error === 'not-allowed'
          }))
        }
      )
    } catch (error) {
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

  const speakResponse = useCallback(async (text: string) => {
    try {
      setState(prev => ({ ...prev, isSpeaking: true }))
      await speakCoachingResponse(
        text,
        () => setState(prev => ({ ...prev, isSpeaking: true })),
        () => setState(prev => ({ ...prev, isSpeaking: false }))
      )
    } catch (error) {
      setState(prev => ({ ...prev, isSpeaking: false }))
    }
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

// Mock response generator for demo
function generateMockResponse(question: string): string {
  const responses: Record<string, string> = {
    'for loop': "I notice you're using a for loop here. Have you considered using the map method instead?",
    'async await': "Great use of async/await! This makes your code much more readable.",
    'useState': "Perfect! useState is the right hook for managing component state.",
    'function': "That's a good function structure. Consider adding type annotations.",
    'error': "Let's break this error down step by step. What specific message are you seeing?",
    'help': "I'm here to help! What specific part of your code are you struggling with?",
    'default': "That's an interesting approach! Let me help you optimize this code."
  }

  const questionLower = question.toLowerCase()
  for (const [keyword, response] of Object.entries(responses)) {
    if (questionLower.includes(keyword)) {
      return response
    }
  }

  return responses.default
}