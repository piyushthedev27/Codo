'use client'

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import { KnowledgeGraphNode } from '@/types/database'
import '@/styles/knowledge-graph-animations.css'

interface D3Node extends d3.SimulationNodeDatum {
  id: string
  concept: string
  status: 'locked' | 'in_progress' | 'mastered'
  category: string
  mastery_percentage: number
  difficulty_level: number
  estimated_duration_minutes: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node
  target: string | D3Node
  type: 'prerequisite' | 'related'
}

interface KnowledgeGraphD3Props {
  nodes: KnowledgeGraphNode[]
  onNodeClick?: (nodeId: string) => void
  onNodeHover?: (nodeId: string | null) => void
  width?: number
  height?: number
  className?: string
}

export interface KnowledgeGraphD3Ref {
  animateNodeStateChange: (nodeId: string, newStatus: 'locked' | 'in_progress' | 'mastered') => void
  animateNodeUnlock: (nodeId: string) => void
  animateNodeCompletion: (nodeId: string) => void
}

const KnowledgeGraphD3 = forwardRef<KnowledgeGraphD3Ref, KnowledgeGraphD3Props>(({
  nodes,
  onNodeClick,
  onNodeHover,
  width = 800,
  height = 600,
  className = ''
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Convert database nodes to D3 nodes
  const d3Nodes: D3Node[] = nodes.map(node => ({
    id: node.id,
    concept: node.concept,
    status: node.status,
    category: node.category,
    mastery_percentage: node.mastery_percentage,
    difficulty_level: node.difficulty_level,
    estimated_duration_minutes: node.estimated_duration_minutes,
    x: node.position.x,
    y: node.position.y
  }))

  // Generate links based on prerequisites
  const d3Links: D3Link[] = nodes.flatMap(node =>
    node.prerequisites.map(prereqId => ({
      source: prereqId,
      target: node.id,
      type: 'prerequisite' as const
    }))
  )

  // Node styling functions
  const getNodeColor = useCallback((status: string, masteryPercentage: number) => {
    switch (status) {
      case 'mastered':
        return '#10b981' // green-500
      case 'in_progress':
        // Gradient from yellow to green based on mastery percentage
        const progress = masteryPercentage / 100
        const r = Math.round(245 * (1 - progress) + 16 * progress)
        const g = Math.round(158 * (1 - progress) + 185 * progress)
        const b = Math.round(11 * (1 - progress) + 129 * progress)
        return `rgb(${r}, ${g}, ${b})`
      case 'locked':
        return '#6b7280' // gray-500
      default:
        return '#6b7280'
    }
  }, [])

  const getNodeIcon = useCallback((status: string) => {
    switch (status) {
      case 'mastered':
        return '✓'
      case 'in_progress':
        return '⚡'
      case 'locked':
        return '🔒'
      default:
        return '🔒'
    }
  }, [])

  const getNodeRadius = useCallback((difficultyLevel: number, status: string) => {
    const baseRadius = 25
    const difficultyMultiplier = 1 + (difficultyLevel - 1) * 0.2 // 1.0 to 1.8
    const statusMultiplier = status === 'mastered' ? 1.1 : status === 'in_progress' ? 1.05 : 1.0
    return baseRadius * difficultyMultiplier * statusMultiplier
  }, [])

  const getNodeStrokeWidth = useCallback((status: string, isHovered: boolean, isSelected: boolean) => {
    let width = 3
    if (isSelected) width += 2
    if (isHovered) width += 1
    if (status === 'in_progress') width += 1
    return width
  }, [])

  const getNodeStrokeColor = useCallback((status: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return '#3b82f6' // blue-500
    if (isHovered) return '#6366f1' // indigo-500
    
    switch (status) {
      case 'mastered':
        return '#059669' // green-600
      case 'in_progress':
        return '#d97706' // amber-600
      case 'locked':
        return '#4b5563' // gray-600
      default:
        return '#4b5563'
    }
  }, [])

  // Handle node interactions
  const handleNodeClick = useCallback((event: MouseEvent, d: D3Node) => {
    event.stopPropagation()
    setSelectedNode(d.id)
    onNodeClick?.(d.id)
  }, [onNodeClick])

  const handleNodeMouseEnter = useCallback((event: MouseEvent, d: D3Node) => {
    setHoveredNode(d.id)
    onNodeHover?.(d.id)
  }, [onNodeHover])

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null)
    onNodeHover?.(null)
  }, [onNodeHover])

  // Initialize and update D3 visualization
  useEffect(() => {
    if (!svgRef.current || d3Nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Create simulation
    const simulation = d3.forceSimulation(d3Nodes)
      .force('link', d3.forceLink(d3Links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => getNodeRadius(d.difficulty_level, d.status) + 5))

    simulationRef.current = simulation

    // Create arrow markers for directed links
    svg.append('defs').selectAll('marker')
      .data(['prerequisite'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#9ca3af')

    // Create links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(d3Links)
      .enter().append('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow-prerequisite)')

    // Create node groups
    const nodeGroup = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(d3Nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')

    // Add circles for nodes
    const circles = nodeGroup.append('circle')
      .attr('r', d => getNodeRadius(d.difficulty_level, d.status))
      .attr('fill', d => getNodeColor(d.status, d.mastery_percentage))
      .attr('stroke', d => getNodeStrokeColor(d.status, false, false))
      .attr('stroke-width', d => getNodeStrokeWidth(d.status, false, false))

    // Add progress rings for in-progress nodes
    nodeGroup.filter(d => d.status === 'in_progress')
      .append('circle')
      .attr('class', 'progress-ring')
      .attr('r', d => getNodeRadius(d.difficulty_level, d.status) + 8)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', d => {
        const circumference = 2 * Math.PI * (getNodeRadius(d.difficulty_level, d.status) + 8)
        const progress = d.mastery_percentage / 100
        return `${circumference * progress} ${circumference * (1 - progress)}`
      })
      .attr('stroke-dashoffset', 0)
      .attr('opacity', 0.8)

    // Add status icons
    nodeGroup.append('text')
      .attr('class', 'status-icon')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', d => `${Math.max(12, getNodeRadius(d.difficulty_level, d.status) * 0.6)}px`)
      .attr('font-weight', 'bold')
      .text(d => getNodeIcon(d.status))
      .style('pointer-events', 'none')

    // Add concept labels
    nodeGroup.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeRadius(d.difficulty_level, d.status) + 20)
      .attr('fill', '#374151')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(d => d.concept)
      .style('pointer-events', 'none')

    // Add mastery percentage for in-progress nodes
    nodeGroup.filter(d => d.status === 'in_progress')
      .append('text')
      .attr('class', 'mastery-percentage')
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeRadius(d.difficulty_level, d.status) + 35)
      .attr('fill', '#f59e0b')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text(d => `${d.mastery_percentage}%`)
      .style('pointer-events', 'none')

    // Add event listeners
    nodeGroup
      .on('click', handleNodeClick)
      .on('mouseenter', handleNodeMouseEnter)
      .on('mouseleave', handleNodeMouseLeave)

      // Update positions on simulation tick with smooth transitions
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      nodeGroup
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    // Add smooth animations for node state changes
    const animateNodeStateChange = (selection: any, duration = 600) => {
      selection
        .transition()
        .duration(duration)
        .ease(d3.easeElastic.period(0.3))
        .attr('r', (d: any) => getNodeRadius(d.difficulty_level, d.status))
        .attr('fill', (d: any) => getNodeColor(d.status, d.mastery_percentage))
        .attr('stroke', (d: any) => getNodeStrokeColor(d.status, false, false))
        .attr('stroke-width', (d: any) => getNodeStrokeWidth(d.status, false, false))
    }

    // Add pulse animation for in-progress nodes
    const addPulseAnimation = () => {
      nodeGroup.filter((d: any) => d.status === 'in_progress')
        .select('circle:not(.progress-ring)')
        .style('animation', 'pulse 2s infinite')
    }

    // Add celebration animation for newly mastered nodes
    const addCelebrationAnimation = (nodeId: string) => {
      const node = nodeGroup.filter((d: any) => d.id === nodeId)
      
      // Create celebration particles
      const particles = svg.append('g').attr('class', 'celebration-particles')
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI
        const distance = 40
        
        particles.append('circle')
          .attr('r', 3)
          .attr('fill', '#10b981')
          .attr('opacity', 1)
          .attr('transform', (d: any) => {
            const nodeData = node.datum() as any
            return `translate(${nodeData.x}, ${nodeData.y})`
          })
          .transition()
          .duration(800)
          .ease(d3.easeQuadOut)
          .attr('transform', (d: any) => {
            const nodeData = node.datum() as any
            const x = nodeData.x + Math.cos(angle) * distance
            const y = nodeData.y + Math.sin(angle) * distance
            return `translate(${x}, ${y})`
          })
          .attr('opacity', 0)
          .remove()
      }
      
      // Scale animation for the node
      node.select('circle:not(.progress-ring)')
        .transition()
        .duration(300)
        .ease(d3.easeBackOut.overshoot(1.7))
        .attr('r', (d: any) => getNodeRadius(d.difficulty_level, d.status) * 1.3)
        .transition()
        .duration(300)
        .ease(d3.easeBackIn)
        .attr('r', (d: any) => getNodeRadius(d.difficulty_level, d.status))
    }

    // Add unlock animation for newly unlocked nodes
    const addUnlockAnimation = (nodeId: string) => {
      const node = nodeGroup.filter((d: any) => d.id === nodeId)
      
      // Shake animation
      node
        .transition()
        .duration(100)
        .attr('transform', (d: any) => `translate(${d.x - 3}, ${d.y})`)
        .transition()
        .duration(100)
        .attr('transform', (d: any) => `translate(${d.x + 3}, ${d.y})`)
        .transition()
        .duration(100)
        .attr('transform', (d: any) => `translate(${d.x - 2}, ${d.y})`)
        .transition()
        .duration(100)
        .attr('transform', (d: any) => `translate(${d.x + 2}, ${d.y})`)
        .transition()
        .duration(100)
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
      
      // Glow effect
      node.select('circle:not(.progress-ring)')
        .style('filter', 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.8))')
        .transition()
        .duration(1000)
        .style('filter', 'none')
    }

    // Store animation functions for external use
    ;(svg.node() as any).__animateStateChange = animateNodeStateChange
    ;(svg.node() as any).__addCelebrationAnimation = addCelebrationAnimation
    ;(svg.node() as any).__addUnlockAnimation = addUnlockAnimation
    
    // Apply initial animations
    addPulseAnimation()

    // Cleanup function
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [d3Nodes, d3Links, width, height, getNodeColor, getNodeIcon, getNodeRadius, getNodeStrokeWidth, getNodeStrokeColor, handleNodeClick, handleNodeMouseEnter, handleNodeMouseLeave])

  // Update node styles when hover/selection state changes with smooth transitions
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    
    // Smooth transition for stroke changes
    svg.selectAll('.node circle:not(.progress-ring)')
      .transition()
      .duration(200)
      .ease(d3.easeQuadInOut)
      .attr('stroke', (d: any) => getNodeStrokeColor(d.status, d.id === hoveredNode, d.id === selectedNode))
      .attr('stroke-width', (d: any) => getNodeStrokeWidth(d.status, d.id === hoveredNode, d.id === selectedNode))
      .style('filter', (d: any) => {
        if (d.id === selectedNode) return 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
        if (d.id === hoveredNode) return 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))'
        return 'none'
      })

    // Animate progress rings for in-progress nodes
    svg.selectAll('.progress-ring')
      .transition()
      .duration(300)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dasharray', (d: any) => {
        const circumference = 2 * Math.PI * (getNodeRadius(d.difficulty_level, d.status) + 8)
        const progress = d.mastery_percentage / 100
        return `${circumference * progress} ${circumference * (1 - progress)}`
      })

    // Scale animation for hovered nodes
    svg.selectAll('.node')
      .transition()
      .duration(200)
      .ease(d3.easeQuadInOut)
      .attr('transform', (d: any) => {
        const scale = d.id === hoveredNode ? 1.1 : d.id === selectedNode ? 1.05 : 1
        return `translate(${d.x}, ${d.y}) scale(${scale})`
      })

  }, [hoveredNode, selectedNode, getNodeStrokeColor, getNodeStrokeWidth, getNodeRadius])

  // Expose animation methods via ref
  useImperativeHandle(ref, () => ({
    animateNodeStateChange: (nodeId: string, newStatus: 'locked' | 'in_progress' | 'mastered') => {
      if (!svgRef.current) return
      
      const svg = d3.select(svgRef.current)
      const node = svg.selectAll('.node').filter((d: any) => d.id === nodeId)
      
      // Update the node data
      const nodeData = d3Nodes.find(n => n.id === nodeId)
      if (nodeData) {
        nodeData.status = newStatus
      }
      
      // Animate the change
      node.select('circle:not(.progress-ring)')
        .transition()
        .duration(600)
        .ease(d3.easeElastic.period(0.3))
        .attr('fill', getNodeColor(newStatus, nodeData?.mastery_percentage || 0))
        .attr('stroke', getNodeStrokeColor(newStatus, false, false))
      
      // Update icon
      node.select('.status-icon')
        .transition()
        .duration(300)
        .style('opacity', 0)
        .transition()
        .duration(300)
        .style('opacity', 1)
        .text(getNodeIcon(newStatus))
    },
    
    animateNodeUnlock: (nodeId: string) => {
      if (!svgRef.current) return
      
      const svg = d3.select(svgRef.current)
      const node = svg.selectAll('.node').filter((d: any) => d.id === nodeId)
      
      // Add unlock animation class
      node.classed('unlocked', true)
      
      // Remove class after animation
      setTimeout(() => {
        node.classed('unlocked', false)
      }, 1500)
    },
    
    animateNodeCompletion: (nodeId: string) => {
      if (!svgRef.current) return
      
      const svg = d3.select(svgRef.current)
      const node = svg.selectAll('.node').filter((d: any) => d.id === nodeId)
      
      // Add celebration animation
      node.classed('mastered', true)
      
      // Create celebration particles
      const nodeData = node.datum() as any
      const particles = svg.append('g').attr('class', 'celebration-particles')
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * 2 * Math.PI
        const distance = 50
        
        particles.append('circle')
          .attr('r', 4)
          .attr('fill', '#10b981')
          .attr('opacity', 1)
          .attr('transform', `translate(${nodeData.x}, ${nodeData.y})`)
          .transition()
          .duration(1000)
          .ease(d3.easeQuadOut)
          .attr('transform', `translate(${nodeData.x + Math.cos(angle) * distance}, ${nodeData.y + Math.sin(angle) * distance})`)
          .attr('opacity', 0)
          .remove()
      }
      
      // Remove class after animation
      setTimeout(() => {
        node.classed('mastered', false)
      }, 600)
    }
  }), [d3Nodes, getNodeColor, getNodeStrokeColor, getNodeIcon])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`knowledge-graph-container ${className}`}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        viewBox={`0 0 ${width} ${height}`}
      />
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
          <span className="text-gray-700 dark:text-gray-300">Mastered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">⚡</div>
          <span className="text-gray-700 dark:text-gray-300">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">🔒</div>
          <span className="text-gray-700 dark:text-gray-300">Locked</span>
        </div>
      </div>
    </motion.div>
  )
})

KnowledgeGraphD3.displayName = 'KnowledgeGraphD3'

export default KnowledgeGraphD3