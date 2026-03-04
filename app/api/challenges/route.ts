import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const difficulty = searchParams.get('difficulty');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') ?? '20');
        const db = adminDb();

        let query: FirebaseFirestore.Query = db.collection('challenges');
        if (difficulty) query = query.where('difficulty', '==', difficulty);
        if (category) query = query.where('category', '==', category);
        query = query.limit(Math.min(limit, 100));

        const snapshot = await query.get();
        const challenges = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ challenges, total: challenges.length });
    } catch (error) {
        console.error('List challenges error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { adminAuth } = await import('@/lib/firebase/admin');
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth().verifyIdToken(token);
        } catch {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        // Ideally, check if user is an admin here. For now, we trust the token or add custom claims checks.
        // if (!decodedToken.admin) return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

        const body = await request.json();

        // Basic validation
        if (!body.title || !body.description || !body.difficulty) {
            return NextResponse.json({ error: 'Missing required configuration for challenge' }, { status: 400 });
        }

        const { createChallenge } = await import('@/lib/services/challengeService');
        const challengeId = await createChallenge({
            ...body,
            createdBy: decodedToken.uid
        });

        return NextResponse.json({ id: challengeId, message: 'Challenge created successfully' }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Create challenge error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
    }
}
