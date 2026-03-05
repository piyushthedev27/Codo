import { Brain } from 'lucide-react';

export default function KnowledgeGraphPage() {
    const nodes = [
        { id: 'js-basics', label: 'JS Basics', x: 50, y: 50, unlocked: true, color: '#ffd700' },
        { id: 'functions', label: 'Functions', x: 30, y: 30, unlocked: true, color: '#6c63ff' },
        { id: 'arrays', label: 'Arrays', x: 70, y: 30, unlocked: true, color: '#6c63ff' },
        { id: 'closures', label: 'Closures', x: 20, y: 60, unlocked: false, color: '#8888aa' },
        { id: 'async', label: 'Async/Await', x: 80, y: 60, unlocked: false, color: '#8888aa' },
        { id: 'react', label: 'React', x: 50, y: 80, unlocked: false, color: '#8888aa' },
    ];

    const connections = [
        { from: 'js-basics', to: 'functions' },
        { from: 'js-basics', to: 'arrays' },
        { from: 'functions', to: 'closures' },
        { from: 'functions', to: 'react' },
        { from: 'arrays', to: 'react' },
        { from: 'arrays', to: 'async' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-pixel text-2xl text-[#6c63ff] mb-2 flex items-center gap-2">
                <Brain /> KNOWLEDGE GRAPH
            </h1>
            <p className="text-mono text-[#8888aa] mb-6">Your visual skill tree — see what you know and what{"'"}s next.</p>
            <div className="relative bg-[#0a0a0f] border-2 border-[#2a2a3e] rounded overflow-hidden" style={{ height: '400px' }}>
                <div className="absolute inset-0 pixel-grid-bg opacity-20" />

                {/* Connections Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {connections.map((conn, i) => {
                        const fromNode = nodes.find(n => n.id === conn.from);
                        const toNode = nodes.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;

                        const isUnlocked = fromNode.unlocked && toNode.unlocked;

                        return (
                            <line
                                key={i}
                                x1={`${fromNode.x}%`}
                                y1={`${fromNode.y}%`}
                                x2={`${toNode.x}%`}
                                y2={`${toNode.y}%`}
                                stroke={isUnlocked ? '#6c63ff' : '#2a2a3e'}
                                strokeWidth="3"
                                strokeDasharray={isUnlocked ? "0" : "6 6"}
                                className={isUnlocked ? "opacity-60 drop-shadow-[0_0_8px_#6c63ff80]" : "opacity-40"}
                            />
                        );
                    })}
                </svg>

                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        <div
                            className={`w-20 h-10 rounded flex items-center justify-center text-xs border-2 transition hover:scale-110 ${node.unlocked ? 'glow-purple' : 'opacity-40'}`}
                            style={{ borderColor: node.color, background: `${node.color}22`, color: node.color }}
                        >
                            <span className="text-retro">{node.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
