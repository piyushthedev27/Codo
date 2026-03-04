'use client';
import { useRouter } from 'next/navigation';

export default function OnboardingPathPage() {
    const router = useRouter();
    const paths = [
        { id: 'web', label: 'WEB DEVELOPER', desc: 'HTML, CSS, JS, React', emoji: '🌐', color: '#00d4ff' },
        { id: 'backend', label: 'BACKEND ENGINEER', desc: 'Python, Node, SQL, APIs', emoji: '🖥️', color: '#6c63ff' },
        { id: 'dsa', label: 'ALGORITHM MASTER', desc: 'DSA, LeetCode prep, competitive', emoji: '🧠', color: '#ffd700' },
        { id: 'fullstack', label: 'FULL-STACK', desc: 'Everything — frontend + backend', emoji: '⚡', color: '#00ff88' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] pixel-grid-bg flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <div className="text-pixel text-[#6c63ff] text-2xl mb-4">CODO</div>
                    <h1 className="text-pixel text-xl text-[#e8e8f0] mb-3">CHOOSE YOUR PATH</h1>
                    <p className="text-mono text-[#8888aa]">What do you want to master first?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {paths.map((path) => (
                        <button
                            key={path.id}
                            onClick={() => router.push('/onboarding/peer')}
                            className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 text-left hover:border-[#6c63ff] hover:glow-purple transition"
                        >
                            <div className="text-4xl mb-3">{path.emoji}</div>
                            <div className="text-pixel text-xs mb-2" style={{ color: path.color }}>{path.label}</div>
                            <div className="text-mono text-[#8888aa] text-sm">{path.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
