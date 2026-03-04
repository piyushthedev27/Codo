import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getNotifications } from '@/lib/services/notificationService';

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

// GET /api/notifications — list all notifications for authenticated user
export async function GET(request: NextRequest) {
    const uid = await verifyRequest(request);
    if (!uid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));

        const notifications = await getNotifications(uid, limit);
        return NextResponse.json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
