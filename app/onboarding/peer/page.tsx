"use client";

import { useRouter } from 'next/navigation';
import { Palette, Zap, GitBranch } from 'lucide-react';

export default function OnboardingPeerPage() {
    const router = useRouter();
    const peers = [
        { name: 'SARAH', color: '#b060ff', specialty: 'FRONTEND SPECIALIST', icon: <Palette size={40} className="text-[#1a1a2e]" />, quote: "Let's build beautiful things together!" },
        { name: 'ALEX', color: '#00d4ff', specialty: 'ALGORITHMS EXPERT', icon: <Zap size={40} className="text-[#1a1a2e]" />, quote: "Challenge accepted. Let's optimize!" },
        { name: 'JORDAN', color: '#00ff88', specialty: 'SYSTEM DESIGN', icon: <GitBranch size={40} className="text-[#1a1a2e]" />, quote: "Let's understand the fundamentals first." },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] pixel-grid-bg flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-10">
                    <div className="text-pixel text-[#6c63ff] text-2xl mb-4">CODO</div>
                    <h1 className="text-pixel text-xl text-[#e8e8f0] mb-3">MEET YOUR SQUAD</h1>
                    <p className="text-mono text-[#8888aa]">Choose your primary AI learning partner. You can always switch later.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {peers.map((peer) => (
                        <button
                            key={peer.name}
                            onClick={() => router.push('/dashboard')}
                            className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 text-center hover:border-[#6c63ff] hover:glow-purple transition group"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: peer.color }}>
                                {peer.icon}
                            </div>
                            <div className="text-pixel text-sm mb-1" style={{ color: peer.color }}>{peer.name}</div>
                            <div className="text-retro text-[#8888aa] text-xs mb-3">{peer.specialty}</div>
                            <div className="text-mono text-[#e8e8f0] text-xs italic bg-[#12121a] border border-[#2a2a3e] rounded p-2">
                                &quot;{peer.quote}&quot;
                            </div>
                            <button
                                className="mt-4 w-full py-2 text-retro text-sm rounded transition group-hover:bg-[#6c63ff] group-hover:text-white border-2"
                                style={{ borderColor: peer.color, color: peer.color }}
                            >
                                CHOOSE {peer.name} ▶
                            </button>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
