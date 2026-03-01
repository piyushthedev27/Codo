'use client'
/* eslint-disable react/jsx-no-comment-textnodes, @typescript-eslint/no-unused-vars */

import React from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
     
    Target as _Target,
     
    Map as _Map,
     
    Flag as _Flag,
    CheckCircle,
    Circle,
    Lock,
    ArrowLeft,
    Trophy,
    Star,
    Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard-animations.css'

export default function LearningPathPage() {
    const router = useRouter()

    // Mock data for the full learning path
    // In a real implementation, this would be fetched from the database
    const courses = [
        {
            id: 'javascript-mastery',
            title: 'JavaScript Mastery',
            description: 'Master core JavaScript concepts from basics to advanced patterns',
            progress: 65,
            modules: [
                { id: 'm1', title: 'Basics & Syntax', status: 'completed' },
                { id: 'm2', title: 'Functions & Scope', status: 'completed' },
                { id: 'm3', title: 'Objects & Arrays', status: 'completed' },
                { id: 'm4', title: 'Asynchronous JS', status: 'in-progress' },
                { id: 'm5', title: 'Advanced Patterns', status: 'locked' }
            ]
        },
        {
            id: 'react-professional',
            title: 'React Professional',
            description: 'Build high-performance UIs with modern React features',
            progress: 20,
            modules: [
                { id: 'r1', title: 'React Fundamentals', status: 'completed' },
                { id: 'r2', title: 'Hooks & State', status: 'in-progress' },
                { id: 'r3', title: 'Context & Redux', status: 'locked' },
                { id: 'r4', title: 'Performance Optimization', status: 'locked' }
            ]
        }
    ]

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-8">
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
                            Your Learning Journey
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Follow your personalized path to mastery
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Overall Progress</p>
                            <p className="text-2xl font-bold text-blue-600">42%</p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-purple-500 flex items-center justify-center animate-spin-slow">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Learning Paths Grid */}
                <div className="grid grid-cols-1 gap-8">
                    {courses.map((course, courseIndex) => (
                        <Card key={course.id} className={`overflow-hidden border-2 card-hover-effect fade-in-delay-${courseIndex + 1}`}>
                            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-blue-100 dark:border-blue-800">
                                            {courseIndex === 0 ? <Zap className="w-6 h-6 text-blue-500" /> : <Star className="w-6 h-6 text-purple-500" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{course.title}</CardTitle>
                                            <CardDescription>{course.description}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <Progress value={course.progress} className="w-32 h-2" />
                                            <span className="text-sm font-bold text-blue-600">{course.progress}%</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                            {course.modules.filter(m => m.status === 'completed').length} / {course.modules.length} Completed
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="relative">
                                    {/* Connection Line */}
                                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700 hidden sm:block" />                                    <div className="space-y-6">
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        {course.modules.map((module, _idx) => (
                                            <div key={module.id} className="flex items-start gap-4 relative group">
                                                <div className={`mt-1 z-10 p-1 rounded-full bg-white dark:bg-gray-900 border-2 transition-colors duration-300 ${module.status === 'completed' ? 'border-green-500 text-green-500' :
                                                        module.status === 'in-progress' ? 'border-blue-500 text-blue-500 animate-pulse' :
                                                            'border-gray-300 dark:border-gray-700 text-gray-400'
                                                    }`}>
                                                    {module.status === 'completed' ? <CheckCircle className="w-6 h-6" /> :
                                                        module.status === 'in-progress' ? <Circle className="w-6 h-6" /> :
                                                            <Lock className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`p-4 rounded-xl border transition-all duration-300 ${module.status === 'in-progress' ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10 shadow-sm' :
                                                            'border-gray-100 dark:border-gray-800'
                                                        }`}>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div>
                                                                <h4 className={`font-semibold ${module.status === 'locked' ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                                    {module.title}
                                                                </h4>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {module.status === 'completed' ? 'Module mastered!' :
                                                                        module.status === 'in-progress' ? 'Current focus' :
                                                                            'Complete previous modules to unlock'}
                                                                </p>
                                                            </div>
                                                            {module.status !== 'locked' && (
                                                                <Button size="sm" variant={module.status === 'in-progress' ? 'default' : 'outline'}>
                                                                    {module.status === 'in-progress' ? 'Continue' : 'Review'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
