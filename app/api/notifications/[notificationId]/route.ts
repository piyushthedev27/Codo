import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { deleteNotification } from '@/lib/services/notificationService';

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

// DELETE /api/notifications/[notificationId] — delete a notification (owner only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { notificationId: string } }
) {
    const uid = await verifyRequest(request);
    if (!uid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const deleted = await deleteNotification(uid, params.notificationId);
        if (!deleted) {
            return NextResponse.json(
                { message: 'Notification not found or access denied' },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
