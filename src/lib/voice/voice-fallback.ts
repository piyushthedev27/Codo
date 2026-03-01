/* eslint-disable @typescript-eslint/no-explicit-any */
// Voice fallback system for graceful degradation
import React from 'react'
import { checkSpeechSupport } from './speech-config'

export interface FallbackState {
  voiceRecognitionAvailable: boolean
  voiceSynthesisAvailable: boolean
  fallbackMode: boolean
  fallbackReason: string | null
}

export interface TextFallbackOptions {
  placeholder?: string
  submitButtonText?: string
  onTextSubmit?: (text: string) => void
  onVoiceToggle?: (enabled: boolean) => void
}

export class VoiceFallbackManager {
  private state: FallbackState = {
    voiceRecognitionAvailable: false,
    voiceSynthesisAvailable: false,
    fallbackMode: false,
    fallbackReason: null
  }

  private listeners: ((state: FallbackState) => void)[] = []

  constructor() {
    this.initialize()
  }

  private initialize() {
    const support = checkSpeechSupport()
    
    this.state = {
      voiceRecognitionAvailable: support.recognition,
      voiceSynthesisAvailable: support.synthesis,
      fallbackMode: !support.supported,
      fallbackReason: this.determineFallbackReason(support)
    }

    this.notifyListeners()
  }

  private determineFallbackReason(support: ReturnType<typeof checkSpeechSupport>): string | null {
    if (!support.recognition && !support.synthesis) {
      return 'Voice features not supported in this browser'
    }
    if (!support.recognition) {
      return 'Voice recognition not supported'
    }
    if (!support.synthesis) {
      return 'Voice synthesis not supported'
    }
    return null
  }

  public getState(): FallbackState {
    return { ...this.state }
  }

  public enableFallbackMode(reason: string): void {
    this.state.fallbackMode = true
    this.state.fallbackReason = reason
    this.notifyListeners()
  }

  public disableFallbackMode(): void {
    // Only disable if voice features are actually supported
    const support = checkSpeechSupport()
    if (support.supported) {
      this.state.fallbackMode = false
      this.state.fallbackReason = null
      this.notifyListeners()
    }
  }

  public handleVoiceError(error: any): void {
    let reason = 'Voice feature temporarily unavailable'
    
    if (error?.error) {
      switch (error.error) {
        case 'not-allowed':
          reason = 'Microphone access denied. Please enable microphone permissions.'
          break
        case 'no-speech':
          reason = 'No speech detected. Please try speaking again.'
          break
        case 'audio-capture':
          reason = 'Microphone not available. Check your audio settings.'
          break
        case 'network':
          reason = 'Network error. Voice recognition requires an internet connection. Using text mode instead.'
          break
        case 'service-not-allowed':
          reason = 'Voice service not available. Using text mode.'
          break
        case 'language-not-supported':
          reason = 'Language not supported for voice recognition.'
          break
        default:
          reason = `Voice error: ${error.error}`
      }
    }

    this.enableFallbackMode(reason)
  }

  public subscribe(listener: (state: FallbackState) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state))
  }

  // Utility methods for common fallback scenarios
  public shouldUseTextInput(): boolean {
    return this.state.fallbackMode || !this.state.voiceRecognitionAvailable
  }

  public shouldUseTextOutput(): boolean {
    return this.state.fallbackMode || !this.state.voiceSynthesisAvailable
  }

  public canRetryVoice(): boolean {
    return this.state.voiceRecognitionAvailable && 
           this.state.voiceSynthesisAvailable &&
           this.state.fallbackReason !== 'not-allowed'
  }
}

// Singleton instance
export const voiceFallbackManager = new VoiceFallbackManager()

// React hook for voice fallback state
export function useVoiceFallback() {
  const [state, setState] = React.useState<FallbackState>(voiceFallbackManager.getState())

  React.useEffect(() => {
    const unsubscribe = voiceFallbackManager.subscribe(setState)
    return unsubscribe
  }, [])

  const enableFallback = React.useCallback((reason: string) => {
    voiceFallbackManager.enableFallbackMode(reason)
  }, [])

  const disableFallback = React.useCallback(() => {
    voiceFallbackManager.disableFallbackMode()
  }, [])

  const handleVoiceError = React.useCallback((error: any) => {
    voiceFallbackManager.handleVoiceError(error)
  }, [])

  return {
    ...state,
    enableFallback,
    disableFallback,
    handleVoiceError,
    shouldUseTextInput: voiceFallbackManager.shouldUseTextInput(),
    shouldUseTextOutput: voiceFallbackManager.shouldUseTextOutput(),
    canRetryVoice: voiceFallbackManager.canRetryVoice()
  }
}

// Text input component for fallback mode
export interface TextInputFallbackProps {
  onSubmit: (text: string) => void
  placeholder?: string
  submitButtonText?: string
  disabled?: boolean
  className?: string
}

// Utility functions
export const handleVoiceError = (error: any): void => {
  voiceFallbackManager.handleVoiceError(error)
}

export const enableFallbackMode = (reason: string): void => {
  voiceFallbackManager.enableFallbackMode(reason)
}

export const shouldUseTextFallback = (): boolean => {
  return voiceFallbackManager.shouldUseTextInput()
}

export const getFallbackReason = (): string | null => {
  return voiceFallbackManager.getState().fallbackReason
}