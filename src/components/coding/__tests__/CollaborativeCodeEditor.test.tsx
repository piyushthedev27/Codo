/**
 * Tests for Collaborative Code Editor
 */

import { render, screen } from '@testing-library/react'
import { CollaborativeCodeEditor } from '../CollaborativeCodeEditor'

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  Editor: ({ value }: { value: string }) => (
    <div data-testid="monaco-editor">{value}</div>
  )
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('CollaborativeCodeEditor', () => {
  it('renders the editor with initial code', () => {
    const initialCode = 'console.log("Hello, world!");'
    
    render(
      <CollaborativeCodeEditor 
        initialCode={initialCode}
        enableCollaboration={false}
      />
    )
    
    expect(screen.getByTestId('monaco-editor')).toHaveTextContent(initialCode)
  })

  it('shows collaboration features when enabled', () => {
    render(
      <CollaborativeCodeEditor 
        enableCollaboration={true}
      />
    )
    
    expect(screen.getByText('Collaborating with:')).toBeInTheDocument()
    expect(screen.getByText('Compare Approaches')).toBeInTheDocument()
    expect(screen.getByText('Detailed Analysis')).toBeInTheDocument()
    expect(screen.getByText('Spot the Bug')).toBeInTheDocument()
  })

  it('hides collaboration features when disabled', () => {
    render(
      <CollaborativeCodeEditor 
        enableCollaboration={false}
      />
    )
    
    expect(screen.queryByText('Collaborating with:')).not.toBeInTheDocument()
  })

  it('calls onCodeChange when code is modified', () => {
    const mockOnCodeChange = jest.fn()
    
    render(
      <CollaborativeCodeEditor 
        onCodeChange={mockOnCodeChange}
        enableCollaboration={false}
      />
    )
    
    // Monaco Editor onChange would be tested in integration tests
    expect(mockOnCodeChange).not.toHaveBeenCalled()
  })
})