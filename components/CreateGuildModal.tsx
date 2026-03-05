'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Globe, Lock, Info } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface GuildData {
    name: string;
    description: string;
    crest: string;
    privacy: 'public' | 'private';
    minLevel: number;
}

interface CreateGuildModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (guildData: GuildData) => void;
}

const CREST_EMOJIS = ['🛡️', '⚔️', '🐉', '🧙', '🏹', '🐺', '🦊', '🦅', '💎', '🔥', '❄️', '⚡'];

export default function CreateGuildModal({ isOpen, onClose, onCreate }: CreateGuildModalProps) {
    const { showSuccess } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        crest: '🛡️',
        privacy: 'public' as 'public' | 'private',
        minLevel: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSaving(true);
        await new Promise((r) => setTimeout(r, 1000));
        onCreate(formData);
        setIsSaving(false);
        showSuccess('Guild Created!', `${formData.name} has been established. Time to recruit!`);
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
                    className="relative w-full max-w-lg bg-[#1a1a2e] border-2 border-[#6c63ff] rounded-xl overflow-hidden shadow-2xl glow-purple"
                >
                    {/* Header */}
                    <div className="bg-[#12121a] border-b-2 border-[#2a2a3e] p-5 flex justify-between items-center bg-gradient-to-r from-[#12121a] to-[#1a1a2e]">
                        <div className="flex items-center gap-3">
                            <Shield className="text-[#6c63ff]" size={24} />
                            <h2 className="text-pixel text-lg text-[#e8e8f0]">FOUND A GUILD</h2>
                        </div>
                        <button onClick={onClose} className="text-[#8888aa] hover:text-white transition">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Name & Description */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-retro text-[#8888aa] mb-2 text-xs uppercase tracking-widest">Guild Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. THE BYTE KNIGHTS"
                                    className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded-lg px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-retro text-[#8888aa] mb-2 text-xs uppercase tracking-widest">Motto / Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What defines your squad?"
                                    className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded-lg px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition resize-none"
                                />
                            </div>
                        </div>

                        {/* Crest Selection */}
                        <div>
                            <label className="block text-retro text-[#8888aa] mb-3 text-xs uppercase tracking-widest text-center">Select Guild Crest</label>
                            <div className="grid grid-cols-6 gap-2 bg-[#12121a] p-3 rounded-xl border-2 border-[#2a2a3e]">
                                {CREST_EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, crest: emoji })}
                                        className={`aspect-square flex items-center justify-center text-2xl rounded-lg transition-all ${formData.crest === emoji
                                            ? 'bg-[#6c63ff] text-white scale-110 shadow-[0_0_15px_rgba(108,99,255,0.5)]'
                                            : 'hover:bg-[#2a2a3e] text-[#8888aa]'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Settings Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-retro text-[#8888aa] mb-2 text-[10px] uppercase tracking-widest">Privacy</label>
                                <div className="flex bg-[#12121a] rounded-lg border-2 border-[#2a2a3e] p-1">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, privacy: 'public' })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] text-retro transition ${formData.privacy === 'public' ? 'bg-[#6c63ff] text-white' : 'text-[#8888aa]'}`}
                                    >
                                        <Globe size={12} /> OPEN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, privacy: 'private' })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] text-retro transition ${formData.privacy === 'private' ? 'bg-[#ff4d6d] text-white' : 'text-[#8888aa]'}`}
                                    >
                                        <Lock size={12} /> INVITE
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-retro text-[#8888aa] mb-2 text-[10px] uppercase tracking-widest">Min. Level</label>
                                <select
                                    value={formData.minLevel}
                                    onChange={(e) => setFormData({ ...formData, minLevel: parseInt(e.target.value) })}
                                    className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded-lg px-3 py-2.5 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none"
                                >
                                    {[1, 5, 10, 20, 50].map(lvl => <option key={lvl} value={lvl}>Level {lvl}+</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="bg-[#6c63ff10] border border-[#6c63ff30] rounded-lg p-3 flex items-start gap-2">
                            <Info size={16} className="text-[#6c63ff] mt-0.5" />
                            <p className="text-mono text-[10px] text-[#8888aa]">Creating a guild costs <span className="text-[#ffd700]">500 Gold Coins</span>. Founders get a unique badge and guild management rights.</p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSaving || !formData.name.trim()}
                            className="w-full py-4 bg-[#6c63ff] text-white rounded-xl text-retro text-xl hover:bg-[#7c73ff] transition transform active:scale-95 disabled:opacity-50 glow-purple shadow-xl"
                        >
                            {isSaving ? 'ESTABLISHING...' : 'FOUND GUILD'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
