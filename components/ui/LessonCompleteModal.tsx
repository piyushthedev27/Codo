'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface LessonCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonTitle: string;
    xpEarned: number;
    coinsEarned?: number;
    accuracy?: number;
    timeSpent?: string;
}

export default function LessonCompleteModal({
    isOpen,
    onClose,
    lessonTitle,
    xpEarned = 200,
    coinsEarned = 50,
    accuracy = 100,
    timeSpent = '4:20'
}: LessonCompleteModalProps) {

    useEffect(() => {
        if (isOpen) {
            const end = Date.now() + 2 * 1000;
            const colors = ['#6c63ff', '#00ff88', '#ffffff'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    className="relative w-full max-w-lg bg-[#1a1a2e] border-2 border-[#00ff88] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,255,136,0.3)]"
                >
                    {/* Top Accent Bar */}
                    <div className="h-2 bg-[#00ff88]" />

                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-[#00ff8822] rounded-full border-2 border-[#00ff88] flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                            <CheckCircle2 size={40} className="text-[#00ff88]" />
                        </div>

                        <h2 className="text-pixel text-xl text-[#00ff88] mb-2 font-black glow-green">CHALLENGE COMPLETE!</h2>
                        <p className="text-retro text-[#e8e8f0] text-sm mb-8 tracking-widest uppercase">
                            {lessonTitle || 'The Algorithm Trial'}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-[#12121a] border border-[#2a2a3e] p-4 rounded-xl">
                                <div className="text-pixel text-2xl text-[#ffd700] mb-1">+{xpEarned}</div>
                                <div className="text-mono text-[10px] text-[#8888aa] font-bold flex items-center justify-center gap-1 uppercase">
                                    <Zap size={10} className="text-[#ffd700]" /> XP EARNED
                                </div>
                            </div>
                            <div className="bg-[#12121a] border border-[#2a2a3e] p-4 rounded-xl">
                                <div className="text-pixel text-2xl text-[#ffd700] mb-1">+{coinsEarned}</div>
                                <div className="text-mono text-[10px] text-[#8888aa] font-bold flex items-center justify-center gap-1 uppercase">
                                    💰 COINS
                                </div>
                            </div>
                            <div className="bg-[#12121a] border border-[#2a2a3e] p-3 rounded-xl">
                                <div className="text-retro text-lg text-[#00ff88] mb-1">{accuracy}%</div>
                                <div className="text-mono text-[9px] text-[#8888aa] flex items-center justify-center gap-1 uppercase">
                                    <Trophy size={10} className="text-[#00ff88]" /> ACCURACY
                                </div>
                            </div>
                            <div className="bg-[#12121a] border border-[#2a2a3e] p-3 rounded-xl">
                                <div className="text-retro text-lg text-[#6c63ff] mb-1">{timeSpent}</div>
                                <div className="text-mono text-[9px] text-[#8888aa] flex items-center justify-center gap-1 uppercase">
                                    <Clock size={10} className="text-[#6c63ff]" /> TIME
                                </div>
                            </div>
                        </div>

                        {/* Rank Info */}
                        <div className="mb-8 p-4 bg-[#6c63ff10] border border-[#6c63ff30] rounded-xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#6c63ff22] border-2 border-[#6c63ff] rounded-lg flex items-center justify-center text-2xl">
                                🛡️
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-retro text-[#e8e8f0] text-xs">LEADERBOARD RANK</div>
                                <div className="text-pixel text-lg text-[#6c63ff]">#1,244 <span className="text-mono text-[10px] text-[#00ff88] ml-2">+25 ↑</span></div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-[#00ff88] text-[#1a1a2e] rounded-xl text-retro text-xl hover:bg-[#34ff9d] transition transform active:scale-95 shadow-xl font-black group"
                        >
                            <span className="flex items-center justify-center gap-2">
                                BACK TO WORLD MAP <Star size={20} className="group-hover:rotate-45 transition-transform" />
                            </span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
