// Speech Synthesis API implementation for voice responses
import { SPEECH_CONFIG, checkSpeechSupport, getAvailableVoices } from './speech-config'

export interface SpeechSynthesisOptions {
  text: string
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: SpeechSynthesisErrorEvent) => void
}

export class VoiceSynthesisManager {
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSupported: boolean = false
  private availableVoices: SpeechSynthesisVoice[] = []

  constructor() {
    this.initialize()
  }

  private initialize() {
    const support = checkSpeechSupport()
    this.isSupported = support.synthesis

    if (this.isSupported && typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis
      this.loadVoices()
      
      // Listen for voices changed event (some browsers load voices asynchronously)
      if (this.synthesis) {
        this.synthesis.addEventListener('voiceschanged', () => {
          this.loadVoices()
        })
      }
    }
  }

  private loadVoices() {
    this.availableVoices = getAvailableVoices()
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices
  }

  public isVoiceSynthesisSupported(): boolean {
    return this.isSupported
  }

  public speak(options: SpeechSynthesisOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.synthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Stop any current speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(options.text)
      
      // Configure utterance
      utterance.rate = options.rate ?? SPEECH_CONFIG.synthesis.rate
      utterance.pitch = options.pitch ?? SPEECH_CONFIG.synthesis.pitch
      utterance.volume = options.volume ?? SPEECH_CONFIG.synthesis.volume
      utterance.lang = SPEECH_CONFIG.synthesis.lang

      // Set voice if provided
      if (options.voice) {
        utterance.voice = options.voice
      } else if (this.availableVoices.length > 0) {
        // Use first available English voice
        utterance.voice = this.availableVoices[0]
      }

      // Set up event handlers
      utterance.onstart = () => {
        options.onStart?.()
      }

      utterance.onend = () => {
        this.currentUtterance = null
        options.onEnd?.()
        resolve()
      }

      utterance.onerror = (error) => {
        this.currentUtterance = null
        options.onError?.(error)
        reject(error)
      }

      // Store current utterance and speak
      this.currentUtterance = utterance
      this.synthesis.speak(utterance)
    })
  }

  public stop(): void {
    if (this.synthesis && this.currentUtterance) {
      this.synthesis.cancel()
      this.currentUtterance = null
    }
  }

  public pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  public resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  public isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false
  }

  public isPaused(): boolean {
    return this.synthesis?.paused ?? false
  }
}

// Singleton instance
export const voiceSynthesis = new VoiceSynthesisManager()

// Utility functions for common use cases
export const speakText = async (text: string, options?: Partial<SpeechSynthesisOptions>): Promise<void> => {
  return voiceSynthesis.speak({ text, ...options })
}

export const speakCoachingResponse = async (
  response: string, 
  onStart?: () => void, 
  onEnd?: () => void
): Promise<void> => {
  return voiceSynthesis.speak({
    text: response,
    rate: 0.9, // Slightly slower for coaching
    onStart,
    onEnd,
    onError: (error) => {
      console.warn('Voice coaching synthesis error:', error)
    }
  })
}

export const stopSpeaking = (): void => {
  voiceSynthesis.stop()
}