/**
 * Mobile Voice Test Page
 * Dedicated page for testing voice features on mobile devices
 */

'use client'

import { MobileVoiceTest } from '@/components/mobile/MobileVoiceTest'
import { MobileResponsiveWrapper } from '@/components/mobile/MobileResponsiveWrapper'

export default function MobileVoiceTestPage() {
  return (
    <MobileResponsiveWrapper
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20"
      enableTouchOptimization={true}
      enableLayoutOptimization={true}
    >
      <div className="container mx-auto py-8">
        <MobileVoiceTest />
      </div>
    </MobileResponsiveWrapper>
  )
}