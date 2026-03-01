'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card as _Card, CardContent as _CardContent, CardHeader as _CardHeader, CardTitle as _CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Mic, MicOff, Volume2 as _Volume2, VolumeX as _VolumeX, Play as _Play, Pause as _Pause, Square } from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { voiceRecognition as _voiceRecognition, startVoiceCoaching, stopVoiceRecognition } from '@/lib/voice/speech-recognition'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { voiceSynthesis as _voiceSynthesis, speakCoachingResponse, stopSpeaking } from '@/lib/voice/speech-synthesis'
import { checkSpeechSupport } from '@/lib/voice/speech-config'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useVoiceFallback, handleVoiceError as _handleVoiceError } from '@/lib/voice/voice-fallback'
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_voiceSession, setVoiceSession] = useState<VoiceSession[]>([])
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
    _handleVoiceError: handleFallbackError,
    disableFallback
  } = useVoiceFallback()

  // Check browser support on mount
  useEffect(() => {
    const support = checkSpeechSupport()
    if (!support.supported) {
      handleFallbackError({ error: 'not-supported' })
    }
  }, [handleFallbackError])

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      // Network is back, clear error if it was a network error
      if (error?.includes('Network') || error?.includes('network')) {
        setError(null)
      }
    }

    const handleOffline = () => {
      // Don't set error - just trigger fallback mode
      // The TextInputFallback will show the reason
      handleFallbackError({ error: 'network' })
      if (isListening) {
        stopListening()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isListening, handleFallbackError])

  // Generate coaching response (Enhanced implementation)
  const generateCoachingResponse = useCallback(async (question: string): Promise<string> => {
    const question_lower = question.toLowerCase()

    // Check for specific code context if userCode is provided
    if (userCode && (question_lower.includes('code') || question_lower.includes('this'))) {
      if (userCode.includes('function') || userCode.includes('=>')) {
        return "I see a function here. It's well-structured, but make sure you handles edge cases like null or undefined inputs."
      }
      if (userCode.includes('const') || userCode.includes('let')) {
        return "You're using modern variable declarations. That's good practice for scoping and avoiding side effects."
      }
    }

    // Keyword-based responses with more helpful content
    const responses: Record<string, string> = {
      'for loop': "I notice you're asking about loops. In modern JavaScript, methods like .map(), .filter(), or .forEach() are often preferred over for loops for better readability and fewer side effects.",
      'async await': "Async/await is the gold standard for asynchronous code in JS. It makes your code look synchronous while remaining non-blocking. Remember to always wrap them in try/catch blocks!",
      'useState': "The useState hook is essential for reactive UIs. When you update state, React schedules a re-render of your component with the new value.",
      'function': "Functions are the building blocks of your app. Consider using arrow functions for simple logic and regular functions when you need the 'this' context.",
      'debug': "Debugging is 90% of coding! Use console.log() to track values, or better yet, use the browser's 'debugger' statement to pause execution.",
      'error': "Errors are just feedback! Try looking at the line number in the console - it usually points exactly to where the logic broke.",
      'help': "I'm your AI guide! You can ask me to 'explain this code', 'find bugs', or 'suggest improvements' based on what you've written so far.",
      'optimize': "Premature optimization is the root of all evil, but clean code isn't. Focus on making it work first, then we can look at reducing complexity.",
      'hint': "Here's a tip: break the problem down into smaller functions. Smaller parts are much easier to test and reason about.",
      'default': "That's a great question! Based on the lesson context, I'd suggest focusing on the core concepts first. Is there a specific part of the code you'd like me to explain?"
    }

    for (const [keyword, response] of Object.entries(responses)) {
      if (question_lower.includes(keyword)) {
        return response
      }
    }

     
    return responses.default
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCode, context])

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

          // For network errors, don't show error - just switch to text mode silently
          // The TextInputFallback component will show the reason
          if (error.error !== 'network') {
            setError(`Voice recognition error: ${error.error}`)
          }

          handleFallbackError(error)
        }
      )
    } catch (error) {
      // Don't show error for network issues - fallback handles it
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('network') && !errorMessage.includes('internet')) {
        setError('Failed to start voice recognition')
      }
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
    <div className={`voice-coaching-interface bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-700/50 overflow-hidden flex flex-col h-full ${className}`}>
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-5 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Mic className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-white tracking-tight">AI Voice Coaching</h3>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Your Personalized Tutor</p>
            </div>
          </div>
          {fallbackMode && (
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-400 border-amber-500/20">
              Text-Only Mode
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
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
            <p className="text-sm font-medium">You&apos;re saying:</p>
            <p className="text-sm">{currentTranscript}</p>
          </div>
        )}

        {/* Error Display - only show for non-network errors */}
        {error && !shouldUseTextInput && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Voice Session History (Redesigned) */}
        {conversation.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Session History</h4>
              <span className="text-[10px] font-bold text-slate-500">Last {Math.min(conversation.length, 6)} messages</span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {conversation.slice(-6).map((entry) => (
                <div key={entry.id} className={`flex flex-col ${entry.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${entry.type === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                    }`}>
                    <p>{entry.content}</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 mt-1.5 px-1 uppercase letter-spacing-widest">
                    {entry.type === 'user' ? 'You' : 'Coach'} • {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips (Integrated) */}
        <div className="p-4 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl border border-blue-500/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-300">Coaching Tips</h4>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed font-medium">
            <li className="flex items-center gap-2">
              <span className="text-blue-500/50">•</span> Ask specific questions about your code
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500/50">•</span> Say &quot;help&quot; for general guidance
                 </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500/50">•</span> Mention error messages for debugging help
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500/50">•</span> Explore best practices and optimization
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}