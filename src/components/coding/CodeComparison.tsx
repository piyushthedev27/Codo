/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Code Comparison Component
 * Provides side-by-side comparison of different coding approaches with analysis
 */

'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, _useEffect } from 'react'
import { Editor } from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/shared/Avatar'
import { getPeerProfile } from '@/lib/avatars'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Clock, 
  Zap, 
  Shield, 
  Eye, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Info,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface CodeSolution {
  peerId: string
  code: string
  language: string
  approach: string
  pros: string[]
  cons: string[]
  performance: 'fast' | 'medium' | 'slow'
  readability: 'high' | 'medium' | 'low'
  complexity: 'simple' | 'moderate' | 'complex'
  linesOfCode: number
  executionTime?: number
}

interface ComparisonMetric {
  name: string
  icon: React.ReactNode
  getValue: (solution: CodeSolution) => string | number
  getScore: (solution: CodeSolution) => number // 1-5 scale
  description: string
}

interface CodeComparisonProps {
  solutions: CodeSolution[]
  title?: string
  onSolutionSelect?: (peerId: string) => void
  className?: string
  expanded?: boolean
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    name: 'Performance',
    icon: <Zap className="w-4 h-4" />,
    getValue: (solution) => solution.performance,
    getScore: (solution) => solution.performance === 'fast' ? 5 : solution.performance === 'medium' ? 3 : 1,
    description: 'Runtime efficiency and speed'
  },
  {
    name: 'Readability',
    icon: <Eye className="w-4 h-4" />,
    getValue: (solution) => solution.readability,
    getScore: (solution) => solution.readability === 'high' ? 5 : solution.readability === 'medium' ? 3 : 1,
    description: 'Code clarity and maintainability'
  },
  {
    name: 'Complexity',
    icon: <TrendingUp className="w-4 h-4" />,
    getValue: (solution) => solution.complexity,
    getScore: (solution) => solution.complexity === 'simple' ? 5 : solution.complexity === 'moderate' ? 3 : 1,
    description: 'Implementation complexity (lower is better)'
  },
  {
    name: 'Lines of Code',
    icon: <Code className="w-4 h-4" />,
    getValue: (solution) => solution.linesOfCode,
    getScore: (solution) => Math.max(1, 6 - Math.floor(solution.linesOfCode / 5)), // Fewer lines = higher score
    description: 'Code conciseness'
  }
]

