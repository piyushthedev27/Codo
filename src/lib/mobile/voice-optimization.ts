/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mobile Voice Optimization Utilities
 * Provides enhanced voice features for mobile browsers
 */

import { voiceRecognition } from '@/lib/voice/speech-recognition'
import { voiceSynthesis } from '@/lib/voice/speech-synthesis'
import { voiceFallbackManager } from '@/lib/voice/voice-fallback'

export interface MobileVoiceConfig {
  enableWakeWord?: boolean
  wakeWord?: string
  autoStart?: boolean
  backgroundMode?: boolean
  batteryOptimization?: boolean
  networkOptimization?: boolean
}

export interface MobileVoiceCapabilities {
  speechRecognition: boolean
  speechSynthesis: boolean
  continuousRecognition: boolean
  interimResults: boolean
  voiceList: SpeechSynthesisVoice[]
  networkStatus: 'online' | 'offline' | 'slow'
  batteryLevel?: number
  batteryCharging?: boolean
}

export class MobileVoiceOptimizer {
  private config: Required<MobileVoiceConfig>
  private capabilities: MobileVoiceCapabilities | null = null
  private isListening: boolean = false
  private wakeWordDetected: boolean = false
  private networkMonitor: any = null
  private batteryMonitor: any = null

  constructor(config: MobileVoiceConfig = {}) {
    this.config = {
      enableWakeWord: false,
      wakeWord: 'hey codo',
      autoStart: false,
      backgroundMode: false,
      batteryOptimization: true,
      networkOptimization: true,
      ...config
    }

    this.initializeCapabilities()
    this.setupNetworkMonitoring()
    this.setupBatteryMonitoring()
  }

  /**
   * Get mobile voice capabilities
   */
  public async getCapabilities(): Promise<MobileVoiceCapabilities> {
    if (!this.capabilities) {
      await this.initializeCapabilities()
    }
    return this.capabilities!
  }

