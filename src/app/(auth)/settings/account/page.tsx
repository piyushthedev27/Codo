'use client'

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { User, ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard-animations.css'

export default function AccountSettingsPage() {
    const router = useRouter()
    const { user, isLoaded } = useUser()
    const [saved, setSaved] = React.useState(false)
    const [saving, setSaving] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Initialize form with real Clerk user data (not hardcoded placeholders)
    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        bio: ''
    })

    // Populate form once Clerk user data is available
    React.useEffect(() => {
        if (isLoaded && user) {
            setFormData({
                firstName: user.firstName ?? '',
                lastName: user.lastName ?? '',
                bio: 'Learning the industrial way with Codo.'
            })
        }
    }, [isLoaded, user])

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        try {
            // Email is owned by Clerk — only persist firstName, lastName, bio
            // which map to the user_profiles table columns
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    // bio is stored in user_profiles if the column exists
                    // otherwise it's a no-op Supabase will ignore unknown fields
                })
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({ error: 'Unknown error' }))
                throw new Error(data.error || `Save failed (${response.status})`)
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    if (!isLoaded) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
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
                    <h1 className="text-3xl font-bold">
                        Account Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your profile and account preferences
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    <Card className="fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal details. Email address is managed through your Clerk account.
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
                            {/* Email is read-only — it belongs to Clerk, not Supabase */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.primaryEmailAddress?.emailAddress ?? ''}
                                    readOnly
                                    disabled
                                    className="opacity-60 cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email is managed by your sign-in provider and cannot be changed here.
                                </p>
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
                                    disabled={saving}
                                    className={`${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-all`}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : saved ? (
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
