'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Flame, Zap, BookOpen, Coins, X, Send, Map, Film, Swords, TrendingUp, Scroll, Cat } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { motion, AnimatePresence } from 'motion/react';
import CreateGuildModal from '@/components/CreateGuildModal';
import JoinGuildModal from '@/components/JoinGuildModal';
import LevelUpModal from '@/components/ui/LevelUpModal';
import { auth } from '@/lib/firebase/client';

type Peer = { name: string; color: string; msg: string; status: string };

function PeerChatDrawer({ peer, onClose }: { peer: Peer; onClose: () => void }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'peer'; text: string }[]>([
        { role: 'peer', text: `Hey hero! I'm ${peer.name}. What do you want to work on today?` },
    ]);
    const [sending, setSending] = useState(false);

    const send = async () => {
        if (!input.trim() || sending) return;
        const userMsg = input.trim();
        setInput('');

        const newHistory: { role: 'user' | 'peer'; text: string }[] = [...messages, { role: 'user', text: userMsg }];
        setMessages(newHistory);
        setSending(true);

        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    history: messages.slice(-5).map(m => ({ role: m.role, text: m.text })), // limit history for tokens
                    peerName: peer.name,
                    currentTopic: "general coding and advice"
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to get chat');

            setMessages((p) => [...p, { role: 'peer', text: data.text }]);
        } catch (error: unknown) {
            console.error("Chat error:", error);
            setMessages((p) => [...p, { role: 'peer', text: "Sorry, I lost my connection for a second. Try again!" }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-[#12121a] border-l-2 border-[#2a2a3e] z-[60] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-[#2a2a3e]">
                    <div className="w-10 h-10 rounded" style={{ background: peer.color }} />
                    <div className="flex-1">
                        <div className="text-retro text-[#e8e8f0]">{peer.name}</div>
                        <div className="text-mono text-[#00ff88] text-xs">● Online</div>
                    </div>
                    <button onClick={onClose} className="text-[#8888aa] hover:text-[#e8e8f0] transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] rounded px-3 py-2 text-mono text-sm ${m.role === 'user'
                                    ? 'bg-[#6c63ff] text-white'
                                    : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#e8e8f0]'
                                    }`}
                            >
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {sending && (
                        <div className="flex justify-start">
                            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded px-3 py-2 text-mono text-[#8888aa] text-sm">
                                {peer.name} is typing...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[#2a2a3e] flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && send()}
                        placeholder={`Ask ${peer.name}...`}
                        className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded px-3 py-2 text-mono text-sm text-[#e8e8f0] placeholder-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
                    />
                    <button onClick={send} disabled={sending} className="p-2 bg-[#6c63ff] text-white rounded hover:bg-[#7c73ff] transition disabled:opacity-50">
                        <Send size={16} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function DashboardPage() {
    const { showSuccess, showAchievement } = useToast();
    const [activePeer, setActivePeer] = useState<Peer | null>(null);
    const [isCreateGuildOpen, setIsCreateGuildOpen] = useState(false);
    const [isJoinGuildOpen, setIsJoinGuildOpen] = useState(false);
    const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);

    const PEERS: Peer[] = [
        { name: 'SARAH', color: '#b060ff', msg: "Ready to learn together?", status: 'online' },
        { name: 'ALEX', color: '#00d4ff', msg: "Let's beat the leaderboard!", status: 'online' },
        { name: 'JORDAN', color: '#00ff88', msg: "Whenever you're ready...", status: 'busy' },
    ];

    return (
        <>
            <div className="p-4">
                {/* Welcome Hero Strip */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#12121a] border-b border-[#2a2a3e] rounded p-4 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-pixel text-xl mb-2">WELCOME BACK, HERO!</h1>
                            <div className="text-retro text-[#8888aa]">Day 1 Streak 🔥 · Start learning today!</div>
                        </div>
                        <div className="flex-1 max-w-md min-w-[250px]">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-retro text-[#8888aa] text-sm">Level 1 → Level 2</div>
                                <button
                                    onClick={() => setIsLevelUpOpen(true)}
                                    className="text-[10px] text-[#ffd700] hover:underline"
                                >
                                    DEMO LEVEL UP
                                </button>
                            </div>
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
                        { icon: <Flame className="text-[#8888aa]" size={28} />, number: '0', label: 'DAY STREAK', sub: 'Start today!', color: '#e8e8f0' },
                        { icon: <Zap className="text-[#8888aa]" size={28} />, number: '0', label: 'XP THIS WEEK', sub: 'Complete lessons', color: '#e8e8f0' },
                        { icon: <BookOpen className="text-[#8888aa]" size={28} />, number: '0', label: 'LESSONS DONE', sub: 'Start learning!', color: '#e8e8f0' },
                        { icon: <Coins className="text-[#8888aa]" size={28} />, number: '0', label: 'GOLD COINS', sub: 'Spend in Shop', color: '#e8e8f0' },
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
                                CONTINUE ▶
                            </Link>
                        </div>

                        {/* Active Quests */}
                        <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-pixel text-sm">ACTIVE QUESTS</h3>
                                <Link href="/quests" className="text-mono text-[#6c63ff] text-xs hover:underline">VIEW ALL →</Link>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { title: 'Daily: Complete 1 lesson', progress: 0, current: 0, total: 1, reward: '+150 XP 🏆' },
                                    { title: 'Weekly: Win a Code Duel', progress: 0, current: 0, total: 1, reward: '+500 XP 💎' },
                                ].map((quest, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-mono text-[#e8e8f0] text-sm flex items-center gap-2"><Scroll size={14} className="text-[#8888aa]" /> {quest.title}</span>
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
                            <h3 className="text-pixel text-sm mb-3">QUICK ACCESS</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { href: '/cinema', icon: <Film size={24} className="text-[#8888aa]" />, title: 'AI Cinema', desc: 'Watch code explained' },
                                    { href: '/duel', icon: <Swords size={24} className="text-[#8888aa]" />, title: 'Code Duel', desc: 'Vs AI peers' },
                                    { href: '/map', icon: <Map size={24} className="text-[#8888aa]" />, title: 'World Map', desc: 'Explore topics' },
                                    { href: '/progress', icon: <TrendingUp size={24} className="text-[#8888aa]" />, title: 'Progress', desc: 'View your stats' },
                                ].map((item, i) => (
                                    <Link key={i} href={item.href} className="bg-[#12121a] border border-[#2a2a3e] rounded p-3 hover:border-[#6c63ff] transition cursor-pointer block">
                                        <div className="mb-2">{item.icon}</div>
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
                                {PEERS.map((peer, i) => (
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
                                            <button
                                                onClick={() => setActivePeer(peer)}
                                                className="flex-1 py-1 border border-[#6c63ff] text-[#6c63ff] rounded text-retro text-xs hover:bg-[#6c63ff22] transition"
                                            >
                                                CHAT
                                            </button>
                                            <button
                                                onClick={() => setActivePeer(peer)}
                                                className="flex-1 py-1 bg-[#6c63ff] text-white rounded text-retro text-xs hover:bg-[#7c73ff] transition"
                                            >
                                                CODE WITH
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pet */}
                        <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 text-center hover:border-[#6c63ff] transition-all">
                            <h3 className="text-pixel text-sm mb-4">YOUR COMPANION</h3>
                            <Link href="/pet" className="block w-fit mx-auto">
                                <Cat size={64} className="mb-3 text-[#8888aa] animate-float hover:scale-105 transition-transform" />
                            </Link>
                            <div className="text-retro text-[#e8e8f0] text-xl mb-1">BYTEBEAR</div>
                            <div className="text-retro text-[#8888aa] text-sm mb-2">LVL 1</div>
                            <div className="text-retro text-[#8888aa] mb-3">HAPPY</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        showSuccess('ByteBear was fed! 🍎', '+5 Happiness · Keep your buddy happy!');
                                        // Randomly trigger achievement for demo
                                        if (Math.random() > 0.7) {
                                            showAchievement('Gourmet Caretaker', 'Feed your pet 5 times in a single day.');
                                        }
                                    }}
                                    className="flex-1 py-2 bg-[#00ff88] text-[#0a0a0f] rounded text-retro text-sm hover:bg-[#00ff99] transition"
                                >
                                    🍎 FEED
                                </button>
                                <Link href="/pet" className="flex-1 py-2 border-2 border-[#00ff88] text-[#00ff88] rounded text-retro text-sm hover:bg-[#00ff8822] transition text-center">
                                    🎮 PLAY
                                </Link>
                            </div>
                        </div>

                        {/* Guild */}
                        <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition-all">
                            <h3 className="text-pixel text-sm mb-4">GUILDS</h3>
                            <p className="text-mono text-[#8888aa] text-sm mb-4">Join or create a guild to compete as a team!</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsJoinGuildOpen(true)}
                                    className="flex-1 py-2 border-2 border-[#6c63ff] text-[#6c63ff] text-center rounded text-retro text-sm hover:bg-[#6c63ff22] transition"
                                >
                                    JOIN
                                </button>
                                <button
                                    onClick={() => setIsCreateGuildOpen(true)}
                                    className="flex-1 py-2 bg-[#6c63ff] text-white text-center rounded text-retro text-sm hover:bg-[#7c73ff] transition"
                                >
                                    CREATE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Peer Chat Drawer */}
            {activePeer && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[59]" onClick={() => setActivePeer(null)} />
                    <PeerChatDrawer peer={activePeer} onClose={() => setActivePeer(null)} />
                </>
            )}
            {/* Modals */}
            <CreateGuildModal
                isOpen={isCreateGuildOpen}
                onClose={() => setIsCreateGuildOpen(false)}
                onCreate={(data) => console.log('Guild Created:', data)}
            />
            <JoinGuildModal
                isOpen={isJoinGuildOpen}
                onClose={() => setIsJoinGuildOpen(false)}
                onJoin={(id) => console.log('Joining Guild:', id)}
            />
            <LevelUpModal
                isOpen={isLevelUpOpen}
                onClose={() => setIsLevelUpOpen(false)}
                oldLevel={1}
                newLevel={2}
                rewards={[
                    { icon: '💎', label: '100 Gems' },
                    { icon: '🛡️', label: 'Iron Shield' },
                    { icon: '🏷️', label: 'Elite Title' },
                ]}
            />
        </>
    );
}
