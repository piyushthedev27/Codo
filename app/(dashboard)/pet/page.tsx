'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useToast } from '@/components/ui/ToastProvider';

type EvolutionStage = 'Baby' | 'Teen' | 'Adult' | 'Mega';

const EVOLUTION_STAGES: { stage: EvolutionStage; xpRequired: number; emoji: string; color: string }[] = [
    { stage: 'Baby', xpRequired: 0, emoji: '🐣', color: '#00ff88' },
    { stage: 'Teen', xpRequired: 500, emoji: '🐤', color: '#00d4ff' },
    { stage: 'Adult', xpRequired: 2000, emoji: '🦅', color: '#6c63ff' },
    { stage: 'Mega', xpRequired: 5000, emoji: '🐉', color: '#ffd700' },
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
    const [isPlaying, setIsPlaying] = useState(false);
    const [clickScore, setClickScore] = useState(0);
    const [petMood, setPetMood] = useState('😊');

    const getMood = (h: number, hap: number) => {
        const avg = (h + hap) / 2;
        if (avg > 80) return '😄';
        if (avg > 60) return '😊';
        if (avg > 40) return '😐';
        if (avg > 20) return '😟';
        return '😢';
    };

    const feed = () => {
        if (stats.hunger >= 100) {
            showInfo('Already Full!', `${petName} isn't hungry right now.`);
            return;
        }
        setStats((p) => {
            const newHunger = Math.min(100, p.hunger + 20);
            const newHappiness = Math.min(100, p.happiness + 5);
            setPetMood(getMood(newHunger, newHappiness));
            return { ...p, hunger: newHunger, happiness: newHappiness };
        });
        showSuccess(`${petName} was fed! 🍎`, '+20 Hunger · +5 Happiness');
    };

    const handlePetClick = () => {
        if (!isPlaying) return;
        setClickScore((p) => p + 1);
        setStats((prev) => ({
            ...prev,
            happiness: Math.min(100, prev.happiness + 2),
            xp: prev.xp + 3,
        }));
    };

    const startGame = () => {
        setIsPlaying(true);
        setClickScore(0);
        showInfo('Minigame Started!', 'Click ByteBear as fast as you can! (10 seconds)');
        setTimeout(() => {
            setIsPlaying(false);
            showSuccess('Game Over!', `You clicked ${clickScore} times! +${clickScore * 3} XP earned 🎮`);
        }, 10000);
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
            <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-6">🐾 YOUR COMPANION</h1>

            <div className="grid md:grid-cols-[1fr_300px] gap-6">
                {/* Main Pet Display */}
                <div className="space-y-4">
                    {/* Pet Avatar */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 text-center">
                        <motion.div
                            onClick={handlePetClick}
                            whileTap={{ scale: 0.92 }}
                            className={`w-32 h-32 bg-[#00ff88] rounded-2xl mx-auto mb-4 flex items-center justify-center text-6xl ${isPlaying ? 'cursor-pointer' : 'animate-float'} ${isPlaying ? 'shadow-[0_0_20px_#00ff8880]' : ''} transition-shadow`}
                        >
                            🐻
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
                            <button onClick={() => { setIsEditingName(true); setNameInput(petName); }} className="text-pixel text-[#e8e8f0] text-2xl mb-1 hover:text-[#6c63ff] transition">
                                {petName} ✏️
                            </button>
                        )}

                        <div className="text-retro text-[#8888aa] mb-1">Level {stats.level} · {stats.stage}</div>
                        <div className="text-pixel text-3xl mb-4">{petMood}</div>

                        {isPlaying && (
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="text-pixel text-[#00ff88] text-xl mb-4"
                            >
                                CLICKS: {clickScore} 🎮
                            </motion.div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={feed}
                                className="px-5 py-2 bg-[#00ff88] text-[#0a0a0f] rounded text-retro text-lg hover:bg-[#00ff99] transition hover:-translate-y-0.5"
                            >
                                🍎 FEED
                            </button>
                            {!isPlaying ? (
                                <button
                                    onClick={startGame}
                                    className="px-5 py-2 border-2 border-[#6c63ff] text-[#6c63ff] rounded text-retro text-lg hover:bg-[#6c63ff22] transition hover:-translate-y-0.5"
                                >
                                    🎮 PLAY
                                </button>
                            ) : (
                                <div className="px-5 py-2 bg-[#ffd700] text-[#0a0a0f] rounded text-retro text-lg animate-pulse">
                                    CLICK ME!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                        <h3 className="text-pixel text-sm text-[#e8e8f0] mb-4">📊 PET STATS</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'XP', value: stats.xp, max: nextStage?.xpRequired ?? stats.xp, color: '#6c63ff', icon: '⚡' },
                                { label: 'Hunger', value: stats.hunger, max: 100, color: '#00ff88', icon: '🍎' },
                                { label: 'Happiness', value: stats.happiness, max: 100, color: '#ffd700', icon: '😊' },
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
                                {xpToNext} XP until evolution to {nextStage.stage} {nextStage.emoji}
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
                                        <span className="text-2xl">{stage.emoji}</span>
                                        <div className="flex-1">
                                            <div className={`text-retro ${isCurrent ? 'text-[#00ff88]' : isUnlocked ? 'text-[#e8e8f0]' : 'text-[#8888aa]'}`}>
                                                {stage.stage}
                                            </div>
                                            <div className="text-mono text-[#8888aa] text-xs">{stage.xpRequired} XP</div>
                                        </div>
                                        {isCurrent && <span className="text-mono text-[#00ff88] text-xs">NOW</span>}
                                        {isUnlocked && !isCurrent && <span className="text-mono text-[#6c63ff] text-xs">✅</span>}
                                        {!isUnlocked && <span className="text-mono text-[#8888aa] text-xs">🔒</span>}
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
                            <div>📅 Adopted: Day 1</div>
                            <div>⚡ Total XP earned: {stats.xp}</div>
                            <div>🍎 Times fed: 3</div>
                            <div>🎮 Games played: 1</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
