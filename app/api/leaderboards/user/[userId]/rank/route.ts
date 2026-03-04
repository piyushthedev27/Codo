import { NextRequest, NextResponse } from 'next/server';
import { getUserRank } from '@/lib/services/leaderboardService';

export async function GET(
    _req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const result = await getUserRank(userId);
        return NextResponse.json({
            ...result,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('User rank error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
