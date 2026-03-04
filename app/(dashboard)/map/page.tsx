export default function MapPage() {
    const zones = [
        { id: 1, name: 'PYTHON PLAINS', color: '#00d4ff', locked: false, x: 15, y: 20, emoji: '🐍' },
        { id: 2, name: 'JS JUNGLE', color: '#ffd700', locked: false, x: 35, y: 40, emoji: '🟨' },
        { id: 3, name: 'REACT REALM', color: '#6c63ff', locked: true, x: 55, y: 25, emoji: '⚛️' },
        { id: 4, name: 'BACKEND BADLANDS', color: '#00ff88', locked: true, x: 70, y: 55, emoji: '🖥️' },
        { id: 5, name: 'ALGORITHM ABYSS', color: '#ff4d6d', locked: true, x: 45, y: 65, emoji: '🧠' },
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

                {zones.map((zone) => (
                    <div
                        key={zone.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                    >
                        <div
                            className={`w-16 h-16 rounded border-4 flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${zone.locked ? 'opacity-40 grayscale' : 'animate-pulse-glow'}`}
                            style={{ borderColor: zone.color, background: `${zone.color}22` }}
                        >
                            {zone.locked ? '🔒' : zone.emoji}
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
