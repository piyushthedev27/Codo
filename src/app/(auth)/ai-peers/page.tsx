'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/Avatar'
import {
    MessageCircle,
    Settings,
    Clock,
    Zap,
    Star,
    Play,
    ArrowRight,
    TrendingUp,
    Award
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
    getAllPeerStatuses,
    getStatusColor,
    getStatusText,
    formatTimeAgo
} from '@/lib/peer-status'
import '@/styles/dashboard-animations.css'

export default function AIPeersPage() {
    const [peers, setPeers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPeers() {
            try {
                const response = await fetch('/api/dashboard')
                const result = await response.json()
                if (result.success) {
                    setPeers(result.data.aiPeers)
                }
            } catch (error) {
                console.error('Failed to fetch peers:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPeers()
    }, [])

    const peerStatuses = useMemo(() => {
        return getAllPeerStatuses(peers.map(p => ({
            id: p.name.toLowerCase(),
            name: p.name,
            personality: p.personality,
            skill_level: p.skill_level,
            avatar_url: p.avatar_url || '',
            common_mistakes: p.common_mistakes || [],
            interaction_style: p.interaction_style || '',
            backstory: p.backstory || ''
        })))
    }, [peers])

    // Get personality-based theme colors consistent with the project
    const getPeerTheme = (peerName: string) => {
        const themes: Record<string, { light: string; dark: string; text: string; button: string }> = {
            sarah: {
                light: 'from-pink-50 to-rose-50',
                dark: 'dark:from-pink-900/20 dark:to-rose-900/20',
                text: 'text-pink-600 dark:text-pink-400',
                button: 'bg-pink-600 hover:bg-pink-700'
            },
            alex: {
                light: 'from-blue-50 to-indigo-50',
                dark: 'dark:from-blue-900/20 dark:to-indigo-900/20',
                text: 'text-blue-600 dark:text-blue-400',
                button: 'bg-blue-600 hover:bg-blue-700'
            },
            jordan: {
                light: 'from-purple-50 to-fuchsia-50',
                dark: 'dark:from-purple-900/20 dark:to-fuchsia-900/20',
                text: 'text-purple-600 dark:text-purple-400',
                button: 'bg-purple-600 hover:bg-purple-700'
            }
        }
        return themes[peerName.toLowerCase()] || themes.alex
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium">Loading your study companions...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">

                {/* Header Section - Blue/Purple Gradient Theme */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 lg:p-12 text-white shadow-xl">
                    <div className="relative z-10 max-w-2xl space-y-4">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-4 py-1">
                            <Zap className="w-3 h-3 mr-2 fill-yellow-400 text-yellow-400" />
                            AI Learning Network
                        </Badge>
                        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                            Meet Your AI Peers
                        </h1>
                        <p className="text-blue-100 text-lg lg:text-xl leading-relaxed">
                            Interact with specialized study companions who adapt to your learning style and help you master new skills.
                        </p>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
                </div>

                {/* Peer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {peers.map((peer, index) => {
                        const peerName = peer.name.toLowerCase()
                        const status = peerStatuses.get(peerName)
                        const theme = getPeerTheme(peerName)

                        return (
                            <motion.div
                                key={peer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group h-full"
                            >
                                <Card className="h-full border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 card-hover-effect">
                                    <div className={`h-24 bg-gradient-to-r ${theme.light} ${theme.dark} border-b border-gray-100 dark:border-gray-800/50`} />

                                    <CardContent className="relative px-6 pb-6 pt-0">
                                        {/* Avatar with Ring */}
                                        <div className="absolute -top-12 left-6">
                                            <div className="p-1 rounded-full bg-white dark:bg-gray-950 shadow-lg">
                                                <Avatar peerId={peerName} size="lg" className="ring-2 ring-gray-100 dark:ring-gray-800" />
                                            </div>
                                        </div>

                                        <div className="pt-14 space-y-6">
                                            {/* Name & Status */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {peer.name}
                                                    </h3>
                                                    <p className={`text-sm font-medium ${theme.text}`}>
                                                        {peer.role || 'Learning Companion'}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 flex items-center gap-1.5 px-3">
                                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(status?.status || 'online')} animate-pulse`} />
                                                    {getStatusText(status?.status || 'online')}
                                                </Badge>
                                            </div>

                                            {/* Bio / Specialty */}
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                                                    <div className="flex-1">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Specialization</span>
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            {status?.specialty || 'General Programming'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 px-1">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            Level {status?.level || 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Award className="w-4 h-4 text-purple-500" />
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            {peer.personality || 'Stable'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recent Message Snippet */}
                                            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/20 italic text-sm text-gray-600 dark:text-gray-400">
                                                &quot;{status?.recentMessage?.content || 'Ready to start our next session!'}&quot;
                                            </div>

                                            {/* Action */}
                                            <div className="pt-2">
                                                <Button
                                                    onClick={() => {
                                                        const lessonMap: Record<string, string> = {
                                                            sarah: 'react-hooks',
                                                            alex: 'javascript-async',
                                                            jordan: 'typescript-basics'
                                                        }
                                                        const topic = lessonMap[peerName] || 'react-hooks'
                                                        window.location.href = `/lessons/${topic}?peer=${peerName}`
                                                    }}
                                                    className={`w-full ${theme.button} text-white shadow-md hover:shadow-lg rounded-xl h-12 font-bold transition-all flex items-center justify-center gap-2 group`}
                                                >
                                                    <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                                                    Start Learning Session
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Bottom Section - Settings Access */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Peer Configuration</h4>
                            <p className="text-sm text-gray-500">Customize how your AI companions interact with you.</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-xl px-6 h-11 border-gray-300 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 font-semibold"
                        onClick={() => window.location.href = '/settings/peers'}
                    >
                        Manage Peers
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

            </div>
        </DashboardLayout>
    )
}
