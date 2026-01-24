/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { HeroSection } from '../HeroSection'
import { ProblemStatement } from '../ProblemStatement'
import { FeaturesShowcase } from '../FeaturesShowcase'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

// Mock dynamic imports
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div>Mocked Dynamic Component</div>
  return DynamicComponent
})

describe('Landing Page Components', () => {
  describe('HeroSection', () => {
    it('renders the main headline', () => {
      render(<HeroSection />)
      expect(screen.getByText(/Learn Programming with/)).toBeInTheDocument()
      expect(screen.getAllByText(/AI Study Buddies/)).toHaveLength(2) // One in headline, one in features
    })

    it('renders the CTA buttons', () => {
      render(<HeroSection />)
      expect(screen.getByText('Start Learning Free')).toBeInTheDocument()
      expect(screen.getByText('Watch Demo')).toBeInTheDocument()
    })

    it('displays feature highlights', () => {
      render(<HeroSection />)
      expect(screen.getAllByText('AI Study Buddies')).toHaveLength(2) // Appears in both headline and features
      expect(screen.getByText('Voice Coaching')).toBeInTheDocument()
      expect(screen.getByText('Smart Learning Paths')).toBeInTheDocument()
    })
  })

  describe('ProblemStatement', () => {
    it('renders the section title', () => {
      render(<ProblemStatement />)
      expect(screen.getByText(/Why Traditional Programming Education/)).toBeInTheDocument()
      expect(screen.getByText(/Fails/)).toBeInTheDocument()
    })

    it('displays problem statistics', () => {
      render(<ProblemStatement />)
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('73%')).toBeInTheDocument()
      expect(screen.getByText('68%')).toBeInTheDocument()
      expect(screen.getByText('90%+')).toBeInTheDocument()
    })
  })

  describe('FeaturesShowcase', () => {
    it('renders all 8 unique features', () => {
      render(<FeaturesShowcase />)
      expect(screen.getByText('Professional Landing Page')).toBeInTheDocument()
      expect(screen.getByText('Synthetic Peer Learning')).toBeInTheDocument()
      expect(screen.getByText('AI Voice Coaching')).toBeInTheDocument()
      expect(screen.getByText('Interactive Knowledge Graph')).toBeInTheDocument()
      expect(screen.getByText('Mistake-Driven Learning')).toBeInTheDocument()
      expect(screen.getByText('Collaborative Code Canvas')).toBeInTheDocument()
      expect(screen.getByText('Live Learning Insights')).toBeInTheDocument()
      expect(screen.getByText('Code Duel Mode')).toBeInTheDocument()
    })

    it('displays feature descriptions', () => {
      render(<FeaturesShowcase />)
      expect(screen.getByText(/Meet Sarah, Alex, and Jordan/)).toBeInTheDocument()
      expect(screen.getByText(/Real-time voice pair programming/)).toBeInTheDocument()
    })
  })
})

describe('Responsive Design', () => {
  it('applies responsive classes correctly', () => {
    render(<HeroSection />)
    const heroElement = screen.getByText(/Learn Programming with/).closest('section')
    expect(heroElement).toHaveClass('min-h-screen')
  })
})

describe('Accessibility', () => {
  it('has proper heading hierarchy', () => {
    render(<HeroSection />)
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
  })

  it('has accessible button labels', () => {
    render(<HeroSection />)
    const ctaButton = screen.getByRole('button', { name: /Start Learning Free/ })
    expect(ctaButton).toBeInTheDocument()
  })
})