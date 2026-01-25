'use client'

import React, { useState } from 'react'
import { VoiceCoachingInterface } from '@/components/unique-features/VoiceCoachingInterface'
import { VoiceHintProvider } from '@/components/unique-features/VoiceHintProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mic, Code, Brain, MessageSquare } from 'lucide-react'

export default function VoiceDemoPage() {
  const [userCode, setUserCode] = useState(`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`)
  
  const [errorCount, setErrorCount] = useState(0)
  const [lastError, setLastError] = useState<string>()
  const [voiceQuestions, setVoiceQuestions] = useState<string[]>([])
  const [coachingResponses, setCoachingResponses] = useState<string[]>([])

  const handleVoiceQuestion = (question: string) => {
    setVoiceQuestions(prev => [...prev, question])
  }

  const handleCoachingResponse = (response: string) => {
    setCoachingResponses(prev => [...prev, response])
  }

  const simulateError = () => {
    setErrorCount(prev => prev + 1)
    setLastError('SyntaxError: Unexpected token')
  }

  const clearCode = () => {
    setUserCode('')
    setErrorCount(0)
    setLastError(undefined)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Mic className="w-8 h-8" />
            Voice Coaching Demo
          </h1>
          <p className="text-muted-foreground">
            Test the AI voice coaching system with speech recognition and synthesis
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Code Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-40 p-3 font-mono text-sm border rounded-md bg-muted/50"
                placeholder="Write your code here..."
              />
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Errors: {errorCount}
                </Badge>
                {lastError && (
                  <Badge variant="destructive">
                    {lastError}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={simulateError} variant="outline" size="sm">
                  Simulate Error
                </Button>
                <Button onClick={clearCode} variant="outline" size="sm">
                  Clear Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Voice Coaching Interface */}
          <VoiceHintProvider
            code={userCode}
            language="javascript"
            challengeType="recursion"
            errorCount={errorCount}
            lastError={lastError}
          >
            <VoiceCoachingInterface
              userCode={userCode}
              context="fibonacci function implementation"
              onVoiceQuestion={handleVoiceQuestion}
              onCoachingResponse={handleCoachingResponse}
            />
          </VoiceHintProvider>
        </div>

        {/* Activity Log */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voice Questions Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Voice Questions ({voiceQuestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {voiceQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No voice questions yet. Try asking the AI coach something!
                  </p>
                ) : (
                  voiceQuestions.map((question, index) => (
                    <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                      {question}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coaching Responses Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Responses ({coachingResponses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {coachingResponses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No AI responses yet. The coach will respond to your questions.
                  </p>
                ) : (
                  coachingResponses.map((response, index) => (
                    <div key={index} className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                      {response}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Status */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Features Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-md">
                <h3 className="font-medium">Speech Recognition</h3>
                <Badge variant={typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) ? 'default' : 'secondary'}>
                  {typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>
              
              <div className="text-center p-4 border rounded-md">
                <h3 className="font-medium">Speech Synthesis</h3>
                <Badge variant={typeof window !== 'undefined' && 'speechSynthesis' in window ? 'default' : 'secondary'}>
                  {typeof window !== 'undefined' && 'speechSynthesis' in window ? 'Supported' : 'Not Supported'}
                </Badge>
              </div>
              
              <div className="text-center p-4 border rounded-md">
                <h3 className="font-medium">Voice Hints</h3>
                <Badge variant="default">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Voice Mode (if supported):</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Click "Start Voice Coaching"</li>
                  <li>• Allow microphone access</li>
                  <li>• Ask questions like "Help me debug this"</li>
                  <li>• Listen to AI responses</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Text Mode (fallback):</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Type questions in the text input</li>
                  <li>• Use quick suggestions</li>
                  <li>• View conversation history</li>
                  <li>• Try "Retry Voice" if available</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}