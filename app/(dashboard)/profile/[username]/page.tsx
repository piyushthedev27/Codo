'use client';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage({ params }: { params: { username: string } }) {
    const { user } = useAuth();
    const isOwn = user?.displayName === params.username || params.username === 'me';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-6 mb-6">
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-[#6c63ff] rounded border-4 border-[#6c63ff] flex items-center justify-center text-white text-4xl font-bold glow-purple">
                        {params.username[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-pixel text-xl text-[#e8e8f0]">{isOwn ? (user?.displayName ?? params.username) : params.username}</h1>
                            <span className="px-2 py-0.5 bg-[#6c63ff22] border border-[#6c63ff] text-[#6c63ff] text-retro text-sm rounded">LVL 1</span>
                        </div>
                        <p className="text-mono text-[#8888aa] mb-4">New coder on the quest. Just getting started! 🚀</p>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Challenges', value: '0' },
                                { label: 'XP', value: '0' },
                                { label: 'Streak', value: '0d' },
                                { label: 'Guild', value: 'None' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-pixel text-lg text-[#6c63ff]">{stat.value}</div>
                                    <div className="text-mono text-[#8888aa] text-xs">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {isOwn && (
                        <button className="px-4 py-2 border-2 border-[#6c63ff] text-[#6c63ff] rounded text-retro hover:bg-[#6c63ff22] transition">
                            EDIT PROFILE
                        </button>
                    )}
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                <h2 className="text-pixel text-sm mb-4">ACHIEVEMENTS</h2>
                <div className="text-center py-8 text-mono text-[#8888aa]">
                    Complete your first challenge to earn achievements! 🏆
                </div>
            </div>
        </div>
    );
}
