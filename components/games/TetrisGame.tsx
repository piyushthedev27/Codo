'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';

interface TetrisGameProps {
    onGameOver: (score: number) => void;
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

// Colors for tetrominoes
const COLORS = [
    '#12121a', // 0: empty
    '#00d4ff', // 1: I - Cyan
    '#6c63ff', // 2: J - Blue (using purple for brand)
    '#ff8800', // 3: L - Orange
    '#ffd700', // 4: O - Yellow
    '#00ff88', // 5: S - Green
    '#b060ff', // 6: T - Purple 
    '#ff4d6d'  // 7: Z - Red
];

const SHAPES = [
    [], // empty
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
];

function createEmptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

export default function TetrisGame({ onGameOver }: TetrisGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const gridRef = useRef(createEmptyGrid());

    // Active piece state
    const pieceRef = useRef({
        matrix: SHAPES[1],
        x: 0,
        y: 0,
        type: 1
    });

    const dropCounterRef = useRef(0);
    const dropIntervalRef = useRef(1000);
    const lastTimeRef = useRef(0);

    const spawnPiece = useCallback(() => {
        const typeId = Math.floor(Math.random() * 7) + 1;
        const matrix = SHAPES[typeId];
        pieceRef.current = {
            matrix,
            x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2),
            y: 0,
            type: typeId
        };

        // Immediately check if spawn causes collision => Game Over
        if (collide(gridRef.current, pieceRef.current)) {
            handleGameOver();
        }
    }, []);

    const resetGame = useCallback(() => {
        gridRef.current = createEmptyGrid();
        setScore(0);
        setGameOver(false);
        dropIntervalRef.current = 1000;
        spawnPiece();
        lastTimeRef.current = performance.now();
    }, [spawnPiece]);

    useEffect(() => {
        spawnPiece();
    }, [spawnPiece]);

    // Collision detection
    const collide = (grid: number[][], player: { matrix: number[][], x: number, y: number }) => {
        const [m, o] = [player.matrix, { x: player.x, y: player.y }];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const merge = (grid: number[][], player: { matrix: number[][], x: number, y: number }) => {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    grid[y + player.y][x + player.x] = value;
                }
            });
        });
    };

    const playerDrop = () => {
        pieceRef.current.y++;
        if (collide(gridRef.current, pieceRef.current)) {
            pieceRef.current.y--; // undo
            merge(gridRef.current, pieceRef.current);
            arenaSweep();
            spawnPiece();
        }
        dropCounterRef.current = 0;
    };

    const playerMove = (offset: number) => {
        pieceRef.current.x += offset;
        if (collide(gridRef.current, pieceRef.current)) {
            pieceRef.current.x -= offset;
        }
    };

    const playerRotate = () => {
        const pos = pieceRef.current.x;
        let offset = 1;
        rotate(pieceRef.current.matrix);
        while (collide(gridRef.current, pieceRef.current)) {
            pieceRef.current.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > pieceRef.current.matrix[0].length) {
                rotate(pieceRef.current.matrix, -1);
                pieceRef.current.x = pos;
                return;
            }
        }
    };

    const rotate = (matrix: number[][], dir = 1) => {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    };

    const arenaSweep = () => {
        let rowCount = 0;
        outer: for (let y = gridRef.current.length - 1; y > 0; --y) {
            for (let x = 0; x < gridRef.current[y].length; ++x) {
                if (gridRef.current[y][x] === 0) {
                    continue outer;
                }
            }
            const row = gridRef.current.splice(y, 1)[0].fill(0);
            gridRef.current.unshift(row);
            ++y;
            rowCount++;
        }
        if (rowCount > 0) {
            const points = rowCount * 10 * rowCount;
            setScore(prev => prev + points);
            dropIntervalRef.current = Math.max(200, dropIntervalRef.current - 20); // speed up
        }
    };

    // Input listening
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return;
            if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
                playerMove(-1);
                e.preventDefault();
            } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
                playerMove(1);
                e.preventDefault();
            } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
                playerDrop();
                e.preventDefault();
            } else if (['ArrowUp', 'w', 'W'].includes(e.key)) {
                playerRotate();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver]);

    // Game Loop
    useEffect(() => {
        if (gameOver) return;

        let animationFrameId: number;

        const main = (time = 0) => {
            animationFrameId = requestAnimationFrame(main);
            const deltaTime = time - lastTimeRef.current;
            lastTimeRef.current = time;

            dropCounterRef.current += deltaTime;
            if (dropCounterRef.current > dropIntervalRef.current) {
                playerDrop();
            }

            draw();
        };

        const drawMatrix = (matrix: number[][], offset: { x: number, y: number }, ctx: CanvasRenderingContext2D) => {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        ctx.fillStyle = COLORS[value];
                        ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                        ctx.strokeStyle = '#12121a';
                        ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                });
            });
        };

        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Background
            ctx.fillStyle = '#12121a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid lines
            ctx.strokeStyle = '#2a2a3e';
            ctx.lineWidth = 1;
            for (let c = 0; c <= COLS; c++) {
                ctx.beginPath();
                ctx.moveTo(c * BLOCK_SIZE, 0);
                ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
                ctx.stroke();
            }
            for (let r = 0; r <= ROWS; r++) {
                ctx.beginPath();
                ctx.moveTo(0, r * BLOCK_SIZE);
                ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
                ctx.stroke();
            }

            // Draw fallen pieces
            drawMatrix(gridRef.current, { x: 0, y: 0 }, ctx);

            // Draw active falling piece
            drawMatrix(pieceRef.current.matrix, { x: pieceRef.current.x, y: pieceRef.current.y }, ctx);
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
                    width={COLS * BLOCK_SIZE}
                    height={ROWS * BLOCK_SIZE}
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
                Arrow Keys to move & rotate
            </div>
        </div>
    );
}
