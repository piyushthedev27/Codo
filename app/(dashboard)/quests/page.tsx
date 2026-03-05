'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Clock, CheckCircle, Lock, Star, Sun, Calendar, Scroll, ClipboardList, CheckCircle2, Coins } from 'lucide-react';

type Tab = 'active' | 'available' | 'completed';

interface Quest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    coinReward: number;
    category: 'daily' | 'weekly' | 'special';
    current: number;
    total: number;
    deadline?: string;
    special?: boolean;
}

const QUESTS: Record<Tab, Quest[]> = {
    active: [
        { id: 'q1', title: 'Daily Code Warrior', description: 'Complete 1 lesson today to keep your streak alive.', xpReward: 150, coinReward: 50, category: 'daily', current: 0, total: 1, deadline: 'Resets in 11h 23m' },
        { id: 'q2', title: 'Duel of the Week', description: 'Win 1 Code Duel this week.', xpReward: 500, coinReward: 200, category: 'weekly', current: 0, total: 1, deadline: 'Resets Monday' },
        { id: 'q3', title: 'Knowledge Seeker', description: 'Visit 3 different topic zones on the World Map.', xpReward: 250, coinReward: 75, category: 'weekly', current: 1, total: 3, deadline: 'Resets Monday' },
    ],
    available: [
        { id: 'q4', title: 'Cinema Scholar', description: 'Watch 2 AI Cinema episodes this week.', xpReward: 200, coinReward: 60, category: 'weekly', current: 0, total: 2, deadline: 'Resets Monday' },
        { id: 'q5', title: 'Social Coder', description: 'Chat with an AI peer 5 times.', xpReward: 100, coinReward: 30, category: 'daily', current: 0, total: 5, deadline: 'Resets in 11h 23m' },
        { id: 'q6', title: 'Dragon Slayer', description: 'Defeat the JavaScript Dragon boss in a timed duel.', xpReward: 1000, coinReward: 500, category: 'special', current: 0, total: 1, special: true },
        { id: 'q7', title: 'Bug Exterminator', description: 'Analyze and fix 3 mistakes in the Mistake Analyzer.', xpReward: 300, coinReward: 100, category: 'weekly', current: 0, total: 3, deadline: 'Resets Monday' },
        { id: 'q8', title: 'Guild Champion', description: 'Contribute 500 XP to your guild this week.', xpReward: 400, coinReward: 150, category: 'weekly', current: 0, total: 500, deadline: 'Resets Monday' },
    ],
    completed: [
        { id: 'q9', title: 'First Blood', description: 'Complete your first lesson on CODO.', xpReward: 100, coinReward: 50, category: 'special', current: 1, total: 1 },
        { id: 'q10', title: 'Welcome Hero', description: 'Finish the onboarding assessment.', xpReward: 200, coinReward: 100, category: 'special', current: 1, total: 1 },
    ],
};

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    daily: { label: 'DAILY', color: '#00d4ff', icon: <Sun size={14} /> },
    weekly: { label: 'WEEKLY', color: '#6c63ff', icon: <Calendar size={14} /> },
    special: { label: 'SPECIAL', color: '#ffd700', icon: <Star size={14} /> },
};

