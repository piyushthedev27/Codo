import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { acceptInvitation } from '@/lib/services/guildService';

export async function POST(
    req: NextRequest,
    { params }: { params: { guildId: string; invitationId: string } }
) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = await adminAuth().verifyIdToken(authHeader.split('Bearer ')[1]);

        await acceptInvitation(params.invitationId, token.uid);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Accept guild invitation error:', error);
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
