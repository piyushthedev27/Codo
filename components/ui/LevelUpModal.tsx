'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    oldLevel: number;
    newLevel: number;
    rewards?: { icon: string; label: string }[];
}

export default function LevelUpModal({ isOpen, onClose, oldLevel, newLevel, rewards = [] }: LevelUpModalProps) {
    useEffect(() => {
        if (isOpen) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ffd700', '#6c63ff', '#ffffff']
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                {/* Light Rays Effect */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.3, scale: 2 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute pointer-events-none w-64 h-64 bg-[#ffd700] rounded-full blur-[100px]"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 5 }}
                    className="relative w-full max-w-md bg-[#1a1a2e] border-4 border-[#ffd700] rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(255,215,0,0.4)]"
                >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-24 h-24 bg-[#ffd700] rounded-full border-4 border-[#1a1a2e] flex items-center justify-center shadow-xl"
                        >
                            <Trophy size={48} className="text-[#1a1a2e]" />
                        </motion.div>
                    </div>

                    <div className="mt-8 space-y-2">
                        <h2 className="text-pixel text-2xl text-[#ffd700] glow-yellow">LEVEL UP!</h2>
                        <p className="text-mono text-[#8888aa] text-sm uppercase tracking-widest font-bold">Your power grows...</p>
                    </div>

                    <div className="my-8 flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center">
                            <div className="text-mono text-[#8888aa] text-xs mb-1">OLD</div>
                            <div className="w-16 h-16 bg-[#12121a] border-2 border-[#2a2a3e] rounded-xl flex items-center justify-center text-pixel text-xl text-[#8888aa]">
                                {oldLevel}
                            </div>
                        </div>
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            <TrendingUp size={24} className="text-[#ffd700]" />
                        </motion.div>
                        <div className="flex flex-col items-center">
                            <div className="text-mono text-[#ffd700] text-xs mb-1 font-bold">NEW</div>
                            <div className="w-20 h-20 bg-[#ffd70022] border-4 border-[#ffd700] rounded-2xl flex items-center justify-center text-pixel text-3xl text-[#ffd700] glow-yellow">
                                {newLevel}
                            </div>
                        </div>
                    </div>

                    {rewards.length > 0 && (
                        <div className="bg-[#12121a] rounded-xl p-4 border border-[#2a2a3e] mb-8">
                            <div className="text-retro text-[#8888aa] text-[10px] uppercase mb-3 tracking-tighter">REWARDS UNLOCKED</div>
                            <div className="flex justify-center gap-4">
                                {rewards.map((reward, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 group">
                                        <div className="w-12 h-12 bg-[#1a1a2e] border-2 border-[#ffd70040] rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-inner">
                                            {reward.icon}
                                        </div>
                                        <div className="text-mono text-[9px] text-[#ffd700] font-bold">{reward.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-[#ffd700] text-[#1a1a2e] rounded-xl text-retro text-xl hover:bg-[#ffed4a] transition transform active:scale-95 shadow-xl font-black"
                    >
                        CONTINUE ADVENTURE ▶
                    </button>

                    <p className="text-mono text-[10px] text-[#444466] mt-4 uppercase">Next target: Level {newLevel + 1}</p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