function QuestCard({ quest, tab }: { quest: Quest; tab: Tab }) {
    const progress = Math.min((quest.current / quest.total) * 100, 100);
    const cat = CATEGORY_LABELS[quest.category];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#1a1a2e] rounded p-4 border-2 transition-all hover:-translate-y-0.5 ${quest.special
                ? 'border-[#ffd700] shadow-[0_0_16px_#ffd70040]'
                : 'border-[#2a2a3e] hover:border-[#6c63ff]'
                }`}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-mono text-xs px-2 py-0.5 rounded border flex items-center gap-1"
                            style={{ color: cat.color, borderColor: cat.color + '60', background: cat.color + '15' }}
                        >
                            {cat.icon} {cat.label}
                        </span>
                        {quest.special && <Star size={14} className="text-[#ffd700]" />}
                        {tab === 'completed' && <CheckCircle size={14} className="text-[#00ff88]" />}
                    </div>
                    <h3 className="text-retro text-[#e8e8f0] text-lg">{quest.title}</h3>
                    <p className="text-mono text-[#8888aa] text-xs mt-1">{quest.description}</p>
                </div>
            </div>

            {/* Progress */}
            {tab !== 'available' && (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-mono text-[#8888aa] text-xs">Progress</span>
                        <span className="text-mono text-[#8888aa] text-xs">
                            {quest.current} / {quest.total > 100 ? `${quest.total} XP` : quest.total}
                        </span>
                    </div>
                    <div className="bg-[#2a2a3e] h-2 rounded overflow-hidden border border-[#3a3a4e]">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                background: tab === 'completed' ? '#00ff88' : cat.color,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-mono text-xs text-[#6c63ff]">
                        <Zap size={12} />
                        +{quest.xpReward} XP
                    </div>
                    <div className="flex items-center gap-1 text-mono text-xs text-[#ffd700]">
                        <Coins size={12} /> +{quest.coinReward}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {quest.deadline && tab !== 'completed' && (
                        <div className="flex items-center gap-1 text-mono text-xs text-[#8888aa]">
                            <Clock size={12} />
                            {quest.deadline}
                        </div>
                    )}
                    {tab === 'available' && (
                        <button className="px-3 py-1 bg-[#6c63ff] text-white rounded text-retro text-xs hover:bg-[#7c73ff] transition">
                            START ▶
                        </button>
                    )}
                    {tab === 'completed' && (
                        <span className="text-mono text-[#00ff88] text-xs flex items-center gap-1">CLAIMED <CheckCircle2 size={12} /></span>
                    )}
                    {tab === 'active' && (
                        <span className="text-mono text-[#6c63ff] text-xs">IN PROGRESS...</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function QuestsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('active');
    const quests = QUESTS[activeTab];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-2 flex items-center gap-2">
                    <Scroll className="text-[#6c63ff]" /> QUESTS
                </h1>
                <p className="text-mono text-[#8888aa]">Complete quests to earn bonus XP, coins, and glory.</p>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: 'ACTIVE', value: QUESTS.active.length, color: '#6c63ff', icon: <Zap size={20} /> },
                    { label: 'AVAILABLE', value: QUESTS.available.length, color: '#00d4ff', icon: <ClipboardList size={20} /> },
                    { label: 'COMPLETED', value: QUESTS.completed.length, color: '#00ff88', icon: <CheckCircle2 size={20} /> },
                ].map((s) => (
                    <div key={s.label} className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-3 text-center">
                        <div className="text-pixel text-2xl mb-1 flex items-center justify-center gap-2" style={{ color: s.color }}>
                            {s.icon} {s.value}
                        </div>
                        <div className="text-mono text-[#8888aa] text-xs">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Locked Notice */}
            <div className="flex items-center gap-2 p-3 bg-[#1a1a2e] border border-[#3a3a4e] rounded mb-6 text-mono text-[#8888aa] text-xs">
                <Lock size={14} />
                Some special quests unlock at higher levels. Keep grinding, hero!
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#2a2a3e]">
                {(['active', 'available', 'completed'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-retro text-sm transition border-b-2 -mb-[2px] ${activeTab === tab
                            ? 'text-[#6c63ff] border-[#6c63ff]'
                            : 'text-[#8888aa] border-transparent hover:text-[#e8e8f0]'
                            }`}
                    >
                        {tab.toUpperCase()}
                        <span className="ml-2 text-xs opacity-60">({QUESTS[tab].length})</span>
                    </button>
                ))}
            </div>

            {/* Quest Cards */}
            <div className="space-y-3">
                {quests.length === 0 ? (
                    <div className="text-center py-16 text-mono text-[#8888aa]">
                        <div className="flex justify-center mb-3">
                            <Star size={48} className="text-[#2a2a3e]" />
                        </div>
                        <div>No quests here — check other tabs!</div>
                    </div>
                ) : (
                    quests.map((quest) => (
                        <QuestCard key={quest.id} quest={quest} tab={activeTab} />
                    ))
                )}
            </div>
        </div>
    );
}
