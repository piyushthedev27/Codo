interface CodeDuelPageProps {
  params: {
    id: string
  }
}

export default function CodeDuelPage({ params }: CodeDuelPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Code Duel {params.id}</h1>
      <p className="text-lg text-muted-foreground">
        Competitive coding challenge
      </p>
    </div>
  )
}