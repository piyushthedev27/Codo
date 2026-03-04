export default function ProgressPage() {
    const stats = [
        { label: 'Challenges Solved', value: '0', color: '#6c63ff' },
        { label: 'Total XP Earned', value: '0', color: '#ffd700' },
        { label: 'Current Level', value: '1', color: '#00d4ff' },
        { label: 'Day Streak', value: '0', color: '#00ff88' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-pixel text-2xl text-[#6c63ff] mb-6">📊 PROGRESS</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4 text-center hover:border-[#6c63ff] transition">
                        <div className="text-pixel text-3xl mb-2" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-retro text-[#8888aa] text-sm">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                    <h3 className="text-pixel text-xs mb-4">XP OVER TIME</h3>
                    <div className="flex items-end gap-1 h-32">
                        {[5, 20, 10, 40, 25, 60, 35].map((h, i) => (
                            <div key={i} className="flex-1 bg-[#6c63ff] rounded-t transition-all hover:bg-[#7c73ff]" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                    <div className="flex justify-between text-mono text-[#8888aa] text-xs mt-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                    <h3 className="text-pixel text-xs mb-4">SKILLS BREAKDOWN</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'JavaScript', pct: 40, color: '#ffd700' },
                            { name: 'Python', pct: 25, color: '#00d4ff' },
                            { name: 'Algorithms', pct: 15, color: '#6c63ff' },
                            { name: 'React', pct: 10, color: '#00ff88' },
                        ].map((skill, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-retro text-sm mb-1">
                                    <span style={{ color: skill.color }}>{skill.name}</span>
                                    <span className="text-[#8888aa]">{skill.pct}%</span>
                                </div>
                                <div className="bg-[#2a2a3e] h-2 rounded overflow-hidden">
                                    <div className="h-full rounded" style={{ width: `${skill.pct}%`, background: skill.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
