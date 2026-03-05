'use client';
import { useState } from 'react';
import { Castle, Shield } from 'lucide-react';

export default function GuildPage() {
    const [activeTab, setActiveTab] = useState<'browse' | 'mine'>('browse');
    const guilds = [
        { name: 'CODECRAFT', members: 5, rank: 3, total: '24.5k', isPublic: true, color: '#6c63ff' },
        { name: 'PYTHONISTAS', members: 8, rank: 1, total: '42.1k', isPublic: true, color: '#00d4ff' },
        { name: 'REACT REBELS', members: 3, rank: 7, total: '12.3k', isPublic: false, color: '#00ff88' },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-pixel text-2xl text-[#6c63ff] mb-1 flex items-center gap-2">
                        <Castle /> GUILDS
                    </h1>
                    <p className="text-mono text-[#8888aa]">Team up. Compete together.</p>
                </div>
                <button className="px-4 py-2 bg-[#6c63ff] text-white rounded text-retro hover:bg-[#7c73ff] glow-purple transition">
                    + CREATE GUILD
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                {(['browse', 'mine'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded text-retro text-lg transition ${activeTab === tab ? 'bg-[#6c63ff] text-white' : 'border border-[#2a2a3e] text-[#8888aa] hover:border-[#6c63ff]'}`}
                    >
                        {tab === 'browse' ? 'BROWSE GUILDS' : 'MY GUILD'}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {guilds.map((guild, i) => (
                    <div key={i} className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 hover:border-[#6c63ff] transition">
                        <div className="w-16 h-16 rounded mx-auto mb-3 flex items-center justify-center" style={{ background: `${guild.color}22`, border: `2px solid ${guild.color}`, color: guild.color }}>
                            <Shield size={32} />
                        </div>
                        <h3 className="text-pixel text-sm text-center mb-1" style={{ color: guild.color }}>{guild.name}</h3>
                        <div className="text-mono text-[#8888aa] text-xs text-center mb-3">
                            {guild.members} members · Rank #{guild.rank} · {guild.total} XP total
                        </div>
                        <div className="flex gap-2">
                            <span className={`px-2 py-0.5 rounded text-retro text-xs ${guild.isPublic ? 'bg-[#00ff8822] text-[#00ff88]' : 'bg-[#ff4d6d22] text-[#ff4d6d]'}`}>
                                {guild.isPublic ? 'PUBLIC' : 'PRIVATE'}
                            </span>
                        </div>
                        <button className="mt-3 w-full py-2 border-2 border-[#6c63ff] text-[#6c63ff] rounded text-retro hover:bg-[#6c63ff22] transition text-sm">
                            {guild.isPublic ? 'JOIN ▶' : 'REQUEST INVITE'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
