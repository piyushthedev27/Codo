import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getGuild, updateGuild, deleteGuild } from '@/lib/services/guildService';

export async function GET(_req: NextRequest, { params }: { params: { guildId: string } }) {
    try {
        const guild = await getGuild(params.guildId);
        if (!guild) return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
        return NextResponse.json({ guild });
    } catch (error: unknown) {
        console.error('Get guild error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { guildId: string } }) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = await adminAuth().verifyIdToken(authHeader.split('Bearer ')[1]);

        const body = await req.json();
        await updateGuild(params.guildId, body, token.uid);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        console.error('Update guild error:', error);
        return NextResponse.json({ error: message }, { status: message?.includes('Only the guild owner') ? 403 : 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { guildId: string } }) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = await adminAuth().verifyIdToken(authHeader.split('Bearer ')[1]);

        await deleteGuild(params.guildId, token.uid);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        console.error('Delete guild error:', error);
        return NextResponse.json({ error: message }, { status: message?.includes('Only the guild owner') ? 403 : 400 });
    }
}
