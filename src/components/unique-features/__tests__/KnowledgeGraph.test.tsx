/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import InteractiveKnowledgeGraph from '../InteractiveKnowledgeGraph'
import { KnowledgeGraphNode } from '@/types/database'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock the D3 components
jest.mock('../ResponsiveKnowledgeGraph', () => {
  return function MockResponsiveKnowledgeGraph({ nodes, onNodeClick }: any) {
    return (
      <div data-testid="knowledge-graph">
        <div>Knowledge Graph</div>
        <div>Showing {nodes.length} concepts</div>
        {nodes.map((node: any) => (
          <button
            key={node.id}
            onClick={() => onNodeClick?.(node.id)}
            data-testid={`node-${node.id}`}
          >
            {node.concept} - {node.status}
          </button>
        ))}
      </div>
    )
  }
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

const mockNodes: KnowledgeGraphNode[] = [
  {
    id: '1',
    user_id: 'user1',
    concept: 'HTML Basics',
    category: 'Web Development',
    prerequisites: [],
    status: 'mastered',
    position: { x: 100, y: 100 },
    connections: ['2'],
    mastery_percentage: 100,
    estimated_duration_minutes: 30,
    difficulty_level: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    concept: 'CSS Styling',
    category: 'Web Development',
    prerequisites: ['1'],
    status: 'in_progress',
    position: { x: 200, y: 100 },
    connections: ['3'],
    mastery_percentage: 65,
    estimated_duration_minutes: 45,
    difficulty_level: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'user1',
    concept: 'JavaScript Fundamentals',
    category: 'Programming',
    prerequisites: ['2'],
    status: 'locked',
    position: { x: 300, y: 100 },
    connections: [],
    mastery_percentage: 0,
    estimated_duration_minutes: 60,
    difficulty_level: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

describe('InteractiveKnowledgeGraph', () => {
  const mockOnStartLesson = jest.fn()
  const mockOnViewDetails = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.innerWidth for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('renders the knowledge graph component', () => {
    render(
      <InteractiveKnowledgeGraph
        nodes={mockNodes}
        onStartLesson={mockOnStartLesson}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByTestId('knowledge-graph')).toBeInTheDocument()
    expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
  })

  it('displays correct number of nodes', () => {
    render(
      <InteractiveKnowledgeGraph
        nodes={mockNodes}
        onStartLesson={mockOnStartLesson}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Showing 3 concepts')).toBeInTheDocument()
  })

  it('shows default exploration message when no node is selected', () => {
    render(
      <InteractiveKnowledgeGraph
        nodes={mockNodes}
        onStartLesson={mockOnStartLesson}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Explore Your Path')).toBeInTheDocument()
    expect(screen.getByText('Click on any concept in the graph to see details and start learning.')).toBeInTheDocument()
  })

  it('displays status legend', () => {
    render(
      <InteractiveKnowledgeGraph
        nodes={mockNodes}
        onStartLesson={mockOnStartLesson}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Green: Mastered concepts')).toBeInTheDocument()
    expect(screen.getByText('Yellow: Currently learning')).toBeInTheDocument()
    expect(screen.getByText('Gray: Locked concepts')).toBeInTheDocument()
  })

  it('renders all node concepts', () => {
    render(
      <InteractiveKnowledgeGraph
        nodes={mockNodes}
        onStartLesson={mockOnStartLesson}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('HTML Basics - mastered')).toBeInTheDocument()
    expect(screen.getByText('CSS Styling - in_progress')).toBeInTheDocument()
    expect(screen.getByText('JavaScript Fundamentals - locked')).toBeInTheDocument()
  })

  it('handles mobile layout correctly', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    render(
      <InteractiveKnowledgeGraph
        nodes={mockNodes}
        onStartLesson={mockOnStartLesson}
        onViewDetails={mockOnViewDetails}
      />
    )

    // Should still render the graph
    expect(screen.getByTestId('knowledge-graph')).toBeInTheDocument()
  })
})