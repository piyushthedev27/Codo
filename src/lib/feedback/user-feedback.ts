/**
 * User Feedback Collection System
 * 
 * Collects user feedback on dashboard features for continuous improvement
 */

export interface FeedbackData {
  userId: string
  feature: string
  rating: number // 1-5
  comment?: string
  category: 'bug' | 'feature_request' | 'improvement' | 'general'
  metadata?: Record<string, any>
  timestamp: Date
}

export interface FeedbackSummary {
  feature: string
  averageRating: number
  totalResponses: number
  categoryBreakdown: Record<string, number>
  recentComments: string[]
}

/**
 * Feedback collector class
 */
export class FeedbackCollector {
  /**
   * Submit user feedback
   */
  async submitFeedback(feedback: Omit<FeedbackData, 'timestamp'>): Promise<boolean> {
    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date()
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      return false
    }
  }
  
  /**
   * Get feedback summary for a feature
   */
  async getFeedbackSummary(feature: string): Promise<FeedbackSummary | null> {
    try {
      const response = await fetch(`/api/feedback/summary?feature=${feature}`)
      if (!response.ok) return null
      
      return await response.json()
    } catch (error) {
      console.error('Failed to get feedback summary:', error)
      return null
    }
  }
}

// Singleton instance
let feedbackCollector: FeedbackCollector | null = null

/**
 * Get feedback collector instance
 */
export function getFeedbackCollector(): FeedbackCollector {
  if (!feedbackCollector) {
    feedbackCollector = new FeedbackCollector()
  }
  return feedbackCollector
}
