'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';

interface SnakeGameProps {
    onGameOver: (score: number) => void;
}

const GRID_SIZE = 20;

type Point = { x: number; y: number };

export default function SnakeGame({ onGameOver }: SnakeGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Game state refs (to avoid stale closures in requestAnimationFrame)
    const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
    const directionRef = useRef<Point>({ x: 1, y: 0 });
    const appleRef = useRef<Point>({ x: 15, y: 10 });
    const lastRenderTimeRef = useRef<number>(0);
    // Control speed. Higher is slower.
    const SNAKE_SPEED = 10;

    const resetGame = useCallback(() => {
        snakeRef.current = [{ x: 10, y: 10 }];
        directionRef.current = { x: 1, y: 0 };
        appleRef.current = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
        setScore(0);
        setGameOver(false);
        lastRenderTimeRef.current = performance.now();
    }, []);

    // Handle Keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'w', 'W'].includes(e.key) && directionRef.current.y === 0) {
                directionRef.current = { x: 0, y: -1 };
                e.preventDefault();
            } else if (['ArrowDown', 's', 'S'].includes(e.key) && directionRef.current.y === 0) {
                directionRef.current = { x: 0, y: 1 };
                e.preventDefault();
            } else if (['ArrowLeft', 'a', 'A'].includes(e.key) && directionRef.current.x === 0) {
                directionRef.current = { x: -1, y: 0 };
                e.preventDefault();
            } else if (['ArrowRight', 'd', 'D'].includes(e.key) && directionRef.current.x === 0) {
                directionRef.current = { x: 1, y: 0 };
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Game Loop
    useEffect(() => {
        if (gameOver) return;

        let animationFrameId: number;

        const main = (currentTime: number) => {
            animationFrameId = requestAnimationFrame(main);
            const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
            if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;

            lastRenderTimeRef.current = currentTime;
            update();
            draw();
        };

        const update = () => {
            const snake = [...snakeRef.current];
            const head = { ...snake[0] };
            head.x += directionRef.current.x;
            head.y += directionRef.current.y;

            // Check walls
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                handleGameOver();
                return;
            }

            // Check self collision
            for (let i = 0; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    handleGameOver();
                    return;
                }
            }

            snake.unshift(head);

            // Check apple
            if (head.x === appleRef.current.x && head.y === appleRef.current.y) {
                setScore(s => s + 10);
                // Move apple
                let newApple: Point;
                let onSnake = true;
                while (onSnake) {
                    newApple = {
                        x: Math.floor(Math.random() * GRID_SIZE),
                        y: Math.floor(Math.random() * GRID_SIZE),
                    };
                    onSnake = snake.some(segment => segment.x === newApple.x && segment.y === newApple.y);
                }
                appleRef.current = newApple!;
            } else {
                snake.pop(); // Remove tail
            }

            snakeRef.current = snake;
        };

        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.fillStyle = '#12121a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid lines
            ctx.strokeStyle = '#2a2a3e';
            ctx.lineWidth = 1;
            const cellSize = canvas.width / GRID_SIZE;
            for (let i = 0; i <= GRID_SIZE; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(canvas.width, i * cellSize);
                ctx.stroke();
            }

            // Draw apple
            ctx.fillStyle = '#ff4d6d';
            ctx.beginPath();
            const ax = appleRef.current.x * cellSize + cellSize / 2;
            const ay = appleRef.current.y * cellSize + cellSize / 2;
            ctx.arc(ax, ay, cellSize / 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Draw snake
            const snake = snakeRef.current;
            snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? '#00ff88' : '#00d4ff';
                ctx.fillRect(
                    segment.x * cellSize + 1,
                    segment.y * cellSize + 1,
                    cellSize - 2,
                    cellSize - 2
                );
            });
        };

        animationFrameId = requestAnimationFrame(main);
        return () => cancelAnimationFrame(animationFrameId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameOver]); // Depend on gameOver to stop the loop

    const handleGameOver = () => {
        setGameOver(true);
        // Delay slightly so the user sees the collision
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
                    width={400}
                    height={400}
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
                Use W A S D or Arrow Keys to move
            </div>
        </div>
    );
}
