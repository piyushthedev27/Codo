/* eslint-disable react/jsx-no-comment-textnodes, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mistake Analyzer Component
 * 
 * This component demonstrates the error parsing and mistake-driven learning system.
 * It allows users to input code errors and see how the system analyzes and responds.
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
 
import { Progress as _Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
   
  TrendingDown as _TrendingDown, 
  BookOpen,
  Target,
  Lightbulb,
  Code,
  Brain
} from 'lucide-react'

interface ParsedError {
  id: string
  originalError: string
  errorType: string
  category: string
  severity: 'low' | 'medium' | 'high'
  language: string
  suggestion: string
  microLessonNeeded: boolean
  relatedConcepts: string[]
  commonMistake: boolean
}

 
interface MistakePattern {
  id: string
  errorType: string
  frequency: number
  resolved: boolean
  lastOccurrence: Date
}

 
interface MicroLesson {
  id: string
  title: string
  duration: number
  difficulty: string
  xpReward: number
}

interface LearningRecommendation {
  title: string
  type: string
  priority: string
  estimatedDuration: number
}

export default function MistakeAnalyzer() {
  const [errorInput, setErrorInput] = useState('')
  const [codeContext, setCodeContext] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [mistakeHistory, setMistakeHistory] = useState<ParsedError[]>([])

  // Demo error examples
  const demoErrors = [
    {
      error: "ReferenceError: userName is not defined",
      code: "console.log(userName);\nlet userName = 'John';",
      language: "javascript"
    },
    {
      error: "TypeError: Cannot read property 'map' of undefined",
      code: "let items;\nconst doubled = items.map(x => x * 2);",
      language: "javascript"
    },
    {
      error: "SyntaxError: await is only valid in async function",
      code: "function fetchData() {\n  const data = await fetch('/api/data');\n  return data;\n}",
      language: "javascript"
    },
    {
      error: "IndentationError: expected an indented block",
      code: "if x > 5:\nprint('Greater than 5')",
      language: "python"
    }
  ]

  const analyzeError = async () => {
    if (!errorInput.trim()) return

    setIsAnalyzing(true)
    
    try {
      // Simulate API call to analyze mistake
      const response = await fetch('/api/mistakes/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorMessage: errorInput,
          codeContext: codeContext,
          language: language
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResult(result.data)
        
        // Add to mistake history
        if (result.data.parsedError) {
          setMistakeHistory(prev => [result.data.parsedError, ...prev.slice(0, 4)])
        }
      } else {
        // Fallback to demo analysis for showcase
        const demoResult = generateDemoAnalysis(errorInput, codeContext, language)
        setAnalysisResult(demoResult)
        setMistakeHistory(prev => [demoResult.parsedError, ...prev.slice(0, 4)])
      }
    } catch (error) {
      console.error('Error analyzing mistake:', error)
      // Fallback to demo analysis
      const demoResult = generateDemoAnalysis(errorInput, codeContext, language)
      setAnalysisResult(demoResult)
      setMistakeHistory(prev => [demoResult.parsedError, ...prev.slice(0, 4)])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateDemoAnalysis = (error: string, code: string, lang: string) => {
    // Demo analysis for showcase purposes
    const isReferenceError = error.toLowerCase().includes('referenceerror')
    const isTypeError = error.toLowerCase().includes('typeerror')
    const isSyntaxError = error.toLowerCase().includes('syntaxerror')
    
    let category = 'LOGIC_ERROR'
    let severity: 'low' | 'medium' | 'high' = 'medium'
    let suggestion = 'Review your code logic and syntax.'
    
    if (isReferenceError) {
      category = 'REFERENCE_ERROR'
      severity = 'high'
      suggestion = 'Make sure the variable or function is declared before using it.'
    } else if (isTypeError) {
      category = 'TYPE_ERROR'
      severity = 'medium'
      suggestion = 'Check if the object exists and is not null or undefined before accessing its properties.'
    } else if (isSyntaxError) {
      category = 'SYNTAX_ERROR'
      severity = 'high'
      suggestion = 'Review your code syntax for missing or incorrect punctuation.'
    }

    return {
      parsedError: {
        id: `demo_${Date.now()}`,
        originalError: error,
        errorType: error.split(':')[0] || 'Error',
        category,
        severity,
        language: lang,
        suggestion,
        microLessonNeeded: severity === 'high',
        relatedConcepts: ['variables', 'scope', 'syntax'],
        commonMistake: true
      },
      mistakePattern: {
        id: `pattern_${Date.now()}`,
        errorType: error.split(':')[0] || 'Error',
        frequency: Math.floor(Math.random() * 5) + 1,
        resolved: false,
        lastOccurrence: new Date()
      },
      microLesson: severity === 'high' ? {
        id: `lesson_${Date.now()}`,
        title: `Understanding ${category.replace('_', ' ')}`,
        duration: 8,
        difficulty: 'beginner',
        xpReward: 50
      } : null,
      learningPathUpdates: {
        newRecommendations: [
          {
            title: `Master ${category.replace('_', ' ')}`,
            type: 'micro-lesson',
            priority: 'high',
            estimatedDuration: 8
          }
        ],
        adaptiveAdjustments: [
          {
            adjustmentType: 'priority-boost',
            reason: `Frequent ${error.split(':')[0]} errors detected`,
            impact: `Boosted priority for ${category} topics`
          }
        ],
        currentFocus: [category.replace('_', ' '), 'JavaScript Basics']
      }
    }
  }

  const loadDemoError = (demo: any) => {
    setErrorInput(demo.error)
    setCodeContext(demo.code)
    setLanguage(demo.language)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Clock className="w-4 h-4" />
      case 'low': return <CheckCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🎯 Mistake-Driven Learning System</h1>
        <p className="text-gray-600">
          Analyze coding errors and get personalized learning recommendations
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Error Analysis Input
          </CardTitle>
          <CardDescription>
            Enter a coding error to see how our AI analyzes and creates personalized learning paths
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Demo Error Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Try these examples:</span>
            {demoErrors.map((demo, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => loadDemoError(demo)}
                className="text-xs"
              >
                {demo.error.split(':')[0]}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Error Message</label>
              <textarea
                value={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
                placeholder="e.g., ReferenceError: userName is not defined"
                className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Code Context (Optional)</label>
            <textarea
              value={codeContext}
              onChange={(e) => setCodeContext(e.target.value)}
              placeholder="Paste the code that caused the error..."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <Button 
            onClick={analyzeError}
            disabled={!errorInput.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Error...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Error & Update Learning Path
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Error Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Error Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Error Type:</span>
                <Badge variant="outline">{analysisResult.parsedError.errorType}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Category:</span>
                <Badge className={getSeverityColor(analysisResult.parsedError.severity)}>
                  {getSeverityIcon(analysisResult.parsedError.severity)}
                  <span className="ml-1">{analysisResult.parsedError.category.replace('_', ' ')}</span>
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Frequency:</span>
                <span className="text-sm">
                  {analysisResult.mistakePattern.frequency} time{analysisResult.mistakePattern.frequency !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Suggestion:</h4>
                <p className="text-blue-800 text-sm">{analysisResult.parsedError.suggestion}</p>
              </div>

              {analysisResult.parsedError.relatedConcepts.length > 0 && (
                <div>
                  <span className="font-medium">Related Concepts:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.parsedError.relatedConcepts.map((concept: string, _index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Path Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Learning Path Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisResult.learningPathUpdates.adaptiveAdjustments.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">🎯 Adaptive Adjustment:</h4>
                  <p className="text-green-800 text-sm">
                    {analysisResult.learningPathUpdates.adaptiveAdjustments[0].reason}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Current Focus Areas:</h4>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.learningPathUpdates.currentFocus.map((focus: string, _index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>

              {analysisResult.learningPathUpdates.newRecommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">New Recommendations:</h4>
                  <div className="space-y-2">
                    {analysisResult.learningPathUpdates.newRecommendations.map((rec: LearningRecommendation, _index: number) => (
                      <div key={index} className="p-2 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{rec.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {rec.estimatedDuration}min
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {rec.type}
                          </Badge>
                          <Badge 
                            className={`text-xs ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' : 
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Micro-Lesson Generation */}
          {analysisResult.microLesson && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Generated Micro-Lesson
                </CardTitle>
                <CardDescription>
                  Personalized lesson created based on your specific error
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-bold text-blue-900">{analysisResult.microLesson.duration} min</div>
                    <div className="text-blue-700 text-sm">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-900">{analysisResult.microLesson.difficulty}</div>
                    <div className="text-green-700 text-sm">Difficulty</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-bold text-purple-900">{analysisResult.microLesson.xpReward} XP</div>
                    <div className="text-purple-700 text-sm">Reward</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-2">{analysisResult.microLesson.title}</h3>
                  <p className="text-gray-700 text-sm">
                    This micro-lesson will help you understand and prevent {analysisResult.parsedError.errorType} errors. 
                    You&apos;ll learn the fundamentals, see common examples, and practice with targeted exercises.
                  </p>
                </div>

                <Button className="w-full mt-4">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Start Micro-Lesson
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Mistake History */}
      {mistakeHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Mistake Analysis
            </CardTitle>
            <CardDescription>
              Track your error patterns and learning progress
            </CardDescription>
          </CardHeader>
          <CardContent>            <div className="space-y-3">
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              {mistakeHistory.map((mistake, index) => (
                <div key={mistake.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(mistake.severity)}
                    <div>
                      <div className="font-medium text-sm">{mistake.errorType}</div>
                      <div className="text-xs text-gray-500">{mistake.category.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(mistake.severity)}>
                      {mistake.severity}
                    </Badge>
                    {mistake.commonMistake && (
                      <Badge variant="outline" className="text-xs">
                        Common
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}