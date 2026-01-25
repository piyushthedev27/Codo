import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { VoiceRecognitionManager, startVoiceRecognition } from '../speech-recognition'

// Mock the Speech Recognition API
const mockSpeechRecognition = jest.fn().mockImplementation(() => ({
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  onstart: null,
  onresult: null,
  onend: null,
  onerror: null,
  onnomatch: null
}))

// Mock window objects
Object.defineProperty(window, 'SpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true
})

describe('VoiceRecognitionManager', () => {
  let manager: VoiceRecognitionManager
  let mockRecognitionInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: 'en-US',
      maxAlternatives: 1,
      start: jest.fn(),
      stop: jest.fn(),
      abort: jest.fn(),
      onstart: null,
      onresult: null,
      onend: null,
      onerror: null,
      onnomatch: null
    }
    mockSpeechRecognition.mockReturnValue(mockRecognitionInstance)
    manager = new VoiceRecognitionManager()
  })

  it('should initialize with browser support', () => {
    expect(manager.isVoiceRecognitionSupported()).toBe(true)
  })

  it('should start listening with default options', async () => {
    const onResult = jest.fn()
    
    // Mock successful start
    mockRecognitionInstance.start.mockImplementation(() => {
      setTimeout(() => mockRecognitionInstance.onstart?.(), 100)
    })

    await manager.startListening({ onResult })

    expect(mockRecognitionInstance.start).toHaveBeenCalled()
  })

  it('should handle recognition results', async () => {
    const onResult = jest.fn()
    
    mockRecognitionInstance.start.mockImplementation(() => {
      setTimeout(() => {
        mockRecognitionInstance.onstart?.()
        
        // Simulate recognition result
        const mockEvent = {
          resultIndex: 0,
          results: [{
            0: { transcript: 'Hello world', confidence: 0.9 },
            isFinal: true,
            length: 1
          }]
        }
        mockRecognitionInstance.onresult?.(mockEvent)
      }, 100)
    })

    await manager.startListening({ onResult })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(onResult).toHaveBeenCalledWith('Hello world', true)
  })

  it('should handle recognition errors', async () => {
    const onError = jest.fn()
    
    mockRecognitionInstance.start.mockImplementation(() => {
      setTimeout(() => {
        mockRecognitionInstance.onerror?.({ error: 'no-speech' })
      }, 100)
    })

    await manager.startListening({ onError })

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(onError).toHaveBeenCalledWith({ error: 'no-speech' })
  })

  it('should stop listening', () => {
    manager.stopListening()
    expect(mockRecognitionInstance.stop).toHaveBeenCalled()
  })

  it('should abort listening', () => {
    manager.abortListening()
    expect(mockRecognitionInstance.abort).toHaveBeenCalled()
  })

  it('should track listening state', async () => {
    expect(manager.isCurrentlyListening()).toBe(false)

    mockRecognitionInstance.start.mockImplementation(() => {
      setTimeout(() => mockRecognitionInstance.onstart?.(), 100)
    })

    await manager.startListening({})
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(manager.isCurrentlyListening()).toBe(true)
  })
})

describe('Utility functions', () => {
  let mockRecognitionInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: 'en-US',
      maxAlternatives: 1,
      start: jest.fn(),
      stop: jest.fn(),
      abort: jest.fn(),
      onstart: null,
      onresult: null,
      onend: null,
      onerror: null,
      onnomatch: null
    }
    mockSpeechRecognition.mockReturnValue(mockRecognitionInstance)
  })

  it('should start voice recognition using utility function', async () => {
    const onResult = jest.fn()
    
    mockRecognitionInstance.start.mockImplementation(() => {
      setTimeout(() => mockRecognitionInstance.onstart?.(), 100)
    })

    await startVoiceRecognition(onResult)
    expect(mockRecognitionInstance.start).toHaveBeenCalled()
  })
})