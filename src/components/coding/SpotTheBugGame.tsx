/**
 * Spot the Bug Interactive Game
 * AI peers make deliberate mistakes for users to identify and fix
 */

'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/shared/Avatar'
import { getPeerProfile } from '@/lib/avatars'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bug, 
  CheckCircle, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle as _XCircle, 
  Lightbulb, 
  Target, 
  Trophy,
  Clock,
  Zap,
  AlertTriangle,
  Eye,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  HelpCircle as _HelpCircle
} from 'lucide-react'

interface BugChallenge {
  id: string
  peerId: string
  title: string
  description: string
  buggyCode: string
  fixedCode: string
  bugLocation: {
    line: number
    startColumn: number
    endColumn: number
  }
  bugType: 'syntax' | 'logic' | 'runtime' | 'performance'
  difficulty: 'easy' | 'medium' | 'hard'
  hint: string
  explanation: string
  commonMistake: boolean
  xpReward: number
}

interface SpotTheBugGameProps {
  challenges?: BugChallenge[]
  onChallengeComplete?: (challengeId: string, timeSpent: number, hintsUsed: number) => void
  className?: string
}

const SAMPLE_BUG_CHALLENGES: BugChallenge[] = [
  {
    id: 'sarah-array-bug',
    peerId: 'sarah',
    title: 'Array Method Confusion',
    description: 'Sarah is trying to find the sum of all even numbers, but something\'s not right...',
    buggyCode: `// Find sum of even numbers
function sumEvenNumbers(numbers) {
  return numbers
    .filter(num => num % 2 === 0)
    .map(num => num + num); // Bug is here!
}

const result = sumEvenNumbers([1, 2, 3, 4, 5, 6]);
console.log(result); // Expected: 12, Got: [4, 8, 12]`,
    fixedCode: `// Find sum of even numbers
function sumEvenNumbers(numbers) {
  return numbers
    .filter(num => num % 2 === 0)
    .reduce((sum, num) => sum + num, 0); // Fixed!
}

const result = sumEvenNumbers([1, 2, 3, 4, 5, 6]);
console.log(result); // Correctly returns: 12`,
    bugLocation: { line: 4, startColumn: 5, endColumn: 25 },
    bugType: 'logic',
    difficulty: 'easy',
    hint: 'Sarah used .map() but she needs to combine all values into a single result...',
    explanation: 'The bug is using .map() instead of .reduce(). .map() transforms each element and returns an array, but we need to sum all values into a single number.',
    commonMistake: true,
    xpReward: 50
  },
  {
    id: 'alex-async-bug',
    peerId: 'alex',
    title: 'Async/Await Mixing',
    description: 'Alex is mixing async patterns and getting unexpected results...',
    buggyCode: `// Fetch user data
async function getUserData(userId) {
  const user = await fetch(\`/api/users/\${userId}\`)
    .then(response => response.json()) // Bug: mixing async/await with .then()
    .then(data => data);
  
  return user;
}

// Usage
getUserData(123).then(user => {
  console.log(user);
});`,
    fixedCode: `// Fetch user data
async function getUserData(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);
  const user = await response.json(); // Fixed: consistent async/await
  
  return user;
}

// Usage
getUserData(123).then(user => {
  console.log(user);
});`,
    bugLocation: { line: 3, startColumn: 5, endColumn: 35 },
    bugType: 'logic',
    difficulty: 'medium',
    hint: 'Alex is mixing two different async patterns in the same function...',
    explanation: 'The bug is mixing async/await with .then(). While it works, it\'s inconsistent and harder to read. Stick to one pattern throughout the function.',
    commonMistake: true,
    xpReward: 75
  },
  {
    id: 'jordan-scope-bug',
    peerId: 'jordan',
    title: 'Variable Scope Issue',
    description: 'Jordan\'s loop has a classic closure problem...',
    buggyCode: `// Create button click handlers
function createButtons() {
  const buttons = [];
  
  for (var i = 0; i < 3; i++) { // Bug: using 'var' instead of 'let'
    buttons.push(function() {
      console.log('Button ' + i + ' clicked');
    });
  }
  
  return buttons;
}

// All buttons will log "Button 3 clicked"
const buttons = createButtons();
buttons[0](); // Expected: "Button 0 clicked", Got: "Button 3 clicked"`,
    fixedCode: `// Create button click handlers
function createButtons() {
  const buttons = [];
  
  for (let i = 0; i < 3; i++) { // Fixed: using 'let' for block scope
    buttons.push(function() {
      console.log('Button ' + i + ' clicked');
    });
  }
  
  return buttons;
}

// Now each button logs correctly
const buttons = createButtons();
buttons[0](); // Correctly logs: "Button 0 clicked"`,
    bugLocation: { line: 4, startColumn: 7, endColumn: 16 },
    bugType: 'logic',
    difficulty: 'hard',
    hint: 'The issue is with variable scope in the loop. Think about when the functions are actually executed...',
    explanation: 'The bug is using "var" which has function scope, so all closures reference the same variable. Using "let" creates block scope, giving each iteration its own variable.',
    commonMistake: true,
    xpReward: 100
  }
]

