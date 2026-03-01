/**
 * Lesson Page
 * Displays AI-generated lessons with interactive elements and progress tracking
 */

import { LessonPageClient } from './LessonPageClient'

interface LessonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  // Await params in Next.js 15+
  const { id } = await params
  
  return <LessonPageClient lessonId={id} />
}