  /**
   * Start optimized voice recognition for mobile
   */
  public async startVoiceRecognition(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      const capabilities = await this.getCapabilities()

      if (!capabilities.speechRecognition) {
        throw new Error('Speech recognition not supported on this device')
      }

      // Check battery level if optimization is enabled
      if (this.config.batteryOptimization && capabilities.batteryLevel && capabilities.batteryLevel < 20) {
        console.warn('Low battery detected, using power-saving voice mode')
        return this.startPowerSavingMode(onResult, onError)
      }

      // Check network status
      if (this.config.networkOptimization && capabilities.networkStatus === 'slow') {
        console.warn('Slow network detected, optimizing voice recognition')
        return this.startNetworkOptimizedMode(onResult, onError)
      }

      // Start normal voice recognition
      await voiceRecognition.startListening({
        continuous: true,
        interimResults: true,
        onResult: (transcript, isFinal) => {
          if (this.config.enableWakeWord && !this.wakeWordDetected) {
            if (transcript.toLowerCase().includes(this.config.wakeWord.toLowerCase())) {
              this.wakeWordDetected = true
              this.provideFeedback('wake-word-detected')
              return
            }
          } else {
            onResult(transcript, isFinal)
          }
        },
        onError: (error) => {
          this.handleVoiceError(error, onError)
        },
        onEnd: () => {
          this.isListening = false
          if (this.config.autoStart) {
            // Restart after a short delay
            setTimeout(() => {
              this.startVoiceRecognition(onResult, onError)
            }, 1000)
          }
        }
      })

      this.isListening = true
    } catch (error) {
      this.handleVoiceError(error, onError)
    }
  }

  /**
   * Stop voice recognition
   */
  public stopVoiceRecognition(): void {
    voiceRecognition.stopListening()
    this.isListening = false
    this.wakeWordDetected = false
  }

  /**
   * Speak text with mobile optimizations
   */
  public async speakText(
    text: string,
    options?: {
      priority?: 'high' | 'normal' | 'low'
      interrupt?: boolean
      rate?: number
      pitch?: number
    }
  ): Promise<void> {
    try {
      const capabilities = await this.getCapabilities()

      if (!capabilities.speechSynthesis) {
        throw new Error('Speech synthesis not supported on this device')
      }

      // Apply mobile-specific optimizations
      const optimizedOptions = this.optimizeSpeechOptions(text, options)

      // Check if we should interrupt current speech
      if (options?.interrupt && voiceSynthesis.isSpeaking()) {
        voiceSynthesis.stop()
      }

      // Queue speech if battery is low
      if (this.config.batteryOptimization && capabilities.batteryLevel && capabilities.batteryLevel < 15) {
        console.warn('Very low battery, queuing speech')
        return this.queueSpeech(text, optimizedOptions)
      }

      await voiceSynthesis.speak({
        text,
        ...optimizedOptions,
        onStart: () => {
          this.provideFeedback('speech-start')
        },
        onEnd: () => {
          this.provideFeedback('speech-end')
        },
        onError: (error) => {
          console.error('Speech synthesis error:', error)
          voiceFallbackManager.handleVoiceError(error)
        }
      })
    } catch (error) {
      console.error('Mobile speech error:', error)
      voiceFallbackManager.handleVoiceError(error)
    }
  }

  /**
   * Test voice features on mobile device
   */
  public async testVoiceFeatures(): Promise<{
    recognition: boolean
    synthesis: boolean
    continuousRecognition: boolean
    voiceCount: number
    errors: string[]
  }> {
    const results = {
      recognition: false,
      synthesis: false,
      continuousRecognition: false,
      voiceCount: 0,
      errors: [] as string[]
    }

    try {
      // Test speech recognition
      if (voiceRecognition.isVoiceRecognitionSupported()) {
        results.recognition = true

        // Test continuous recognition
        try {
          await voiceRecognition.startListening({
            continuous: true,
            onResult: () => { },
            onError: (error) => {
              results.errors.push(`Recognition error: ${error.error}`)
            }
          })
          results.continuousRecognition = true
          voiceRecognition.stopListening()
        } catch (error) {
          results.errors.push(`Continuous recognition failed: ${error}`)
        }
      } else {
        results.errors.push('Speech recognition not supported')
      }

      // Test speech synthesis
      if (voiceSynthesis.isVoiceSynthesisSupported()) {
        results.synthesis = true
        results.voiceCount = voiceSynthesis.getAvailableVoices().length

        // Test synthesis with short phrase
        try {
          await voiceSynthesis.speak({
            text: 'Test',
            volume: 0.1, // Very quiet for testing
            onError: (error) => {
              results.errors.push(`Synthesis error: ${error}`)
            }
          })
        } catch (error) {
          results.errors.push(`Synthesis test failed: ${error}`)
        }
      } else {
        results.errors.push('Speech synthesis not supported')
      }
    } catch (error) {
      results.errors.push(`General test error: ${error}`)
    }

    return results
  }

  /**
   * Get mobile-specific voice recommendations
   */
  public getMobileVoiceRecommendations(): {
    recognition: string[]
    synthesis: string[]
    general: string[]
  } {
    const capabilities = this.capabilities
    const recommendations = {
      recognition: [] as string[],
      synthesis: [] as string[],
      general: [] as string[]
    }

    if (!capabilities) {
      recommendations.general.push('Initialize voice capabilities first')
      return recommendations
    }

    // Recognition recommendations
    if (!capabilities.speechRecognition) {
      recommendations.recognition.push('Speech recognition not supported - use text input fallback')
    } else {
      if (!capabilities.continuousRecognition) {
        recommendations.recognition.push('Use push-to-talk mode instead of continuous listening')
      }
      if (!capabilities.interimResults) {
        recommendations.recognition.push('Interim results not supported - provide loading indicators')
      }
    }

    // Synthesis recommendations
    if (!capabilities.speechSynthesis) {
      recommendations.synthesis.push('Speech synthesis not supported - use text output only')
    } else {
      if (capabilities.voiceList.length === 0) {
        recommendations.synthesis.push('No voices available - check browser settings')
      } else if (capabilities.voiceList.length < 3) {
        recommendations.synthesis.push('Limited voice options - consider fallback voices')
      }
    }

    // General recommendations
    if (capabilities.networkStatus === 'offline') {
      recommendations.general.push('Offline mode - use cached responses only')
    } else if (capabilities.networkStatus === 'slow') {
      recommendations.general.push('Slow network - reduce voice data usage')
    }

    if (capabilities.batteryLevel && capabilities.batteryLevel < 20) {
      recommendations.general.push('Low battery - enable power saving mode')
    }

    return recommendations
  }

  private async initializeCapabilities(): Promise<void> {
    const speechRecognition = voiceRecognition.isVoiceRecognitionSupported()
    const speechSynthesis = voiceSynthesis.isVoiceSynthesisSupported()
    const voiceList = speechSynthesis ? voiceSynthesis.getAvailableVoices() : []

    // Test continuous recognition
    let continuousRecognition = false
    let interimResults = false

    if (speechRecognition) {
      try {
        // Quick test for continuous recognition support
        continuousRecognition = true // Assume supported, will be tested in actual usage
        interimResults = true // Assume supported, will be tested in actual usage
      } catch (error) {
        console.warn('Could not test continuous recognition:', error)
      }
    }

    this.capabilities = {
      speechRecognition,
      speechSynthesis,
      continuousRecognition,
      interimResults,
      voiceList,
      networkStatus: this.getNetworkStatus(),
      batteryLevel: await this.getBatteryLevel(),
      batteryCharging: await this.getBatteryCharging()
    }
  }

  private async startPowerSavingMode(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    // Use shorter listening sessions to save battery
    await voiceRecognition.startListening({
      continuous: false, // Disable continuous mode
      interimResults: false, // Disable interim results
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          onResult(transcript, isFinal)
          // Restart listening after processing
          setTimeout(() => {
            this.startPowerSavingMode(onResult, onError)
          }, 500)
        }
      },
      onError: (error) => {
        this.handleVoiceError(error, onError)
      }
    })
  }

  private async startNetworkOptimizedMode(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    // Use local processing when possible, reduce network calls
    await voiceRecognition.startListening({
      continuous: true,
      interimResults: false, // Reduce network traffic
      onResult: (transcript, isFinal) => {
        if (isFinal && transcript.trim().length > 3) { // Only process meaningful input
          onResult(transcript, isFinal)
        }
      },
      onError: (error) => {
        this.handleVoiceError(error, onError)
      }
    })
  }

  private optimizeSpeechOptions(text: string, options?: any): any {
    const capabilities = this.capabilities
    if (!capabilities) return options

    const optimized = { ...options }

    // Adjust rate for mobile
    if (!optimized.rate) {
      optimized.rate = 0.9 // Slightly slower for mobile
    }

    // Choose best voice for mobile
    if (!optimized.voice && capabilities.voiceList.length > 0) {
      // Prefer local voices over network voices
      const localVoices = capabilities.voiceList.filter(voice => voice.localService)
      optimized.voice = localVoices.length > 0 ? localVoices[0] : capabilities.voiceList[0]
    }

    // Adjust volume based on battery
    if (capabilities.batteryLevel && capabilities.batteryLevel < 30) {
      optimized.volume = Math.min(optimized.volume || 1, 0.8)
    }

    return optimized
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async queueSpeech(text: string, _options: any): Promise<void> {
    // Simple queue implementation for low battery mode
    console.log('Queuing speech for low battery mode:', text)
    // In a real implementation, this would queue the speech for later
  }

  private handleVoiceError(error: any, onError?: (error: any) => void): void {
    console.error('Mobile voice error:', error)

    // Handle mobile-specific errors
    if (error?.error === 'not-allowed') {
      voiceFallbackManager.enableFallbackMode('Microphone permission denied. Please enable microphone access in browser settings.')
    } else if (error?.error === 'network') {
      voiceFallbackManager.enableFallbackMode('Network error. Voice features may be limited in offline mode.')
    } else {
      voiceFallbackManager.handleVoiceError(error)
    }

    onError?.(error)
  }

  private provideFeedback(type: string): void {
    // Provide haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      switch (type) {
        case 'wake-word-detected':
          navigator.vibrate([50, 50, 50])
          break
        case 'speech-start':
          navigator.vibrate(10)
          break
        case 'speech-end':
          navigator.vibrate(20)
          break
      }
    }
  }

  private setupNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.networkMonitor = () => {
        if (this.capabilities) {
          this.capabilities.networkStatus = this.getNetworkStatus()
        }
      }
      connection.addEventListener('change', this.networkMonitor)
    }
  }

  private setupBatteryMonitoring(): void {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.batteryMonitor = () => {
          if (this.capabilities) {
            this.capabilities.batteryLevel = battery.level * 100
            this.capabilities.batteryCharging = battery.charging
          }
        }
        battery.addEventListener('levelchange', this.batteryMonitor)
        battery.addEventListener('chargingchange', this.batteryMonitor)
      })
    }
  }

  private getNetworkStatus(): 'online' | 'offline' | 'slow' {
    if (!navigator.onLine) return 'offline'

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        return 'slow'
      }
    }

    return 'online'
  }

  private async getBatteryLevel(): Promise<number | undefined> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        return battery.level * 100
      } catch (error) {
        console.warn('Could not get battery level:', error)
      }
    }
    return undefined
  }

  private async getBatteryCharging(): Promise<boolean | undefined> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        return battery.charging
      } catch (error) {
        console.warn('Could not get battery charging status:', error)
      }
    }
    return undefined
  }
}

