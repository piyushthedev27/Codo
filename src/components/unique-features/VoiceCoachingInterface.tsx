'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Square } from 'lucide-react'
import { voiceRecognition, startVoiceCoaching, stopVoiceRecognition } from '@/lib/voice/speech-recognition'
import { voiceSynthesis, speakCoachingResponse, stopSpeaking } from '@/lib/voice/speech-synthesis'
import { checkSpeechSupport } from '@/lib/voice/speech-config'
import { useVoiceFallback, handleVoiceError } from '@/lib/voice/voice-fallback'
import { TextInputFallback, ConversationEntry } from './TextInputFallback'

interface VoiceCoachingInterfaceProps {
  userCode?: string
  context?: string
  onVoiceQuestion?: (question: string) => void
  onCoachingResponse?: (response: string) => void
  className?: string
}

interface VoiceSession {
  id: string
  timestamp: Date
  userQuestion: string
  aiResponse: string
  confidence: number
}

export function VoiceCoachingInterface({
  userCode = '',
  context = '',
  onVoiceQuestion,
  onCoachingResponse,
  className = ''
}: VoiceCoachingInterfaceProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [voiceSession, setVoiceSession] = useState<VoiceSession[]>([])
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationEntry[]>([])

  // Use voice fallback hook
  const {
    fallbackMode,
    fallbackReason,
    voiceRecognitionAvailable,
    voiceSynthesisAvailable,
    shouldUseTextInput,
    shouldUseTextOutput,
    canRetryVoice,
    handleVoiceError: handleFallbackError,
    disableFallback
  } = useVoiceFallback()

  // Check browser support on mount
  useEffect(() => {
    const support = checkSpeechSupport()
    if (!support.supported) {
      handleFallbackError({ error: 'not-supported' })
    }
  }, [])

  // Generate coaching response (mock implementation)
  const generateCoachingResponse = useCallback(async (question: string): Promise<string> => {
    // Mock responses based on common coding questions
    const responses: Record<string, string> = {
      'for loop': "I notice you're using a for loop here. Have you considered using the map method instead? It's more functional and readable.",
      'async await': "Great use of async/await! This makes your asynchronous code much more readable than promise chains.",
      'useState': "Perfect! useState is the right hook for managing component state. Remember it returns an array with the current value and setter function.",
      'function': "That's a good function structure. Consider adding type annotations if you're using TypeScript for better code clarity.",
      'error': "I see you're dealing with an error. Let's break this down step by step. What specific error message are you seeing?",
      'help': "I'm here to help! Can you tell me what specific part of your code you're struggling with?",
      'default': "That's an interesting approach! Let me help you optimize this code. What specific outcome are you trying to achieve?"
    }

    // Simple keyword matching for demo
    const question_lower = question.toLowerCase()
    for (const [keyword, response] of Object.entries(responses)) {
      if (question_lower.includes(keyword)) {
        return response
      }
    }

    return responses.default
  }, [])

  // Handle voice question
  const handleVoiceQuestion = useCallback(async (question: string) => {
    try {
      setError(null)
      onVoiceQuestion?.(question)

      // Add user message to conversation
      const userEntry: ConversationEntry = {
        id: `user_${Date.now()}`,
        timestamp: new Date(),
        type: 'user',
        content: question
      }
      setConversation(prev => [...prev, userEntry])

      // Generate AI response
      const response = await generateCoachingResponse(question)
      
      // Add AI response to conversation
      const aiEntry: ConversationEntry = {
        id: `ai_${Date.now()}`,
        timestamp: new Date(),
        type: 'assistant',
        content: response
      }
      setConversation(prev => [...prev, aiEntry])

      // Add to session history
      const newSession: VoiceSession = {
        id: Date.now().toString(),
        timestamp: new Date(),
        userQuestion: question,
        aiResponse: response,
        confidence: 0.9 // Mock confidence
      }
      
      setVoiceSession(prev => [...prev, newSession])
      onCoachingResponse?.(response)

      // Speak the response if voice synthesis is available
      if (voiceSynthesisAvailable && !shouldUseTextOutput) {
        setIsSpeaking(true)
        await speakCoachingResponse(
          response,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        )
      }
    } catch (error) {
      console.error('Voice coaching error:', error)
      setError('Failed to process question')
      handleFallbackError(error)
    }
  }, [generateCoachingResponse, voiceSynthesisAvailable, shouldUseTextOutput, onVoiceQuestion, onCoachingResponse, handleFallbackError])

  // Start listening
  const startListening = useCallback(async () => {
    if (!voiceRecognitionAvailable) {
      handleFallbackError({ error: 'not-supported' })
      return
    }

    try {
      setError(null)
      await startVoiceCoaching(
        handleVoiceQuestion,
        () => {
          setIsListening(true)
          setCurrentTranscript('')
        },
        () => {
          setIsListening(false)
          setCurrentTranscript('')
        },
        (error) => {
          setIsListening(false)
          setError(`Voice recognition error: ${error.error}`)
          handleFallbackError(error)
        }
      )
    } catch (error) {
      setError('Failed to start voice recognition')
      handleFallbackError(error)
    }
  }, [voiceRecognitionAvailable, handleVoiceQuestion, handleFallbackError])

  // Stop listening
  const stopListening = useCallback(() => {
    stopVoiceRecognition()
    setIsListening(false)
    setCurrentTranscript('')
  }, [])

  // Stop speaking
  const stopSpeakingHandler = useCallback(() => {
    stopSpeaking()
    setIsSpeaking(false)
  }, [])

  // Fallback text input handler
  const handleTextSubmit = useCallback(async (text: string) => {
    await handleVoiceQuestion(text)
  }, [handleVoiceQuestion])

  // Retry voice functionality
  const retryVoice = useCallback(() => {
    disableFallback()
    setError(null)
  }, [disableFallback])

  return (
    <Card className={`voice-coaching-interface ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          AI Voice Coaching
          {fallbackMode && (
            <Badge variant="secondary">Text Mode</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voice Controls or Text Fallback */}
        {shouldUseTextInput ? (
          <TextInputFallback
            onSubmit={handleTextSubmit}
            placeholder="Type your coding question here..."
            submitButtonText="Ask Coach"
            fallbackReason={fallbackReason}
            onRetryVoice={canRetryVoice ? retryVoice : undefined}
            canRetryVoice={canRetryVoice}
            disabled={isSpeaking}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              size="sm"
              disabled={isSpeaking}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Voice Coaching
                </>
              )}
            </Button>

            {isSpeaking && (
              <Button
                onClick={stopSpeakingHandler}
                variant="outline"
                size="sm"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Speaking
              </Button>
            )}

            {isListening && (
              <Badge variant="default" className="animate-pulse">
                Listening...
              </Badge>
            )}

            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                Speaking...
              </Badge>
            )}
          </div>
        )}

        {/* Current Transcript */}
        {currentTranscript && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">You're saying:</p>
            <p className="text-sm">{currentTranscript}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Voice Session History */}
        {conversation.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Coaching Session</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {conversation.slice(-6).map((entry) => (
                <div key={entry.id} className={`flex gap-2 ${
                  entry.type === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`max-w-[80%] p-2 rounded-md text-sm ${
                    entry.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p>{entry.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
          <h4 className="text-sm font-medium mb-2">💡 Voice Coaching Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Ask specific questions about your code</li>
            <li>• Say "help" for general guidance</li>
            <li>• Mention error messages for debugging help</li>
            <li>• Ask about best practices and optimization</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}