export function SpotTheBugGame({
  challenges = SAMPLE_BUG_CHALLENGES,
  onChallengeComplete,
  className = ''
}: SpotTheBugGameProps) {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'found' | 'completed'>('playing')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  // eslint-disable-next-line react-hooks/purity
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [hintsUsed, setHintsUsed] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  const currentChallenge = challenges[currentChallengeIndex]
  const peer = currentChallenge ? getPeerProfile(currentChallenge.peerId) : null

  useEffect(() => {
    setStartTime(Date.now())
    setShowHint(false)
    setShowExplanation(false)
    setSelectedLine(null)
    setGameState('playing')
  }, [currentChallengeIndex])

  const handleLineClick = (lineNumber: number) => {
    if (gameState !== 'playing') return

    setSelectedLine(lineNumber)
    
    // Check if the selected line contains the bug
    if (lineNumber === currentChallenge.bugLocation.line) {
      const timeSpent = Date.now() - startTime
      const newScore = currentChallenge.xpReward - (hintsUsed * 10)
      
      setGameState('found')
      setScore(prev => prev + newScore)
      setStreak(prev => prev + 1)
      setShowExplanation(true)
      
      onChallengeComplete?.(currentChallenge.id, timeSpent, hintsUsed)
    } else {
      // Wrong line selected
      setTimeout(() => setSelectedLine(null), 1000)
    }
  }

  const useHint = () => {
    setShowHint(true)
    setHintsUsed(prev => prev + 1)
  }

  const nextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1)
      setHintsUsed(0)
    } else {
      setGameState('completed')
    }
  }

  const resetGame = () => {
    setCurrentChallengeIndex(0)
    setScore(0)
    setStreak(0)
    setHintsUsed(0)
    setGameState('playing')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'hard': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getBugTypeIcon = (type: string) => {
    switch (type) {
      case 'syntax': return <AlertTriangle className="w-4 h-4" />
      case 'logic': return <Bug className="w-4 h-4" />
      case 'runtime': return <Zap className="w-4 h-4" />
      case 'performance': return <Clock className="w-4 h-4" />
      default: return <Bug className="w-4 h-4" />
    }
  }

  if (!currentChallenge || !peer) {
    return <div>No challenges available</div>
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Game Header */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bug className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold">Spot the Bug!</h2>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              Challenge {currentChallengeIndex + 1} of {challenges.length}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-xl font-bold text-blue-600">{score} XP</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Streak</div>
              <div className="text-xl font-bold text-green-600">{streak}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Challenge Info */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar peerId={currentChallenge.peerId} size="md" className="w-12 h-12" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold">{currentChallenge.title}</h3>
              <Badge variant="outline" className={`flex items-center gap-1 ${getDifficultyColor(currentChallenge.difficulty)}`}>
                {getBugTypeIcon(currentChallenge.bugType)}
                {currentChallenge.difficulty} • {currentChallenge.bugType}
              </Badge>
              {currentChallenge.commonMistake && (
                <Badge variant="secondary">Common Mistake</Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-4">{currentChallenge.description}</p>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={useHint}
                disabled={showHint}
                className="flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Hint Used' : 'Get Hint'} ({hintsUsed})
              </Button>
              <div className="text-sm text-muted-foreground">
                Reward: {currentChallenge.xpReward - (hintsUsed * 10)} XP
              </div>
            </div>
          </div>
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Hint</div>
                  <div className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    {currentChallenge.hint}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Code Editor */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="font-medium">Click on the line with the bug</span>
            </div>
            {gameState === 'found' && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Bug Found!
              </Badge>
            )}
          </div>
        </div>
        
        <div className="relative">
          <Editor
            height="300px"
            language="javascript"
            theme="vs-dark"
            value={gameState === 'found' && showExplanation ? currentChallenge.fixedCode : currentChallenge.buggyCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              glyphMargin: true,
              automaticLayout: true
            }}
            onMount={(editor) => {
              // Add click handler for lines
              editor.onMouseDown((e) => {
                if (e.target.position) {
                  handleLineClick(e.target.position.lineNumber)
                }
              })
            }}
          />

          {/* Line Selection Overlay */}
          {selectedLine && (
            <div 
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: `${(selectedLine - 1) * 19 + 10}px`,
                height: '19px',
                backgroundColor: selectedLine === currentChallenge.bugLocation.line 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)',
                border: selectedLine === currentChallenge.bugLocation.line 
                  ? '2px solid rgb(34, 197, 94)' 
                  : '2px solid rgb(239, 68, 68)'
              }}
            />
          )}
        </div>
      </Card>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && gameState === 'found' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Great job! You found the bug!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    {currentChallenge.explanation}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button onClick={nextChallenge} className="flex items-center gap-2">
                      {currentChallengeIndex < challenges.length - 1 ? (
                        <>Next Challenge</>
                      ) : (
                        <>Complete Game</>
                      )}
                    </Button>
                    <div className="text-sm text-green-600">
                      +{currentChallenge.xpReward - (hintsUsed * 10)} XP earned!
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Completed */}
      <AnimatePresence>
        {gameState === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="p-8 text-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
              <p className="text-lg text-muted-foreground mb-4">
                You&apos;ve completed all bug challenges!
              </p>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{streak}</div>
                  <div className="text-sm text-muted-foreground">Final Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{challenges.length}</div>
                  <div className="text-sm text-muted-foreground">Bugs Fixed</div>
                </div>
              </div>
              <Button onClick={resetGame} size="lg" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Play Again
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}