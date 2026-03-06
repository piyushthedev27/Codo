'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Loader2, Film } from 'lucide-react';
import Image from 'next/image';
import { auth } from '@/lib/firebase/client';
import InteractiveVideoPlayer, { CinemaState } from '@/components/cinema/InteractiveVideoPlayer';
import { featuredVideos, FeaturedVideo } from '@/lib/data/featured-cinema';
import { useRewards } from '@/hooks/useRewards';
import { useToast } from '@/components/ui/ToastProvider';

export default function CinemaPage() {
    return (
        <Suspense fallback={<div className="p-6 text-mono text-[#e8e8f0]">Loading Cinema Engine...</div>}>
            <CinemaContent />
        </Suspense>
    );
}

function CinemaContent() {
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic');
    const autoGenRef = useRef(false);

    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [sessionData, setSessionData] = useState<{ states: CinemaState[], sessionId: string, token: string } | null>(null);
    const { addCoins, addXp, addLesson } = useRewards();
    const { showSuccess } = useToast();

    const handleGenerate = async (overrideTopic?: string) => {
        const topicToUse = overrideTopic || topic;
        if (!topicToUse.trim()) return;
        setIsGenerating(true);
        setSessionData(null);
        if (overrideTopic) setTopic(overrideTopic);

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                alert("Please log in to generate Cinema lessions.");
                setIsGenerating(false);
                return;
            }

            const res = await fetch('/api/cinema/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic: topicToUse })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Generation failed');

            // The API returns { script: { states: [...] } }
            if (!data.script || !data.script.states) {
                throw new Error('Invalid cinema script format received');
            }

            setSessionData({
                states: data.script.states,
                sessionId: data.script.title || 'cinema-session',
                token
            });

            // Reward for generating an AI Cinema
            addXp(50);
            addCoins(20);
            addLesson();
            showSuccess('Video Synthesised! 🎬', '+50 XP · +20 Coins');
        } catch (error: unknown) {
            console.error('Failed to generate cinema:', error);
            const err = error as Error;
            alert(err.message || 'An unknown error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (initialTopic && !autoGenRef.current) {
            autoGenRef.current = true;
            handleGenerate(initialTopic);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialTopic]);

    const handlePlayFeatured = async (video: FeaturedVideo) => {
        if (isGenerating) return;
        setTopic(video.title);

        try {
            const token = await auth.currentUser?.getIdToken() || 'demo-token';
            // Instantly load the pre-generated script without hitting the AI API
            setSessionData({
                states: video.script.states,
                sessionId: video.title,
                token
            });

            // Reward for watching featured content
            const xpAmount = video.xp ? parseInt(video.xp.replace(/\D/g, ''), 10) : 20;
            addXp(xpAmount);
            addCoins(10);
            addLesson();
            showSuccess('Cinema Started! 🍿', `+${xpAmount} XP · +10 Coins`);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-3.5rem)] overflow-y-auto w-full">
            <div className="mb-6">
                <h1 className="text-pixel text-2xl text-[#e8e8f0] mb-2 flex items-center gap-2">
                    <Film className="text-[#6c63ff]" size={28} /> AI CODE CINEMA
                </h1>
                <p className="text-mono text-[#8888aa]">Type any coding topic — AI animates and narrates the code for you.</p>
            </div>

            {/* Generate Bar */}
            <div className="bg-[#1a1a2e] border-2 border-[#6c63ff] rounded p-4 mb-6 flex gap-3 glow-purple max-w-4xl mx-auto">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. 'How does recursion work?' or 'Python decorators'"
                    className="flex-1 bg-[#12121a] border-2 border-[#2a2a3e] rounded px-4 py-3 text-mono text-[#e8e8f0] focus:border-[#6c63ff] focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                    disabled={isGenerating}
                />
                <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || !topic.trim()}
                    className="px-6 py-3 bg-[#6c63ff] text-white rounded text-retro text-lg hover:bg-[#7c73ff] transition disabled:opacity-50 disabled:hover:bg-[#6c63ff] flex items-center gap-2"
                >
                    {isGenerating ? <><Loader2 className="animate-spin" size={20} /> GENERATING...</> : '▶ GENERATE'}
                </button>
            </div>

            {/* Player Area */}
            {sessionData && (
                <div className="mb-12">
                    <InteractiveVideoPlayer
                        states={sessionData.states}
                        token={sessionData.token}
                    />
                </div>
            )}

            {/* Featured */}
            {!sessionData && (
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-pixel text-sm mb-4">FEATURED VIDEOS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {featuredVideos.map((video, i) => (
                            <div
                                key={i}
                                onClick={() => handlePlayFeatured(video)}
                                className={`bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded hover:border-[#6c63ff] transition group cursor-pointer overflow-hidden ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="bg-[#0a0a0f] aspect-video flex items-center justify-center border-b-2 border-[#2a2a3e] relative overflow-hidden">
                                    <Image
                                        src={video.image}
                                        alt={video.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className="opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                                    />
                                    <button className="w-16 h-16 bg-[#6c63ff] rounded-full flex items-center justify-center group-hover:scale-110 transition glow-purple z-10 shadow-[0_0_30px_#6c63ff]">
                                        <Play className="text-white ml-1" size={24} />
                                    </button>
                                </div>
                                <div className="p-4 relative bg-[#1a1a2e] z-10">
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {video.tags.map((tag, j) => (
                                            <span key={j} className="px-2 py-0.5 bg-[#2a2a3e] text-mono text-[#00ff88] text-xs rounded border border-[#00ff88]/30">{tag}</span>
                                        ))}
                                    </div>
                                    <h3 className="text-retro text-[#e8e8f0] text-xl mb-2">{video.title}</h3>
                                    <div className="flex items-center justify-between text-mono text-[#8888aa] text-sm">
                                        <span>⏱ {video.duration} · 👁 {video.views}</span>
                                        <span className="text-[#ffd700] text-pixel text-[10px]">{video.xp}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
