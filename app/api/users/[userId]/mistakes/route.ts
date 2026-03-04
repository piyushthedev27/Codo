import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth().verifyIdToken(token);

        if (decodedToken.uid !== userId && !decodedToken.admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const snapshot = await adminDb()
            .collection('mistakeAnalysis')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const mistakes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ mistakes });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('User mistake list error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
