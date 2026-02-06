import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/landing/HeroSection'
import { FloatingSarahChat } from '@/components/landing/FloatingSarahChat'
import { SkeletonCard, LoadingWithMessage } from '@/components/ui/loading'
import { Users, Target, Lightbulb, MessageSquare, Trophy, Zap } from 'lucide-react'

// Lazy load components that are below the fold with enhanced loading states
const ProblemStatement = dynamic(() => import('@/components/landing/ProblemStatement').then(mod => ({ default: mod.ProblemStatement })), {
  loading: () => (
    <div className="h-96 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingWithMessage message="Loading problem analysis..." icon={Target} />
    </div>
  )
})

const FeaturesShowcase = dynamic(() => import('@/components/landing/FeaturesShowcase').then(mod => ({ default: mod.FeaturesShowcase })), {
  loading: () => (
    <div className="h-96 bg-white dark:bg-gray-800 flex items-center justify-center">
      <LoadingWithMessage message="Loading features showcase..." icon={Zap} />
    </div>
  )
})

const AIPeerShowcase = dynamic(() => import('@/components/landing/AIPeerShowcase').then(mod => ({ default: mod.AIPeerShowcase })), {
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center">
      <LoadingWithMessage message="Loading AI peer showcase..." icon={Users} />
    </div>
  )
})

const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks').then(mod => ({ default: mod.HowItWorks })), {
  loading: () => (
    <div className="h-96 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingWithMessage message="Loading workflow guide..." icon={Lightbulb} />
    </div>
  )
})

const SocialProof = dynamic(() => import('@/components/landing/SocialProof').then(mod => ({ default: mod.SocialProof })), {
  loading: () => (
    <div className="h-96 bg-white dark:bg-gray-800 flex items-center justify-center">
      <LoadingWithMessage message="Loading testimonials..." icon={MessageSquare} />
    </div>
  )
})

const FinalCTA = dynamic(() => import('@/components/landing/FinalCTA').then(mod => ({ default: mod.FinalCTA })), {
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
      <LoadingWithMessage message="Loading call to action..." icon={Trophy} className="text-white" />
    </div>
  )
})

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Load immediately for LCP */}
      <section id="hero">
        <HeroSection />
      </section>

      {/* Below-the-fold sections - Lazy loaded */}
      <section id="problem">
        <ProblemStatement />
      </section>

      <section id="features">
        <FeaturesShowcase />
      </section>

      <section id="ai-peers">
        <AIPeerShowcase />
      </section>

      <section id="how-it-works">
        <HowItWorks />
      </section>

      <section id="testimonials">
        <SocialProof />
      </section>

      <section id="cta">
        <FinalCTA />
      </section>

      {/* Floating Sarah Chat - Load immediately to showcase AI interaction */}
      <FloatingSarahChat />
    </div>
  )
}