import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getChallenge, updateChallenge, deleteChallenge } from '@/lib/services/challengeService';

// Extract challenge ID from the URL path since Next.js app router params approach can be sometimes tricky with raw requests
function extractIdFromUrl(url: string): string | null {
    const parts = url.split('/');
    const index = parts.indexOf('challenges');
    if (index !== -1 && index + 1 < parts.length) {
        // Handle query params attached to the id (e.g., id?foo=bar)
        return parts[index + 1].split('?')[0];
    }
    return null;
}

export async function GET(request: NextRequest) {
    try {
        const challengeId = extractIdFromUrl(request.url);
        if (!challengeId) return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });

        const challenge = await getChallenge(challengeId);
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        return NextResponse.json(challenge);
    } catch (error: unknown) {
        console.error('Get challenge error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function verifyAdminAccess(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
    }

    const token = authHeader.split('Bearer ')[1];
    return await adminAuth().verifyIdToken(token);
}

export async function PUT(request: NextRequest) {
    try {
        await verifyAdminAccess(request);

        const challengeId = extractIdFromUrl(request.url);
        if (!challengeId) return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });

        const body = await request.json();
        await updateChallenge(challengeId, body);

        return NextResponse.json({ message: 'Challenge updated successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        console.error('Update challenge error:', error);
        if (message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await verifyAdminAccess(request);

        const challengeId = extractIdFromUrl(request.url);
        if (!challengeId) return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });

        await deleteChallenge(challengeId);

        return NextResponse.json({ message: 'Challenge deleted successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        console.error('Delete challenge error:', error);
        if (message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
