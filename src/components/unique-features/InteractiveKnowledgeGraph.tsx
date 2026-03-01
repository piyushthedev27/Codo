'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent, _CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _Brain,
  Clock,
  Target,
  BookOpen,
  Play,
  Lock,
  CheckCircle,
  Zap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Map
} from 'lucide-react'
import ResponsiveKnowledgeGraph from './ResponsiveKnowledgeGraph'
import { KnowledgeGraphNode } from '@/types/database'

interface InteractiveKnowledgeGraphProps {
  nodes: KnowledgeGraphNode[]
  onStartLesson?: (nodeId: string) => void
  onViewDetails?: (nodeId: string) => void
  className?: string
}

export default function InteractiveKnowledgeGraph({
  nodes,
  onStartLesson,
  onViewDetails,
  className = ''
}: InteractiveKnowledgeGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileDetails, setShowMobileDetails] = useState(false)
  const [viewMode, setViewMode] = useState<'graph' | 'cards'>('graph')

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null
  const hoveredNode = hoveredNodeId ? nodes.find(n => n.id === hoveredNodeId) : null

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId)
    if (isMobile) {
      setShowMobileDetails(true)
    }
  }, [selectedNodeId, isMobile])

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId)
  }, [])

  const handleStartLesson = useCallback(() => {
    if (selectedNode) {
      onStartLesson?.(selectedNode.id)
      setSelectedNodeId(null)
    }
  }, [selectedNode, onStartLesson])

  const handleViewDetails = useCallback(() => {
    if (selectedNode) {
      onViewDetails?.(selectedNode.id)
    }
  }, [selectedNode, onViewDetails])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Zap className="w-4 h-4 text-yellow-500" />
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-500" />
      default:
        return <Lock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'locked':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const canStartLesson = (node: KnowledgeGraphNode) => {
    return node.status === 'in_progress' || node.status === 'locked'
  }

  const getPrerequisiteNodes = (node: KnowledgeGraphNode) => {
    return node.prerequisites
      .map(prereqId => nodes.find(n => n.id === prereqId))
      .filter(Boolean) as KnowledgeGraphNode[]
  }

  const getUnlockedByNodes = (node: KnowledgeGraphNode) => {
    return nodes.filter(n => n.prerequisites.includes(node.id))
  }

  return (
    <div className={`interactive-knowledge-graph ${className}`}>
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="space-y-4">
          {/* View Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex gap-1">
              <Button
                variant={viewMode === 'graph' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('graph')}
                className="flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                Map
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </Button>
            </div>
          </div>

          {/* Main Content */}
          {viewMode === 'graph' ? (
            <ResponsiveKnowledgeGraph
              nodes={nodes}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {nodes.map(node => (
                <Card
                  key={node.id}
                  className={`border-l-4 ${node.status === 'mastered' ? 'border-l-green-500' :
                      node.status === 'in_progress' ? 'border-l-yellow-500' :
                        'border-l-gray-300'
                    }`}
                  onClick={() => handleNodeClick(node.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">{node.concept}</h4>
                      <p className="text-xs text-muted-foreground">{node.category}</p>
                    </div>
                    {getStatusIcon(node.status)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Mobile Details Panel - Collapsible */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedNode.status)}
                        <CardTitle className="text-lg">{selectedNode.concept}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNodeId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(selectedNode.status)}>
                        {selectedNode.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedNode.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Progress for in-progress nodes */}
                    {selectedNode.status === 'in_progress' && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{selectedNode.mastery_percentage}%</span>
                        </div>
                        <Progress value={selectedNode.mastery_percentage} className="h-2" />
                      </div>
                    )}

                    {/* Compact Stats */}
                    <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{selectedNode.estimated_duration_minutes}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-muted-foreground" />
                        <span>Level {selectedNode.difficulty_level}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {canStartLesson(selectedNode) && (
                        <Button
                          onClick={handleStartLesson}
                          className="flex-1"
                          size="sm"
                          disabled={selectedNode.status === 'locked' &&
                            getPrerequisiteNodes(selectedNode).some(p => p.status !== 'mastered')}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {selectedNode.status === 'in_progress' ? 'Continue' : 'Start'}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={handleViewDetails}
                        className="flex-1"
                        size="sm"
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>

                    {/* Expandable Details */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMobileDetails(!showMobileDetails)}
                      className="w-full justify-center"
                    >
                      {showMobileDetails ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Less Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          More Details
                        </>
                      )}
                    </Button>

                    <AnimatePresence>
                      {showMobileDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-2 border-t"
                        >
                          {/* Prerequisites */}
                          {selectedNode.prerequisites.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Prerequisites</h4>
                              <div className="space-y-1">
                                {getPrerequisiteNodes(selectedNode).map(prereq => (
                                  <div key={prereq.id} className="flex items-center gap-2 text-sm">
                                    {getStatusIcon(prereq.status)}
                                    <span className={prereq.status !== 'mastered' ? 'text-muted-foreground' : ''}>
                                      {prereq.concept}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Unlocks */}
                          {getUnlockedByNodes(selectedNode).length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Unlocks</h4>
                              <div className="space-y-1">
                                {getUnlockedByNodes(selectedNode).slice(0, 2).map(unlocked => (
                                  <div key={unlocked.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {getStatusIcon(unlocked.status)}
                                    <span>{unlocked.concept}</span>
                                  </div>
                                ))}
                                {getUnlockedByNodes(selectedNode).length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{getUnlockedByNodes(selectedNode).length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Graph */}
          <div className="lg:col-span-2">
            <ResponsiveKnowledgeGraph
              nodes={nodes}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
            />
          </div>

          {/* Desktop Details Panel */}
          <div className="space-y-4">
            {/* Hovered Node Info */}
            <AnimatePresence>
              {hoveredNode && !selectedNode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(hoveredNode.status)}
                        {hoveredNode.concept}
                      </CardTitle>
                      <Badge className={getStatusColor(hoveredNode.status)}>
                        {hoveredNode.status.replace('_', ' ')}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Hover over a concept to see details, click to interact
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {hoveredNode.estimated_duration_minutes} min
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Node Details */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-blue-200 dark:border-blue-800 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            {getStatusIcon(selectedNode.status)}
                            {selectedNode.concept}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(selectedNode.status)}>
                              {selectedNode.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {selectedNode.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNodeId(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress for in-progress nodes */}
                      {selectedNode.status === 'in_progress' && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{selectedNode.mastery_percentage}%</span>
                          </div>
                          <Progress value={selectedNode.mastery_percentage} />
                        </div>
                      )}

                      {/* Node Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedNode.estimated_duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span>Level {selectedNode.difficulty_level}</span>
                        </div>
                      </div>

                      {/* Prerequisites */}
                      {selectedNode.prerequisites.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Prerequisites</h4>
                          <div className="space-y-1">
                            {getPrerequisiteNodes(selectedNode).map(prereq => (
                              <div key={prereq.id} className="flex items-center gap-2 text-sm">
                                {getStatusIcon(prereq.status)}
                                <span className={prereq.status !== 'mastered' ? 'text-muted-foreground' : ''}>
                                  {prereq.concept}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unlocks */}
                      {getUnlockedByNodes(selectedNode).length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Unlocks</h4>
                          <div className="space-y-1">
                            {getUnlockedByNodes(selectedNode).slice(0, 3).map(unlocked => (
                              <div key={unlocked.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getStatusIcon(unlocked.status)}
                                <span>{unlocked.concept}</span>
                              </div>
                            ))}
                            {getUnlockedByNodes(selectedNode).length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{getUnlockedByNodes(selectedNode).length - 3} more concepts
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {canStartLesson(selectedNode) && (
                          <Button
                            onClick={handleStartLesson}
                            className="flex-1"
                            disabled={selectedNode.status === 'locked' &&
                              getPrerequisiteNodes(selectedNode).some(p => p.status !== 'mastered')}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {selectedNode.status === 'in_progress' ? 'Continue' : 'Start'}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          onClick={handleViewDetails}
                          className="flex-1"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>

                      {/* Locked Node Message */}
                      {selectedNode.status === 'locked' &&
                        getPrerequisiteNodes(selectedNode).some(p => p.status !== 'mastered') && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              Complete the prerequisites first to unlock this concept.
                            </p>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Default State */}
            {!selectedNode && !hoveredNode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Explore Your Path</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click on any concept in the graph to see details and start learning.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Green: Mastered concepts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Yellow: Currently learning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-500" />
                      <span>Gray: Locked concepts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}