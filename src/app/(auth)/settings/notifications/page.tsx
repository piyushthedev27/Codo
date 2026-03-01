'use client'

import React from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, ArrowLeft, Mail, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard-animations.css'

export default function NotificationSettingsPage() {
    const router = useRouter()

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
                        Notifications
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configure how and when you want to be notified
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-yellow-500" />
                                Email Notifications
                            </CardTitle>
                            <CardDescription>
                                Choose which updates you want to receive via email
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Weekly Progress Reports</Label>
                                    <p className="text-sm text-gray-500">Receive a summary of your learning progress every week</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">New Course Alerts</Label>
                                    <p className="text-sm text-gray-500">Get notified when new lessons or courses are available</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="fade-in-delay-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-blue-500" />
                                Push Notifications
                            </CardTitle>
                            <CardDescription>
                                Manage alerts on your mobile device or browser
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Learning Reminders</Label>
                                    <p className="text-sm text-gray-500">Get daily reminders to stick to your learning schedule</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">AI Peer Messages</Label>
                                    <p className="text-sm text-gray-500">Notifications when an AI peer mentions you or starts a conversation</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
