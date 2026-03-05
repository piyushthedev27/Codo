'use client';
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2, Play, Check, AlertTriangle, Lightbulb, Trophy } from 'lucide-react';
import { auth } from '@/lib/firebase/client';
import LessonCompleteModal from '@/components/ui/LessonCompleteModal';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++'];
const LANG_MAP: Record<string, string> = {
    'JavaScript': 'javascript',
    'Python': 'python',
    'Java': 'java',
    'C++': 'cpp'
};

const DEFAULT_CODE: Record<string, string> = {
    'javascript': 'function twoSum(nums, target) {\n  // Write your solution here\n  \n}',
    'python': 'def twoSum(nums, target):\n    # Write your solution here\n    pass',
    'java': 'class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
    'cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}'
};

// Mock test cases for Two Sum problem
const SAMPLE_TESTS = [
    { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
    { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false }
];

const HIDDEN_TESTS = [
    ...SAMPLE_TESTS,
    { input: '3 3\n6', expectedOutput: '0 1', isHidden: true }
];

interface ExecutionResult {
    status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'memory_limit';
    results: {
        testCaseId: number;
        passed: boolean;
        output: string;
        expectedOutput: string;
        error?: string;
    }[];
    executionTime: number;
    memoryUsed: number;
    compilationError?: string;
    error?: string;
}

export default function LessonPage({ params }: { params: { id: string } }) {
    const [selectedLang, setSelectedLang] = useState('JavaScript');
    const [code, setCode] = useState(DEFAULT_CODE['javascript']);
    const [output, setOutput] = useState<ExecutionResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'problem' | 'output'>('problem');
    const [hint, setHint] = useState<string | null>(null);
    const [isGettingHint, setIsGettingHint] = useState(false);
    const [isLessonCompleteOpen, setIsLessonCompleteOpen] = useState(false);

    // Update default code when language changes if code hasn't been edited
    useEffect(() => {
        const langValue = LANG_MAP[selectedLang];
        setCode(DEFAULT_CODE[langValue]);
    }, [selectedLang]);

    const handleExecute = async (isSubmit: boolean) => {
        const langValue = LANG_MAP[selectedLang];
        const testCases = isSubmit ? HIDDEN_TESTS : SAMPLE_TESTS;

        if (isSubmit) setIsSubmitting(true);
        else setIsRunning(true);
        setActiveTab('output');
        setOutput(null);

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("Ensure you are logged in to run code.");

            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code,
                    language: langValue,
                    testCases
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Execution failed');
            }

            setOutput(data);

            if (isSubmit && data.status === 'success' && data.results.every((r: { passed: boolean }) => r.passed)) {
                // Call complete endpoint
                await fetch(`/api/lessons/${params.id}/complete`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsLessonCompleteOpen(true);
            }
        } catch (error: unknown) {
            console.error(error);
            const err = error as Error;
            setOutput({
                status: 'runtime_error',
                error: err.message,
                results: [],
                executionTime: 0,
                memoryUsed: 0
            } as ExecutionResult);
        } finally {
            setIsRunning(false);
            setIsSubmitting(false);
        }
    };

    const handleGetHint = async () => {
        setIsGettingHint(true);
        setHint(null);
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("Ensure you are logged in to use hints.");

            const res = await fetch('/api/ai/hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    problemTitle: 'Two Sum',
                    problemDescription: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
                    userCode: code,
                    language: LANG_MAP[selectedLang]
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to get hint');

            setHint(data.hint);
        } catch (error: unknown) {
            console.error(error);
            const err = error as Error;
            setHint(`⚠️ ${err.message}`);
        } finally {
            setIsGettingHint(false);
        }
    };

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col">
            {/* Header */}
            <div className="bg-[#12121a] border-b-2 border-[#2a2a3e] px-6 py-3 flex justify-between items-center">
                <h1 className="text-pixel text-sm text-[#6c63ff]">CHALLENGE: {params.id.replace(/-/g, ' ').toUpperCase()}</h1>
                <div className="flex gap-2">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setSelectedLang(lang)}
                            className={`px-3 py-1 rounded text-retro text-sm transition ${selectedLang === lang ? 'bg-[#6c63ff] text-white' : 'border border-[#2a2a3e] text-[#8888aa] hover:border-[#6c63ff]'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel (Tabs: Problem / Output) */}
                <div className="w-96 bg-[#12121a] border-r-2 border-[#2a2a3e] flex flex-col flex-shrink-0">
                    <div className="flex border-b-2 border-[#2a2a3e]">
                        <button
                            className={`flex-1 py-3 text-retro text-sm ${activeTab === 'problem' ? 'text-[#6c63ff] border-b-2 border-[#6c63ff]' : 'text-[#8888aa]'}`}
                            onClick={() => setActiveTab('problem')}
                        >
                            PROBLEM
                        </button>
                        <button
                            className={`flex-1 py-3 text-retro text-sm ${activeTab === 'output' ? 'text-[#6c63ff] border-b-2 border-[#6c63ff]' : 'text-[#8888aa]'}`}
                            onClick={() => setActiveTab('output')}
                        >
                            OUTPUT
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        {activeTab === 'problem' ? (
                            <div>
                                <div className="px-2 py-0.5 bg-[#6c63ff22] border border-[#6c63ff] rounded text-retro text-[#6c63ff] text-xs inline-block mb-3">MEDIUM</div>
                                <h2 className="text-pixel text-sm text-[#e8e8f0] mb-4">Two Sum</h2>
                                <p className="text-mono text-[#8888aa] text-sm mb-4 leading-relaxed">
                                    Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                                </p>
                                <p className="text-mono text-[#8888aa] text-sm mb-6 leading-relaxed">
                                    You may assume that each input would have exactly one solution, and you may not use the same element twice.
                                </p>

                                {SAMPLE_TESTS.map((tc, idx) => (
                                    <div key={idx} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded p-3 mb-4">
                                        <div className="text-retro text-[#8888aa] text-xs mb-2">Example {idx + 1}:</div>
                                        <pre className="text-mono text-[#00ff88] text-xs leading-relaxed whitespace-pre-wrap">
                                            Input: {tc.input.replace(/\n/g, ', target=')}<br />
                                            Output: {tc.expectedOutput}
                                        </pre>
                                    </div>
                                ))}
                                <div className="text-retro text-[#ffd700] text-sm mb-6 border border-[#ffd700]/30 bg-[#ffd700]/10 p-2 rounded inline-block">+200 XP AT STAKE ⚡</div>

                                {/* AI Hint Section */}
                                <div className="mt-2 border-t border-[#2a2a3e] pt-4 pb-12">
                                    <button
                                        onClick={handleGetHint}
                                        disabled={isGettingHint}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 border border-[#6c63ff]/30 text-[#6c63ff] rounded text-retro transition disabled:opacity-50"
                                    >
                                        {isGettingHint ? <Loader2 className="animate-spin" size={16} /> : <Lightbulb size={16} />}
                                        {isGettingHint ? 'ANALYZING CODE...' : 'GET AI HINT'}
                                    </button>

                                    {hint && (
                                        <div className="mt-4 p-3 bg-[#1a1a2e] border border-[#6c63ff] rounded relative text-sm leading-relaxed text-[#e8e8f0] font-sans">
                                            <div className="absolute -top-2 left-4 bg-[#6c63ff] px-2 py-0 text-[10px] text-white rounded text-retro shadow-lg">AI HINT</div>
                                            {hint}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                {!output && !isRunning && !isSubmitting && (
                                    <p className="text-mono text-[#8888aa] text-sm text-center mt-10">Run your code to see results here.</p>
                                )}
                                {(isRunning || isSubmitting) && (
                                    <div className="flex flex-col items-center justify-center mt-10 gap-3">
                                        <Loader2 className="animate-spin text-[#6c63ff]" size={32} />
                                        <p className="text-retro text-[#6c63ff]">EXECUTING IN CLOUD...</p>
                                    </div>
                                )}
                                {output && !isRunning && !isSubmitting && (
                                    <div>
                                        {output.error || output.compilationError ? (
                                            <div className="bg-red-500/10 border border-red-500 rounded p-4 mb-4">
                                                <div className="flex items-center gap-2 text-red-400 mb-2">
                                                    <AlertTriangle size={16} />
                                                    <span className="text-retro font-bold">ERROR</span>
                                                </div>
                                                <pre className="text-mono text-xs text-red-200 whitespace-pre-wrap">{output.error || output.compilationError}</pre>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-pixel text-[#e8e8f0] text-sm">TEST RESULTS</h3>
                                                    <span className="text-mono text-[#8888aa] text-xs">Time: {output.executionTime}ms</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {output.results.map((r: { passed: boolean; output: string; expectedOutput: string }, idx: number) => (
                                                        <div key={idx} className={`p-3 border rounded ${r.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-retro text-xs text-[#e8e8f0]">Test Case {idx + 1}</span>
                                                                {r.passed ? (
                                                                    <span className="flex items-center gap-1 text-green-400 text-xs text-retro"><Check size={14} /> PASSED</span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 text-red-400 text-xs text-retro">FAILED</span>
                                                                )}
                                                            </div>
                                                            {!r.passed && (
                                                                <div className="space-y-1">
                                                                    <div className="text-mono text-xs text-[#8888aa]">Output: <span className="text-white">{r.output || '[Empty]'}</span></div>
                                                                    <div className="text-mono text-xs text-[#8888aa]">Expected: <span className="text-green-400">{r.expectedOutput}</span></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {output.status === 'success' && output.results.every((r: { passed: boolean }) => r.passed) && (
                                                    <div className="mt-4 p-4 bg-[#00ff8815] border-2 border-[#00ff88] rounded-xl text-center">
                                                        <Trophy className="mx-auto mb-2 text-[#00ff88]" size={24} />
                                                        <div className="text-pixel text-sm text-[#00ff88] mb-1">CHALLENGE COMPLETE</div>
                                                        <button
                                                            onClick={() => setIsLessonCompleteOpen(true)}
                                                            className="text-retro text-xs text-[#00ff88] underline hover:no-underline"
                                                        >
                                                            View Summary
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Code Editor Panel */}
                <div className="flex-1 flex flex-col relative w-full h-full">
                    <div className="flex-1 pt-2 bg-[#1e1e1e]">
                        <Editor
                            height="100%"
                            language={LANG_MAP[selectedLang] === 'cpp' ? 'cpp' : (LANG_MAP[selectedLang] === 'java' ? 'java' : (LANG_MAP[selectedLang] === 'python' ? 'python' : 'javascript'))}
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 16,
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontLigatures: true,
                            }}
                        />
                    </div>
                    <div className="border-t-2 border-[#2a2a3e] p-3 flex justify-between items-center bg-[#12121a] absolute bottom-0 left-0 right-0 z-10 w-full h-[60px]">
                        <div className="text-mono text-[#8888aa] text-xs flex gap-4">
                            <span>Runtime: Node.js / Python / GCC</span>
                        </div>
                        <div className="flex gap-3 h-full">
                            <button
                                onClick={() => handleExecute(false)}
                                disabled={isRunning || isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 border border-[#2a2a3e] text-[#8888aa] rounded hover:text-white text-retro hover:border-[#6c63ff] transition disabled:opacity-50"
                            >
                                <Play size={16} /> RUN TESTS
                            </button>
                            <button
                                onClick={() => handleExecute(true)}
                                disabled={isRunning || isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 bg-[#6c63ff] text-white rounded text-retro hover:bg-[#7c73ff] hover:glow-purple transition shadow-lg disabled:opacity-50"
                            >
                                <Check size={16} /> SUBMIT CODE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Success Modal */}
            <LessonCompleteModal
                isOpen={isLessonCompleteOpen}
                onClose={() => setIsLessonCompleteOpen(false)}
                lessonTitle={params.id.replace(/-/g, ' ').toUpperCase()}
                xpEarned={200}
                coinsEarned={50}
                accuracy={100}
                timeSpent="3:45"
            />
        </div>
    );
}
