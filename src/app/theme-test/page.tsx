'use client'

import { useTheme } from '@/components/ui/ThemeProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeTestPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-background text-foreground p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Dark Theme Only</h1>
          <p className="text-muted-foreground">
            The website now uses only the dark theme with landing page colors!
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Current Theme: {theme}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant="default"
                className="flex items-center gap-2"
                disabled
              >
                <Moon className="w-4 h-4" />
                Dark Mode (Always Active)
              </Button>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Theme Information:</strong>
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Dark theme is now permanently enabled</li>
                <li>• Uses the same gradient background as the landing page</li>
                <li>• Consistent blue-to-purple color scheme throughout</li>
                <li>• No light theme option available</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Background Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background border rounded">
                <p>This uses the gradient background</p>
              </div>
              <div className="p-4 bg-card border rounded">
                <p>This is a card background</p>
              </div>
              <div className="p-4 bg-muted rounded">
                <p>This is a muted background</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-foreground">Foreground text</p>
                <p className="text-muted-foreground">Muted foreground text</p>
                <p className="text-primary">Primary color text</p>
                <p className="text-secondary-foreground">Secondary text</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <p><strong>Current theme:</strong> {theme}</p>
              <p><strong>HTML classes:</strong> {document.documentElement.className}</p>
              <p><strong>Body background:</strong> Gradient (landing page style)</p>
              <p><strong>Body color:</strong> {document.body.style.color || 'CSS default'}</p>
              <p><strong>Color scheme:</strong> {document.documentElement.style.colorScheme}</p>
              <p><strong>Theme status:</strong> Dark theme permanently enabled</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={() => window.location.href = '/dashboard'}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}