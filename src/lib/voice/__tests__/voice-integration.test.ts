import { describe, it, expect, jest } from '@jest/globals'

// Mock speech config
jest.mock('../speech-config', () => ({
  SPEECH_CONFIG: {
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
  },
  checkSpeechSupport: jest.fn(() => ({
    recognition: true,
    synthesis: true,
    supported: true,
  })),
  getAvailableVoices: jest.fn(() => [])
}))

describe('Voice Integration', () => {
  it('should export voice synthesis functions', () => {
    const { VoiceSynthesisManager, speakText } = require('../speech-synthesis')
    expect(VoiceSynthesisManager).toBeDefined()
    expect(speakText).toBeDefined()
  })

  it('should export voice recognition functions', () => {
    const { VoiceRecognitionManager, startVoiceRecognition } = require('../speech-recognition')
    expect(VoiceRecognitionManager).toBeDefined()
    expect(startVoiceRecognition).toBeDefined()
  })

  it('should export voice hints functions', () => {
    const { voiceHintsManager, analyzeCodeForHints } = require('../voice-hints')
    expect(voiceHintsManager).toBeDefined()
    expect(analyzeCodeForHints).toBeDefined()
  })

  it('should export voice fallback functions', () => {
    const { voiceFallbackManager, handleVoiceError } = require('../voice-fallback')
    expect(voiceFallbackManager).toBeDefined()
    expect(handleVoiceError).toBeDefined()
  })

  it('should have proper TypeScript types', () => {
    const speechSynthesis = require('../speech-synthesis')
    const speechRecognition = require('../speech-recognition')
    
    expect(typeof speechSynthesis.VoiceSynthesisManager).toBe('function')
    expect(typeof speechRecognition.VoiceRecognitionManager).toBe('function')
  })
})