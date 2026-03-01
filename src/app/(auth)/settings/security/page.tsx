'use client'

import React from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Lock, ArrowLeft, Shield, Key } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard-animations.css'

export default function SecuritySettingsPage() {
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
                        Privacy & Security
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your account security and data privacy
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5 text-red-500" />
                                Password Management
                            </CardTitle>
                            <CardDescription>
                                Change your password regularly to keep your account safe
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input id="currentPassword" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input id="newPassword" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input id="confirmPassword" type="password" />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Update Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="fade-in-delay-1 border-red-200 dark:border-red-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Shield className="w-5 h-5" />
                                Advanced Security
                            </CardTitle>
                            <CardDescription>
                                Enable additional security layers for your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                <h5 className="font-semibold mb-1">Two-Factor Authentication</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Adds an extra layer of security by requiring a code from your mobile device when signing in.
                                </p>
                                <Button variant="outline" className="border-red-200 hover:bg-red-100 text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                                    Enable 2FA
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
