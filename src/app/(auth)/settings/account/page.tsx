'use client'

import React from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { User, ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard-animations.css'

export default function AccountSettingsPage() {
    const router = useRouter()
    const [saved, setSaved] = React.useState(false)
    const [formData, setFormData] = React.useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        bio: 'Learning the industrial way with Codo.'
    })

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

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
                        Account Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your profile and account preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-500" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal details and how they appear to others
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSave}
                                    className={`${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-all`}
                                >
                                    {saved ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Changes Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