/**
 * React hook for mobile voice optimization
 */
export function useMobileVoice(config?: MobileVoiceConfig) {
  const optimizer = new MobileVoiceOptimizer(config)

  return {
    getCapabilities: optimizer.getCapabilities.bind(optimizer),
    startVoiceRecognition: optimizer.startVoiceRecognition.bind(optimizer),
    stopVoiceRecognition: optimizer.stopVoiceRecognition.bind(optimizer),
    speakText: optimizer.speakText.bind(optimizer),
    testVoiceFeatures: optimizer.testVoiceFeatures.bind(optimizer),
    getMobileVoiceRecommendations: optimizer.getMobileVoiceRecommendations.bind(optimizer)
  }
}

/**
 * Utility to detect mobile voice support
 */
export function getMobileVoiceSupport(): {
  recognition: boolean
  synthesis: boolean
  continuous: boolean
  offline: boolean
} {
  const isWebKit = /webkit/i.test(navigator.userAgent)
  const isChrome = /chrome/i.test(navigator.userAgent)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _isSafari = /safari/i.test(navigator.userAgent) && !isChrome
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _isFirefox = /firefox/i.test(navigator.userAgent)

  return {
    recognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    synthesis: !!window.speechSynthesis,
    continuous: isChrome || isWebKit, // Chrome and WebKit support continuous recognition
    offline: false // Most mobile browsers require network for speech recognition
  }
}