import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { markAsRead } from '@/lib/services/notificationService';

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

// PUT /api/notifications/[notificationId]/read — mark a notification as read
export async function PUT(
    request: NextRequest,
    { params }: { params: { notificationId: string } }
) {
    const uid = await verifyRequest(request);
    if (!uid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const updated = await markAsRead(uid, params.notificationId);
        if (!updated) {
            return NextResponse.json(
                { message: 'Notification not found or access denied' },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
