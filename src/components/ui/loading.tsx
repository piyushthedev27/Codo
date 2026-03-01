'use client'
/* eslint-disable react-hooks/static-components */

import React from 'react'
import { Loader2, Brain, Code, Users, Target, BookOpen, Zap, Lightbulb, MessageSquare, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { animationClasses } from '@/lib/animations/animation-optimizer'

// Base loading spinner component
export function LoadingSpinner({
  size = 'md',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <Loader2 className={cn(
      'animate-spin text-blue-500 hw-accelerated',
      sizeClasses[size],
      className
    )} />
  )
}

// Skeleton components for different content types
export function SkeletonLine({
  width = 'full',
  height = 'h-4',
  className = '',
  style
}: {
  width?: string | 'full' | 'half' | 'quarter' | 'three-quarters'
  height?: string
  className?: string
  style?: React.CSSProperties
}) {
  const widthClasses = {
    full: 'w-full',
    half: 'w-1/2',
    quarter: 'w-1/4',
    'three-quarters': 'w-3/4'
  }

  const widthClass = typeof width === 'string' && widthClasses[width as keyof typeof widthClasses]
    ? widthClasses[width as keyof typeof widthClasses]
    : width

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded animate-shimmer',
        height,
        widthClass,
        className
      )}
      style={style}
    />
  )
}

export function SkeletonAvatar({
  size = 'md',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={cn(
      'bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer',
      sizeClasses[size],
      className
    )} />
  )
}

export function SkeletonCard({
  className = '',
  showHeader = true,
  lines = 3
}: {
  className?: string
  showHeader?: boolean
  lines?: number
}) {
  return (
    <Card className={cn('animate-scale-in', className)}>
      {showHeader && (
        <CardHeader>
          <SkeletonLine width="half" height="h-5" />
          <SkeletonLine width="three-quarters" height="h-3" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? 'half' : 'full'}
            height="h-4"
            className={animationClasses.fadeInUp}
            style={{ animationDelay: `${i * 0.1}s` } as React.CSSProperties}
          />
        ))}
      </CardContent>
    </Card>
  )
}

// Specialized loading states for different features
export function DashboardLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        {/* Hero Section Skeleton */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <SkeletonLine width="quarter" height="h-8" />
                <SkeletonLine width="half" height="h-4" />
              </div>
              <div className="flex gap-2">
                <SkeletonAvatar size="md" />
                <SkeletonAvatar size="md" />
                <SkeletonAvatar size="md" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <SkeletonLine height="h-6" />
              <SkeletonLine height="h-6" />
              <SkeletonLine height="h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gradient-to-br from-blue-500 to-purple-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-white/20 rounded" />
                  <SkeletonLine width="half" height="h-4" className="bg-white/20" />
                </div>
                <SkeletonLine width="quarter" height="h-8" className="bg-white/20 mb-2" />
                <SkeletonLine width="three-quarters" height="h-3" className="bg-white/20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={6} />
          </div>
          <div className="space-y-6">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={4} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LessonLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <BookOpen className="w-8 h-8 animate-pulse text-blue-500 mr-3" />
          <LoadingSpinner size="lg" />
        </div>
        <div className="space-y-2">
          <SkeletonLine width="quarter" height="h-6" className="mx-auto" />
          <SkeletonLine width="half" height="h-4" className="mx-auto" />
        </div>
      </div>
    </div>
  )
}

export function KnowledgeGraphLoadingSkeleton() {
  return (
    <div className="w-full h-[400px] bg-gray-50 dark:bg-gray-900 rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Brain className="w-12 h-12 animate-pulse text-purple-500 mx-auto" />
          <div className="space-y-2">
            <SkeletonLine width="quarter" height="h-5" className="mx-auto" />
            <SkeletonLine width="half" height="h-3" className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CodeEditorLoadingSkeleton() {
  return (
    <div className="w-full h-[300px] bg-gray-900 rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-green-400" />
          <SkeletonLine width="quarter" height="h-4" className="bg-gray-700" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i % 2 === 0 ? 'three-quarters' : 'half'}
            height="h-4"
            className="bg-gray-700"
          />
        ))}
      </div>
    </div>
  )
}

export function AIPeerLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-500" />
        <SkeletonLine width="quarter" height="h-5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <SkeletonAvatar size="md" />
                <div className="space-y-1">
                  <SkeletonLine width="half" height="h-4" />
                  <SkeletonLine width="quarter" height="h-3" />
                </div>
              </div>
              <SkeletonLine width="full" height="h-3" />
              <SkeletonLine width="three-quarters" height="h-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function InsightsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLine width="quarter" height="h-8" />
          <SkeletonLine width="half" height="h-4" />
        </div>
        <div className="flex gap-2">
          <SkeletonLine width="24" height="h-9" />
          <SkeletonLine width="9" height="h-9" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <SkeletonLine width="half" height="h-4" />
                  <SkeletonLine width="quarter" height="h-8" />
                </div>
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine width="half" height="h-5" />
                  <SkeletonLine width="full" height="h-4" />
                  <SkeletonLine width="three-quarters" height="h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Icon name type for serialization
export type LoadingIconName =
  | 'Loader2'
  | 'Brain'
  | 'Code'
  | 'Users'
  | 'Target'
  | 'BookOpen'
  | 'Zap'
  | 'Lightbulb'
  | 'MessageSquare'
  | 'Trophy'

// Icon mapping for client-side rendering
const LOADING_ICON_MAP = {
  Loader2,
  Brain,
  Code,
  Users,
  Target,
  BookOpen,
  Zap,
  Lightbulb,
  MessageSquare,
  Trophy
} as const

function getLoadingIcon(iconName?: LoadingIconName) {
  if (!iconName) return Loader2
  return LOADING_ICON_MAP[iconName as keyof typeof LOADING_ICON_MAP] || Loader2
}

// Loading states with contextual messages
export function LoadingWithMessage({
  message,
  iconName,
  className = ''
}: {
  message: string
  iconName?: LoadingIconName
  className?: string
}) {
  const Icon = getLoadingIcon(iconName)

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <Icon className="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
    </div>
  )
}

// Progressive loading component for complex features
export function ProgressiveLoader({
  steps,
  currentStep = 0,
  className = ''
}: {
  steps: string[]
  currentStep?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      <div className="flex items-center justify-center mb-6">
        <LoadingSpinner size="lg" />
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 text-sm',
              index < currentStep ? 'text-green-600 dark:text-green-400' :
                index === currentStep ? 'text-blue-600 dark:text-blue-400' :
                  'text-gray-400 dark:text-gray-600'
            )}
          >
            <div className={cn(
              'w-2 h-2 rounded-full',
              index < currentStep ? 'bg-green-500' :
                index === currentStep ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-300 dark:bg-gray-600'
            )} />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Lazy loading wrapper with suspense fallback
export function LazyLoadWrapper({
  children,
  fallback,
  className = ''
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <React.Suspense fallback={fallback || <LoadingSpinner />}>
        {children}
      </React.Suspense>
    </div>
  )
}