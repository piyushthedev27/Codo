'use client';
import { useState } from 'react';
import { Play } from 'lucide-react';

export default function CinemaPage() {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const featured = [
        { title: 'Closures & Scope Explained', duration: '8 min', views: '2.3k', xp: '+150 XP', tags: ['JavaScript', 'Intermediate'] },
        { title: 'How Async/Await Works', duration: '12 min', views: '4.1k', xp: '+200 XP', tags: ['JavaScript', 'Advanced'] },
        { title: 'Python List Comprehensions', duration: '6 min', views: '1.8k', xp: '+100 XP', tags: ['Python', 'Beginner'] },
        { title: 'React Hooks Deep Dive', duration: '15 min', views: '5.2k', xp: '+250 XP', tags: ['React', 'Advanced'] },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-pixel text-2xl text-[#6c63ff] mb-2">🎬 AI CODE CINEMA</h1>
                <p className="text-mono text-[#8888aa]">Type any coding topic — AI animates and narrates the code for you.</p>
            </div>

            {/* Generate Bar */}
            <div className="bg-[#1a1a2e] border-2 border-[#6c63ff] rounded p-4 mb-6 flex gap-3 glow-purple">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. 'How does recursion work?' or 'Python decorators'"
                    className="flex-1 bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && setIsGenerating(true)}
                />
                <button
                    onClick={() => setIsGenerating(!isGenerating)}
                    className="px-6 py-3 bg-[#6c63ff] text-white rounded text-retro text-lg hover:bg-[#7c73ff] transition"
                >
                    {isGenerating ? '⏳ GENERATING...' : '▶ GENERATE'}
                </button>
            </div>

            {/* Featured */}
            <div>
                <h2 className="text-pixel text-sm mb-4">FEATURED VIDEOS</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {featured.map((video, i) => (
                        <div key={i} className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded hover:border-[#6c63ff] transition group">
                            <div className="bg-[#0a0a0f] aspect-video flex items-center justify-center border-b-2 border-[#2a2a3e]">
                                <button className="w-16 h-16 bg-[#6c63ff] rounded-full flex items-center justify-center group-hover:scale-110 transition glow-purple">
                                    <Play className="text-white ml-1" size={24} />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {video.tags.map((tag, j) => (
                                        <span key={j} className="px-2 py-0.5 bg-[#2a2a3e] text-mono text-[#6c63ff] text-xs rounded">{tag}</span>
                                    ))}
                                </div>
                                <h3 className="text-retro text-[#e8e8f0] text-lg mb-2">{video.title}</h3>
                                <div className="flex items-center justify-between text-mono text-[#8888aa] text-xs">
                                    <span>⏱ {video.duration} · 👁 {video.views} views</span>
                                    <span className="text-[#ffd700]">{video.xp}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
