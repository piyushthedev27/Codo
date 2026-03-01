'use client'

/**
 * Optimized Image Component
 * Provides lazy loading, responsive images, and performance optimizations
 */

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getOptimalImageQuality, _getNetworkQuality } from '@/lib/performance/lazy-loading'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  quality?: number
  sizes?: string
  className?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality,
  sizes,
  className,
  objectFit = 'cover',
  onLoad,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [adaptiveQuality, setAdaptiveQuality] = useState(quality || 75)
  const imgRef = useRef<HTMLDivElement>(null)

  // Adapt quality based on network conditions
  useEffect(() => {
    if (!quality) {
      const optimalQuality = getOptimalImageQuality()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdaptiveQuality(optimalQuality)
    }
  }, [quality])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const _handleError = () => {
    setHasError(true)
  }

  // Fallback for error state
  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-200 dark:bg-gray-700',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        !isLoaded && 'animate-pulse bg-gray-200 dark:bg-gray-700',
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={adaptiveQuality}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down'
        )}
        onLoad={handleLoad}
        onError={_handleError}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}

/**
 * Optimized Avatar Image with fallback
 */
interface OptimizedAvatarProps {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  fallback,
  className
}: OptimizedAvatarProps) {
  const [imgSrc, setImgSrc] = useState(src)

  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  }

  const pixelSize = sizeMap[size]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleError = () => {
    if (fallback) {
      setImgSrc(fallback)
    }
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', className)}>
      <OptimizedImage
        src={imgSrc}
        alt={alt}
        width={pixelSize}
        height={pixelSize}
        quality={90}
        objectFit="cover"
        onLoad={() => {}}
        className="rounded-full"
      />
    </div>
  )
}

/**
 * Progressive Image Loading with Low Quality Image Placeholder (LQIP)
 */
interface ProgressiveImageProps {
  src: string
  lqip: string // Low quality image placeholder
  alt: string
  width: number
  height: number
  className?: string
}

export function ProgressiveImage({
  src,
  lqip,
  alt,
  width,
  height,
  className
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(lqip)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.src = src
    img.onload = () => {
      setCurrentSrc(src)
      setIsLoaded(true)
    }
  }, [src])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-all duration-500',
          !isLoaded && 'blur-sm scale-105'
        )}
        quality={isLoaded ? 90 : 10}
      />
    </div>
  )
}

/**
 * Lazy loaded background image
 */
interface LazyBackgroundImageProps {
  src: string
  children: React.ReactNode
  className?: string
  fallbackColor?: string
}

export function LazyBackgroundImage({
  src,
  children,
  className,
  fallbackColor = 'bg-gray-200 dark:bg-gray-800'
}: LazyBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new window.Image()
            img.src = src
            img.onload = () => {
              setBackgroundImage(`url(${src})`)
              setIsLoaded(true)
            }
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [src])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-500',
        !isLoaded && fallbackColor,
        className
      )}
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {children}
    </div>
  )
}

/**
 * Responsive image with art direction
 */
interface ResponsiveArtDirectedImageProps {
  mobile: string
  tablet: string
  desktop: string
  alt: string
  className?: string
}

export function ResponsiveArtDirectedImage({
  mobile,
  tablet,
  desktop,
  alt,
  className
}: ResponsiveArtDirectedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(mobile)

  useEffect(() => {
    const updateImage = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setCurrentSrc(desktop)
      } else if (width >= 768) {
        setCurrentSrc(tablet)
      } else {
        setCurrentSrc(mobile)
      }
    }

    updateImage()
    window.addEventListener('resize', updateImage)
    return () => window.removeEventListener('resize', updateImage)
  }, [mobile, tablet, desktop])

  return (
    <OptimizedImage
      src={currentSrc}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  )
}
