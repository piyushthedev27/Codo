/**
 * Avatar Context Provider
 * Manages avatar states, interactions, and animations across the application
 */

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AIPeerProfile, getAllPeers, preloadAvatars } from '@/lib/avatars'

interface AvatarState {
  peerId: string
  status: 'online' | 'typing' | 'thinking' | 'offline'
  isActive: boolean
  lastInteraction: Date
}

interface AvatarContextType {
  avatarStates: Record<string, AvatarState>
  updateAvatarStatus: (peerId: string, status: AvatarState['status']) => void
  setAvatarActive: (peerId: string, active: boolean) => void
  getAvatarState: (peerId: string) => AvatarState
  triggerAvatarAnimation: (peerId: string, animation: string) => void
  preloadAllAvatars: () => void
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined)

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatarStates, setAvatarStates] = useState<Record<string, AvatarState>>({})

  // Initialize avatar states for all AI peers
  useEffect(() => {
    const peers = getAllPeers()
    const initialStates: Record<string, AvatarState> = {}
    
    peers.forEach(peer => {
      initialStates[peer.id] = {
        peerId: peer.id,
        status: 'online',
        isActive: false,
        lastInteraction: new Date()
      }
    })
    
    setAvatarStates(initialStates)
    
    // Preload avatar images for better performance
    preloadAvatars()
  }, [])

  const updateAvatarStatus = useCallback((peerId: string, status: AvatarState['status']) => {
    setAvatarStates(prev => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        status,
        lastInteraction: new Date()
      }
    }))
  }, [])

  const setAvatarActive = useCallback((peerId: string, active: boolean) => {
    setAvatarStates(prev => ({
      ...prev,
      [peerId]: {
        ...prev[peerId],
        isActive: active,
        lastInteraction: new Date()
      }
    }))
  }, [])

  const getAvatarState = useCallback((peerId: string): AvatarState => {
    return avatarStates[peerId] || {
      peerId,
      status: 'online',
      isActive: false,
      lastInteraction: new Date()
    }
  }, [avatarStates])

  const triggerAvatarAnimation = useCallback((peerId: string, animation: string) => {
    const element = document.getElementById(`avatar-${peerId}`)
    if (element) {
      element.classList.add(animation)
      setTimeout(() => element.classList.remove(animation), 1000)
    }
  }, [])

  const preloadAllAvatars = useCallback(() => {
    preloadAvatars()
  }, [])

  const contextValue: AvatarContextType = {
    avatarStates,
    updateAvatarStatus,
    setAvatarActive,
    getAvatarState,
    triggerAvatarAnimation,
    preloadAllAvatars
  }

  return (
    <AvatarContext.Provider value={contextValue}>
      {children}
    </AvatarContext.Provider>
  )
}

export function useAvatar() {
  const context = useContext(AvatarContext)
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider')
  }
  return context
}

// Custom hooks for specific avatar interactions
export function useAvatarInteraction(peerId: string) {
  const { updateAvatarStatus, setAvatarActive, triggerAvatarAnimation, getAvatarState } = useAvatar()
  
  const startTyping = useCallback(() => {
    updateAvatarStatus(peerId, 'typing')
    setAvatarActive(peerId, true)
  }, [peerId, updateAvatarStatus, setAvatarActive])
  
  const stopTyping = useCallback(() => {
    updateAvatarStatus(peerId, 'online')
    setAvatarActive(peerId, false)
  }, [peerId, updateAvatarStatus, setAvatarActive])
  
  const startThinking = useCallback(() => {
    updateAvatarStatus(peerId, 'thinking')
    setAvatarActive(peerId, true)
  }, [peerId, updateAvatarStatus, setAvatarActive])
  
  const celebrate = useCallback(() => {
    triggerAvatarAnimation(peerId, 'animate-bounce')
    setTimeout(() => triggerAvatarAnimation(peerId, 'animate-wiggle'), 500)
  }, [peerId, triggerAvatarAnimation])
  
  const avatarState = getAvatarState(peerId)
  
  return {
    avatarState,
    startTyping,
    stopTyping,
    startThinking,
    celebrate
  }
}

// Hook for managing collaborative avatar states
export function useCollaborativeAvatars(peerIds: string[]) {
  const { updateAvatarStatus, setAvatarActive } = useAvatar()
  
  const setActivePeer = useCallback((activeId: string) => {
    peerIds.forEach(peerId => {
      if (peerId === activeId) {
        updateAvatarStatus(peerId, 'typing')
        setAvatarActive(peerId, true)
      } else {
        updateAvatarStatus(peerId, 'online')
        setAvatarActive(peerId, false)
      }
    })
  }, [peerIds, updateAvatarStatus, setAvatarActive])
  
  const resetAllPeers = useCallback(() => {
    peerIds.forEach(peerId => {
      updateAvatarStatus(peerId, 'online')
      setAvatarActive(peerId, false)
    })
  }, [peerIds, updateAvatarStatus, setAvatarActive])
  
  return {
    setActivePeer,
    resetAllPeers
  }
}