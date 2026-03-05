'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Users, Trophy, ChevronRight, Filter, Globe, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface JoinGuildModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (guildId: string) => void;
}

const MOCK_GUILDS = [
    { id: '1', name: 'ALPHA CODERS', description: 'The elite squad of competitive coders.', members: 42, maxMembers: 50, minLevel: 20, crest: '⚔️', type: 'public', rank: 1 },
    { id: '2', name: 'BYTE KNIGHTS', description: 'Defenders of clean code and documentation.', members: 28, maxMembers: 50, minLevel: 10, crest: '🛡️', type: 'public', rank: 5 },
    { id: '3', name: 'PYTHON PIT', description: 'All things snake. Indentation is life.', members: 45, maxMembers: 50, minLevel: 5, crest: '🐍', type: 'private', rank: 3 },
    { id: '4', name: 'REACT REBELS', description: 'Hooks, states, and virtual DOM mastery.', members: 15, maxMembers: 30, minLevel: 1, crest: '⚛️', type: 'public', rank: 12 },
    { id: '5', name: 'JAVA GIANTS', description: 'Object-oriented excellence for legacy and beyond.', members: 50, maxMembers: 50, minLevel: 15, crest: '☕', type: 'public', rank: 8 },
];

export default function JoinGuildModal({ isOpen, onClose, onJoin }: JoinGuildModalProps) {
    const { showSuccess, showInfo } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isJoining, setIsJoining] = useState<string | null>(null);

    const filteredGuilds = MOCK_GUILDS.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleJoin = async (guild: typeof MOCK_GUILDS[0]) => {
        if (guild.members >= guild.maxMembers) {
            showInfo('Guild Full', 'This guild has reached its maximum capacity.');
            return;
        }

        if (guild.type === 'private') {
            showInfo('Application Sent', `Your request to join ${guild.name} has been sent to the leaders.`);
            onClose();
            return;
        }

        setIsJoining(guild.id);
        await new Promise((r) => setTimeout(r, 1000));
        onJoin(guild.id);
        setIsJoining(null);
        showSuccess('Welcome to the Squad!', `You are now a member of ${guild.name}.`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="relative w-full max-w-2xl bg-[#1a1a2e] border-2 border-[#6c63ff] rounded-xl overflow-hidden shadow-2xl glow-purple max-h-[85vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-[#12121a] border-b-2 border-[#2a2a3e] p-5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <Users className="text-[#6c63ff]" size={24} />
                            <h2 className="text-pixel text-lg text-[#e8e8f0]">JOIN A GUILD</h2>
                        </div>
                        <button onClick={onClose} className="text-[#8888aa] hover:text-white transition">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Search & Filter */}
                    <div className="p-4 bg-[#12121a] border-b border-[#2a2a3e] shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or keyword..."
                                className="w-full bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-lg pl-12 pr-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition shadow-inner"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444466]" size={20} />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                <button className="p-1.5 text-[#8888aa] hover:text-[#6c63ff] transition">
                                    <Filter size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Guild List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredGuilds.length > 0 ? (
                            filteredGuilds.map((guild) => (
                                <div
                                    key={guild.id}
                                    className="bg-[#12121a] border-2 border-[#2a2a3e] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-[#6c63ff40] hover:bg-[#151525] transition-all group"
                                >
                                    <div className="w-16 h-16 bg-[#1a1a2e] rounded-lg border-2 border-[#2a2a3e] flex items-center justify-center text-3xl group-hover:scale-110 transition shrink-0 shadow-lg">
                                        {guild.crest}
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                            <h3 className="text-retro text-[#e8e8f0] text-lg font-bold tracking-wide">{guild.name}</h3>
                                            <div className="flex justify-center sm:justify-start gap-2">
                                                {guild.type === 'public' ? (
                                                    <span className="text-[10px] text-[#00ff88] bg-[#00ff8810] px-2 py-0.5 rounded border border-[#00ff8820] flex items-center gap-1">
                                                        <Globe size={10} /> OPEN
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-[#ff4d6d] bg-[#ff4d6d10] px-2 py-0.5 rounded border border-[#ff4d6d20] flex items-center gap-1">
                                                        <Lock size={10} /> PRIVATE
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-[#ffd700] bg-[#ffd70010] px-2 py-0.5 rounded border border-[#ffd70020] flex items-center gap-1 uppercase tracking-tighter">
                                                    <Trophy size={10} /> RANK #{guild.rank}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-mono text-[#8888aa] text-xs line-clamp-1 mb-2">
                                            {guild.description}
                                        </p>
                                        <div className="flex items-center justify-center sm:justify-start gap-4 text-mono text-[10px] text-[#444466] uppercase font-bold">
                                            <span className="flex items-center gap-1 text-[#8888aa]">
                                                <Users size={12} /> {guild.members}/{guild.maxMembers}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                LEV {guild.minLevel}+ REQ
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleJoin(guild)}
                                        disabled={isJoining === guild.id}
                                        className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-retro text-sm flex items-center justify-center gap-2 transition transform active:scale-95 shadow-md ${guild.members >= guild.maxMembers
                                                ? 'bg-[#2a2a3e] text-[#444466] cursor-not-allowed'
                                                : 'bg-[#6c63ff] text-white hover:bg-[#7c73ff] hover:glow-purple'
                                            }`}
                                    >
                                        {isJoining === guild.id ? 'JOINING...' : (guild.members >= guild.maxMembers ? 'FULL' : 'JOIN')}
                                        {isJoining !== guild.id && guild.members < guild.maxMembers && <ChevronRight size={14} />}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-[#444466]">
                                <Users size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-retro text-xl mb-1 opacity-50 uppercase">No Guilds Found</p>
                                <p className="text-mono text-sm opacity-50 italic">Try a different search or create your own!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-[#12121a] border-t-2 border-[#2a2a3e] shrink-0 text-center">
                        <p className="text-mono text-[10px] text-[#444466]">Can&apos;t find what you&apos;re looking for? <button className="text-[#6c63ff] hover:underline" onClick={onClose}>Found your own legend.</button></p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
