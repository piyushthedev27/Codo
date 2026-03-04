export default function LeaderboardPage() {
    const global = [
        { rank: 1, name: 'CodeNinja99', xp: '12,450', country: '🇮🇳', streak: 45 },
        { rank: 2, name: 'PixelCoder', xp: '11,230', country: '🇺🇸', streak: 32 },
        { rank: 3, name: 'ByteMaster', xp: '10,890', country: '🇬🇧', streak: 28 },
        { rank: 4, name: 'AlgoQueen', xp: '9,750', country: '🇩🇪', streak: 21 },
        { rank: 5, name: 'DevWanderer', xp: '8,920', country: '🇯🇵', streak: 15 },
    ];
    const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

    return (
        <div className="p-6">
            <h1 className="text-pixel text-2xl text-[#6c63ff] mb-2">🏆 LEADERBOARD</h1>
            <p className="text-mono text-[#8888aa] mb-6">Top coders this week. Keep pushing!</p>

            <div className="bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded overflow-hidden">
                <div className="bg-[#12121a] border-b border-[#2a2a3e] px-4 py-3 grid grid-cols-5 text-retro text-[#8888aa] text-sm">
                    <span>RANK</span><span>PLAYER</span><span>COUNTRY</span><span>XP</span><span>STREAK</span>
                </div>
                {global.map((player) => (
                    <div key={player.rank} className={`px-4 py-4 grid grid-cols-5 items-center hover:bg-[#22223a] transition border-b border-[#2a2a3e] last:border-0 ${player.rank <= 3 ? 'bg-[#6c63ff08]' : ''}`}>
                        <span className="text-2xl">{medals[player.rank] ?? `#${player.rank}`}</span>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#6c63ff] rounded flex items-center justify-center text-white text-xs font-bold">{player.name[0]}</div>
                            <span className="text-retro text-[#e8e8f0]">{player.name}</span>
                        </div>
                        <span className="text-2xl">{player.country}</span>
                        <span className="text-retro text-[#ffd700]">{player.xp} XP</span>
                        <span className="text-retro text-[#ff4d6d]">🔥 {player.streak}d</span>
                    </div>
                ))}
                {/* You */}
                <div className="px-4 py-4 grid grid-cols-5 items-center bg-[#6c63ff22] border-t-2 border-[#6c63ff]">
                    <span className="text-retro text-[#6c63ff]">#?</span>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#6c63ff] rounded flex items-center justify-center text-white text-xs">Y</div>
                        <span className="text-retro text-[#6c63ff]">YOU</span>
                    </div>
                    <span></span>
                    <span className="text-retro text-[#ffd700]">0 XP</span>
                    <span className="text-retro text-[#8888aa]">🔥 0d</span>
                </div>
            </div>
        </div>
    );
}
