// Speech Recognition API implementation for voice input
import { SPEECH_CONFIG, checkSpeechSupport } from './speech-config'

export interface SpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  lang?: string
  onResult?: (transcript: string, isFinal: boolean) => void
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: SpeechRecognitionErrorEvent) => void
  onNoMatch?: () => void
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export class VoiceRecognitionManager {
  private recognition: SpeechRecognition | null = null
  private isSupported: boolean = false
  private isListening: boolean = false
  private currentOptions: SpeechRecognitionOptions | null = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    const support = checkSpeechSupport()
    this.isSupported = support.recognition

    if (this.isSupported && typeof window !== 'undefined') {
      // Use webkit prefix for Safari/Chrome
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass()
        this.setupRecognition()
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    // Set default configuration
    this.recognition.continuous = SPEECH_CONFIG.recognition.continuous
    this.recognition.interimResults = SPEECH_CONFIG.recognition.interimResults
    this.recognition.lang = SPEECH_CONFIG.recognition.lang
    this.recognition.maxAlternatives = SPEECH_CONFIG.recognition.maxAlternatives

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true
      this.currentOptions?.onStart?.()
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Call result handler with appropriate transcript
      if (finalTranscript) {
        this.currentOptions?.onResult?.(finalTranscript.trim(), true)
      } else if (interimTranscript) {
        this.currentOptions?.onResult?.(interimTranscript.trim(), false)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.currentOptions?.onEnd?.()
    }

    this.recognition.onerror = (error: SpeechRecognitionErrorEvent) => {
      this.isListening = false
      this.currentOptions?.onError?.(error)
    }

    this.recognition.onnomatch = () => {
      this.currentOptions?.onNoMatch?.()
    }
  }

  public isVoiceRecognitionSupported(): boolean {
    return this.isSupported
  }

  public startListening(options: SpeechRecognitionOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.recognition) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      if (this.isListening) {
        reject(new Error('Already listening'))
        return
      }

      // Store options for event handlers
      this.currentOptions = options

      // Configure recognition with provided options
      if (options.continuous !== undefined) {
        this.recognition.continuous = options.continuous
      }
      if (options.interimResults !== undefined) {
        this.recognition.interimResults = options.interimResults
      }
      if (options.maxAlternatives !== undefined) {
        this.recognition.maxAlternatives = options.maxAlternatives
      }
      if (options.lang !== undefined) {
        this.recognition.lang = options.lang
      }

      try {
        this.recognition.start()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  public abortListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort()
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening
  }
}

// Singleton instance
export const voiceRecognition = new VoiceRecognitionManager()

// Utility functions for common use cases
export const startVoiceRecognition = async (
  onResult: (transcript: string, isFinal: boolean) => void,
  options?: Partial<SpeechRecognitionOptions>
): Promise<void> => {
  return voiceRecognition.startListening({
    onResult,
    ...options
  })
}

export const stopVoiceRecognition = (): void => {
  voiceRecognition.stopListening()
}

// Voice coaching specific function
export const startVoiceCoaching = async (
  onQuestion: (question: string) => void,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: SpeechRecognitionErrorEvent) => void
): Promise<void> => {
  return voiceRecognition.startListening({
    continuous: false, // Stop after each question
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        onQuestion(transcript.trim())
      }
    },
    onStart,
    onEnd,
    onError: (error) => {
      console.warn('Voice coaching recognition error:', error)
      onError?.(error)
    }
  })
}