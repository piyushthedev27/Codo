/**
 * Avatar System Demo Page
 * Showcases the enhanced avatar system with engaging visual identity features
 */

import { AvatarProvider } from '@/contexts/AvatarContext'
import { AvatarShowcase } from '@/components/shared/AvatarShowcase'

export default function AvatarDemoPage() {
  return (
    <AvatarProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto py-8">
          <AvatarShowcase />
        </div>
      </div>
    </AvatarProvider>
  )
}

export const metadata = {
  title: 'Avatar System Demo - Codo',
  description: 'Demonstration of the enhanced avatar system with engaging visual identity for synthetic peer learning'
}