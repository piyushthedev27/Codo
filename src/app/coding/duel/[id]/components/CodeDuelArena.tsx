/**
 * Code Duel Arena Component
 * Main coding interface for competitive challenges
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, CheckCircle, XCircle, Lightbulb, Code, Terminal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CodeDuelArenaProps {
  duelState: 'waiting' | 'active' | 'completed'
  onProgressUpdate: (progress: number, score: number, tests?: number) => void
  timeRemaining: number
}

interface TestCase {
  id: string
  input: string
  expected: string
  passed?: boolean
  userOutput?: string
}

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  testCases: TestCase[]
  starterCode: string
  hints: string[]
}

export function CodeDuelArena({ duelState, onProgressUpdate, timeRemaining }: CodeDuelArenaProps) {
  const [userCode, setUserCode] = useState('')
  const [testResults, setTestResults] = useState<TestCase[]>([])
  const [currentScore, setCurrentScore] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [executionOutput, setExecutionOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  // Sample challenge data
  const challenge: Challenge = {
    id: 'array-methods-1',
    title: 'Array Methods Mastery',
    description: 'Implement a function that filters an array of numbers, keeping only even numbers, then doubles each remaining number.',
    difficulty: 'medium',
    points: 100,
    testCases: [
      {
        id: 'test-1',
        input: '[1, 2, 3, 4, 5, 6]',
        expected: '[4, 8, 12]'
      },
      {
        id: 'test-2',
        input: '[10, 15, 20, 25, 30]',
        expected: '[20, 40, 60]'
      },
      {
        id: 'test-3',
        input: '[1, 3, 5, 7, 9]',
        expected: '[]'
      },
      {
        id: 'test-4',
        input: '[2, 4, 6, 8]',
        expected: '[4, 8, 12, 16]'
      }
    ],
    starterCode: `function processArray(numbers) {
  // Your code here
  // Filter even numbers and double them
  
  return [];
}`,
    hints: [
      'Use the filter() method to keep only even numbers',
      'Use the map() method to double each number',
      'Chain the methods together for a clean solution',
      'Remember: even numbers have remainder 0 when divided by 2'
    ]
  }

  useEffect(() => {
    setUserCode(challenge.starterCode)
    setTestResults(challenge.testCases.map(tc => ({ ...tc, passed: false })))
  }, [])

  const runTests = async () => {
    if (duelState !== 'active') return

    setIsRunning(true)
    setExecutionOutput('Running tests...\n')

    try {
      // Simulate test execution
      const results = await Promise.all(
        challenge.testCases.map(async (testCase, index) => {
          await new Promise(resolve => setTimeout(resolve, 500 + index * 200))
          
          // Simple test simulation - in real app, this would execute the code
          const mockPassed = Math.random() > 0.3 // 70% pass rate for demo
          const userOutput = mockPassed ? testCase.expected : 'undefined'
          
          return {
            ...testCase,
            passed: mockPassed,
            userOutput
          }
        })
      )

      setTestResults(results)
      
      // Calculate progress and score
      const passedTests = results.filter(r => r.passed).length
      const progress = (passedTests / results.length) * 100
      const score = Math.round((passedTests / results.length) * challenge.points)
      
      setCurrentScore(score)
      onProgressUpdate(progress, score, passedTests)

      // Update execution output
      let output = 'Test Results:\n'
      results.forEach((result, index) => {
        output += `Test ${index + 1}: ${result.passed ? '✅ PASS' : '❌ FAIL'}\n`
        if (!result.passed) {
          output += `  Expected: ${result.expected}\n`
          output += `  Got: ${result.userOutput}\n`
        }
      })
      output += `\nScore: ${score}/${challenge.points} points`
      
      setExecutionOutput(output)

    } catch (error) {
      setExecutionOutput(`Error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Code className="w-6 h-6 text-blue-500" />
              {challenge.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {challenge.points} pts
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {challenge.description}
          </p>
          
          {/* Hints Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHints(!showHints)}
            className="mb-4"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showHints ? 'Hide' : 'Show'} Hints
          </Button>

          {/* Hints */}
          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4"
            >
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Hints:</h4>
              <ul className="space-y-1">
                {challenge.hints.map((hint, index) => (
                  <li key={index} className="text-sm text-blue-700 dark:text-blue-400">
                    {index + 1}. {hint}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Code Editor and Tests */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="code">Code Editor</TabsTrigger>
              <TabsTrigger value="tests">Test Cases</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>

            {/* Code Editor Tab */}
            <TabsContent value="code" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Solution</h3>
                  <Button
                    onClick={runTests}
                    disabled={duelState !== 'active' || isRunning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run Tests'}
                  </Button>
                </div>
                
                <div className="relative">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full h-64 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Write your code here..."
                    disabled={duelState !== 'active'}
                  />
                  {duelState !== 'active' && (
                    <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {duelState === 'waiting' ? 'Start the duel to begin coding' : 'Duel completed'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Test Cases Tab */}
            <TabsContent value="tests" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Cases</h3>
                {testResults.map((testCase, index) => (
                  <div
                    key={testCase.id}
                    className={`p-4 rounded-lg border-2 ${
                      testCase.passed === undefined
                        ? 'border-gray-200 dark:border-gray-700'
                        : testCase.passed
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Test {index + 1}</span>
                      {testCase.passed !== undefined && (
                        testCase.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Input:</span> {testCase.input}
                      </div>
                      <div>
                        <span className="font-medium">Expected:</span> {testCase.expected}
                      </div>
                      {testCase.userOutput && (
                        <div>
                          <span className="font-medium">Your Output:</span> {testCase.userOutput}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Output Tab */}
            <TabsContent value="output" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold">Execution Output</h3>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[200px] whitespace-pre-wrap">
                  {executionOutput || 'No output yet. Run your tests to see results.'}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}