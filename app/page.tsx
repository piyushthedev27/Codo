'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function LandingPage() {
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const numbers = entry.target.querySelectorAll('.stat-number');
                        numbers.forEach((num) => {
                            const target = parseInt(num.getAttribute('data-target') || '0');
                            let current = 0;
                            const increment = target / 50;
                            const timer = setInterval(() => {
                                current += increment;
                                if (current >= target) {
                                    num.textContent = target.toLocaleString();
                                    clearInterval(timer);
                                } else {
                                    num.textContent = Math.floor(current).toLocaleString();
                                }
                            }, 40);
                        });
                    }
                });
            },
            { threshold: 0.5 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8f0]">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#12121a] border-b border-[#2a2a3e]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-pixel text-2xl text-[#6c63ff] glow-purple">CODO</h1>
                    <div className="hidden md:flex items-center gap-8 text-retro text-lg">
                        <a href="#features" className="text-[#8888aa] hover:text-[#6c63ff] transition">Courses</a>
                        <a href="#features" className="text-[#8888aa] hover:text-[#6c63ff] transition">Features</a>
                        <a href="#leaderboard" className="text-[#8888aa] hover:text-[#6c63ff] transition">Leaderboard</a>
                        <a href="#community" className="text-[#8888aa] hover:text-[#6c63ff] transition">Community</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="px-6 py-2 border-2 border-[#6c63ff] text-[#6c63ff] rounded text-retro text-lg hover:bg-[#6c63ff22] transition">
                            LOGIN
                        </Link>
                        <Link href="/sign-up" className="px-6 py-2 bg-[#6c63ff] text-white rounded text-retro text-lg hover:bg-[#7c73ff] glow-purple transition">
                            START FREE ▶
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pixel-grid-bg scanline-effect pt-20">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    {['</>', '{}', '()', '[]', ';', '=', '=>', 'fn'].map((code, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-[#6c63ff] text-pixel text-2xl"
                            style={{ left: `${(i * 13 + 5) % 100}%`, top: `${(i * 17 + 10) % 90}%` }}
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                        >
                            {code}
                        </motion.div>
                    ))}
                </div>

                <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8 items-center relative z-10">
                    <div>
                        <div className="text-retro text-[#00d4ff] text-xl mb-4">LEVEL UP YOUR SKILLS</div>
                        <h1 className="text-pixel text-3xl md:text-4xl mb-6 leading-tight">NEVER LEARN ALONE</h1>
                        <p className="text-mono text-[#8888aa] text-base mb-8 leading-relaxed">
                            Your AI study partners — Sarah, Alex, and Jordan — are ready to code, debug, and learn with you. 24 hours a day, 7 days a week.
                        </p>
                        <div className="flex flex-wrap gap-4 mb-8">
                            <Link href="/sign-up" className="px-6 py-3 bg-[#6c63ff] text-white rounded text-retro text-lg hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1">
                                ▶ START YOUR QUEST
                            </Link>
                            <button className="px-6 py-3 border-2 border-[#6c63ff] text-[#6c63ff] rounded text-retro text-lg hover:bg-[#6c63ff22] transition">
                                ▷ WATCH DEMO
                            </button>
                        </div>
                        <div ref={statsRef} className="grid grid-cols-3 gap-4">
                            {[
                                { target: '12847', label: 'Learners' },
                                { target: '1200000', label: 'Lessons' },
                                { target: '48000', label: 'Achievements' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-retro text-[#ffd700] text-2xl stat-number" data-target={stat.target}>0</div>
                                    <div className="text-mono text-[#8888aa] text-xs">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 animate-float">
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { name: 'SARAH', color: '#b060ff', msg: "Let's build something!" },
                                    { name: 'ALEX', color: '#00d4ff', msg: "I found a bug!" },
                                    { name: 'JORDAN', color: '#00ff88', msg: "Here's a better approach..." },
                                ].map((peer, i) => (
                                    <div key={i} className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-2 rounded" style={{ background: peer.color }} />
                                        <div className="text-pixel text-xs mb-2" style={{ color: peer.color }}>{peer.name}</div>
                                        <div className="bg-[#12121a] border-2 border-[#2a2a3e] rounded p-2 text-mono text-[#8888aa] text-xs">
                                            &quot;{peer.msg}&quot;
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scrolling Ticker */}
            <div className="bg-[#6c63ff] py-3 overflow-hidden">
                <div className="whitespace-nowrap animate-marquee text-retro text-white text-xl">
                    PYTHON · JAVASCRIPT · REACT · HTML/CSS · NODE.JS · ALGORITHMS · SQL · TYPESCRIPT · PYTHON · JAVASCRIPT · REACT · HTML/CSS
                </div>
            </div>

            {/* Problem Section */}
            <section id="problem" className="py-20 bg-[#12121a]">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-pixel text-3xl text-center mb-16">THE OLD WAY IS BROKEN</h2>
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-[#1a1a2e] border-2 border-[#ff4d6d33] rounded p-8">
                            <h3 className="text-pixel text-[#ff4d6d] text-xl mb-6">❌ TRADITIONAL LEARNING</h3>
                            <ul className="space-y-4">
                                {['Watch videos alone in silence', 'Stuck on bugs for hours with no help', '85% of students quit before finishing', 'Generic content ignores your weak spots', 'Human tutors cost ₹2,000/hour'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-mono text-[#8888aa]">
                                        <XCircle className="text-[#ff4d6d] mt-1 flex-shrink-0" size={20} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[#1a1a2e] border-2 border-[#00ff88] rounded p-8 glow-green">
                            <h3 className="text-pixel text-[#00ff88] text-xl mb-6">✅ THE CODO WAY</h3>
                            <ul className="space-y-4">
                                {['Learn WITH AI peers side-by-side', 'Instant help from Sarah, Alex, or Jordan', '80% projected completion rate', 'Adapts to YOUR specific mistakes', 'Available 24/7 — free'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-mono text-[#e8e8f0]">
                                        <CheckCircle className="text-[#00ff88] mt-1 flex-shrink-0" size={20} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-[#0a0a0f] pixel-grid-bg">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-pixel text-3xl text-center mb-16">YOUR ARSENAL</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: '🎬', title: 'AI CODE CINEMA', desc: 'Type any topic. Watch AI animate the code with voiceover. Pause, rewind, speed up.' },
                            { icon: '🗺️', title: 'WORLD MAP', desc: 'Topics are zones on a pixel art adventure map. Unlock new regions as your level grows.' },
                            { icon: '⚔️', title: 'CODE DUELS', desc: 'Race against AI peers in timed coding challenges. Live leaderboard. Real XP rewards.' },
                            { icon: '🧠', title: 'KNOWLEDGE GRAPH', desc: 'Visual skill tree shows what you know, what\'s next, and where your gaps are.' },
                            { icon: '🐾', title: 'PIXEL PET', desc: 'Your companion grows as you learn. Stay consistent and watch it evolve.' },
                            { icon: '🔍', title: 'MISTAKE ANALYZER', desc: 'AI reads your errors and generates targeted micro-lessons. Stop repeating mistakes.' },
                        ].map((feature, i) => (
                            <div key={i} className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 hover:border-[#6c63ff] hover:glow-purple hover:-translate-y-1 transition cursor-pointer">
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-retro text-[#6c63ff] text-xl mb-3">{feature.title}</h3>
                                <p className="text-mono text-[#8888aa] text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-[#12121a] text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-pixel text-4xl mb-4">READY TO LEVEL UP?</h2>
                    <p className="text-retro text-[#8888aa] text-xl mb-8">Join 12,847 developers already on their quest</p>
                    <Link href="/sign-up" className="inline-block px-12 py-5 bg-[#6c63ff] text-white rounded text-retro text-2xl hover:bg-[#7c73ff] glow-purple transition hover:-translate-y-1">
                        ▶▶ CREATE FREE ACCOUNT — NO CREDIT CARD
                    </Link>
                    <p className="text-mono text-[#8888aa] text-sm mt-4">Free tier includes 20 lessons + all 3 AI peers</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0a0a0f] border-t border-[#2a2a3e] py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {[
                            { title: 'Product', links: ['Features', 'Pricing', 'Roadmap'] },
                            { title: 'Learning', links: ['Courses', 'Paths', 'Challenges'] },
                            { title: 'Community', links: ['Discord', 'Forum', 'Guilds'] },
                            { title: 'Company', links: ['About', 'Blog', 'Careers'] },
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="text-retro text-[#6c63ff] text-lg mb-4">{col.title}</h4>
                                <ul className="space-y-2 text-mono text-[#8888aa]">
                                    {col.links.map((link, j) => (
                                        <li key={j}><a href="#" className="hover:text-[#6c63ff] transition">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[#2a2a3e] pt-8 text-center text-mono text-[#8888aa] text-sm">
                        © 2026 Codo. Built with ❤️ for learners worldwide.
                    </div>
                </div>
            </footer>
        </div>
    );
}
