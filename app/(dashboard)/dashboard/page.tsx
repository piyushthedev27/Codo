'use client';

import Link from 'next/link';
import { Flame, Zap, BookOpen, Coins } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="p-4">
            {/* Welcome Hero Strip */}
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#12121a] border-b border-[#2a2a3e] rounded p-4 mb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-pixel text-xl mb-2">WELCOME BACK, HERO!</h1>
                        <div className="text-retro text-[#8888aa]">Day 1 Streak 🔥 · Start learning today!</div>
                    </div>
                    <div className="flex-1 max-w-md min-w-[250px]">
                        <div className="text-retro text-[#8888aa] mb-2 text-sm">Level 1 → Level 2</div>
                        <div className="bg-[#2a2a3e] h-3 rounded overflow-hidden border-2 border-[#3a3a4e]">
                            <div className="bg-[#6c63ff] h-full transition-all" style={{ width: '0%' }} />
                        </div>
                        <div className="text-retro text-[#8888aa] text-xs mt-1">0 / 1,000 XP</div>
                    </div>
                </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                    { icon: <Flame className="text-[#ffd700]" size={28} />, number: '0', label: 'DAY STREAK', sub: 'Start today!', color: '#ffd700' },
                    { icon: <Zap className="text-[#6c63ff]" size={28} />, number: '0', label: 'XP THIS WEEK', sub: 'Complete lessons', color: '#6c63ff' },
                    { icon: <BookOpen className="text-[#00d4ff]" size={28} />, number: '0', label: 'LESSONS DONE', sub: 'Start learning!', color: '#00d4ff' },
                    { icon: <Coins className="text-[#ffd700]" size={28} />, number: '0', label: 'GOLD COINS', sub: 'Spend in Shop', color: '#ffd700' },
                ].map((card, i) => (
                    <div key={i} className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition">
                        <div className="mb-3">{card.icon}</div>
                        <div className="text-pixel text-2xl mb-1" style={{ color: card.color }}>{card.number}</div>
                        <div className="text-retro text-[#8888aa] text-xs mb-1">{card.label}</div>
                        <div className="text-mono text-[#8888aa] text-xs">{card.sub}</div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-[1fr_350px] gap-4">
                <div className="space-y-4">
                    {/* Continue Learning */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition-all">
                        <h3 className="text-pixel text-sm mb-3">CONTINUE LEARNING</h3>
                        <div className="mb-3">
                            <div className="text-[#00d4ff] text-retro text-lg mb-2">JavaScript · Chapter 1: Basics</div>
                            <div className="bg-[#2a2a3e] h-2 rounded overflow-hidden mb-2">
                                <div className="bg-[#6c63ff] h-full transition-all" style={{ width: '5%' }} />
                            </div>
                            <div className="text-retro text-[#8888aa] text-sm">5% complete</div>
                        </div>
                        <Link href="/lessons/js-basics" className="block w-full py-2 bg-[#6c63ff] text-white text-center rounded text-retro text-lg hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-0.5">
                            START ▶
                        </Link>
                    </div>

                    {/* Active Quests */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition-all">
                        <h3 className="text-pixel text-sm mb-3">ACTIVE QUESTS 📜</h3>
                        <div className="space-y-3">
                            {[
                                { title: 'Daily: Complete 1 lesson', progress: 0, current: 0, total: 1, reward: '+150 XP 🏆' },
                                { title: 'Weekly: Win a Code Duel', progress: 0, current: 0, total: 1, reward: '+500 XP 💎' },
                            ].map((quest, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-mono text-[#e8e8f0] text-sm">📜 {quest.title}</span>
                                        <span className="text-retro text-[#8888aa] text-sm">{quest.current}/{quest.total}</span>
                                    </div>
                                    <div className="bg-[#2a2a3e] h-2 rounded overflow-hidden mb-1">
                                        <div className="bg-[#6c63ff] h-full" style={{ width: `${quest.progress}%` }} />
                                    </div>
                                    <div className="text-mono text-[#ffd700] text-xs">Reward: {quest.reward}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features Quick-access */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition-all">
                        <h3 className="text-pixel text-sm mb-3">QUICK ACCESS ✨</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { href: '/cinema', icon: '🎬', title: 'AI Cinema', desc: 'Watch code explained' },
                                { href: '/duel', icon: '⚔️', title: 'Code Duel', desc: 'Vs AI peers' },
                                { href: '/map', icon: '🗺️', title: 'World Map', desc: 'Explore topics' },
                                { href: '/progress', icon: '📊', title: 'Progress', desc: 'View your stats' },
                            ].map((item, i) => (
                                <Link key={i} href={item.href} className="bg-[#12121a] border border-[#2a2a3e] rounded p-3 hover:border-[#6c63ff] transition cursor-pointer block">
                                    <div className="text-2xl mb-1">{item.icon}</div>
                                    <div className="text-retro text-[#6c63ff] text-sm">{item.title}</div>
                                    <div className="text-mono text-[#8888aa] text-xs">{item.desc}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Your Squad */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition-all">
                        <h3 className="text-pixel text-sm mb-3">YOUR SQUAD</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'SARAH', color: '#b060ff', msg: "Ready to learn together?", status: 'online' },
                                { name: 'ALEX', color: '#00d4ff', msg: "Let's beat the leaderboard!", status: 'online' },
                                { name: 'JORDAN', color: '#00ff88', msg: "Whenever you're ready...", status: 'busy' },
                            ].map((peer, i) => (
                                <div key={i} className="border-b border-[#2a2a3e] pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded" style={{ background: peer.color }} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-retro text-[#e8e8f0]">{peer.name}</span>
                                                <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                                            </div>
                                            <p className="text-mono text-[#8888aa] text-xs">&quot;{peer.msg}&quot;</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-1 border border-[#6c63ff] text-[#6c63ff] rounded text-retro text-xs hover:bg-[#6c63ff22] transition">CHAT</button>
                                        <button className="flex-1 py-1 bg-[#6c63ff] text-white rounded text-retro text-xs hover:bg-[#7c73ff] transition">CODE WITH</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pet */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 text-center hover:border-[#6c63ff] transition-all">
                        <h3 className="text-pixel text-sm mb-4">YOUR COMPANION 🐾</h3>
                        <div className="w-20 h-20 bg-[#00ff88] rounded mx-auto mb-3 animate-float" />
                        <div className="text-retro text-[#e8e8f0] text-xl mb-1">BYTEBEAR</div>
                        <div className="text-retro text-[#8888aa] text-sm mb-2">LVL 1</div>
                        <div className="text-retro text-[#00ff88] mb-3">😊 HAPPY</div>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-[#00ff88] text-[#0a0a0f] rounded text-retro text-sm hover:bg-[#00ff99] transition">🍎 FEED</button>
                            <button className="flex-1 py-2 border-2 border-[#00ff88] text-[#00ff88] rounded text-retro text-sm hover:bg-[#00ff8822] transition">🎮 PLAY</button>
                        </div>
                    </div>

                    {/* Guild */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition-all">
                        <h3 className="text-pixel text-sm mb-4">GUILDS 🏰</h3>
                        <p className="text-mono text-[#8888aa] text-sm mb-4">Join or create a guild to compete as a team!</p>
                        <Link href="/guild" className="block w-full py-2 border-2 border-[#6c63ff] text-[#6c63ff] text-center rounded text-retro hover:bg-[#6c63ff22] transition">
                            BROWSE GUILDS ▶
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
