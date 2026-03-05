'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Share2, Award, Zap, Target, Users, Copy, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import ProfileEditModal, { AVATARS } from '@/components/ProfileEditModal';

const ACHIEVEMENTS = [
    { id: '1', name: 'First Milestone', icon: '🎯', description: 'Complete your first coding challenge.', unlocked: true },
    { id: '2', name: 'Streak Starter', icon: '🔥', description: 'Maintain a 3-day coding streak.', unlocked: true },
    { id: '3', name: 'Social Butterfly', icon: '🦋', description: 'Join your first guild.', unlocked: false },
    { id: '4', name: 'Bug Hunter', icon: '🐛', description: 'Fix 10 AI-detected bugs.', unlocked: true },
    { id: '5', name: 'Gold Miner', icon: '💰', description: 'Earn 1000 gold coins.', unlocked: false },
];

export default function ProfilePage({ params }: { params: { username: string } }) {
    const { user } = useAuth();
    const { showSuccess } = useToast();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const isOwn = user?.displayName === params.username || params.username === 'me' || !params.username;

    const [profileData, setProfileData] = useState({
        displayName: user?.displayName || params.username || 'Hero',
        bio: 'New coder on the quest. Just getting started! 🚀',
        avatar: 'av-1'
    });

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showSuccess('Link Copied', 'Profile link copied to clipboard.');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-xl p-8 mb-8 relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6c63ff10] rounded-bl-full border-l border-b border-[#6c63ff20]" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    {/* Avatar Container */}
                    <div className="relative group">
                        <div className="w-32 h-32 bg-[#12121a] rounded-2xl border-4 border-[#6c63ff] flex items-center justify-center text-5xl glow-purple transition-transform duration-300 group-hover:scale-105">
                            {AVATARS.find(a => a.id === profileData.avatar)?.emoji || '⚔️'}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[#ffd700] text-[#1a1a2e] px-3 py-1 rounded-full text-retro text-xs border-2 border-[#12121a] shadow-lg">
                            LVL 12
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                            <h1 className="text-pixel text-3xl text-[#e8e8f0] tracking-tight">{profileData.displayName}</h1>
                            <div className="flex justify-center md:justify-start gap-2">
                                <span className="px-3 py-1 bg-[#6c63ff22] border border-[#6c63ff40] text-[#6c63ff] text-retro text-xs rounded-lg flex items-center gap-1">
                                    <Award size={12} /> PRO WARRIOR
                                </span>
                            </div>
                        </div>

                        <p className="text-mono text-[#8888aa] text-lg max-w-2xl mb-6 leading-relaxed">
                            {profileData.bio}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl">
                            {[
                                { label: 'CHALLENGES', value: '42', icon: <Target size={14} className="text-[#ff4d6d]" /> },
                                { label: 'TOTAL XP', value: '12.4k', icon: <Zap size={14} className="text-[#ffd700]" /> },
                                { label: 'STREAK', value: '14d', icon: <div className="text-orange-500">🔥</div> },
                                { label: 'GUILD', value: 'AlphaCoders', icon: <Users size={14} className="text-[#00ff88]" /> },
                            ].map((stat, i) => (
                                <div key={i} className="bg-[#12121a] border border-[#2a2a3e] p-3 rounded-lg flex flex-col items-center md:items-start">
                                    <div className="text-pixel text-xl text-[#e8e8f0] mb-1">{stat.value}</div>
                                    <div className="flex items-center gap-1.5 text-mono text-[#8888aa] text-[10px] uppercase font-bold tracking-wider">
                                        {stat.icon}
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {isOwn ? (
                            <>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-6 py-2.5 bg-[#6c63ff] text-white rounded-lg text-retro text-sm flex items-center gap-2 hover:bg-[#7c73ff] transition transform active:scale-95 glow-purple"
                                >
                                    <Edit3 size={16} /> EDIT PROFILE
                                </button>
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="px-6 py-2.5 border-2 border-[#2a2a3e] text-[#e8e8f0] rounded-lg text-retro text-sm flex items-center gap-2 hover:border-[#6c63ff] transition transform active:scale-95"
                                >
                                    <Share2 size={16} /> SHARE
                                </button>
                            </>
                        ) : (
                            <button className="px-6 py-2.5 bg-[#6c63ff] text-white rounded-lg text-retro text-sm flex items-center gap-2 hover:bg-[#7c73ff] transition transform active:scale-95 glow-purple">
                                <Users size={16} /> ADD FRIEND
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Achievements Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-pixel text-lg text-[#e8e8f0]">ACHIEVEMENTS</h2>
                            <span className="text-mono text-[#8888aa] text-xs">3 / 5 UNLOCKED</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {ACHIEVEMENTS.map((ach) => (
                                <div
                                    key={ach.id}
                                    className={`relative group p-4 rounded-xl border-2 transition-all cursor-help ${ach.unlocked
                                        ? 'bg-[#6c63ff10] border-[#6c63ff40] grayscale-0'
                                        : 'bg-[#12121a] border-[#2a2a3e] grayscale'
                                        }`}
                                >
                                    <div className="text-3xl mb-2 text-center">{ach.icon}</div>
                                    <div className="text-mono text-[10px] text-center font-bold text-[#e8e8f0] truncate">
                                        {ach.name.toUpperCase()}
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-2 bg-[#12121a] border border-[#6c63ff] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none shadow-2xl">
                                        <div className="text-retro text-[#6c63ff] text-[10px] mb-1">{ach.name}</div>
                                        <div className="text-mono text-[11px] text-[#8888aa] leading-tight">{ach.description}</div>
                                        {!ach.unlocked && <div className="mt-2 text-[10px] text-[#ff4d6d] font-bold">LOCKED</div>}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#6c63ff]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Friend/Side Content */}
                <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-xl p-6">
                    <h2 className="text-pixel text-lg text-[#e8e8f0] mb-6">BADGES</h2>
                    <div className="flex flex-wrap gap-3">
                        {['🛡️', '⚔️', '🧙', '🏹', '💎'].map((badge, i) => (
                            <div key={i} className="w-12 h-12 bg-[#12121a] border border-[#2a2a3e] rounded-lg flex items-center justify-center text-xl hover:border-[#6c63ff] transition-colors cursor-pointer">
                                {badge}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-[#2a2a3e]">
                        <h3 className="text-retro text-[#8888aa] text-xs mb-4">LATEST ACTIVITY</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#00ff8822] flex items-center justify-center text-[#00ff88]">✓</div>
                                <div className="text-mono text-xs">
                                    <span className="text-white">Completed:</span> Two Sum<br />
                                    <span className="text-[#8888aa]">2 hours ago</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#ffd70022] flex items-center justify-center text-[#ffd700]">★</div>
                                <div className="text-mono text-xs">
                                    <span className="text-white">Unlocked Achievement:</span> Streak Starter<br />
                                    <span className="text-[#8888aa]">Yesterday</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={profileData}
                onSave={setProfileData}
            />

            <AnimatePresence>
                {isShareModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsShareModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-sm bg-[#1a1a2e] border-2 border-[#6c63ff] rounded-xl p-6 shadow-2xl glow-purple"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-pixel text-sm text-[#6c63ff]">SHARE PROFILE</h3>
                                <button onClick={() => setIsShareModalOpen(false)} className="text-[#8888aa] hover:text-white transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-mono text-[#8888aa] text-sm mb-4 text-center">Copy your profile link to share your progress with friends!</p>

                            <div className="flex items-center gap-2 bg-[#12121a] border-2 border-[#2a2a3e] rounded-lg p-3 mb-6">
                                <div className="flex-1 truncate text-mono text-xs text-[#8888aa]">
                                    {typeof window !== 'undefined' ? window.location.href : 'loading...'}
                                </div>
                            </div>

                            <button
                                onClick={handleCopyLink}
                                className="w-full py-3 bg-[#6c63ff] text-white rounded-lg text-retro text-lg flex items-center justify-center gap-2 hover:bg-[#7c73ff] transition glow-purple"
                            >
                                {copied ? <><Check size={20} /> COPIED!</> : <><Copy size={20} /> COPY LINK</>}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
