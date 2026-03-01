'use client'

import React from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Users,
    User,
    Settings as SettingsIcon,
    Bell,
    Lock,
    Palette,
    Globe,
    ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import '@/styles/dashboard-animations.css'

export default function SettingsPage() {
    const router = useRouter()

    const settingsGroups = [
        {
            title: 'AI Companions',
            description: 'Manage your AI peers and study buddies',
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            href: '/settings/peers'
        },
        {
            title: 'Account Settings',
            description: 'Manage your profile and account preferences',
            icon: User,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            href: '/settings/account'
        },
        {
            title: 'Notifications',
            description: 'Configure your alert and notification settings',
            icon: Bell,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            href: '/settings/notifications'
        },
        {
            title: 'Privacy & Security',
            description: 'Manage your data and security preferences',
            icon: Lock,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            href: '/settings/security'
        },
        {
            title: 'Appearance',
            description: 'Customize your dashboard look and feel',
            icon: Palette,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            href: '/settings/appearance'
        },
        {
            title: 'Language & Region',
            description: 'Set your preferred language and time zone',
            icon: Globe,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
            href: '/settings/language'
        }
    ]

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 p-6 sm:p-10">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                        Settings Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Manage your account preferences and customize your learning experience
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settingsGroups.map((group, index) => {
                        const Icon = group.icon
                        return (
                            <motion.div
                                key={group.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800 cursor-pointer overflow-hidden"
                                    onClick={() => group.href !== '#' && router.push(group.href)}
                                >
                                    <CardHeader className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`p-3 rounded-xl ${group.bgColor} ${group.color} transition-transform group-hover:scale-110 duration-300`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {group.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <CardDescription className="text-sm leading-relaxed mb-4 min-h-[40px]">
                                            {group.description}
                                        </CardDescription>
                                        <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                            Configure <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </DashboardLayout>
    )
}
