'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, Map, MapIcon, Swords, Trophy } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] pixel-grid-bg flex items-center justify-center px-6">
            <div className="text-center max-w-xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                >
                    {/* Pixel Art 404 */}
                    <div className="text-pixel text-[120px] leading-none text-[#6c63ff] glow-purple mb-2 select-none">
                        404
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-3">PAGE NOT FOUND</h1>
                    <p className="text-mono text-[#8888aa] mb-2">
                        Looks like you wandered off the map, hero.
                    </p>
                    <p className="text-mono text-[#8888aa] mb-8 text-sm flex items-center justify-center gap-1">
                        This zone doesn&apos;t exist — or maybe it&apos;s locked at a higher level. <MapIcon size={14} />
                    </p>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto">
                        {[
                            { href: '/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
                            { href: '/map', icon: <Map size={18} />, label: 'World Map' },
                            { href: '/duel', icon: <Swords size={18} />, label: 'Code Duel' },
                            { href: '/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 justify-center px-4 py-3 bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded text-retro text-[#8888aa] hover:border-[#6c63ff] hover:text-[#6c63ff] transition"
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <Link
                        href="/dashboard"
                        className="inline-block px-8 py-3 bg-[#6c63ff] text-white rounded text-retro text-xl hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1"
                    >
                        RETURN HOME ▶
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
