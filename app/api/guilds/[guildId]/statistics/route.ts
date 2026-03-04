import { NextRequest, NextResponse } from 'next/server';
import { getGuildStatistics } from '@/lib/services/guildLeaderboardService';

export async function GET(
    request: NextRequest,
    { params }: { params: { guildId: string } }
) {
    const { guildId } = params;

    try {
        const statistics = await getGuildStatistics(guildId);
        if (!statistics) {
            return NextResponse.json({ message: 'Guild not found' }, { status: 404 });
        }
        return NextResponse.json({ statistics, updatedAt: new Date().toISOString() });
    } catch (error) {
        console.error('Guild statistics error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
