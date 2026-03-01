// Browser Speech API configuration (FREE APIs)

export const SPEECH_CONFIG = {
  recognition: {
    continuous: true,
    interimResults: true,
    lang: 'en-US',
    maxAlternatives: 1,
  },
  synthesis: {
    rate: 0.8,
    pitch: 1,
    volume: 1,
    lang: 'en-US',
  },
} as const

// Check browser support for Speech APIs
export function checkSpeechSupport() {
  if (typeof window === 'undefined') {
    return {
      recognition: false,
      synthesis: false,
      supported: false,
    }
  }

  const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  const hasSynthesis = 'speechSynthesis' in window

  return {
    recognition: hasRecognition,
    synthesis: hasSynthesis,
    supported: hasRecognition && hasSynthesis,
  }
}

// Check network connectivity
export function checkNetworkConnectivity(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

// Get available voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return []

  return speechSynthesis.getVoices().filter(voice =>
    voice.lang.startsWith('en')
  )
}