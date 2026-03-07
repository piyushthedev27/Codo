'use client';

import { useState, useEffect } from 'react';
import { X, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SnakeGame from './SnakeGame';
import TetrisGame from './TetrisGame';
import CatchGame from './CatchGame';

type GameType = 'snake' | 'tetris' | 'catch';

interface RandomGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGameComplete: (score: number) => void;
}

export default function RandomGameModal({ isOpen, onClose, onGameComplete }: RandomGameModalProps) {
    const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

    useEffect(() => {
        if (isOpen) {
            const games: GameType[] = ['snake', 'tetris', 'catch'];
            const random = games[Math.floor(Math.random() * games.length)];
            setSelectedGame(random);
        } else {
            setSelectedGame(null);
        }
    }, [isOpen]);

    const handleGameOver = (score: number) => {
        onGameComplete(score);
    };

    let GameComponent = null;
    let title = '';

    if (selectedGame === 'snake') {
        GameComponent = <SnakeGame onGameOver={handleGameOver} />;
        title = 'Neon Snake';
    } else if (selectedGame === 'tetris') {
        GameComponent = <TetrisGame onGameOver={handleGameOver} />;
        title = 'Retro Blocks';
    } else if (selectedGame === 'catch') {
        GameComponent = <CatchGame onGameOver={handleGameOver} />;
        title = 'Apple Catch';
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-xl shadow-[0_0_30px_rgba(108,99,255,0.2)] p-6 relative flex flex-col items-center max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-[#8888aa] hover:text-white hover:rotate-90 transition-all duration-300"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6 w-full border-b border-[#2a2a3e] pb-4 pr-8 pl-8">
                            <h2 className="text-pixel text-2xl text-[#e8e8f0] flex items-center justify-center gap-3">
                                <Gamepad2 className="text-[#6c63ff]" size={28} />
                                {title}
                            </h2>
                            <p className="text-mono text-[#8888aa] text-xs mt-2 uppercase tracking-wider">
                                Random Mini-game Selected
                            </p>
                        </div>

                        <div className="flex justify-center flex-col items-center w-full">
                            {GameComponent}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
