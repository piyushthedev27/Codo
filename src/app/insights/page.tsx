import { LiveInsightsDashboard } from '@/components/unique-features/LiveInsightsDashboard'

export default function InsightsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LiveInsightsDashboard 
        showFloatingNotifications={false}
        className="max-w-6xl mx-auto"
      />
    </div>
  )
}