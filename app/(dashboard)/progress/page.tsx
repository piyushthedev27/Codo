'use client';
import { BarChart3, ChevronRight, PlayCircle } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import Link from 'next/link';

export default function ProgressPage() {
    const { xp, streak, lessonsDone } = useRewards();
    const currentLevel = Math.floor(xp / 1000) + 1;

    const stats = [
        { label: 'Challenges Solved', value: lessonsDone.toString(), color: '#6c63ff' },
        { label: 'Total XP Earned', value: xp.toLocaleString(), color: '#ffd700' },
        { label: 'Current Level', value: currentLevel.toString(), color: '#00d4ff' },
        { label: 'Day Streak', value: streak.toString(), color: '#00ff88' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-pixel text-2xl text-[#6c63ff] mb-6 flex items-center gap-2">
                <BarChart3 /> PROGRESS
            </h1>

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
            <div className="mt-6 bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded p-4">
                <h3 className="text-pixel text-sm mb-4 text-[#ffd700]">RECOMMENDED FOR YOU</h3>
                <p className="text-mono text-[#8888aa] text-xs mb-4">Click any topic to generate an instant AI lesson.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { title: 'React Hooks', desc: 'Master useState and useEffect', color: '#00d4ff' },
                        { title: 'TypeScript Interfaces', desc: 'Strongly type your objects', color: '#6c63ff' },
                        { title: 'CSS Grid Layout', desc: 'Build complex 2D layouts', color: '#ff4d6d' },
                        { title: 'REST vs GraphQL', desc: 'API design patterns', color: '#00ff88' },
                        { title: 'Docker Basics', desc: 'Containerize your applications', color: '#00d4ff' },
                        { title: 'Big O Notation', desc: 'Algorithm time complexity', color: '#ffd700' },
                    ].map((topic, i) => (
                        <Link
                            key={i}
                            href={`/cinema?topic=${encodeURIComponent(topic.title)}`}
                            className="group bg-[#12121a] border border-[#2a2a3e] rounded p-3 hover:border-[#6c63ff] transition-all hover:-translate-y-1 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="min-w-8 h-8 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${topic.color}22`, color: topic.color }}>
                                    <PlayCircle size={16} />
                                </div>
                                <div className="truncate">
                                    <div className="text-retro text-sm text-[#e8e8f0] truncate">{topic.title}</div>
                                    <div className="text-mono text-[10px] text-[#8888aa] truncate">{topic.desc}</div>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-[#444466] group-hover:text-[#6c63ff] transition-colors ml-2 shrink-0" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
