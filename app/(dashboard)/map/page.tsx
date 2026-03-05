import { Terminal, Code2, Atom, Server, Brain, Lock } from 'lucide-react';

export default function MapPage() {
    const zones = [
        { id: 1, name: 'PYTHON PLAINS', color: '#00d4ff', locked: false, x: 15, y: 20, icon: <Terminal size={32} /> },
        { id: 2, name: 'JS JUNGLE', color: '#ffd700', locked: false, x: 35, y: 40, icon: <Code2 size={32} /> },
        { id: 3, name: 'REACT REALM', color: '#6c63ff', locked: true, x: 55, y: 25, icon: <Atom size={32} /> },
        { id: 4, name: 'BACKEND BADLANDS', color: '#00ff88', locked: true, x: 70, y: 55, icon: <Server size={32} /> },
        { id: 5, name: 'ALGORITHM ABYSS', color: '#ff4d6d', locked: true, x: 45, y: 65, icon: <Brain size={32} /> },
    ];

    const paths = [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 2, to: 5 },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-pixel text-2xl text-[#6c63ff] mb-2">WORLD MAP</h1>
                <p className="text-mono text-[#8888aa]">Explore learning zones. Unlock new lands as you level up.</p>
            </div>

            <div className="relative bg-[#0a1a0a] border-2 border-[#2a2a3e] rounded overflow-hidden" style={{ height: '500px' }}>
                {/* Grid overlay */}
                <div className="absolute inset-0 pixel-grid-bg opacity-30" />

                {/* SVG Paths Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {paths.map((path, i) => {
                        const fromZone = zones.find(z => z.id === path.from);
                        const toZone = zones.find(z => z.id === path.to);
                        if (!fromZone || !toZone) return null;

                        const isUnlocked = !toZone.locked;

                        return (
                            <line
                                key={i}
                                x1={`${fromZone.x}%`}
                                y1={`${fromZone.y}%`}
                                x2={`${toZone.x}%`}
                                y2={`${toZone.y}%`}
                                stroke={isUnlocked ? toZone.color : '#2a2a3e'}
                                strokeWidth="4"
                                strokeDasharray={isUnlocked ? "0" : "8 8"}
                                strokeLinecap="round"
                                className={isUnlocked ? "opacity-60 drop-shadow-[0_0_10px_currentColor]" : "opacity-30"}
                                style={{ color: toZone.color }}
                            />
                        );
                    })}
                </svg>

                {zones.map((zone) => (
                    <div
                        key={zone.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                    >
                        <div
                            className={`w-16 h-16 rounded border-4 flex items-center justify-center transition-transform group-hover:scale-110 ${zone.locked ? 'opacity-40 grayscale' : 'animate-pulse-glow'}`}
                            style={{ borderColor: zone.color, background: `${zone.color}22`, color: zone.color }}
                        >
                            {zone.locked ? <Lock size={32} /> : zone.icon}
                        </div>
                        <div className="text-pixel text-xs text-center mt-2 text-retro" style={{ color: zone.color, fontSize: '10px' }}>
                            {zone.name}
                        </div>
                        {zone.locked && <div className="text-mono text-[#8888aa] text-xs text-center">LOCKED</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
