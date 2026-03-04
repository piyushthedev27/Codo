import { NextRequest, NextResponse } from 'next/server';
import { getChallengeLeaderboard } from '@/lib/services/leaderboardService';

export async function GET(
    _req: NextRequest,
    { params }: { params: { challengeId: string } }
) {
    const { challengeId } = params;

    if (!challengeId) {
        return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
    }

    try {
        const leaderboard = await getChallengeLeaderboard(challengeId);
        return NextResponse.json({
            leaderboard,
            challengeId,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Challenge leaderboard error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
