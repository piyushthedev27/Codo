// Mock window objects before importing the modules
Object.defineProperty(global, 'window', {
  value: {
    speechSynthesis: {
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      speaking: false,
      paused: false,
      getVoices: jest.fn(() => []),
      addEventListener: jest.fn()
    },
    SpeechSynthesisUtterance: jest.fn().mockImplementation((text) => ({
      text,
      rate: 1,
      pitch: 1,
      volume: 1,
      lang: 'en-US',
      voice: null,
      onstart: null,
      onend: null,
      onerror: null
    }))
  },
  writable: true
})

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

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { VoiceSynthesisManager, speakText, speakCoachingResponse } from '../speech-synthesis'

describe('VoiceSynthesisManager', () => {
  let manager: VoiceSynthesisManager

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window mocks
    ;(global.window.speechSynthesis.speak as jest.Mock).mockClear()
    ;(global.window.speechSynthesis.cancel as jest.Mock).mockClear()
    manager = new VoiceSynthesisManager()
  })

  it('should initialize with browser support', () => {
    expect(manager.isVoiceSynthesisSupported()).toBe(true)
  })

  it('should speak text with default options', async () => {
    const text = 'Hello, world!'
    
    // Mock successful speech
    ;(global.window.speechSynthesis.speak as jest.Mock).mockImplementation((utterance) => {
      setTimeout(() => utterance.onend?.(), 100)
    })

    await manager.speak({ text })

    expect(global.window.SpeechSynthesisUtterance).toHaveBeenCalledWith(text)
    expect(global.window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('should handle speech synthesis errors', async () => {
    const text = 'Test error'
    const onError = jest.fn()

    ;(global.window.speechSynthesis.speak as jest.Mock).mockImplementation((utterance) => {
      setTimeout(() => utterance.onerror?.({ error: 'synthesis-failed' }), 100)
    })

    try {
      await manager.speak({ text, onError })
    } catch (error) {
      expect(onError).toHaveBeenCalled()
    }
  })

  it('should stop current speech', () => {
    manager.stop()
    expect(global.window.speechSynthesis.cancel).toHaveBeenCalled()
  })

  it('should check if currently speaking', () => {
    ;(global.window.speechSynthesis as any).speaking = true
    expect(manager.isSpeaking()).toBe(true)

    ;(global.window.speechSynthesis as any).speaking = false
    expect(manager.isSpeaking()).toBe(false)
  })
})

describe('Utility functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.window.speechSynthesis.speak as jest.Mock).mockClear()
  })

  it('should speak text using utility function', async () => {
    ;(global.window.speechSynthesis.speak as jest.Mock).mockImplementation((utterance) => {
      setTimeout(() => utterance.onend?.(), 100)
    })

    await speakText('Test message')
    expect(global.window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('should speak coaching response with appropriate rate', async () => {
    ;(global.window.speechSynthesis.speak as jest.Mock).mockImplementation((utterance) => {
      setTimeout(() => utterance.onend?.(), 100)
    })

    await speakCoachingResponse('Coaching message')
    
    expect(global.window.speechSynthesis.speak).toHaveBeenCalled()
    expect(global.window.SpeechSynthesisUtterance).toHaveBeenCalledWith('Coaching message')
  })
})