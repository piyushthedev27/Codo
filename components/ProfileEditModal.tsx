'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, User, Pencil, Palette } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: {
        displayName: string;
        bio: string;
        avatar: string;
    };
    onSave: (data: { displayName: string; bio: string; avatar: string }) => void;
}

export const AVATARS = [
    { id: 'av-1', emoji: '⚔️', color: 'bg-red-500' },
    { id: 'av-2', emoji: '🧙', color: 'bg-blue-500' },
    { id: 'av-3', emoji: '🏹', color: 'bg-green-500' },
    { id: 'av-4', emoji: '🦊', color: 'bg-orange-500' },
    { id: 'av-5', emoji: '🤖', color: 'bg-slate-500' },
    { id: 'av-6', emoji: '🛡️', color: 'bg-purple-500' },
    { id: 'av-7', emoji: '🐉', color: 'bg-emerald-500' },
    { id: 'av-8', emoji: '💎', color: 'bg-cyan-500' },
];

export default function ProfileEditModal({ isOpen, onClose, initialData, onSave }: ProfileEditModalProps) {
    const { showSuccess } = useToast();
    const [activeTab, setActiveTab] = useState<'info' | 'avatar'>('info');
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 800));
        onSave(formData);
        setIsSaving(false);
        showSuccess('Profile Updated', 'Your changes have been saved successfully.');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#1a1a2e] border-2 border-[#6c63ff] rounded-lg shadow-2xl overflow-hidden glow-purple"
                >
                    {/* Header */}
                    <div className="bg-[#12121a] border-b-2 border-[#2a2a3e] p-4 flex justify-between items-center">
                        <h2 className="text-pixel text-sm text-[#6c63ff]">EDIT PROFILE</h2>
                        <button onClick={onClose} className="text-[#8888aa] hover:text-white transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b-2 border-[#2a2a3e]">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`flex-1 py-3 text-retro text-sm flex items-center justify-center gap-2 ${activeTab === 'info' ? 'bg-[#6c63ff15] text-[#6c63ff] border-b-2 border-[#6c63ff]' : 'text-[#8888aa]'
                                }`}
                        >
                            <User size={16} /> BASIC INFO
                        </button>
                        <button
                            onClick={() => setActiveTab('avatar')}
                            className={`flex-1 py-3 text-retro text-sm flex items-center justify-center gap-2 ${activeTab === 'avatar' ? 'bg-[#6c63ff15] text-[#6c63ff] border-b-2 border-[#6c63ff]' : 'text-[#8888aa]'
                                }`}
                        >
                            <Palette size={16} /> AVATAR
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'info' ? (
                                <motion.div
                                    key="info"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-retro text-[#8888aa] mb-2 text-sm uppercase">Display Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.displayName}
                                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition pl-11"
                                                placeholder="Enter your hero name..."
                                            />
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444466]" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-retro text-[#8888aa] mb-2 text-sm uppercase">Bio</label>
                                        <div className="relative">
                                            <textarea
                                                rows={4}
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="w-full bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none transition pl-11 resize-none"
                                                placeholder="Tell your story to the community..."
                                            />
                                            <Pencil size={18} className="absolute left-4 top-4 text-[#444466]" />
                                        </div>
                                        <p className="text-right text-[10px] text-[#444466] mt-1 text-mono">{formData.bio.length}/150</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="avatar"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-center mb-6">
                                        <div className={`w-24 h-24 rounded-lg flex items-center justify-center text-4xl border-4 border-[#6c63ff] glow-purple ${AVATARS.find(a => a.id === formData.avatar)?.color ?? 'bg-[#2a2a3e]'
                                            }`}>
                                            {AVATARS.find(a => a.id === formData.avatar)?.emoji ?? '❓'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        {AVATARS.map((avatar) => (
                                            <button
                                                key={avatar.id}
                                                onClick={() => setFormData({ ...formData, avatar: avatar.id })}
                                                className={`aspect-square rounded-lg flex items-center justify-center text-2xl border-2 transition relative ${formData.avatar === avatar.id
                                                    ? 'border-[#6c63ff] bg-[#6c63ff22]'
                                                    : 'border-[#2a2a3e] bg-[#12121a] hover:border-[#6c63ff88]'
                                                    }`}
                                            >
                                                {avatar.emoji}
                                                {formData.avatar === avatar.id && (
                                                    <div className="absolute -top-1 -right-1 bg-[#6c63ff] rounded-full p-0.5 shadow-lg">
                                                        <Check size={10} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-mono text-xs text-[#8888aa]">More avatars can be unlocked in the <span className="text-[#ffd700]">SHOP</span>.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="bg-[#12121a] border-t-2 border-[#2a2a3e] p-4 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border-2 border-[#2a2a3e] text-[#8888aa] rounded text-retro text-lg hover:bg-[#2a2a3e] hover:text-white transition"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-3 bg-[#6c63ff] text-white rounded text-retro text-lg hover:bg-[#7c73ff] transition disabled:opacity-50 glow-purple"
                        >
                            {isSaving ? 'SAVING...' : 'SAVE PROFILE'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