export function CodeComparison({
  solutions,
  title = "Code Approaches Comparison",
  onSolutionSelect,
  className = '',
  expanded = false
}: CodeComparisonProps) {
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null)
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay' | 'metrics'>('side-by-side')
  const [isExpanded, setIsExpanded] = useState(expanded)
  const [showAnalysis, setShowAnalysis] = useState(true)

  // Calculate overall scores
  const solutionsWithScores = solutions.map(solution => {
    const totalScore = COMPARISON_METRICS.reduce((sum, metric) => sum + metric.getScore(solution), 0)
    const averageScore = totalScore / COMPARISON_METRICS.length
    return { ...solution, overallScore: averageScore }
  }).sort((a, b) => b.overallScore - a.overallScore)

  const handleSolutionClick = (peerId: string) => {
    setSelectedSolution(selectedSolution === peerId ? null : peerId)
    onSolutionSelect?.(peerId)
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 dark:text-green-400'
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 4) return 'default'
    if (score >= 3) return 'secondary'
    return 'destructive'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6" />
            {title}
          </h2>
          <p className="text-muted-foreground mt-1">
            Compare different approaches and learn from various coding styles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalysis(!showAnalysis)}
          >
            {showAnalysis ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {showAnalysis ? 'Hide' : 'Show'} Analysis
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Compact' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Comparison Mode Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">View:</span>
        {[
          { key: 'side-by-side', label: 'Side by Side' },
          { key: 'metrics', label: 'Metrics Only' }
        ].map(mode => (
          <Button
            key={mode.key}
            variant={comparisonMode === mode.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setComparisonMode(mode.key as any)}
          >
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Metrics Overview */}
      {showAnalysis && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3">Solution</th>
                  {COMPARISON_METRICS.map(metric => (
                    <th key={metric.name} className="text-center py-2 px-3">
                      <div className="flex items-center justify-center gap-1">
                        {metric.icon}
                        <span className="text-sm">{metric.name}</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center py-2 px-3">Overall</th>
                </tr>
              </thead>
              <tbody>
                {solutionsWithScores.map((solution, index) => {
                  const peer = getPeerProfile(solution.peerId)
                  if (!peer) return null

                  return (
                    <motion.tr
                      key={solution.peerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                      onClick={() => handleSolutionClick(solution.peerId)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <Avatar peerId={solution.peerId} size="sm" className="w-8 h-8" />
                          <div>
                            <div className="font-medium">{peer.name}</div>
                            <div className="text-xs text-muted-foreground">{solution.approach}</div>
                          </div>
                          {index === 0 && (
                            <Badge variant="default" className="ml-2">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Best
                            </Badge>
                          )}
                        </div>
                      </td>
                      {COMPARISON_METRICS.map(metric => {
                        const score = metric.getScore(solution)
                        return (
                          <td key={metric.name} className="text-center py-3 px-3">
                            <div className="flex flex-col items-center gap-1">
                              <Badge variant={getScoreBadgeVariant(score)} className="text-xs">
                                {metric.getValue(solution)}
                              </Badge>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i <= score ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                        )
                      })}
                      <td className="text-center py-3 px-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-bold ${getScoreColor(solution.overallScore)}`}>
                            {solution.overallScore.toFixed(1)}
                          </span>
                          <div className="text-xs text-muted-foreground">/ 5.0</div>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Code Comparison */}
      {comparisonMode === 'side-by-side' && (
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(solutions.length, 3)}, 1fr)` }}>
          {solutions.slice(0, 3).map((solution, index) => {
            const peer = getPeerProfile(solution.peerId)
            if (!peer) return null

            const isSelected = selectedSolution === solution.peerId
            const solutionWithScore = solutionsWithScores.find(s => s.peerId === solution.peerId)

            return (
              <motion.div
                key={solution.peerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                  }`}
                >
                  {/* Solution Header */}
                  <div 
                    className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                    onClick={() => handleSolutionClick(solution.peerId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar peerId={solution.peerId} size="sm" className="w-8 h-8" />
                        <div>
                          <div className="font-semibold">{peer.name}</div>
                          <div className="text-sm text-muted-foreground">{solution.approach}</div>
                        </div>
                      </div>
                      {solutionWithScore && (
                        <Badge variant={getScoreBadgeVariant(solutionWithScore.overallScore)}>
                          {solutionWithScore.overallScore.toFixed(1)}/5
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className="relative">
                    <Editor
                      height={isExpanded ? "400px" : "250px"}
                      language={solution.language}
                      theme="vs-dark"
                      value={solution.code}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 12,
                        lineNumbers: 'on',
                        folding: false,
                        automaticLayout: true
                      }}
                    />
                  </div>

                  {/* Solution Analysis */}
                  <AnimatePresence>
                    {isSelected && showAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-4 space-y-4">
                          {/* Pros and Cons */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Strengths
                              </h4>
                              <ul className="text-sm space-y-1">
                                {solution.pros.map((pro, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Considerations
                              </h4>
                              <ul className="text-sm space-y-1">
                                {solution.cons.map((con, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Code className="w-3 h-3" />
                              {solution.linesOfCode} lines
                            </div>
                            {solution.executionTime && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {solution.executionTime}ms
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Shield className="w-3 h-3" />
                              {solution.complexity} complexity
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Learning Insights */}
      {showAnalysis && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Learning Insights
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>
                  <strong>Best Overall:</strong> {solutionsWithScores[0] && getPeerProfile(solutionsWithScores[0].peerId)?.name}&apos;s approach 
                  scores highest with {solutionsWithScores[0]?.overallScore.toFixed(1)}/5.0
                </p>
                <p>
                  <strong>Key Takeaway:</strong> Each approach has trade-offs. Consider your specific requirements 
                  when choosing between performance, readability, and simplicity.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <ArrowRight className="w-4 h-4" />
                  <span className="font-medium">Try implementing your own version combining the best aspects!</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Sample data for testing
export const SAMPLE_CODE_SOLUTIONS: CodeSolution[] = [
  {
    peerId: 'sarah',
    code: `// Sarah's approach - using modern array methods
function processNumbers(numbers) {
  return numbers
    .filter(num => num % 2 === 0)
    .map(num => num * 2);
}

// Clean and functional
const result = processNumbers([1, 2, 3, 4, 5, 6]);
console.log(result); // [4, 8, 12]`,
    language: 'javascript',
    approach: 'Functional Programming',
    pros: [
      'Concise and readable',
      'Uses modern JavaScript features',
      'Immutable approach',
      'Easy to understand'
    ],
    cons: [
      'Creates intermediate arrays',
      'Slightly less performant for large datasets',
      'May be unfamiliar to beginners'
    ],
    performance: 'medium',
    readability: 'high',
    complexity: 'simple',
    linesOfCode: 8,
    executionTime: 0.8
  },
  {
    peerId: 'alex',
    code: `// Alex's approach - with comprehensive error handling
function processNumbers(numbers) {
  // Input validation
  if (!Array.isArray(numbers)) {
    throw new Error('Input must be an array');
  }
  
  const result = [];
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    if (typeof num === 'number' && num % 2 === 0) {
      result.push(num * 2);
    }
  }
  
  return result;
}

// Robust and safe
try {
  const result = processNumbers([1, 2, 3, 4, 5, 6]);
  console.log(result);
} catch (error) {
  console.error('Error:', error.message);
}`,
    language: 'javascript',
    approach: 'Defensive Programming',
    pros: [
      'Comprehensive error handling',
      'Type checking included',
      'Very robust and safe',
      'Good for production code'
    ],
    cons: [
      'More verbose',
      'Higher complexity',
      'Longer to write and maintain'
    ],
    performance: 'fast',
    readability: 'medium',
    complexity: 'moderate',
    linesOfCode: 20,
    executionTime: 0.6
  },
  {
    peerId: 'jordan',
    code: `// Jordan's approach - functional with helper functions
function processNumbers(numbers) {
  // Filter for even numbers, then double them
  return numbers
    .filter(isEven)
    .map(double);
}

// Helper functions for clarity
const isEven = num => num % 2 === 0;
const double = num => num * 2;

// Usage example with clear intent
const input = [1, 2, 3, 4, 5, 6];
const output = processNumbers(input);
console.log('Processed:', output);`,
    language: 'javascript',
    approach: 'Modular Functions',
    pros: [
      'Very readable and self-documenting',
      'Reusable helper functions',
      'Easy to test individual parts',
      'Clear separation of concerns'
    ],
    cons: [
      'More functions to maintain',
      'Slightly more setup',
      'May be overkill for simple tasks'
    ],
    performance: 'medium',
    readability: 'high',
    complexity: 'simple',
    linesOfCode: 12,
    executionTime: 0.9
  }
]