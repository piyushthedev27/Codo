import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

async function verifyRequest(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
        const decoded = await adminAuth().verifyIdToken(authHeader.split('Bearer ')[1]);
        return decoded.uid;
    } catch {
        return null;
    }
}

export async function GET(_request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const doc = await adminDb().collection('users').doc(params.userId).get();
        if (!doc.exists) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const data = doc.data()!;
        const publicData = { ...data };
        delete (publicData as Record<string, unknown>).email;
        return NextResponse.json(publicData);
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
    const uid = await verifyRequest(request);
    if (!uid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (uid !== params.userId) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    try {
        const body = await request.json();
        const allowedFields = ['displayName', 'bio', 'isPublic', 'avatarUrl'];
        const update: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) update[key] = body[key];
        }
        await adminDb().collection('users').doc(params.userId).update(update);
        return NextResponse.json({ message: 'Profile updated', ...update });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
