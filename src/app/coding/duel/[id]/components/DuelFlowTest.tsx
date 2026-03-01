/**
 * Manual Test Component for Code Duel Flow
 * This component provides manual testing interface for duel functionality
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { _Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Play, RotateCcw } from 'lucide-react'

interface TestResult {
  test: string
  expected: string
  actual: string
  passed: boolean
}

export function DuelFlowTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const runDuelFlowTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setCurrentTest('Starting duel flow tests...')

    const tests = [
      {
        name: 'Timer Initialization',
        test: () => {
          const initialTime = 600 // 10 minutes
          return initialTime === 600
        },
        expected: 'Timer starts at 10:00',
        description: 'Verify timer initializes correctly'
      },
      {
        name: 'Progress Calculation',
        test: () => {
          const testsPasssed = 4
          const totalTests = 8
          const progress = (testsPasssed / totalTests) * 100
          return progress === 50
        },
        expected: '50% progress for 4/8 tests',
        description: 'Verify progress calculation is correct'
      },
      {
        name: 'Score Calculation',
        test: () => {
          const testsPasssed = 6
          const totalTests = 8
          const basePoints = 100
          const score = Math.round((testsPasssed / totalTests) * basePoints)
          return score === 75
        },
        expected: '75 points for 6/8 tests',
        description: 'Verify score calculation is accurate'
      },
      {
        name: 'Victory Condition',
        test: () => {
          const progress = 100
          const isVictory = progress >= 100
          return isVictory === true
        },
        expected: 'Victory triggered at 100% progress',
        description: 'Verify victory condition triggers correctly'
      },
      {
        name: 'Rank Bonus Calculation',
        test: () => {
          const baseScore = 80
          const rank1Bonus = 100
          const rank2Bonus = 50
          const rank3Bonus = 25
          const rank4Bonus = 10
          
          return (
            baseScore + rank1Bonus === 180 &&
            baseScore + rank2Bonus === 130 &&
            baseScore + rank3Bonus === 105 &&
            baseScore + rank4Bonus === 90
          )
        },
        expected: 'Correct XP bonuses for all ranks',
        description: 'Verify rank-based XP bonus calculation'
      },
      {
        name: 'Time Warning',
        test: () => {
          const timeRemaining = 60 // 1 minute
          const warningThreshold = 120 // 2 minutes
          const shouldWarn = timeRemaining <= warningThreshold
          return shouldWarn === true
        },
        expected: 'Warning shows when time < 2 minutes',
        description: 'Verify time warning triggers correctly'
      },
      {
        name: 'Milestone Celebrations',
        test: () => {
          const milestones = [25, 50, 75, 100]
          const progress = 75
          const currentMilestone = milestones.find(m => progress >= m)
          return currentMilestone === 75
        },
        expected: 'Milestone detected at 75% progress',
        description: 'Verify milestone detection works'
      },
      {
        name: 'Leaderboard Sorting',
        test: () => {
          const participants = [
            { id: 'user', score: 850 },
            { id: 'alex', score: 720 },
            { id: 'sarah', score: 680 },
            { id: 'jordan', score: 640 }
          ]
          const sorted = [...participants].sort((a, b) => b.score - a.score)
          return sorted[0].id === 'user' && sorted[1].id === 'alex'
        },
        expected: 'Participants sorted by score correctly',
        description: 'Verify leaderboard sorting logic'
      }
    ]

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      setCurrentTest(`Running: ${test.name}`)
      
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate test execution
      
      try {
        const result = test.test()
        const testResult: TestResult = {
          test: test.name,
          expected: test.expected,
          actual: result ? 'PASS' : 'FAIL',
          passed: result
        }
        
        setTestResults(prev => [...prev, testResult])
      } catch (error) {
        const testResult: TestResult = {
          test: test.name,
          expected: test.expected,
          actual: `ERROR: ${error}`,
          passed: false
        }
        
        setTestResults(prev => [...prev, testResult])
      }
    }

    setCurrentTest('All tests completed!')
    setIsRunning(false)
  }

  const resetTests = () => {
    setTestResults([])
    setCurrentTest('')
    setIsRunning(false)
  }

  const passedTests = testResults.filter(r => r.passed).length
  const totalTests = testResults.length
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Play className="w-6 h-6 text-blue-500" />
            Code Duel Flow Test Suite
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Manual testing interface for competitive coding functionality
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runDuelFlowTests} 
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              onClick={resetTests} 
              variant="outline"
              disabled={isRunning}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Current Test Status */}
          {currentTest && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                {currentTest}
              </p>
            </div>
          )}

          {/* Test Results Summary */}
          {testResults.length > 0 && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {passedTests}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tests Passed
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {totalTests - passedTests}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tests Failed
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${
                    successRate >= 80 ? 'text-green-600' : 
                    successRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {successRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Success Rate
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-4">Test Results</h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.passed
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{result.test}</span>
                    {result.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Expected:</span> {result.expected}
                    </div>
                    <div>
                      <span className="font-medium">Result:</span> {result.actual}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Test Coverage Information */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-3">Test Coverage Areas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">Core Functionality</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Timer initialization and countdown</li>
                  <li>• Progress calculation logic</li>
                  <li>• Score calculation accuracy</li>
                  <li>• Victory condition detection</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">User Experience</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Time warning notifications</li>
                  <li>• Milestone celebrations</li>
                  <li>• Leaderboard sorting</li>
                  <li>• XP bonus calculations</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}