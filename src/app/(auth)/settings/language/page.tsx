'use client'

import React from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Globe, ArrowLeft, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import '@/styles/dashboard-animations.css'

export default function LanguageSettingsPage() {
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
                        Language & Region
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Set your preferred language and time zone
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-500" />
                                Localization
                            </CardTitle>
                            <CardDescription>
                                Adjust your language and region settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="language">Preferred Language</Label>
                                <Select defaultValue="en">
                                    <SelectTrigger id="language">
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English (US)</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone" className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Timezone
                                </Label>
                                <Select defaultValue="ist">
                                    <SelectTrigger id="timezone">
                                        <SelectValue placeholder="Select Timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ist">India Standard Time (IST) - UTC+5:30</SelectItem>
                                        <SelectItem value="pst">Pacific Standard Time (PST) - UTC-8:00</SelectItem>
                                        <SelectItem value="est">Eastern Standard Time (EST) - UTC-5:00</SelectItem>
                                        <SelectItem value="gmt">Greenwich Mean Time (GMT) - UTC+0:00</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Save Localization
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
