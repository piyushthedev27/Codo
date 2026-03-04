import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getInvitations, createInvitation } from '@/lib/services/guildService';

export async function GET(req: NextRequest, { params }: { params: { guildId: string } }) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = await adminAuth().verifyIdToken(authHeader.split('Bearer ')[1]);

        const invitations = await getInvitations(params.guildId, token.uid);
        return NextResponse.json({ invitations });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Get guild invitations error:', error);
        return NextResponse.json({ error: message }, { status: 403 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = await adminAuth().verifyIdToken(authHeader.split('Bearer ')[1]);

        const body = await req.json();
        if (!body.inviteeEmail) return NextResponse.json({ error: 'inviteeEmail required' }, { status: 400 });

        const invitationId = await createInvitation(params.guildId, body.inviteeEmail, token.uid);
        return NextResponse.json({ invitationId }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Create guild invitation error:', error);
        return NextResponse.json({ error: message }, { status: 403 });
    }
}
