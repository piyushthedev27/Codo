/**
 * Mistake Analyzer Demo Page
 * 
 * This page showcases the mistake-driven learning system
 * for hackathon demonstrations and user testing.
 */

import MistakeAnalyzer from '@/components/unique-features/MistakeAnalyzer'

export default function MistakeAnalyzerDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MistakeAnalyzer />
    </div>
  )
}

export const metadata = {
  title: 'Mistake Analyzer Demo - Codo AI Learning Platform',
  description: 'Experience mistake-driven learning with AI-powered error analysis and personalized micro-lessons',
}