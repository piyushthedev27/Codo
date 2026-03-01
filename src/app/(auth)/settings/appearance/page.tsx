'use client'

import React from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Palette, ArrowLeft, Sun, Moon, Monitor } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import '@/styles/dashboard-animations.css'

export default function AppearanceSettingsPage() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-8">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/settings')}
                        className="mb-2 -ml-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Appearance
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Customize your dashboard look and feel
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-green-500" />
                                Theme Preference
                            </CardTitle>
                            <CardDescription>
                                Select your preferred theme for the dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Button
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    className={`h-24 flex flex-col gap-2 ${theme === 'light' ? 'bg-blue-600 text-white' : ''}`}
                                    onClick={() => setTheme('light')}
                                >
                                    <Sun className="w-6 h-6" />
                                    Light
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    className={`h-24 flex flex-col gap-2 ${theme === 'dark' ? 'bg-blue-600 text-white' : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <Moon className="w-6 h-6" />
                                    Dark
                                </Button>
                                <Button
                                    variant={theme === 'system' ? 'default' : 'outline'}
                                    className={`h-24 flex flex-col gap-2 ${theme === 'system' ? 'bg-blue-600 text-white' : ''}`}
                                    onClick={() => setTheme('system')}
                                >
                                    <Monitor className="w-6 h-6" />
                                    System
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="fade-in-delay-1">
                        <CardHeader>
                            <CardTitle>Accent Color</CardTitle>
                            <CardDescription>Choose the primary color for your interface highlights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                {['blue', 'purple', 'green', 'orange', 'red'].map((color) => (
                                    <button
                                        key={color}
                                        className={`w-10 h-10 rounded-full bg-${color}-500 ring-offset-2 hover:ring-2 transition-all`}
                                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
