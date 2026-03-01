'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ZoomIn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ZoomOut,
  Smartphone,
  Monitor
} from 'lucide-react'
import KnowledgeGraphD3, { KnowledgeGraphD3Ref } from './KnowledgeGraphD3'
import { KnowledgeGraphNode } from '@/types/database'

interface ResponsiveKnowledgeGraphProps {
  nodes: KnowledgeGraphNode[]
  onNodeClick?: (nodeId: string) => void
  onNodeHover?: (nodeId: string | null) => void
  className?: string
}

export default function ResponsiveKnowledgeGraph({
  nodes,
  onNodeClick,
  onNodeHover,
  className = ''
}: ResponsiveKnowledgeGraphProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<'auto' | 'mobile' | 'desktop'>('auto')
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<KnowledgeGraphD3Ref>(null)

  // Detect screen size and update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // Detect mobile
      const mobile = screenWidth < 768
      setIsMobile(mobile)

      // Calculate optimal dimensions
      let width: number
      let height: number

      if (isFullscreen) {
        width = screenWidth - 40
        height = screenHeight - 120
      } else if (mobile || viewMode === 'mobile') {
        // Mobile optimized dimensions - more compact
        width = Math.min(containerRect.width - 10, screenWidth - 20)
        height = Math.min(280, screenHeight * 0.35) // Reduced height for mobile
      } else if (viewMode === 'desktop') {
        // Desktop optimized dimensions
        width = Math.min(containerRect.width - 20, 1000)
        height = Math.min(600, screenHeight * 0.7)
      } else {
        // Auto mode - responsive with better mobile handling
        width = Math.min(containerRect.width - 10, mobile ? screenWidth - 20 : 800)
        height = Math.min(mobile ? 280 : 500, screenHeight * (mobile ? 0.35 : 0.6))
      }

      setDimensions({ width: Math.max(300, width), height: Math.max(250, height) })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [isFullscreen, viewMode])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const resetView = () => {
    // Reset any zoom or pan state if implemented
    setViewMode('auto')
  }

  const handleViewModeChange = (mode: 'auto' | 'mobile' | 'desktop') => {
    setViewMode(mode)
  }

  // Calculate responsive node sizes and spacing
  const getResponsiveConfig = () => {
    const baseConfig = {
      nodeRadius: 25,
      fontSize: 12,
      linkDistance: 100,
      chargeStrength: -400
    }

    if (isMobile || viewMode === 'mobile') {
      return {
        nodeRadius: 20,
        fontSize: 10,
        linkDistance: 80,
        chargeStrength: -300
      }
    }

    if (dimensions.width < 500) {
      return {
        nodeRadius: 18,
        fontSize: 10,
        linkDistance: 70,
        chargeStrength: -250
      }
    }

    return baseConfig
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _responsiveConfig = getResponsiveConfig()

  // Filter nodes for mobile if there are too many
  const getDisplayNodes = () => {
    if (!isMobile && viewMode !== 'mobile') return nodes
    
    // On mobile, prioritize important nodes
    if (nodes.length <= 8) return nodes
    
    // Show mastered, in-progress, and next available nodes
    const priorityNodes = nodes.filter(node => 
      node.status === 'mastered' || 
      node.status === 'in_progress' ||
      (node.status === 'locked' && node.prerequisites.every(prereqId => 
        nodes.find(n => n.id === prereqId)?.status === 'mastered'
      ))
    )
    
    return priorityNodes.slice(0, 10) // Limit to 10 nodes on mobile
  }

  const displayNodes = getDisplayNodes()

  return (
    <div ref={containerRef} className={`responsive-knowledge-graph ${className}`}>
      <Card className={isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : ''}>
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Knowledge Graph
                {isMobile && <Badge variant="secondary" className="text-xs">Mobile</Badge>}
              </CardTitle>
              <CardDescription>
                {isMobile 
                  ? `Showing ${displayNodes.length} key concepts`
                  : `Interactive learning path with ${nodes.length} concepts`
                }
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('mobile')}
                  className="h-8 px-2"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'auto' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('auto')}
                  className="h-8 px-2"
                >
                  Auto
                </Button>
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('desktop')}
                  className="h-8 px-2"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>

              {/* Control Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="h-8 px-2"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 px-2"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={isFullscreen ? 'flex-1 overflow-hidden' : ''}>
          <motion.div
            layout
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <KnowledgeGraphD3
              ref={graphRef}
              nodes={displayNodes}
              onNodeClick={onNodeClick}
              onNodeHover={onNodeHover}
              width={dimensions.width}
              height={dimensions.height}
              className="responsive-graph"
            />
          </motion.div>

          {/* Mobile-specific controls */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-wrap gap-2 justify-center"
            >
              <Badge variant="outline" className="text-xs">
                Tap nodes to explore
              </Badge>
              <Badge variant="outline" className="text-xs">
                Pinch to zoom
              </Badge>
              {nodes.length > displayNodes.length && (
                <Badge variant="secondary" className="text-xs">
                  +{nodes.length - displayNodes.length} more on desktop
                </Badge>
              )}
            </motion.div>
          )}

          {/* Progress Summary for Mobile */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 grid grid-cols-3 gap-2 text-center"
            >
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {nodes.filter(n => n.status === 'mastered').length}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">Done</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {nodes.filter(n => n.status === 'in_progress').length}
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">Learning</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {nodes.filter(n => n.status === 'locked').length}
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300">Locked</div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  )
}