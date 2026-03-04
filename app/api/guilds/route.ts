import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { createGuild } from '@/lib/services/guildService';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth().verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await req.json();
        const { name, description, isPublic } = body;

        if (!name || typeof isPublic !== 'boolean') {
            return NextResponse.json({ error: 'Missing required fields: name, isPublic' }, { status: 400 });
        }

        const guildId = await createGuild({ name, description: description || '', isPublic }, userId);
        return NextResponse.json({ guildId }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Create guild error:', error);
        return NextResponse.json(
            { error: message },
            { status: message?.includes('already exists') ? 409 : 500 }
        );
    }
}
