/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Collaborative Code Editor with Monaco Editor
 * Features real-time collaboration with AI peers, cursor presence, and code comparison
 * Optimized for mobile touch interactions
 */

'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, useEffect, useRef, useCallback as _useCallback } from 'react'
import { Editor, OnMount, OnChange } from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/shared/Avatar'
import { getPeerProfile } from '@/lib/avatars'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Bug, Users, MessageSquare, BarChart3, Target } from 'lucide-react'
import { CodeComparison, SAMPLE_CODE_SOLUTIONS } from './CodeComparison'
import { SpotTheBugGame } from './SpotTheBugGame'
import { useTouchOptimization, isMobileDevice } from '@/lib/mobile/touch-optimization'
import { useLayoutOptimization } from '@/lib/mobile/layout-optimization'
import { CollaborationManager, CursorPosition as CollabCursor } from '@/lib/realtime/collaboration-manager'
import { useUser } from '@clerk/nextjs'

interface CursorPosition {
  peerId: string
  line: number
  column: number
  isTyping: boolean
  selection?: {
    startLine: number
    startColumn: number
    endLine: number
    endColumn: number
  }
  lastActivity: Date
}

interface PeerCodeState {
  peerId: string
  code: string
  language: string
  lastModified: Date
}

interface CodeSuggestion {
  peerId: string
  line: number
  message: string
  type: 'suggestion' | 'bug' | 'improvement'
  timestamp: Date
}

interface CollaborativeCodeEditorProps {
  initialCode?: string
  language?: string
  theme?: 'vs-dark' | 'light'
  height?: string
  onCodeChange?: (code: string) => void
  challengeId?: string
  enableCollaboration?: boolean
}

