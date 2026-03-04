import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decoded = await adminAuth().verifyIdToken(idToken);
        return NextResponse.json({ uid: decoded.uid, email: decoded.email, valid: true });
    } catch {
        return NextResponse.json({ message: 'Invalid or expired token', valid: false }, { status: 401 });
    }
}
