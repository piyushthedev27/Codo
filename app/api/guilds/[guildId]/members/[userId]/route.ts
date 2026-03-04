import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { removeMember } from '@/lib/services/guildService';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { guildId: string; userId: string } }
) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = await adminAuth().verifyIdToken(authHeader.split('Bearer ')[1]);

        await removeMember(params.guildId, params.userId, token.uid);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        console.error('Remove guild member error:', error);
        return NextResponse.json(
            { error: message },
            { status: message?.includes('Only the guild owner') ? 403 : 400 }
        );
    }
}
