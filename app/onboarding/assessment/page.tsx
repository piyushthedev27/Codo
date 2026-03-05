"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, Leaf, Trees, Mountain } from 'lucide-react';

export default function OnboardingAssessmentPage() {
    const router = useRouter();
    const levels = [
        { id: 'beginner', label: 'COMPLETE BEGINNER', desc: 'Never written a line of code', icon: <Sprout size={40} className="text-[#00ff88]" /> },
        { id: 'basics', label: 'KNOW THE BASICS', desc: 'Variables, loops, functions', icon: <Leaf size={40} className="text-[#6c63ff]" /> },
        { id: 'intermediate', label: 'INTERMEDIATE', desc: 'OOP, async, frameworks', icon: <Trees size={40} className="text-[#ffd700]" /> },
        { id: 'advanced', label: 'ADVANCED', desc: 'Algorithms, system design', icon: <Mountain size={40} className="text-[#ff4d6d]" /> },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] pixel-grid-bg flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <div className="text-pixel text-[#6c63ff] text-2xl mb-4">CODO</div>
                    <h1 className="text-pixel text-xl text-[#e8e8f0] mb-3">WHERE ARE YOU IN YOUR CODING JOURNEY?</h1>
                    <p className="text-mono text-[#8888aa]">We&apos;ll personalize your path based on your answer.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {levels.map((level) => (
                        <button
                            key={level.id}
                            onClick={() => router.push('/onboarding/path')}
                            className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 text-left hover:border-[#6c63ff] hover:glow-purple transition group"
                        >
                            <div className="mb-3">{level.icon}</div>
                            <div className="text-pixel text-xs text-[#6c63ff] mb-2">{level.label}</div>
                            <div className="text-mono text-[#8888aa] text-sm">{level.desc}</div>
                        </button>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/onboarding/path" className="text-mono text-[#8888aa] hover:text-[#6c63ff] transition text-sm">
                        Skip this step →
                    </Link>
                </div>
            </div>
        </div>
    );
}
