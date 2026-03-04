import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getGuildMembers, joinGuild } from '@/lib/services/guildService';

export async function GET(_req: NextRequest, { params }: { params: { guildId: string } }) {
    try {
        const members = await getGuildMembers(params.guildId);
        return NextResponse.json({ members });
    } catch (error: unknown) {
        console.error('Get guild members error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = await adminAuth().verifyIdToken(authHeader.split('Bearer ')[1]);

        await joinGuild(params.guildId, token.uid);
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        console.error('Join guild error:', error);
        return NextResponse.json(
            { error: message },
            { status: message?.includes('invitation') ? 403 : 400 }
        );
    }
}
