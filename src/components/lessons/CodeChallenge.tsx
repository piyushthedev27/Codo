/**
 * Code Challenge Component
 * Interactive coding challenges within lessons
 */

'use client'

import { useState, useRef } from 'react'
import { Play, CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TestCase {
  input: string
  expected: string
  description?: string
}

export interface CodeChallengeProps {
  _id: string
  title: string
  description: string
  starterCode: string
  _language: string
  testCases: TestCase[]
  hints?: string[]
  onSubmit?: (code: string, passed: boolean) => void
  showHints?: boolean
}

export function CodeChallenge({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _id,
  title,
  description,
  starterCode,
  _language,
  testCases,
  hints = [],
  onSubmit,
  showHints = true
}: CodeChallengeProps) {
  const [code, setCode] = useState(starterCode)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; output?: string; error?: string }>>([])
  const [showHintIndex, setShowHintIndex] = useState(-1)
  const [submitted, setSubmitted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleReset = () => {
    setCode(starterCode)
    setTestResults([])
    setSubmitted(false)
    setShowHintIndex(-1)
  }

  const handleRunTests = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      // Simulate test execution (in a real implementation, this would run in a sandboxed environment)
      const results = await simulateTestExecution(code, testCases, _language)
      setTestResults(results)
      
      const allPassed = results.every(result => result.passed)
      if (!submitted) {
        setSubmitted(true)
        onSubmit?.(code, allPassed)
      }
    } catch (_error) {
      console.error('Error running tests:', _error)
      setTestResults([{ passed: false, _error: 'Failed to execute code' }])
    } finally {
      setIsRunning(false)
    }
  }

  const handleShowNextHint = () => {
    if (showHintIndex < hints.length - 1) {
      setShowHintIndex(showHintIndex + 1)
    }
  }

  const passedTests = testResults.filter(result => result.passed).length
  const totalTests = testResults.length
  const allTestsPassed = totalTests > 0 && passedTests === totalTests

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-purple-100 text-sm">{description}</p>
      </div>

      {/* Code Editor */}
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Code ({_language})
            </label>
            <div className="flex items-center gap-2">
              {showHints && hints.length > 0 && (
                <button
                  onClick={handleShowNextHint}
                  disabled={showHintIndex >= hints.length - 1}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lightbulb className="w-3 h-3" />
                  Hint ({showHintIndex + 1}/{hints.length})
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </div>
          
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </div>

        {/* Hints */}
        <AnimatePresence>
          {showHintIndex >= 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Hint {showHintIndex + 1}
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {hints[showHintIndex]}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Test Results
              </h4>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                allTestsPassed 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {allTestsPassed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {passedTests}/{totalTests} passed
              </div>
            </div>

            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border ${
                    result.passed
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {result.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={result.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                      Test {index + 1}: {testCases[index]?.description || `Input: ${testCases[index]?.input}`}
                    </span>
                  </div>
                  {result.error && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-mono">
                      Error: {result._error}
                    </p>
                  )}
                  {result.output && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono">
                      Output: {result.output}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {allTestsPassed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Congratulations! All tests passed! 🎉</span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {testCases.length} test case{testCases.length !== 1 ? 's' : ''} to pass
          </div>
          
          <button
            onClick={handleRunTests}
            disabled={isRunning || !code.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Simulate test execution (placeholder implementation)
 * In a real application, this would run in a secure sandboxed environment
 */
async function simulateTestExecution(
  code: string,
  testCases: TestCase[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: string
): Promise<Array<{ passed: boolean; output?: string; error?: string }>> {
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return testCases.map((testCase, index) => {
    // Simple simulation - in reality, this would execute the code safely
    try {
      // For demo purposes, randomly pass/fail some tests based on code content
      const codeLength = code.trim().length
      const hasKeywords = ['function', 'return', 'if', 'for', 'while'].some(keyword => 
        code.toLowerCase().includes(keyword)
      )
      
      // Simple heuristic: longer code with keywords is more likely to pass
      const passChance = Math.min(0.9, (codeLength / 100) * (hasKeywords ? 1.5 : 0.5))
      const passed = Math.random() < passChance

      return {
        passed,
        output: passed ? testCase.expected : 'undefined',
        _error: passed ? undefined : 'Logic error in implementation'
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return {
        passed: false,
        _error: 'Syntax error'
      }
    }
  })
}