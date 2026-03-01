import { LiveInsightsDashboard } from '@/components/unique-features/LiveInsightsDashboard'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'

export default function InsightsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <LiveInsightsDashboard 
          showFloatingNotifications={false}
          className="max-w-full"
        />
      </div>
    </DashboardLayout>
  )
}