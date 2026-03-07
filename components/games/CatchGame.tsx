'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';

interface CatchGameProps {
    onGameOver: (score: number) => void;
}

export default function CatchGame({ onGameOver }: CatchGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Canvas dimensions
    const WIDTH = 400;
    const HEIGHT = 400;

    // Game Entities
    const basketRef = useRef({ x: WIDTH / 2 - 30, y: HEIGHT - 30, width: 60, height: 15, speed: 6, dx: 0 });
    const appleRef = useRef({ x: Math.random() * (WIDTH - 20) + 10, y: -20, radius: 10, speed: 3 });
    const lastRenderTimeRef = useRef<number>(0);

    const resetGame = useCallback(() => {
        basketRef.current = { ...basketRef.current, x: WIDTH / 2 - 30, dx: 0 };
        appleRef.current = { x: Math.random() * (WIDTH - 20) + 10, y: -20, radius: 10, speed: 3 };
        setScore(0);
        setGameOver(false);
        lastRenderTimeRef.current = performance.now();
    }, []);

    // Handle Keyboard input for Basket
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
                basketRef.current.dx = -basketRef.current.speed;
                e.preventDefault();
            } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
                basketRef.current.dx = basketRef.current.speed;
                e.preventDefault();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (['ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D'].includes(e.key)) {
                basketRef.current.dx = 0;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Game Loop
    useEffect(() => {
        if (gameOver) return;

        let animationFrameId: number;

        const main = (currentTime: number) => {
            animationFrameId = requestAnimationFrame(main);
            // Cap at ~60fps
            if (currentTime - lastRenderTimeRef.current < 16) return;

            lastRenderTimeRef.current = currentTime;
            update();
            draw();
        };

        const update = () => {
            const basket = basketRef.current;
            const apple = appleRef.current;

            // Move Basket
            basket.x += basket.dx;
            // Wall Collision for Basket
            if (basket.x < 0) basket.x = 0;
            if (basket.x + basket.width > WIDTH) basket.x = WIDTH - basket.width;

            // Move Apple
            apple.y += apple.speed;

            // Hit Bottom (Missed)
            if (apple.y - apple.radius > HEIGHT) {
                handleGameOver();
                return;
            }

            // Hit Basket (Caught)
            if (
                apple.y + apple.radius >= basket.y &&
                apple.y - apple.radius <= basket.y + basket.height &&
                apple.x + apple.radius >= basket.x &&
                apple.x - apple.radius <= basket.x + basket.width
            ) {
                // Caught!
                setScore(s => s + 10);
                // Reset Apple and speed up slightly
                apple.y = -20;
                apple.x = Math.random() * (WIDTH - 20) + 10;
                apple.speed += 0.2; // increase difficulty steadily
            }
        };

        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.fillStyle = '#12121a';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            // Draw Stars background
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 5; i++) {
                // Just random twinkling effect
                const rx = Math.random() * WIDTH;
                const ry = Math.random() * HEIGHT;
                ctx.fillRect(rx, ry, 1, 1);
            }

            // Draw Basket
            const basket = basketRef.current;
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
            // Basket styling (rim)
            ctx.fillStyle = '#00cc6a';
            ctx.fillRect(basket.x, basket.y, basket.width, 4);

            // Draw Apple
            const apple = appleRef.current;
            ctx.fillStyle = '#ff4d6d';
            ctx.beginPath();
            ctx.arc(apple.x, apple.y, apple.radius, 0, Math.PI * 2);
            ctx.fill();

            // Apple stem
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(apple.x - 1, apple.y - apple.radius - 4, 2, 4);
            // Apple leaf
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(apple.x + 3, apple.y - apple.radius - 2, 3, 0, Math.PI);
            ctx.fill();
        };

        animationFrameId = requestAnimationFrame(main);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameOver]);

    const handleGameOver = () => {
        setGameOver(true);
        setTimeout(() => {
            onGameOver(score);
        }, 500);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
                <div className="text-pixel text-[#00ff88] text-xl flex items-center gap-2">
                    <Trophy size={18} /> SCORE: {score}
                </div>
            </div>
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    className="bg-[#12121a] border-4 border-[#2a2a3e] rounded-lg shadow-lg"
                />
                {gameOver && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                        <h2 className="text-pixel text-4xl text-[#ff4d6d] mb-4 glow-red">GAME OVER</h2>
                        <div className="text-retro text-xl text-white mb-6">Final Score: {score}</div>
                        <button
                            onClick={resetGame}
                            className="bg-[#6c63ff] text-white px-6 py-3 rounded text-retro hover:bg-[#7c73ff] flex items-center gap-2 transition"
                        >
                            <RefreshCw size={18} /> PLAY AGAIN
                        </button>
                    </div>
                )}
            </div>
            <div className="text-mono text-[#8888aa] text-xs mt-4 uppercase">
                Use A/D or Left/Right Arrows to move basket
            </div>
        </div>
    );
}
