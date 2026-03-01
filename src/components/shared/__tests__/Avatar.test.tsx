/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Avatar Component Tests
 * Tests for enhanced 3D avatar display and engaging visual identity features
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { Avatar, AvatarGroup, TypingAvatar, InteractiveAvatar } from '../Avatar'
import { AI_PEERS } from '@/lib/avatars'

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    )
  }
})

describe('Avatar Component', () => {
  it('renders Sarah 3D avatar correctly', () => {
    render(<Avatar peerId="sarah" size="md" />)

    const avatar = screen.getByAltText(/Sarah.*curious AI peer/)
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', '/images/avatars/sarah-3d.png')
  })

  it('renders Alex 3D avatar correctly', () => {
    render(<Avatar peerId="alex" size="lg" />)

    const avatar = screen.getByAltText(/Alex.*analytical AI peer/)
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', '/images/avatars/alex-3d.png')
  })

  it('renders Jordan 3D avatar correctly', () => {
    render(<Avatar peerId="jordan" size="sm" />)

    const avatar = screen.getByAltText(/Jordan.*supportive AI peer/)
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', '/images/avatars/jordan-3d.png')
  })

  it('applies correct size classes', () => {
    const { container } = render(<Avatar peerId="sarah" size="xl" />)

    // Look for the inner avatar container with size classes
    const avatarContainer = container.querySelector('[id="avatar-sarah"]')
    expect(avatarContainer).toHaveClass('w-20', 'h-20')
  })

  it('shows personality ring colors', () => {
    const { container } = render(<Avatar peerId="sarah" showRing={true} />)

    // Look for the inner avatar container with ring classes
    const avatarContainer = container.querySelector('[id="avatar-sarah"]')
    expect(avatarContainer).toHaveClass('ring-pink-400') // Sarah is curious
  })

  it('handles click events with animation', () => {
    const handleClick = jest.fn()
    render(<Avatar peerId="alex" onClick={handleClick} interactive />)

    const avatarContainer = screen.getByRole('button')
    fireEvent.click(avatarContainer)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows status indicators correctly', () => {
    const { container } = render(<Avatar peerId="sarah" showStatus status="typing" />)

    const statusIndicator = container.querySelector('[title*="typing"]')
    expect(statusIndicator).toBeInTheDocument()
  })

  it('displays personality badge when enabled', () => {
    const { container } = render(<Avatar peerId="sarah" showPersonalityBadge />)

    // Should show curious emoji for Sarah
    expect(container.textContent).toContain('🤔')
  })

  it('falls back to Sarah avatar on error', () => {
    render(<Avatar peerId="invalid" />)

    // Should still render an image (fallback)
    const avatar = screen.getByRole('img')
    expect(avatar).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn()
    render(<Avatar peerId="alex" onClick={handleClick} />)

    const avatarContainer = screen.getByRole('button')
    fireEvent.keyDown(avatarContainer, { key: 'Enter' })

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('AvatarGroup Component', () => {
  it('renders multiple 3D avatars', () => {
    render(<AvatarGroup peerIds={['sarah', 'alex', 'jordan']} />)

    expect(screen.getByAltText(/Sarah.*curious AI peer/)).toBeInTheDocument()
    expect(screen.getByAltText(/Alex.*analytical AI peer/)).toBeInTheDocument()
    expect(screen.getByAltText(/Jordan.*supportive AI peer/)).toBeInTheDocument()
  })

  it('shows overflow count when maxDisplay is exceeded', () => {
    render(<AvatarGroup peerIds={['sarah', 'alex', 'jordan']} maxDisplay={2} />)

    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('applies interactive features when enabled', () => {
    const { container } = render(
      <AvatarGroup peerIds={['sarah', 'alex']} interactive showStatus />
    )

    // Should have hover effects and status indicators
    const avatarContainers = container.querySelectorAll('[id^="avatar-"]')
    expect(avatarContainers.length).toBeGreaterThan(0)
  })
})

describe('Specialized Avatar Components', () => {
  it('renders TypingAvatar with animation', () => {
    const { container } = render(<TypingAvatar peerId="sarah" />)

    // Should have typing animation dots
    const typingDots = container.querySelectorAll('.animate-bounce')
    expect(typingDots.length).toBeGreaterThan(0)
  })

  it('renders InteractiveAvatar with active state', () => {
    const { container } = render(<InteractiveAvatar peerId="alex" isActive />)

    // Should have active state styling
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})

describe('Avatar System Integration', () => {
  it('all AI peers have 3D avatar URLs', () => {
    Object.values(AI_PEERS).forEach(peer => {
      expect(peer.avatar_url).toMatch(/\/images\/avatars\/.*-3d\.png$/)
    })
  })

  it('Sarah, Alex, and Jordan are properly configured', () => {
    expect(AI_PEERS.sarah).toBeDefined()
    expect(AI_PEERS.alex).toBeDefined()
    expect(AI_PEERS.jordan).toBeDefined()

    expect(AI_PEERS.sarah.avatar_url).toBe('/images/avatars/sarah-3d.png')
    expect(AI_PEERS.alex.avatar_url).toBe('/images/avatars/alex-3d.png')
    expect(AI_PEERS.jordan.avatar_url).toBe('/images/avatars/jordan-3d.png')
  })

  it('personality types are correctly mapped', () => {
    expect(AI_PEERS.sarah.personality).toBe('curious')
    expect(AI_PEERS.alex.personality).toBe('analytical')
    expect(AI_PEERS.jordan.personality).toBe('supportive')
  })

  it('personality-based features work correctly', () => {
    const { container: sarahContainer } = render(<Avatar peerId="sarah" showRing />)
    const { container: alexContainer } = render(<Avatar peerId="alex" showRing />)
    const { container: jordanContainer } = render(<Avatar peerId="jordan" showRing />)

    // Each should have their personality ring color on the inner avatar container
    expect(sarahContainer.querySelector('[id="avatar-sarah"]')).toHaveClass('ring-pink-400')
    expect(alexContainer.querySelector('[id="avatar-alex"]')).toHaveClass('ring-blue-400')
    expect(jordanContainer.querySelector('[id="avatar-jordan"]')).toHaveClass('ring-green-400')
  })

  it('enhanced visual identity features are accessible', () => {
    render(<Avatar peerId="sarah" showTooltip showPersonalityBadge />)

    const avatar = screen.getByLabelText(/Sarah.*curious AI study buddy/)
    expect(avatar).toBeInTheDocument()
  })
})