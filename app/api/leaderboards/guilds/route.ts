import { NextResponse } from 'next/server';
import { getGlobalGuildLeaderboard } from '@/lib/services/guildLeaderboardService';

export async function GET() {
    try {
        const leaderboard = await getGlobalGuildLeaderboard();
        return NextResponse.json({ leaderboard, updatedAt: new Date().toISOString() });
    } catch (error) {
        console.error('Guild leaderboard error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
