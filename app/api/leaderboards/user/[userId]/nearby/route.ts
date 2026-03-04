import { NextRequest, NextResponse } from 'next/server';
import { getUserNearby } from '@/lib/services/leaderboardService';

export async function GET(
    _req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const result = await getUserNearby(userId);
        return NextResponse.json({
            userId,
            ...result,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Nearby competitors error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
