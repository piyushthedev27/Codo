'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface Node {
  id: string
  name: string
  status: 'locked' | 'in_progress' | 'mastered'
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string | Node
  target: string | Node
}

export default function D3KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null)
  
  const initialNodes: Node[] = [
    { id: 'html', name: 'HTML', status: 'mastered' },
    { id: 'css', name: 'CSS', status: 'mastered' },
    { id: 'js', name: 'JavaScript', status: 'in_progress' },
    { id: 'react', name: 'React', status: 'locked' },
    { id: 'hooks', name: 'React Hooks', status: 'locked' },
    { id: 'state', name: 'State Management', status: 'locked' },
    { id: 'api', name: 'API Integration', status: 'locked' },
    { id: 'testing', name: 'Testing', status: 'locked' }
  ]

  const [nodes, setNodes] = useState<Node[]>(initialNodes)

  const links: Link[] = [
    { source: 'html', target: 'css' },
    { source: 'css', target: 'js' },
    { source: 'js', target: 'react' },
    { source: 'react', target: 'hooks' },
    { source: 'hooks', target: 'state' },
    { source: 'js', target: 'api' },
    { source: 'react', target: 'testing' }
  ]

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'mastered': return '#10b981'
      case 'in_progress': return '#f59e0b'
      case 'locked': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'mastered': return '✓'
      case 'in_progress': return '⚡'
      case 'locked': return '🔒'
      default: return '🔒'
    }
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = 400
    const height = 300

    svg.selectAll('*').remove()

    // Create simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))

    simulationRef.current = simulation

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6)

    // Create nodes
    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')

    // Add circles for nodes
    nodeGroup.append('circle')
      .attr('r', 25)
      .attr('fill', (d) => getNodeColor(d.status))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)

    // Add status icons
    nodeGroup.append('text')
      .attr('class', 'status-icon')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .text((d) => getNodeIcon(d.status))

    // Add labels
    nodeGroup.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '45px')
      .attr('fill', '#374151')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text((d) => d.name)

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      nodeGroup
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [nodes])

  // Separate effect for animation
  useEffect(() => {
    const progressSteps: Array<{ nodeId: string; status: 'locked' | 'in_progress' | 'mastered' }> = [
      { nodeId: 'js', status: 'mastered' },
      { nodeId: 'react', status: 'in_progress' },
      { nodeId: 'react', status: 'mastered' },
      { nodeId: 'hooks', status: 'in_progress' }
    ]

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % (progressSteps.length + 1)
        
        if (nextStep < progressSteps.length) {
          const step = progressSteps[nextStep]
          
          setNodes(prevNodes => 
            prevNodes.map(node => 
              node.id === step.nodeId 
                ? { ...node, status: step.status }
                : node
            )
          )
        } else {
          // Reset to initial state
          setNodes(initialNodes)
        }
        
        return nextStep
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
      <svg
        ref={svgRef}
        width="400"
        height="300"
        className="w-full h-auto"
        viewBox="0 0 400 300"
      />
    </div>
  )
}