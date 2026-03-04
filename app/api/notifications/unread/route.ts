import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getUnreadNotifications } from '@/lib/services/notificationService';

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

// GET /api/notifications/unread — list unread notifications for authenticated user
export async function GET(request: NextRequest) {
    const uid = await verifyRequest(request);
    if (!uid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const notifications = await getUnreadNotifications(uid);
        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount: notifications.length,
        });
    } catch (error) {
        console.error('Get unread notifications error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
