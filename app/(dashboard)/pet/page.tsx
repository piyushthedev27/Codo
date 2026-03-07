'use client';

import { useToast } from '@/components/ui/ToastProvider';
import { useRewards } from '@/hooks/useRewards';
import RandomGameModal from '@/components/games/RandomGameModal';
import { PawPrint, Apple, Gamepad2, Pencil, BarChart3, Zap, Egg, Bird, CheckCircle2, Lock, Smile, Calendar, Cat } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

type EvolutionStage = 'Baby' | 'Teen' | 'Adult' | 'Mega';

const EVOLUTION_STAGES: { stage: EvolutionStage; xpRequired: number; icon: React.ReactNode; color: string }[] = [
    { stage: 'Baby', xpRequired: 0, icon: <Egg size={24} />, color: '#8888aa' },
    { stage: 'Teen', xpRequired: 500, icon: <Bird size={24} />, color: '#8888aa' },
    { stage: 'Adult', xpRequired: 2000, icon: <Bird size={28} />, color: '#8888aa' },
    { stage: 'Mega', xpRequired: 5000, icon: <Zap size={32} />, color: '#8888aa' },
];

interface PetStats {
    xp: number;
    level: number;
    hunger: number;
    happiness: number;
    stage: EvolutionStage;
}

export default function PetPage() {
    const { showSuccess, showInfo } = useToast();
    const { addXp } = useRewards();
    const [stats, setStats] = useState<PetStats>({
        xp: 120,
        level: 1,
        hunger: 75,
        happiness: 88,
        stage: 'Baby',
    });
    const [petName, setPetName] = useState('ByteBear');
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(petName);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [gamesPlayed, setGamesPlayed] = useState(1);

    const feed = () => {
        if (stats.hunger >= 100) {
            showInfo('Already Full!', `${petName} isn't hungry right now.`);
            return;
        }
        setStats((p) => {
            const newHunger = Math.min(100, p.hunger + 20);
            const newHappiness = Math.min(100, p.happiness + 5);
            return { ...p, hunger: newHunger, happiness: newHappiness };
        });
        showSuccess(`${petName} was fed! 🍎`, '+20 Hunger · +5 Happiness');
    };

    const handlePetClick = () => {
        setStats((prev) => ({
            ...prev,
            happiness: Math.min(100, prev.happiness + 1),
        }));
    };

    const handleGameComplete = (score: number) => {
        setIsGameModalOpen(false);
        setGamesPlayed(p => p + 1);
        if (score > 0) {
            const earnedXp = Math.floor(score / 5);
            const happinessGain = Math.min(100 - stats.happiness, Math.max(5, Math.floor(score / 20)));

            setStats((prev) => ({
                ...prev,
                happiness: prev.happiness + happinessGain,
                xp: prev.xp + earnedXp,
            }));
            addXp(earnedXp);

            showSuccess('Game Complete!', `ByteBear gained +${earnedXp} XP and +${happinessGain} Happiness! 🎮`);
        } else {
            showInfo('Game Over', `You didn't score any points. Keep practicing!`);
        }
    };

    const saveName = () => {
        setPetName(nameInput.trim() || petName);
        setIsEditingName(false);
        showSuccess('Name saved!', `Your pet is now called ${nameInput.trim() || petName}`);
    };

    const currentStageIdx = EVOLUTION_STAGES.findIndex((s) => s.stage === stats.stage);
    const nextStage = EVOLUTION_STAGES[currentStageIdx + 1];
    const xpToNext = nextStage ? nextStage.xpRequired - stats.xp : null;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-6 flex items-center gap-2">
                <PawPrint className="text-[#6c63ff]" /> YOUR COMPANION
            </h1>

            <div className="grid md:grid-cols-[1fr_300px] gap-6">
                {/* Main Pet Display */}
                <div className="space-y-4">
                    {/* Pet Avatar */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 text-center">
                        <motion.div
                            onClick={handlePetClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-40 h-40 bg-gradient-to-b from-[#1a1a2e] to-[#12121a] border-2 border-[#6c63ff40] rounded-full mx-auto mb-6 flex items-center justify-center text-[#e8e8f0] cursor-pointer shadow-xl hover:shadow-[0_0_30px_#6c63ff60] transition-all duration-300 relative group`}
                        >
                            <div className="absolute inset-0 bg-[#6c63ff10] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Cat size={80} className="relative z-10" />
                        </motion.div>

                        {/* Name */}
                        {isEditingName ? (
                            <div className="flex items-center gap-2 justify-center mb-3">
                                <input
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                    className="bg-[#12121a] border border-[#6c63ff] rounded px-3 py-1 text-mono text-[#e8e8f0] text-center focus:outline-none"
                                    autoFocus
                                    maxLength={16}
                                />
                                <button onClick={saveName} className="px-3 py-1 bg-[#6c63ff] text-white rounded text-mono text-sm">OK</button>
                            </div>
                        ) : (
                            <button onClick={() => { setIsEditingName(true); setNameInput(petName); }} className="text-pixel text-[#e8e8f0] text-2xl mb-1 hover:text-[#6c63ff] transition flex items-center justify-center gap-2 mx-auto">
                                {petName} <Pencil size={18} className="text-[#8888aa]" />
                            </button>
                        )}

                        <div className="text-retro text-[#8888aa] mb-1">Level {stats.level} · {stats.stage}</div>

                        <div className="flex gap-4 justify-center mt-6">
                            <button
                                onClick={feed}
                                className="px-6 py-2.5 bg-[#1a1a2e] border-2 border-[#00ff88] text-[#00ff88] rounded flex items-center gap-2 text-retro text-lg hover:bg-[#00ff88] hover:text-[#0a0a0f] hover:shadow-[0_0_15px_#00ff8860] transition-all"
                            >
                                <Apple size={20} /> FEED
                            </button>
                            <button
                                onClick={() => setIsGameModalOpen(true)}
                                className="px-6 py-2.5 bg-[#1a1a2e] border-2 border-[#6c63ff] text-[#6c63ff] rounded flex items-center gap-2 text-retro text-lg hover:bg-[#6c63ff] hover:text-[#ffffff] hover:shadow-[0_0_15px_#6c63ff60] transition-all"
                            >
                                <Gamepad2 size={20} /> PLAY
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                        <h3 className="text-pixel text-sm text-[#e8e8f0] mb-4 flex items-center gap-2">
                            <BarChart3 size={18} className="text-[#6c63ff]" /> PET STATS
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'XP', value: stats.xp, max: nextStage?.xpRequired ?? stats.xp, color: '#6c63ff', icon: <Zap size={14} /> },
                                { label: 'Hunger', value: stats.hunger, max: 100, color: '#00ff88', icon: <Apple size={14} /> },
                                { label: 'Happiness', value: stats.happiness, max: 100, color: '#ffd700', icon: <Smile size={14} /> },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-mono text-[#8888aa] text-xs">{stat.icon} {stat.label}</span>
                                        <span className="text-mono text-[#8888aa] text-xs">{stat.value} / {stat.max}</span>
                                    </div>
                                    <div className="bg-[#2a2a3e] h-2.5 rounded overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full rounded"
                                            style={{ background: stat.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {xpToNext && (
                            <div className="mt-3 text-mono text-[#8888aa] text-xs text-center">
                                {xpToNext} XP until evolution to {nextStage.stage}
                            </div>
                        )}
                    </div>
                </div>

                {/* Evolution Tree */}
                <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                    <h3 className="text-pixel text-sm text-[#e8e8f0] mb-4">🌱 EVOLUTION TREE</h3>
                    <div className="space-y-3">
                        {EVOLUTION_STAGES.map((stage, i) => {
                            const isUnlocked = stats.xp >= stage.xpRequired;
                            const isCurrent = stage.stage === stats.stage;
                            return (
                                <div key={stage.stage}>
                                    <div
                                        className={`flex items-center gap-3 p-3 rounded border-2 transition ${isCurrent
                                            ? 'border-[#00ff88] bg-[#00ff8815]'
                                            : isUnlocked
                                                ? 'border-[#6c63ff] bg-[#6c63ff10]'
                                                : 'border-[#2a2a3e] opacity-50'
                                            }`}
                                    >
                                        <span className="text-[#8888aa]">{stage.icon}</span>
                                        <div className="flex-1">
                                            <div className={`text-retro ${isCurrent ? 'text-[#00ff88]' : isUnlocked ? 'text-[#e8e8f0]' : 'text-[#8888aa]'}`}>
                                                {stage.stage}
                                            </div>
                                            <div className="text-mono text-[#8888aa] text-xs">{stage.xpRequired} XP</div>
                                        </div>
                                        {isCurrent && <span className="text-mono text-[#00ff88] text-xs">NOW</span>}
                                        {isUnlocked && !isCurrent && <CheckCircle2 size={16} className="text-[#6c63ff]" />}
                                        {!isUnlocked && <Lock size={16} className="text-[#8888aa]" />}
                                    </div>
                                    {i < EVOLUTION_STAGES.length - 1 && (
                                        <div className="w-0.5 h-3 bg-[#2a2a3e] mx-auto" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pet History */}
                    <div className="mt-6 border-t border-[#2a2a3e] pt-4">
                        <h4 className="text-pixel text-xs text-[#8888aa] mb-3">HISTORY</h4>
                        <div className="space-y-2 text-mono text-xs text-[#8888aa]">
                            <div><Calendar size={12} className="inline mr-1" /> Adopted: Day 1</div>
                            <div><Zap size={12} className="inline mr-1" /> Total XP earned: {stats.xp}</div>
                            <div><Apple size={12} className="inline mr-1" /> Times fed: 3</div>
                            <div><Gamepad2 size={12} className="inline mr-1" /> Games played: {gamesPlayed}</div>
                        </div>
                    </div>
                </div>
            </div>

            <RandomGameModal
                isOpen={isGameModalOpen}
                onClose={() => setIsGameModalOpen(false)}
                onGameComplete={handleGameComplete}
            />
        </div>
    );
}
