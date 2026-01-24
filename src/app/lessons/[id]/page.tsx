interface LessonPageProps {
  params: {
    id: string
  }
}

export default function LessonPage({ params }: LessonPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lesson {params.id}</h1>
      <p className="text-lg text-muted-foreground">
        AI-powered lesson with voice coaching
      </p>
    </div>
  )
}