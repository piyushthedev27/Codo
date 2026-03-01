'use client'

/**
 * Code Duel Lobby Page
 * Entry point for starting or joining code duel sessions
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/Avatar'
import { Trophy, Zap, Users, Play, Clock, Target, ArrowRight, Sword } from 'lucide-react'

const availableDuels = [
    {
        id: 'duel-alex-arrays',
        opponent: 'alex',
        title: 'Array Methods Challenge',
        difficulty: 'intermediate',
        duration: '15 min',
        xpReward: 200,
        description: 'Race Alex to implement map, filter, and reduce from scratch.',
    },
    {
        id: 'duel-sarah-loops',
        opponent: 'sarah',
        title: 'Recursion vs Iteration',
        difficulty: 'beginner',
        duration: '10 min',
        xpReward: 120,
        description: 'Sarah challenges you to solve Fibonacci both ways. Fastest and cleanest wins!',
    },
    {
        id: 'duel-jordan-async',
        opponent: 'jordan',
        title: 'Async/Await Mastery',
        difficulty: 'advanced',
        duration: '20 min',
        xpReward: 350,
        description: 'Jordan wants to see who can handle complex async chains quicker and cleaner.',
    },
]

const difficultyColor = (d: string) => {
    if (d === 'beginner') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    if (d === 'advanced') return 'bg-rose-500/10 text-rose-600 border-rose-500/20'
    return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
}

export default function DuelLobbyPage() {
    const router = useRouter()
    const [starting, setStarting] = useState<string | null>(null)

    const startDuel = (duelId: string) => {
        setStarting(duelId)
        setTimeout(() => {
            router.push(`/coding/duel/${duelId}`)
        }, 600)
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 p-8 text-white shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Sword className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wider">Battle Arena</span>
                        </div>
                        <h1 className="text-4xl font-black mb-3">Code Duel Mode</h1>
                        <p className="text-orange-100 text-lg max-w-xl leading-relaxed">
                            Race against your AI peers in timed coding challenges. Win XP, climb the leaderboard, and prove your mastery!
                        </p>
                        <div className="flex gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-300" />
                                <span className="text-sm font-semibold">Earn bonus XP for speed + correctness</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-300" />
                                <span className="text-sm font-semibold">Real-time leaderboard</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40" />
                </div>

                {/* Duel Cards */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-500" />
                        Available Challenges
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {availableDuels.map((duel) => (
                            <Card
                                key={duel.id}
                                className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-orange-400/60"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
                                <CardHeader className="pb-3 pt-5">
                                    {/* Opponent */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar peerId={duel.opponent} size="sm" />
                                        <div>
                                            <div className="text-xs text-muted-foreground">Challenge by</div>
                                            <div className="font-bold capitalize">{duel.opponent}</div>
                                        </div>
                                        <Badge className={`ml-auto border text-xs ${difficultyColor(duel.difficulty)}`}>
                                            {duel.difficulty}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg leading-tight group-hover:text-orange-600 transition-colors">
                                        {duel.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm">{duel.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" /> {duel.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5 font-bold text-amber-600">
                                            <Zap className="w-4 h-4" /> +{duel.xpReward} XP
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white font-bold rounded-xl"
                                        onClick={() => startDuel(duel.id)}
                                        disabled={starting === duel.id}
                                    >
                                        {starting === duel.id ? (
                                            'Starting...'
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Duel
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Stats Row */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Target className="w-5 h-5 text-orange-500" />
                            Your Duel Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-3xl font-black text-orange-500">7</div>
                                <div className="text-sm text-muted-foreground mt-1">Duels Won</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-rose-500">3</div>
                                <div className="text-sm text-muted-foreground mt-1">Duels Lost</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-amber-500">70%</div>
                                <div className="text-sm text-muted-foreground mt-1">Win Rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
