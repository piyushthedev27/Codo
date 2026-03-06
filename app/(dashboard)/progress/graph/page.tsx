import { Brain, Lock, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeGraphPage() {
    // Redesigned Skill Tree Structure
    const nodes = [
        { id: 'html-css', label: 'HTML & CSS', x: 50, y: 15, status: 'completed', color: '#00d4ff' },
        { id: 'js-basics', label: 'JS Basics', x: 50, y: 30, status: 'completed', color: '#ffd700' },
        { id: 'dom', label: 'DOM Nodes', x: 25, y: 45, status: 'completed', color: '#00ff88' },
        { id: 'functions', label: 'Functions', x: 75, y: 45, status: 'next', color: '#6c63ff' },
        { id: 'events', label: 'Event Listeners', x: 15, y: 65, status: 'next', color: '#ff4d6d' },
        { id: 'async', label: 'Async/Await', x: 85, y: 65, status: 'locked', color: '#8888aa' },
        { id: 'react', label: 'React.js', x: 50, y: 60, status: 'locked', color: '#8888aa' },
        { id: 'nextjs', label: 'Next.js', x: 50, y: 85, status: 'locked', color: '#8888aa' },
    ];

    const connections = [
        { from: 'html-css', to: 'js-basics' },
        { from: 'js-basics', to: 'dom' },
        { from: 'js-basics', to: 'functions' },
        { from: 'dom', to: 'events' },
        { from: 'dom', to: 'react' },
        { from: 'functions', to: 'react' },
        { from: 'functions', to: 'async' },
        { from: 'react', to: 'nextjs' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-pixel text-2xl text-[#6c63ff] mb-2 flex items-center gap-2">
                <Brain /> KNOWLEDGE GRAPH
            </h1>
            <p className="text-mono text-[#8888aa] mb-6">Your visual skill tree — explore the map and click any topic to instantly generate an AI Video Lesson!</p>
            <div className="relative bg-[#0a0a0f] border-2 border-[#2a2a3e] rounded overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" style={{ height: '550px' }}>
                <div className="absolute inset-0 pixel-grid-bg opacity-20" />

                {/* Connections Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {connections.map((conn, i) => {
                        const fromNode = nodes.find(n => n.id === conn.from);
                        const toNode = nodes.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;

                        const isCompletedPath = fromNode.status === 'completed' && (toNode.status === 'completed' || toNode.status === 'next');

                        return (
                            <line
                                key={i}
                                x1={`${fromNode.x}%`}
                                y1={`${fromNode.y}%`}
                                x2={`${toNode.x}%`}
                                y2={`${toNode.y}%`}
                                stroke={isCompletedPath ? '#6c63ff' : '#2a2a3e'}
                                strokeWidth="3"
                                strokeDasharray={isCompletedPath ? "0" : "6 6"}
                                className={isCompletedPath ? "opacity-60 drop-shadow-[0_0_8px_#6c63ff80]" : "opacity-40"}
                            />
                        );
                    })}
                </svg>

                {/* Nodes rendering outside the SVG container to maintain standard DOM stacking */}
                {nodes.map((node) => {
                    const isNext = node.status === 'next';
                    const isLocked = node.status === 'locked';

                    return (
                        <div
                            key={node.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        >
                            <Link href={`/cinema?topic=${encodeURIComponent(node.label)}`} className="group relative block">
                                {/* Pulsing Ring for Next topics */}
                                {isNext && (
                                    <div className="absolute inset-0 rounded-lg animate-ping opacity-60" style={{ background: node.color }} />
                                )}

                                <div
                                    className={`relative z-10 px-4 py-2 rounded-lg flex flex-col items-center justify-center text-xs border-2 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(108,99,255,0.6)] ${node.status === 'completed' ? 'glow-purple shadow-md' :
                                        isNext ? 'shadow-lg -translate-y-1' : 'opacity-50 grayscale hover:grayscale-0 focus:grayscale-0'
                                        }`}
                                    style={{
                                        borderColor: isLocked ? '#2a2a3e' : node.color,
                                        background: isLocked ? '#12121a' : `${node.color}22`,
                                        color: isLocked ? '#8888aa' : node.color
                                    }}
                                >
                                    {/* Icon Badge */}
                                    <div className="absolute -top-3 -right-3 bg-[#0a0a0f] rounded-full border border-[#2a2a3e] p-1 z-20">
                                        {node.status === 'completed' && <Star size={12} className="text-[#ffd700]" fill="#ffd700" />}
                                        {isNext && <ChevronRight size={12} className="text-[#00ff88]" />}
                                        {isLocked && <Lock size={12} className="text-[#8888aa]" />}
                                    </div>
                                    <span className="text-retro font-bold truncate max-w-[100px] text-center">{node.label}</span>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
