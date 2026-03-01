'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, RotateCcw, Zap, CheckCircle, BookOpen, Play } from 'lucide-react'
import InteractiveKnowledgeGraph from '@/components/unique-features/InteractiveKnowledgeGraph'
import { KnowledgeGraphNode } from '@/types/database'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'

// Demo data for the knowledge graph
const demoNodes: KnowledgeGraphNode[] = [
  {
    id: '1',
    user_id: 'demo',
    concept: 'HTML Basics',
    category: 'Web Development',
    prerequisites: [],
    status: 'mastered',
    position: { x: 150, y: 200 },
    connections: ['2', '3'],
    mastery_percentage: 100,
    estimated_duration_minutes: 30,
    difficulty_level: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'demo',
    concept: 'CSS Styling',
    category: 'Web Development',
    prerequisites: ['1'],
    status: 'mastered',
    position: { x: 300, y: 150 },
    connections: ['4', '5'],
    mastery_percentage: 100,
    estimated_duration_minutes: 45,
    difficulty_level: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'demo',
    concept: 'JavaScript Basics',
    category: 'Programming',
    prerequisites: ['1'],
    status: 'in_progress',
    position: { x: 300, y: 250 },
    connections: ['6', '7'],
    mastery_percentage: 75,
    estimated_duration_minutes: 60,
    difficulty_level: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    user_id: 'demo',
    concept: 'CSS Grid & Flexbox',
    category: 'Web Development',
    prerequisites: ['2'],
    status: 'locked',
    position: { x: 450, y: 100 },
    connections: ['8'],
    mastery_percentage: 0,
    estimated_duration_minutes: 90,
    difficulty_level: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    user_id: 'demo',
    concept: 'Responsive Design',
    category: 'Web Development',
    prerequisites: ['2'],
    status: 'locked',
    position: { x: 450, y: 200 },
    connections: ['9'],
    mastery_percentage: 0,
    estimated_duration_minutes: 75,
    difficulty_level: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    user_id: 'demo',
    concept: 'DOM Manipulation',
    category: 'Programming',
    prerequisites: ['3'],
    status: 'locked',
    position: { x: 450, y: 250 },
    connections: ['10'],
    mastery_percentage: 0,
    estimated_duration_minutes: 80,
    difficulty_level: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    user_id: 'demo',
    concept: 'ES6+ Features',
    category: 'Programming',
    prerequisites: ['3'],
    status: 'locked',
    position: { x: 450, y: 300 },
    connections: ['11'],
    mastery_percentage: 0,
    estimated_duration_minutes: 100,
    difficulty_level: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    user_id: 'demo',
    concept: 'Advanced CSS',
    category: 'Web Development',
    prerequisites: ['4', '5'],
    status: 'locked',
    position: { x: 600, y: 150 },
    connections: [],
    mastery_percentage: 0,
    estimated_duration_minutes: 120,
    difficulty_level: 6,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '9',
    user_id: 'demo',
    concept: 'Mobile-First Design',
    category: 'Web Development',
    prerequisites: ['5'],
    status: 'locked',
    position: { x: 600, y: 200 },
    connections: [],
    mastery_percentage: 0,
    estimated_duration_minutes: 90,
    difficulty_level: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '10',
    user_id: 'demo',
    concept: 'Event Handling',
    category: 'Programming',
    prerequisites: ['6'],
    status: 'locked',
    position: { x: 600, y: 250 },
    connections: ['12'],
    mastery_percentage: 0,
    estimated_duration_minutes: 70,
    difficulty_level: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '11',
    user_id: 'demo',
    concept: 'Async Programming',
    category: 'Programming',
    prerequisites: ['7'],
    status: 'locked',
    position: { x: 600, y: 300 },
    connections: ['12'],
    mastery_percentage: 0,
    estimated_duration_minutes: 110,
    difficulty_level: 6,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '12',
    user_id: 'demo',
    concept: 'React Fundamentals',
    category: 'Framework',
    prerequisites: ['10', '11'],
    status: 'locked',
    position: { x: 750, y: 275 },
    connections: [],
    mastery_percentage: 0,
    estimated_duration_minutes: 150,
    difficulty_level: 7,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export default function KnowledgeGraphDemoPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedPath, setSelectedPath] = useState<string>('web-development')

  const handleStartLesson = (nodeId: string) => {
    console.log('Starting lesson for node:', nodeId)
    // In a real app, this would navigate to the lesson page
    alert(`Starting lesson for node ${nodeId}`)
  }

  const handleViewDetails = (nodeId: string) => {
    console.log('Viewing details for node:', nodeId)
    // In a real app, this would show detailed information
    alert(`Viewing details for node ${nodeId}`)
  }

  const handleResetProgress = () => {
    // In a real app, this would reset the user's progress
    alert('Progress reset functionality would be implemented here')
  }

  const getPathStats = () => {
    const totalNodes = demoNodes.length
    const masteredNodes = demoNodes.filter(n => n.status === 'mastered').length
    const inProgressNodes = demoNodes.filter(n => n.status === 'in_progress').length
    const completionPercentage = Math.round((masteredNodes / totalNodes) * 100)
    
    return {
      totalNodes,
      masteredNodes,
      inProgressNodes,
      completionPercentage
    }
  }

  const stats = getPathStats()

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Concepts</p>
                  <p className="text-2xl font-bold">{stats.totalNodes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mastered</p>
                  <p className="text-2xl font-bold">{stats.masteredNodes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgressNodes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="text-2xl font-bold">{stats.completionPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Path Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Learning Path: Web Development Fundamentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                Interactive Learning
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                Adaptive Difficulty
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                Personalized Path
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This shows a complete learning path from HTML basics to React fundamentals. 
              Click on any concept to explore prerequisites, estimated time, and difficulty level.
            </p>
            <Button variant="outline" onClick={handleResetProgress}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Progress
            </Button>
          </CardContent>
        </Card>

        {/* Interactive Knowledge Graph */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Interactive Knowledge Graph</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <InteractiveKnowledgeGraph
              nodes={demoNodes}
              onStartLesson={handleStartLesson}
              onViewDetails={handleViewDetails}
              className="min-h-[600px]"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}