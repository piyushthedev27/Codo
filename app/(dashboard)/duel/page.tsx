'use client';
import { useState, useEffect } from 'react';
import { useRewards } from '@/hooks/useRewards';
import { useToast } from '@/components/ui/ToastProvider';

export default function CodeDuelPage() {
    const { addXp } = useRewards();
    const { showSuccess, showError, showInfo } = useToast();

    const [code, setCode] = useState('// Write your solution here\nfunction reverse(str) {\n  \n}');
    const [timeLeft, setTimeLeft] = useState(300);
    const [started, setStarted] = useState(false);
    const [output, setOutput] = useState('');

    useEffect(() => {
        if (!started) return;
        const interval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(interval);
                    setStarted(false);
                    showError("Time's Up!", "You didn't solve it in time.");
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [started, showError]);

    const executeCode = () => {
        let logs: string[] = [];
        const originalLog = console.log;

        console.log = (...args) => {
            logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };

        try {
            const fn = new Function(code);
            fn();
            setOutput(logs.join('\n') || 'Code executed. No output.');
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
        } finally {
            console.log = originalLog;
        }
    };

    const submitCode = () => {
        if (!started) {
            setStarted(true);
            return;
        }

        try {
            const evalCode = `
                ${code}
                if (typeof reverse === 'function') {
                    return reverse("hello");
                }
                return undefined;
            `;

            const fn = new Function(evalCode);
            const userResult = fn();

            if (userResult === "olleh") {
                showSuccess("Victory!", "You reversed the string first! +150 XP");
                setStarted(false);
                addXp(150);
                setOutput(`Testing test case: reverse("hello")\nExpected: "olleh"\nGot: "olleh"\n\n[SUCCESS] +150 XP awarded.`);
            } else {
                showError("Failed", `Expected "olleh" but got ${JSON.stringify(userResult)}`);
                setOutput(`Testing test case: reverse("hello")\nExpected: "olleh"\nGot: ${JSON.stringify(userResult)}\n\n[FAILED] Try again.`);
            }

        } catch (error: any) {
            showError("Syntax/Runtime Error", error.message);
            setOutput(`Error during execution:\n${error.message}`);
        }
    };

    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-pixel text-2xl text-[#6c63ff] mb-1">⚔️ CODE DUEL</h1>
                    <p className="text-mono text-[#8888aa]">Race your AI peers. First to solve wins.</p>
                </div>
                <div className={`text-pixel text-4xl ${timeLeft < 60 ? 'text-[#ff4d6d]' : 'text-[#ffd700]'}`}>
                    {mins}:{secs}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mb-4">
                {/* Problem */}
                <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-[#ffd70022] text-[#ffd700] border border-[#ffd700] text-retro text-xs rounded">EASY</span>
                        <span className="text-retro text-[#8888aa] text-sm">+150 XP to winner</span>
                    </div>
                    <h2 className="text-pixel text-sm text-[#e8e8f0] mb-3">Reverse a String</h2>
                    <p className="text-mono text-[#8888aa] text-sm mb-4">Write a function that reverses a string.</p>
                    <div className="bg-[#12121a] border border-[#2a2a3e] rounded p-3">
                        <code className="text-mono text-[#00ff88] text-xs">reverse(&quot;hello&quot;) → &quot;olleh&quot;</code>
                    </div>
                </div>

                {/* Scoreboard */}
                <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                    <h3 className="text-pixel text-xs mb-4">LIVE STANDINGS</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'YOU', progress: 0, color: '#6c63ff', status: 'coding...' },
                            { name: 'ALEX', progress: 45, color: '#00d4ff', status: '45% done' },
                            { name: 'SARAH', progress: 20, color: '#b060ff', status: '20% done' },
                        ].map((player, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-retro text-sm mb-1">
                                    <span style={{ color: player.color }}>{player.name}</span>
                                    <span className="text-[#8888aa]">{player.status}</span>
                                </div>
                                <div className="bg-[#2a2a3e] h-2 rounded overflow-hidden">
                                    <div className="h-full transition-all" style={{ width: `${player.progress}%`, background: player.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Editor */}
            <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded">
                <div className="border-b border-[#2a2a3e] px-4 py-2 flex justify-between items-center bg-[#12121a]">
                    <span className="text-retro text-[#8888aa]">JavaScript</span>
                    <div className="flex gap-3">
                        <button onClick={executeCode} className="px-4 py-1 border border-[#2a2a3e] text-[#8888aa] rounded text-retro text-sm hover:border-[#6c63ff] hover:text-[#e8e8f0] transition">▶ RUN</button>
                        <button
                            onClick={submitCode}
                            className={`px-4 py-1 rounded text-retro text-sm transition ${started ? 'bg-[#00ff88] text-[#0a0a0f] hover:bg-[#00cc6a] shadow-[0_0_10px_#00ff8840]' : 'bg-[#6c63ff] text-white hover:bg-[#7c73ff] glow-purple'}`}
                        >
                            {started ? '✓ SUBMIT' : '▶ START DUEL'}
                        </button>
                    </div>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={8}
                    className="w-full bg-[#0a0a0f] text-mono text-[#e8e8f0] text-sm p-4 resize-none focus:outline-none font-mono"
                    spellCheck={false}
                />

                {/* Console Output Block */}
                <div className="border-t border-[#2a2a3e] bg-[#12121a] p-4 font-mono text-sm max-h-40 overflow-y-auto">
                    <span className="text-[#8888aa] mb-2 block">&gt; Console Output</span>
                    {output ? (
                        <pre className={`whitespace-pre-wrap ${output.includes('Error') || output.includes('FAILED') ? 'text-[#ff4d6d]' : output.includes('SUCCESS') ? 'text-[#00ff88]' : 'text-[#e8e8f0]'}`}>
                            {output}
                        </pre>
                    ) : (
                        <span className="text-[#555570]">Run your code or submit it to see the output.</span>
                    )}
                </div>
            </div>
        </div>
    );
}
