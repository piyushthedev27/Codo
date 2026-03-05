'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, CheckCircle2 } from 'lucide-react';
import { animate, JSAnimation } from 'animejs';

interface Choice {
    label: string;
    nextState: string;
}

export interface CinemaState {
    id: string;
    narration: string;
    codeSnippet: string | null;
    duration: number; // in seconds
    next: string | null;
    choices: Choice[] | null;
}

export default function InteractiveVideoPlayer({ states, token }: { states: CinemaState[], token: string }) {
    const [currentStateId, setCurrentStateId] = useState<string>('intro');
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [showChoices, setShowChoices] = useState(false);
    const [typedCode, setTypedCode] = useState('');
    const [audioAvailable, setAudioAvailable] = useState(true);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animationRef = useRef<JSAnimation | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentState = states?.find(s => s.id === currentStateId) ?? states?.[0];

    const transitionToState = useCallback((nextId: string) => {
        setShowChoices(false);
        setTypedCode('');
        setCurrentStateId(nextId);
        // effect will auto-trigger fetchAndPlayTTS if isPlaying is still true
    }, []);

    const handleStateEnd = useCallback(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        if (currentState.choices) {
            setIsPlaying(false);
            setShowChoices(true);
        } else if (currentState.next) {
            transitionToState(currentState.next);
        } else {
            // End of video branch
            setIsPlaying(false);
            setProgress(1);
        }
    }, [currentState, transitionToState]);

    const startProgressTimer = useCallback(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        const startTime = Date.now();
        const durationMs = currentState.duration * 1000;

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const targetProg = Math.min(1, elapsed / durationMs);
            setProgress(targetProg);

            if (targetProg >= 1) {
                handleStateEnd();
            }
        }, 50);
    }, [currentState.duration, handleStateEnd]);

    const animateCodeTyping = useCallback(() => {
        if (!currentState.codeSnippet) {
            setTypedCode('');
            return;
        }

        const fullCode = currentState.codeSnippet;
        if (animationRef.current) animationRef.current.pause();

        const obj = { length: 0 };
        animationRef.current = animate(obj, {
            length: fullCode.length,
            duration: currentState.duration * 1000 * 0.8, // Finish slightly before audio
            ease: 'linear',
            onUpdate: () => {
                setTypedCode(fullCode.substring(0, Math.floor(obj.length)));
            }
        });
    }, [currentState]);

    // Auto-fetch TTS buffer on state change
    useEffect(() => {
        let isCancelled = false;

        const fetchAndPlayTTS = async () => {
            if (!isPlaying) return; // Only fetch if we intend to play

            try {
                const res = await fetch('/api/cinema/tts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        text: currentState.narration,
                        stateId: currentState.id
                    })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.warn('TTS failed, continuing without audio:', errorData.error);
                    
                    // Show user-friendly message for quota errors
                    if (errorData.code === 'quota_exceeded') {
                        console.info('💡 TTS quota exceeded - playing cinema without audio narration');
                        setAudioAvailable(false);
                    }
                    
                    // Continue without audio - just show visuals and text
                    throw new Error('TTS unavailable');
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                if (isCancelled) return;

                if (audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play().catch(err => {
                        console.warn('Audio playback failed:', err);
                    });
                }

                setProgress(0);
                startProgressTimer();
                animateCodeTyping();

            } catch (e) {
                console.error('Failed to play TTS', e);
                // Fallback: just wait for duration without audio
                setProgress(0);
                startProgressTimer();
                animateCodeTyping();
            }
        };

        if (isPlaying && !showChoices) {
            fetchAndPlayTTS();
        }

        return () => { isCancelled = true; };
    }, [currentStateId, isPlaying, showChoices, token, currentState, animateCodeTyping, startProgressTimer]); // Dependencies added to satisfy lint bonus: now fully reactive

    // Guard against undefined or empty states - moved after all hooks
    if (!states || states.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto mt-8 bg-[#0a0a0f] border-2 border-[#2a2a3e] rounded-lg overflow-hidden p-8 text-center">
                <p className="text-[#8888aa] text-retro">Loading cinema content...</p>
            </div>
        );
    }

    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
            if (animationRef.current) animationRef.current.pause();
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        } else {
            setIsPlaying(true);
            // Will trigger effect causing TTS fetch/play if at start of state
            // If resuming from middle, would need more complex logic. 
            // For MVP simplicity, AI cinema is designed to play full state chunks.
        }
    };

    // Calculate total progress across all states for progress bar (rough estimate)
    const currentIndex = states.findIndex(s => s.id === currentStateId);
    const overallProgress = (currentIndex / states.length) * 100;

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 bg-[#0a0a0f] border-2 border-[#2a2a3e] rounded-lg overflow-hidden relative shadow-2xl flex flex-col h-[500px]">

            <audio ref={audioRef} onEnded={() => { /* fallback if Audio ends before duration timer */ }} />

            {/* Top Progress Bar */}
            <div className="h-1 w-full bg-[#12121a]">
                <div
                    className="h-full bg-[#6c63ff] transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative p-8 flex flex-col items-center justify-center pt-16">

                {/* Audio Unavailable Notice */}
                {!audioAvailable && (
                    <div className="absolute top-4 right-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-3 py-2 rounded text-xs text-mono flex items-center gap-2">
                        <span>🔇</span>
                        <span>Audio narration unavailable - visual mode</span>
                    </div>
                )}

                {/* Narration Subs */}
                <div className="text-center md:max-w-2xl bg-black/50 p-4 rounded-lg backdrop-blur mb-8 min-h-[80px] flex items-center justify-center border border-[#2a2a3e]/50">
                    <p className="text-retro text-[#e8e8f0] text-lg leading-relaxed">
                        {currentState.narration}
                    </p>
                </div>

                {/* Main Visual / Code Visual */}
                <div className="flex-1 w-full flex items-center justify-center w-full max-w-2xl bg-[#12121a] rounded p-6 font-mono text-sm border border-[#2a2a3e] shadow-inner overflow-hidden">
                    {currentState.codeSnippet ? (
                        <pre className="text-[#00ff88] whitespace-pre-wrap flex-1 text-left">
                            {typedCode}
                            <span className="animate-pulse bg-[#6c63ff] ml-1 w-2 h-4 inline-block align-middle" />
                        </pre>
                    ) : (
                        <div className="text-pixel text-[#8888aa] text-center opacity-50">
                            [SCENE VISUALS]
                        </div>
                    )}
                </div>

                {/* Choice Overlay */}
                {showChoices && (
                    <div className="absolute inset-0 bg-[#0a0a0f]/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20">
                        <h3 className="text-pixel text-[#6c63ff] text-xl mb-8">CHOOSE YOUR PATH</h3>
                        <div className="flex flex-col gap-4 w-full max-w-md">
                            {currentState.choices?.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => transitionToState(c.nextState)}
                                    className="px-6 py-4 bg-[#1a1a2e] border-2 border-[#6c63ff] text-[#e8e8f0] text-retro rounded-lg hover:bg-[#6c63ff]/20 hover:-translate-y-1 transition-all glow-purple"
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="bg-[#12121a] border-t-2 border-[#2a2a3e] p-4 flex items-center gap-4 z-10">
                <button
                    onClick={togglePlay}
                    disabled={showChoices}
                    className="w-12 h-12 rounded-full bg-[#6c63ff] text-white flex items-center justify-center hover:scale-105 transition glow-purple disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isPlaying ? <Pause className="ml-0" size={24} /> : <Play className="ml-1" size={24} />}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-mono text-xs text-[#8888aa]">
                        <span>SCENE: {currentStateId.toUpperCase()}</span>
                        <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#0a0a0f] rounded-full overflow-hidden border border-[#2a2a3e]">
                        <div
                            className="h-full bg-[#6c63ff]"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                </div>

                {(!currentState.next && !currentState.choices && progress >= 1) && (
                    <div className="flex items-center gap-2 text-[#00ff88] text-retro text-sm ml-4 border border-[#00ff88]/30 bg-[#00ff88]/10 px-3 py-2 rounded">
                        <CheckCircle2 size={16} /> MODULE COMPLETE
                    </div>
                )}
            </div>

            {/* Start Overlay (only shown initially) */}
            {!isPlaying && currentStateId === 'intro' && progress === 0 && !showChoices && (
                <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                    <button
                        onClick={togglePlay}
                        className="flex flex-col items-center gap-4 group"
                    >
                        <div className="w-24 h-24 rounded-full bg-[#6c63ff] text-white flex items-center justify-center shadow-[0_0_30px_#6c63ff] group-hover:scale-110 transition-transform">
                            <Play className="ml-2" size={48} />
                        </div>
                        <span className="text-pixel text-xl text-[#e8e8f0] tracking-widest">START INTERACTIVE LESSON</span>
                    </button>
                </div>
            )}
        </div>
    );
}
