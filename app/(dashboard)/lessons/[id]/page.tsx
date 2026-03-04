'use client';
import { useState } from 'react';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript'];

export default function LessonPage({ params }: { params: { id: string } }) {
    const [code, setCode] = useState('// Write your solution here\nfunction solution(input) {\n  \n}');
    const [selectedLang, setSelectedLang] = useState('JavaScript');
    const [output, setOutput] = useState('');

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col">
            {/* Header */}
            <div className="bg-[#12121a] border-b-2 border-[#2a2a3e] px-6 py-3 flex items-center gap-6">
                <h1 className="text-pixel text-sm text-[#6c63ff]">LESSON: {params.id.replace(/-/g, ' ').toUpperCase()}</h1>
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
                {/* Problem Panel */}
                <div className="w-80 bg-[#12121a] border-r-2 border-[#2a2a3e] p-4 overflow-y-auto flex-shrink-0">
                    <div className="px-2 py-0.5 bg-[#6c63ff22] border border-[#6c63ff] rounded text-retro text-[#6c63ff] text-xs inline-block mb-3">MEDIUM</div>
                    <h2 className="text-pixel text-sm text-[#e8e8f0] mb-4">Two Sum</h2>
                    <p className="text-mono text-[#8888aa] text-sm mb-4">
                        Given an array of integers and a target, return indices of two numbers that add up to the target.
                    </p>
                    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded p-3 mb-4">
                        <div className="text-retro text-[#8888aa] text-xs mb-2">Example:</div>
                        <code className="text-mono text-[#00ff88] text-xs">
                            Input: [2,7,11,15], target=9<br />
                            Output: [0,1]
                        </code>
                    </div>
                    <div className="text-retro text-[#ffd700] text-sm">+200 XP on solve ⚡</div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-[#0a0a0f] text-mono text-[#e8e8f0] text-sm p-4 resize-none focus:outline-none font-mono leading-relaxed"
                        spellCheck={false}
                    />
                    <div className="border-t-2 border-[#2a2a3e] p-3 flex justify-between items-center bg-[#12121a]">
                        <div className="text-mono text-[#8888aa] text-xs">{output || 'Run code to see output'}</div>
                        <div className="flex gap-3">
                            <button onClick={() => setOutput('Running...')} className="px-4 py-2 border border-[#2a2a3e] text-[#8888aa] rounded text-retro hover:border-[#6c63ff] transition">
                                ▶ RUN
                            </button>
                            <button className="px-4 py-2 bg-[#6c63ff] text-white rounded text-retro hover:bg-[#7c73ff] glow-purple transition">
                                ✓ SUBMIT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
