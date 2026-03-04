export default function MistakeAnalyzerPage() {
    const mistakes = [
        { category: 'Off-by-one errors', count: 3, severity: 'HIGH', lesson: 'Array Indexing' },
        { category: 'Missing return statement', count: 2, severity: 'MEDIUM', lesson: 'Functions' },
        { category: 'Undefined variable', count: 1, severity: 'LOW', lesson: 'Variable Scope' },
    ];

    const severityColors: Record<string, string> = { HIGH: '#ff4d6d', MEDIUM: '#ffd700', LOW: '#00ff88' };

    return (
        <div className="p-6">
            <h1 className="text-pixel text-2xl text-[#6c63ff] mb-2">🔍 MISTAKE ANALYZER</h1>
            <p className="text-mono text-[#8888aa] mb-6">AI analyzes your errors to build targeted micro-lessons.</p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[{ label: 'Total Errors', value: '6', color: '#ff4d6d' }, { label: 'Fixed', value: '0', color: '#00ff88' }, { label: 'Lessons Generated', value: '3', color: '#6c63ff' }].map((s, i) => (
                    <div key={i} className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 text-center">
                        <div className="text-pixel text-3xl mb-2" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-retro text-[#8888aa]">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {mistakes.map((m, i) => (
                    <div key={i} className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 flex items-center justify-between hover:border-[#6c63ff] transition">
                        <div className="flex items-center gap-4">
                            <span className="px-2 py-0.5 text-xs border rounded text-retro" style={{ borderColor: severityColors[m.severity], color: severityColors[m.severity] }}>{m.severity}</span>
                            <div>
                                <div className="text-retro text-[#e8e8f0]">{m.category}</div>
                                <div className="text-mono text-[#8888aa] text-xs">Occurred {m.count} times · Related: {m.lesson}</div>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-[#6c63ff] text-white rounded text-retro text-sm hover:bg-[#7c73ff] transition">
                            FIX IT ▶
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
