import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getUserSubmissions } from '@/lib/services/submissionService';

function extractUserIdFromUrl(url: string): string | null {
    const parts = url.split('/');
    const userIndex = parts.indexOf('user');
    if (userIndex !== -1 && userIndex + 1 < parts.length) {
        return parts[userIndex + 1].split('?')[0];
    }
    return null;
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        try {
            await adminAuth().verifyIdToken(token);
        } catch {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        const userId = extractUserIdFromUrl(request.url);
        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        // Ensure user can only request their own history or must be admin
        // if (userId !== decodedToken.uid && !decodedToken.admin) {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const { searchParams } = new URL(request.url);
        const challengeId = searchParams.get('challengeId') || undefined;
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const submissions = await getUserSubmissions(userId, limit, challengeId);

        return NextResponse.json({ submissions, total: submissions.length });
    } catch (error: unknown) {
        console.error('Get user submissions error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
