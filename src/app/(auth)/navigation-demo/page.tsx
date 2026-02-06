'use client'

/**
 * Navigation Demo Page
 * Demonstrates the comprehensive navigation architecture
 */

import { DashboardLayout } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Sidebar, 
  Navigation, 
  Smartphone, 
  Monitor,
  Palette,
  Zap
} from 'lucide-react'

export default function NavigationDemoPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Navigation Architecture Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive navigation system with sidebar, top bar, and responsive mobile support
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sidebar className="w-5 h-5 text-blue-600" />
                  Sidebar Navigation
                </CardTitle>
                <CardDescription>
                  Vertical icon-based menu with active states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Active page highlighting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Collapsible for desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">User profile section</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Smooth transitions</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-purple-600" />
                  Top Navigation Bar
                </CardTitle>
                <CardDescription>
                  Horizontal bar with notifications and search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Notification center with badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Global search functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Quick action buttons</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">User profile dropdown</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  Mobile Responsive
                </CardTitle>
                <CardDescription>
                  Optimized for all device sizes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Hamburger menu for mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Touch-optimized interactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Overlay backdrop</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Smooth slide animations</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Performance
                </CardTitle>
                <CardDescription>
                  Optimized for speed and efficiency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">60fps animations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Efficient re-renders</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Lazy loading dropdowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Minimal bundle impact</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Implementation Status */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                Implementation Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sidebar Navigation</span>
                <Badge variant="default" className="bg-green-600">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Top Navigation Bar</span>
                <Badge variant="default" className="bg-green-600">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dashboard Layout</span>
                <Badge variant="default" className="bg-green-600">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mobile Support</span>
                <Badge variant="default" className="bg-green-600">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Navigation State Management</span>
                <Badge variant="default" className="bg-green-600">Complete</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
              <CardDescription>
                Integrate the navigation system into your pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Wrap your page with DashboardLayout</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import { DashboardLayout } from '@/components/navigation'

export default function YourPage() {
  return (
    <DashboardLayout>
      <YourContent />
    </DashboardLayout>
  )
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Add new navigation items</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`// Edit src/components/navigation/navigation-config.ts
{
  id: 'new-feature',
  label: 'New Feature',
  href: '/new-feature',
  icon: YourIcon,
  description: 'Feature description'
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Test on different devices</h4>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    Desktop
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    Mobile
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    Dark Mode
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
