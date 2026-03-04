import { NextResponse } from 'next/server';
import { getGlobalLeaderboard } from '@/lib/services/leaderboardService';

export async function GET() {
    try {
        const leaderboard = await getGlobalLeaderboard();
        return NextResponse.json({ leaderboard, updatedAt: new Date().toISOString() });
    } catch (error) {
        console.error('Global leaderboard error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
