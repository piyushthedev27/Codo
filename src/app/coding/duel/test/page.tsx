/**
 * Test Page for Code Duel Functionality
 * Manual testing interface for verifying duel flow and scoring
 */

import { DuelFlowTest } from '../[id]/components/DuelFlowTest'

export default function DuelTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Code Duel Test Suite
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manual testing interface for competitive coding functionality
          </p>
        </div>
        
        <DuelFlowTest />
      </div>
    </div>
  )
}