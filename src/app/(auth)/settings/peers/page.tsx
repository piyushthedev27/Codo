'use client'

import React from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Users as _Users,
    MessageSquare,
    Settings,
    UserPlus,
    Shield,
    Terminal,
    Brain,
    Zap,
    ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard-animations.css'

export default function PeerSettingsPage() {
    const router = useRouter()

    const peers = [
        {
            id: 'sarah',
            name: 'Sarah',
            role: 'Frontend Mentor',
            specialty: 'React & UI/UX',
            status: 'active',
            personality: 'Encouraging',
            autoEngage: true,
            voiceEnabled: true
        },
        {
            id: 'alex',
            name: 'Alex',
            role: 'Backend Architect',
            specialty: 'Node.js & Databases',
            status: 'active',
            personality: 'Analytical',
            autoEngage: false,
            voiceEnabled: false
        },
        {
            id: 'jordan',
            name: 'Jordan',
            role: 'Fullstack Guide',
            specialty: 'Next.js & Supabase',
            status: 'active',
            personality: 'Pragmatic',
            autoEngage: true,
            voiceEnabled: true
        }
    ]

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="mb-2 -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            AI Peer Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Configure your AI learning companions
                        </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New Peer
                    </Button>
                </div>

                {/* Peer Configuration Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {peers.map((peer, index) => (
                        <Card key={peer.id} className={`fade-in-delay-${index + 1} card-hover-effect`}>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full bg-gradient-to-br ${index === 0 ? 'from-pink-500 to-rose-500' :
                                                index === 1 ? 'from-blue-500 to-cyan-500' :
                                                    'from-purple-500 to-indigo-500'
                                            } text-white`}>
                                            <Brain className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-xl">{peer.name}</CardTitle>
                                                <Badge variant="outline" className="text-xs uppercase tracking-wider">{peer.role}</Badge>
                                            </div>
                                            <CardDescription>{peer.specialty}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none">
                                        Connected
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    {/* Personality & Style */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            <Settings className="w-4 h-4 text-blue-500" />
                                            Interaction Settings
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`engage-${peer.id}`} className="flex flex-col gap-1 cursor-pointer">
                                                <span className="text-sm font-medium">Proactive Engagement</span>
                                                <span className="text-xs text-gray-500">Allow {peer.name} to start conversations</span>
                                            </Label>
                                            <Switch id={`engage-${peer.id}`} checked={peer.autoEngage} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`voice-${peer.id}`} className="flex flex-col gap-1 cursor-pointer">
                                                <span className="text-sm font-medium">Voice Feedback</span>
                                                <span className="text-xs text-gray-500">Enable audio coaching and tips</span>
                                            </Label>
                                            <Switch id={`voice-${peer.id}`} checked={peer.voiceEnabled} />
                                        </div>
                                    </div>

                                    {/* Capability Details */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            <Zap className="w-4 h-4 text-purple-500" />
                                            Mentorship Style
                                        </h4>
                                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Personality</span>
                                                <span className="font-medium">{peer.personality}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Mentorship Tone</span>
                                                <span className="font-medium">Direct & Supportive</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Code Reviews</span>
                                                <Badge variant="secondary" className="text-[10px] h-5">Detail Oriented</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button variant="outline" size="sm" className="text-xs">
                                        <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                        Reset History
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                                        <Shield className="w-3.5 h-3.5 mr-2" />
                                        Disable Peer
                                    </Button>
                                    <Button size="sm" className="text-xs bg-gray-900 dark:bg-gray-700 text-white">
                                        <Terminal className="w-3.5 h-3.5 mr-2" />
                                        Debug AI Context
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