export function CollaborativeCodeEditor({
  initialCode = '// Start coding with your AI peers!\nfunction hello() {\n  console.log("Hello, world!");\n}',
  language = 'javascript',
  theme = 'vs-dark',
  height = '400px',
  onCodeChange,
  challengeId,
  enableCollaboration = true
}: CollaborativeCodeEditorProps) {
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [code, setCode] = useState(initialCode)
  const [cursors, setCursors] = useState<CursorPosition[]>([])
  const [peerCodeStates, setPeerCodeStates] = useState<PeerCodeState[]>([])
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showDetailedComparison, setShowDetailedComparison] = useState(false)
  const [showBugGame, setShowBugGame] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useUser()
  const collabManagerRef = useRef<CollaborationManager | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_realtimeCursors, setRealtimeCursors] = useState<CollabCursor[]>([])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeCollaborators = ['sarah', 'alex']

  // Mobile optimization hooks
  const { optimizeRef } = useTouchOptimization({
    tapDelay: 200,
    longPressDelay: 600,
    preventZoom: true,
    enhancedTouchTargets: true
  })

  const { viewport: _viewport, optimizeForMobile } = useLayoutOptimization()

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Optimize container for mobile
  useEffect(() => {
    if (containerRef.current && isMobile) {
      optimizeForMobile(containerRef.current)
    }
  }, [isMobile, optimizeForMobile])

  // Initialize AI peer code states
  useEffect(() => {
    if (!enableCollaboration) return

    const initialPeerStates: PeerCodeState[] = [
      {
        peerId: 'sarah',
        code: '// Sarah\'s approach - using array methods\nfunction hello() {\n  const messages = ["Hello", "world!"];\n  messages.forEach(msg => console.log(msg));\n}',
        language,
        lastModified: new Date()
      },
      {
        peerId: 'alex',
        code: '// Alex\'s approach - with error handling\nfunction hello() {\n  try {\n    console.log("Hello, world!");\n  } catch (error) {\n    console.error("Error:", error);\n  }\n}',
        language,
        lastModified: new Date()
      }
    ]

    setPeerCodeStates(initialPeerStates)
  }, [language, enableCollaboration])

  // Real-time collaboration setup
  useEffect(() => {
    if (!enableCollaboration || !user || !challengeId) return

    const sessionId = challengeId
    const userId = user.id
    const userName = user.firstName || 'User'

    const manager = new CollaborationManager(sessionId, userId, userName)
    collabManagerRef.current = manager

    const setupCollab = async () => {
      await manager.join()

      manager.onUpdates({
        onCodeUpdate: (update) => {
          setCode(update.code)
        },
        onCursorUpdate: (cursors) => {
          setRealtimeCursors(cursors)
        }
      })
    }

    setupCollab()

    return () => {
      manager.leave()
    }
  }, [enableCollaboration, user, challengeId])

  // Simulate cursor movements and typing with realistic patterns
  useEffect(() => {
    if (!enableCollaboration || !editorRef.current) return

    const interval = setInterval(() => {
      setCursors(prev => {
        return activeCollaborators.map(peerId => {
          const existing = prev.find(c => c.peerId === peerId)
          const peer = getPeerProfile(peerId)
          if (!peer) return existing

          // Simulate realistic cursor behavior based on personality
          let newLine = existing?.line || Math.floor(Math.random() * 10) + 1
          let newColumn = existing?.column || Math.floor(Math.random() * 20) + 1
          let isTyping = false

          if (peer.personality === 'analytical') {
            // Alex moves methodically, types in focused bursts
            newLine += Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0
            newColumn += Math.floor(Math.random() * 3) - 1
            isTyping = Math.random() > 0.65 // Types less frequently but more focused
          } else if (peer.personality === 'curious') {
            // Sarah moves more actively, explores different areas
            newLine += Math.floor(Math.random() * 3) - 1
            newColumn += Math.floor(Math.random() * 6) - 3
            isTyping = Math.random() > 0.45 // Types more frequently
          } else if (peer.personality === 'supportive') {
            // Jordan moves steadily and consistently
            newLine += Math.random() > 0.75 ? (Math.random() > 0.5 ? 1 : -1) : 0
            newColumn += Math.floor(Math.random() * 4) - 2
            isTyping = Math.random() > 0.55 // Steady typing rhythm
          }

          // Keep within reasonable bounds
          newLine = Math.max(1, Math.min(20, newLine))
          newColumn = Math.max(1, Math.min(50, newColumn))

          return {
            peerId,
            line: newLine,
            column: newColumn,
            isTyping,
            lastActivity: new Date()
          }
        }).filter(Boolean) as CursorPosition[]
      })
    }, 1500) // Slightly faster updates for more dynamic feel

    return () => clearInterval(interval)
  }, [activeCollaborators, enableCollaboration])

  // Generate periodic suggestions from AI peers
  useEffect(() => {
    if (!enableCollaboration) return

    const interval = setInterval(() => {
      const suggestionTypes: Array<'suggestion' | 'bug' | 'improvement'> = ['suggestion', 'bug', 'improvement']
      const messages = [
        "Consider adding error handling here",
        "This could be optimized with array methods",
        "Don't forget to handle edge cases",
        "Great approach! Maybe add some comments?",
        "This function could be more modular",
        "Watch out for potential null values"
      ]

      if (Math.random() > 0.7 && suggestions.length < 3) {
        const randomPeer = activeCollaborators[Math.floor(Math.random() * activeCollaborators.length)]
        const newSuggestion: CodeSuggestion = {
          peerId: randomPeer,
          line: Math.floor(Math.random() * 10) + 1,
          message: messages[Math.floor(Math.random() * messages.length)],
          type: suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)],
          timestamp: new Date()
        }

        setSuggestions(prev => [...prev, newSuggestion])

        // Auto-remove after 10 seconds
        setTimeout(() => {
          setSuggestions(prev => prev.filter(s => s.timestamp !== newSuggestion.timestamp))
        }, 10000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [activeCollaborators, suggestions.length, enableCollaboration])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditorDidMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor

    // Configure editor for collaboration and mobile
    const editorOptions = {
      minimap: { enabled: !isMobile }, // Disable minimap on mobile
      scrollBeyondLastLine: false,
      fontSize: isMobile ? 16 : 14, // Larger font on mobile
      lineNumbers: (isMobile ? 'off' : 'on') as 'on' | 'off', // Hide line numbers on mobile for space
      renderWhitespace: 'selection' as const,
      cursorBlinking: 'smooth' as const,
      wordWrap: (isMobile ? 'on' : 'off') as 'on' | 'off', // Enable word wrap on mobile
      automaticLayout: true,
      scrollbar: {
        verticalScrollbarSize: isMobile ? 8 : 14,
        horizontalScrollbarSize: isMobile ? 8 : 14
      },
      // Mobile-specific optimizations
      mouseWheelZoom: !isMobile, // Disable zoom on mobile
      contextmenu: !isMobile, // Disable context menu on mobile
      quickSuggestions: !isMobile, // Disable quick suggestions on mobile for performance
      parameterHints: { enabled: !isMobile },
      suggestOnTriggerCharacters: !isMobile
    }

    editor.updateOptions(editorOptions)

    // Add cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      if (collabManagerRef.current) {
        collabManagerRef.current.updatePresence({
          line: e.position.lineNumber,
          column: e.position.column,
          isTyping: true
        })
      }
    })

    // Mobile-specific touch handling
    if (isMobile) {
      const editorElement = editor.getDomNode()
      if (editorElement) {
        // Prevent zoom on double tap
        editorElement.style.touchAction = 'manipulation'

        // Add mobile-friendly styling
        editorElement.classList.add('mobile-code-editor')
      }
    }
  }

  const handleCodeChange: OnChange = (value) => {
    if (value !== undefined) {
      setCode(value)
      onCodeChange?.(value)

      if (collabManagerRef.current) {
        const position = editorRef.current?.getPosition()
        collabManagerRef.current.broadcastCode(value, position ? {
          line: position.lineNumber,
          column: position.column
        } : undefined)
      }
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    // Simulate code execution
    setTimeout(() => {
      setIsRunning(false)
      // In a real implementation, this would execute the code
      console.log('Code executed:', code)
    }, 2000)
  }

  const toggleComparison = () => {
    setShowComparison(!showComparison)
  }

  const toggleDetailedComparison = () => {
    setShowDetailedComparison(!showDetailedComparison)
  }

  const toggleBugGame = () => {
    setShowBugGame(!showBugGame)
  }

  const dismissSuggestion = (timestamp: Date) => {
    setSuggestions(prev => prev.filter(s => s.timestamp !== timestamp))
  }

  return (
    <div ref={containerRef} className={`w-full space-y-4 ${isMobile ? 'mobile-code-container' : ''}`}>
      {/* Collaboration Header */}
      {enableCollaboration && (
        <div className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${isMobile ? 'flex-col space-y-4' : ''}`}>
          <div className={`flex items-center gap-4 ${isMobile ? 'w-full justify-center' : ''}`}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'}`}>Collaborating with:</span>
            </div>
            <div className="flex -space-x-2">
              {activeCollaborators.map(peerId => (
                <Avatar key={peerId} peerId={peerId} size="sm" className="border-2 border-white dark:border-gray-800" />
              ))}
            </div>
          </div>
          <div className={`flex items-center gap-2 ${isMobile ? 'w-full flex-wrap justify-center' : ''}`}>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={toggleComparison}
              className={`flex items-center gap-2 ${isMobile ? 'touch-target-enhanced' : ''}`}
              ref={optimizeRef({
                onTap: () => toggleComparison(),
                onLongPress: () => console.log('Long press on compare button')
              })}
            >
              <MessageSquare className="w-4 h-4" />
              {isMobile ? 'Compare' : (showComparison ? 'Hide' : 'Compare') + ' Approaches'}
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={toggleDetailedComparison}
              className={`flex items-center gap-2 ${isMobile ? 'touch-target-enhanced' : ''}`}
              ref={optimizeRef({
                onTap: () => toggleDetailedComparison()
              })}
            >
              <BarChart3 className="w-4 h-4" />
              {isMobile ? 'Analysis' : 'Detailed Analysis'}
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={toggleBugGame}
              className={`flex items-center gap-2 ${isMobile ? 'touch-target-enhanced' : ''}`}
              ref={optimizeRef({
                onTap: () => toggleBugGame()
              })}
            >
              <Target className="w-4 h-4" />
              {isMobile ? 'Bug Hunt' : 'Spot the Bug'}
            </Button>
            <Button
              onClick={runCode}
              disabled={isRunning}
              size={isMobile ? "sm" : "sm"}
              className={`flex items-center gap-2 ${isMobile ? 'touch-target-enhanced bg-blue-600 hover:bg-blue-700' : ''}`}
              ref={optimizeRef({
                onTap: () => !isRunning && runCode(),
                onLongPress: () => console.log('Long press on run button')
              })}
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
          </div>
        </div>
      )}

      <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
        {/* Main Editor */}
        <div className="flex-1 relative">
          <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <Editor
              height={isMobile ? '300px' : height} // Shorter on mobile
              language={language}
              theme={theme}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: !isMobile },
                scrollBeyondLastLine: false,
                fontSize: isMobile ? 16 : 14,
                lineNumbers: isMobile ? 'off' : 'on',
                renderWhitespace: 'selection',
                cursorBlinking: 'smooth',
                automaticLayout: true,
                wordWrap: isMobile ? 'on' : 'off',
                scrollbar: {
                  verticalScrollbarSize: isMobile ? 8 : 14,
                  horizontalScrollbarSize: isMobile ? 8 : 14
                }
              }}
            />

            {/* Cursor Overlays */}
            {enableCollaboration && (
              <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence>
                  {cursors.map((cursor) => {
                    const peer = getPeerProfile(cursor.peerId)
                    if (!peer) return null

                    // Calculate approximate pixel position (rough estimation)
                    const lineHeight = 19
                    const charWidth = 7.2
                    const x = cursor.column * charWidth + 60 // Account for line numbers
                    const y = cursor.line * lineHeight + 10

                    return (
                      <motion.div
                        key={cursor.peerId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x, y }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute"
                      >
                        {/* Cursor Line */}
                        <div
                          className="w-0.5 h-4 animate-pulse"
                          style={{
                            backgroundColor: peer.personality === 'curious' ? '#ec4899' :
                              peer.personality === 'analytical' ? '#3b82f6' : '#10b981'
                          }}
                        />

                        {/* Cursor Label with Enhanced Typing Animation */}
                        {cursor.isTyping && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-10 -left-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-xs shadow-lg border border-gray-200 dark:border-gray-600 flex items-center gap-2"
                          >
                            <Avatar peerId={cursor.peerId} size="sm" className="w-5 h-5" />
                            <div className="flex flex-col">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{peer.name}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 text-xs">typing</span>
                                <div className="flex gap-0.5">
                                  {[0, 1, 2].map((i) => (
                                    <motion.div
                                      key={i}
                                      animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.4, 1, 0.4],
                                      }}
                                      transition={{
                                        duration: peer.personality === 'curious' ? 0.8 :
                                          peer.personality === 'analytical' ? 1.2 : 1.0,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                      }}
                                      className="w-1 h-1 rounded-full"
                                      style={{
                                        backgroundColor: peer.personality === 'curious' ? '#ec4899' :
                                          peer.personality === 'analytical' ? '#3b82f6' : '#10b981'
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Code Suggestions */}
          <AnimatePresence>
            {suggestions.map((suggestion) => {
              const peer = getPeerProfile(suggestion.peerId)
              if (!peer) return null

              return (
                <motion.div
                  key={suggestion.timestamp.getTime()}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="absolute top-4 right-4 max-w-xs z-10"
                >
                  <Card className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="flex items-start gap-2">
                      <Avatar peerId={suggestion.peerId} size="sm" className="w-6 h-6 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {peer.name}
                          </span>
                          <Badge
                            variant={suggestion.type === 'bug' ? 'destructive' :
                              suggestion.type === 'improvement' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {suggestion.type === 'bug' && <Bug className="w-3 h-3 mr-1" />}
                            {suggestion.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          {suggestion.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            Line {suggestion.line}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissSuggestion(suggestion.timestamp)}
                            className="h-6 px-2 text-xs"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Code Comparison Panel */}
        <AnimatePresence>
          {showComparison && enableCollaboration && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: isMobile ? '100%' : 400 }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <Card className="h-full p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Peer Approaches
                </h3>
                <div className="space-y-4">
                  {peerCodeStates.map((peerState) => {
                    const peer = getPeerProfile(peerState.peerId)
                    if (!peer) return null

                    return (
                      <div key={peerState.peerId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <Avatar peerId={peerState.peerId} size="sm" className="w-6 h-6" />
                          <span className="text-sm font-medium">{peer.name}&apos;s Code</span>
                        </div>
                        <div className="p-2">
                          <Editor
                            height={isMobile ? "120px" : "150px"}
                            language={peerState.language}
                            theme={theme}
                            value={peerState.code}
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              fontSize: isMobile ? 14 : 12,
                              lineNumbers: 'off',
                              folding: false,
                              lineDecorationsWidth: 0,
                              lineNumbersMinChars: 0,
                              glyphMargin: false,
                              wordWrap: isMobile ? 'on' : 'off'
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detailed Code Comparison */}
      <AnimatePresence>
        {showDetailedComparison && enableCollaboration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            <CodeComparison
              solutions={SAMPLE_CODE_SOLUTIONS}
              title="AI Peer Code Analysis"
              onSolutionSelect={(peerId) => {
                console.log('Selected solution from:', peerId)
                // Could update the main editor with the selected solution
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spot the Bug Game */}
      <AnimatePresence>
        {showBugGame && enableCollaboration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            <SpotTheBugGame
              onChallengeComplete={(challengeId, timeSpent, hintsUsed) => {
                console.log(`Challenge ${challengeId} completed in ${timeSpent}ms with ${hintsUsed} hints`)
                // Could track progress and award XP
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}