import { NextRequest, NextResponse } from 'next/server';
import { getGuildMemberLeaderboard } from '@/lib/services/guildLeaderboardService';

export async function GET(
    request: NextRequest,
    { params }: { params: { guildId: string } }
) {
    const { guildId } = params;

    try {
        const leaderboard = await getGuildMemberLeaderboard(guildId);
        return NextResponse.json({ leaderboard, updatedAt: new Date().toISOString() });
    } catch (error) {
        console.error('Guild member leaderboard error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
