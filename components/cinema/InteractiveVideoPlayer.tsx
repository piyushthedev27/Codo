'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, CheckCircle2, RefreshCw } from 'lucide-react';
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
    blockBuilder?: {
        shuffledBlocks: string[];
        correctSequence: string[];
        successNextState: string;
    } | null;
}

export default function InteractiveVideoPlayer({ states, token }: { states: CinemaState[], token: string }) {
    const [currentStateId, setCurrentStateId] = useState<string>('intro');
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [showChoices, setShowChoices] = useState(false);
    const [showBlockBuilder, setShowBlockBuilder] = useState(false);
    const [typedCode, setTypedCode] = useState('');
    const [audioAvailable, setAudioAvailable] = useState(true);

    // Block Builder States
    const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
    const [placedBlocks, setPlacedBlocks] = useState<string[]>([]);
    const [blockError, setBlockError] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animationRef = useRef<JSAnimation | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentState = states?.find(s => s.id === currentStateId) ?? states?.[0];

    // Initialize block builder when necessary
    useEffect(() => {
        if (showBlockBuilder && currentState?.blockBuilder) {
            setAvailableBlocks([...currentState.blockBuilder.shuffledBlocks]);
            setPlacedBlocks([]);
            setBlockError(false);
        }
    }, [showBlockBuilder, currentState]);

    const transitionToState = useCallback((nextId: string) => {
        setShowChoices(false);
        setShowBlockBuilder(false);
        setTypedCode('');
        setCurrentStateId(nextId);
        // effect will auto-trigger fetchAndPlayTTS if isPlaying is still true
    }, []);

    const handleStateEnd = useCallback(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        if (currentState.choices) {
            setIsPlaying(false);
            setShowChoices(true);
        } else if (currentState.blockBuilder) {
            setIsPlaying(false);
            setShowBlockBuilder(true);
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

            // Helper to fall back to browser TTS
            const playBrowserTTS = () => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(currentState.narration);
                    const voices = window.speechSynthesis.getVoices();
                    const femaleKeywords = ['zira', 'samantha', 'victoria', 'karen', 'tessa', 'moira', 'veena', 'female', 'woman', 'girl'];

                    let preferredVoice = voices.find(v =>
                        v.lang.startsWith('en-') &&
                        femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
                    );

                    if (!preferredVoice) {
                        preferredVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google US English'));
                    }

                    if (!preferredVoice) {
                        preferredVoice = voices.find(v => v.lang.startsWith('en-'));
                    }

                    if (preferredVoice) utterance.voice = preferredVoice;
                    utterance.rate = 1.0;
                    utterance.pitch = 1.25;

                    window.speechSynthesis.speak(utterance);
                    console.info('🔊 Playing browser fallback TTS');
                } else {
                    console.warn('Browser TTS not supported, continuing silently.');
                    setAudioAvailable(false);
                }
            };

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
                    console.warn('Backend TTS failed, trying browser fallback:', errorData.error);
                    throw new Error('TTS unavailable');
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                if (isCancelled) return;

                if (audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play().catch(err => {
                        console.warn('Audio playback failed, trying browser fallback:', err);
                        playBrowserTTS();
                    });
                }

            } catch (e) {
                console.error('Failed to play backend TTS', e);
                playBrowserTTS();
            } finally {
                setProgress(0);
                startProgressTimer();
                animateCodeTyping();
            }
        };

        if (isPlaying && !showChoices && !showBlockBuilder) {
            fetchAndPlayTTS();
        }

        return () => { isCancelled = true; };
    }, [currentStateId, isPlaying, showChoices, showBlockBuilder, token, currentState, animateCodeTyping, startProgressTimer]);

    // Handle Block Builder Interactions
    const handleBlockClick = (block: string, isAvailable: boolean) => {
        if (isAvailable) {
            // Move from available to placed
            const blockIndex = availableBlocks.indexOf(block);
            if (blockIndex > -1) {
                const newAvailable = [...availableBlocks];
                newAvailable.splice(blockIndex, 1);
                setAvailableBlocks(newAvailable);
                setPlacedBlocks([...placedBlocks, block]);
                setBlockError(false);
            }
        } else {
            // Move from placed back to available
            const blockIndex = placedBlocks.indexOf(block);
            if (blockIndex > -1) {
                const newPlaced = [...placedBlocks];
                const removedBlock = newPlaced.splice(blockIndex, 1)[0];
                setPlacedBlocks(newPlaced);
                setAvailableBlocks([...availableBlocks, removedBlock]);
                setBlockError(false);
            }
        }
    };

    const submitBlockBuilder = () => {
        if (!currentState.blockBuilder) return;

        const isCorrect = JSON.stringify(placedBlocks) === JSON.stringify(currentState.blockBuilder.correctSequence);
        if (isCorrect) {
            transitionToState(currentState.blockBuilder.successNextState);
            setIsPlaying(true);
        } else {
            setBlockError(true);
            setTimeout(() => setBlockError(false), 800); // Remove error animation state after 800ms

            // Auto reset blocks after wrong attempt
            setTimeout(() => {
                setAvailableBlocks([...currentState.blockBuilder!.shuffledBlocks]);
                setPlacedBlocks([]);
            }, 800);
        }
    };

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
        }
    };

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

                {!audioAvailable && (
                    <div className="absolute top-4 right-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-3 py-2 rounded text-xs text-mono flex items-center gap-2">
                        <span>🔇</span>
                        <span>Audio narration unavailable - visual mode</span>
                    </div>
                )}

                {/* Narration Subs */}
                <div className="text-center md:max-w-2xl bg-black/50 p-4 rounded-lg backdrop-blur mb-8 min-h-[80px] flex items-center justify-center border border-[#2a2a3e]/50 z-10">
                    <p className="text-retro text-[#e8e8f0] text-lg leading-relaxed">
                        {currentState.narration}
                    </p>
                </div>

                {/* Main Visual / Code Visual */}
                <div className="flex-1 w-full flex items-center justify-center w-full max-w-2xl bg-[#12121a] rounded p-6 font-mono text-sm border border-[#2a2a3e] shadow-inner overflow-hidden">
                    {currentState.codeSnippet ? (
                        <pre className="text-[#00ff88] whitespace-pre-wrap flex-1 text-left">
                            {typedCode}
                            {isPlaying && <span className="animate-pulse bg-[#6c63ff] ml-1 w-2 h-4 inline-block align-middle" />}
                        </pre>
                    ) : (
                        <div className="text-pixel text-[#8888aa] text-center opacity-50">
                            [SCENE VISUALS]
                        </div>
                    )}
                </div>

                {/* Overlays */}

                {/* 1. Choice Branch Overlay */}
                {showChoices && (
                    <div className="absolute inset-0 bg-[#0a0a0f]/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20">
                        <h3 className="text-pixel text-[#6c63ff] text-xl mb-8">CHOOSE YOUR PATH</h3>
                        <div className="flex flex-col gap-4 w-full max-w-md">
                            {currentState.choices?.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        transitionToState(c.nextState);
                                        setIsPlaying(true);
                                    }}
                                    className="px-6 py-4 bg-[#1a1a2e] border-2 border-[#6c63ff] text-[#e8e8f0] text-retro rounded-lg hover:bg-[#6c63ff]/20 hover:-translate-y-1 transition-all glow-purple"
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Block Builder Overlay */}
                {showBlockBuilder && currentState.blockBuilder && (
                    <div className="absolute inset-0 bg-[#0a0a0f]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 z-20">
                        <h3 className="text-pixel text-[#00ff88] text-xl mb-2 text-center">BUILD THE LOGIC</h3>
                        <p className="text-[#8888aa] text-mono text-sm mb-8 text-center max-w-md">
                            Click available blocks below to arrange them into the correct code sequence.
                        </p>

                        {/* Target Assembly Area */}
                        <div className={`w-full max-w-2xl bg-[#12121a] border-2 ${blockError ? 'border-red-500 animate-shake' : 'border-[#2a2a3e]'} rounded-lg p-6 min-h-[100px] flex items-center justify-center flex-wrap gap-2 mb-8 transition-colors duration-300`}>
                            {placedBlocks.length === 0 && (
                                <span className="text-[#8888aa]/50 text-retro uppercase">Assemble blocks here...</span>
                            )}
                            {placedBlocks.map((block, i) => (
                                <button
                                    key={`placed-${i}`}
                                    onClick={() => handleBlockClick(block, false)}
                                    className={`px-4 py-2 font-mono text-lg rounded bg-[#2a2a3e] text-[#e8e8f0] border ${blockError ? 'border-red-500' : 'border-[#6c63ff]'} hover:bg-red-500/20 hover:border-red-500 transition-all shadow-lg select-none`}
                                >
                                    {block}
                                </button>
                            ))}
                        </div>

                        {/* Available Blocks Pool */}
                        <div className="w-full max-w-2xl flex flex-wrap gap-3 justify-center mb-12">
                            {availableBlocks.map((block, i) => (
                                <button
                                    key={`avail-${i}`}
                                    onClick={() => handleBlockClick(block, true)}
                                    className="px-4 py-2 font-mono text-lg rounded bg-[#1a1a2e] text-[#00ff88] border border-[#00ff88]/50 hover:bg-[#00ff88]/20 hover:-translate-y-1 transition-all shadow-[0_0_10px_rgba(0,255,136,0.1)] select-none"
                                >
                                    {block}
                                </button>
                            ))}
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setAvailableBlocks([...currentState.blockBuilder!.shuffledBlocks]);
                                    setPlacedBlocks([]);
                                    setBlockError(false);
                                }}
                                className="px-6 py-3 rounded text-[#8888aa] hover:text-white hover:bg-[#2a2a3e] transition flex items-center gap-2 text-mono"
                            >
                                <RefreshCw size={18} /> RESET
                            </button>
                            <button
                                onClick={submitBlockBuilder}
                                disabled={placedBlocks.length !== currentState.blockBuilder.correctSequence.length}
                                className="px-8 py-3 rounded bg-[#00ff88] text-black font-bold text-retro disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00cc6a] hover:shadow-[0_0_20px_#00ff88] transition-all"
                            >
                                SUBMIT CODE
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="bg-[#12121a] border-t-2 border-[#2a2a3e] p-4 flex items-center gap-4 z-30">
                <button
                    onClick={togglePlay}
                    disabled={showChoices || showBlockBuilder}
                    className="w-12 h-12 rounded-full bg-[#6c63ff] text-white flex items-center justify-center hover:scale-105 transition glow-purple disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
                            className="h-full bg-[#3e34e2]"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                </div>

                {(!currentState.next && !currentState.choices && !currentState.blockBuilder && progress >= 1) && (
                    <div className="flex items-center gap-2 text-[#00ff88] text-retro text-sm ml-4 border border-[#00ff88]/30 bg-[#00ff88]/10 px-3 py-2 rounded">
                        <CheckCircle2 size={16} /> LESSON COMPLETE
                    </div>
                )}
            </div>

            {/* Start Overlay (only shown initially) */}
            {!isPlaying && currentStateId === 'intro' && progress === 0 && !showChoices && !showBlockBuilder && (
                <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm flex flex-col items-center justify-center z-40">
                    <button
                        onClick={togglePlay}
                        className="flex flex-col items-center gap-4 group"
                    >
                        <div className="w-24 h-24 rounded-full bg-[#6c63ff] text-white flex items-center justify-center shadow-[0_0_30px_#6c63ff] group-hover:scale-110 transition-transform">
                            <Play className="ml-2" size={48} />
                        </div>
                        <span className="text-pixel text-xl text-[#e8e8f0] tracking-widest text-shadow-md">START LESSON</span>
                    </button>
                    <p className="mt-8 text-mono text-[#8888aa] border border-[#2a2a3e] px-4 py-2 rounded-full bg-black/40 shadow-inner">Interactive AI Video</p>
                </div>
            )}
        </div>
    );
}
