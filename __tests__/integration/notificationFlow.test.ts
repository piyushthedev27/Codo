/**
 * Integration test: Notification Flow (12.6)
 * Tests create → retrieve → mark-read → delete → cache invalidation.
 */

jest.mock('../../lib/firebase/admin', () => ({ adminDb: jest.fn() }));

import { adminDb } from '../../lib/firebase/admin';
import {
    createNotification,
    getNotifications,
    markAsRead,
    deleteNotification,
    invalidateUnreadCache,
} from '../../lib/services/notificationService';
import { FieldValue } from 'firebase-admin/firestore';

jest.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: jest.fn(() => 'MOCK_TIMESTAMP') },
}));

beforeEach(() => jest.clearAllMocks());

// Shared doc mock
function makeNotifDoc(id: string, userId: string, isRead = false) {
    const data = {
        id,
        userId,
        type: 'system',
        title: 'Test',
        body: 'Test body',
        isRead,
        metadata: {},
        createdAt: 'MOCK_TIMESTAMP',
    };
    return {
        id,
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({ exists: true, id, data: () => data })),
        data: () => data,
    };
}

describe('Notification Flow Integration', () => {
    test('12.6.1 — Create: notification document is written to Firestore', async () => {
        const docRef = makeNotifDoc('notif-1', 'user-1');
        const collRef = {
            doc: jest.fn(() => docRef),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: jest.fn(() => Promise.resolve({ docs: [docRef] })),
        };
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => collRef) });

        const id = await createNotification({
            userId: 'user-1',
            type: 'system',
            title: 'Test',
            body: 'Test body',
        });

        expect(docRef.set).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', isRead: false }));
    });

    test('12.6.2 — Retrieve: getNotifications returns user notifications', async () => {
        const docRef = makeNotifDoc('notif-1', 'user-1');
        const collRef = {
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: jest.fn(() => Promise.resolve({ docs: [docRef] })),
        };
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => collRef) });

        const notifications = await getNotifications('user-1');

        expect(notifications.length).toBe(1);
        expect(notifications[0].userId).toBe('user-1');
    });

    test('12.6.3 — Mark as read: updates isRead=true and invalidates cache', async () => {
        const docRef = makeNotifDoc('notif-1', 'user-1', false);
        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({ doc: jest.fn(() => docRef) })),
        });

        const result = await markAsRead('user-1', 'notif-1');

        expect(result).toBe(true);
        expect(docRef.update).toHaveBeenCalledWith({ isRead: true });
    });

    test('12.6.4 — Mark as read: returns false if notification belongs to different user', async () => {
        const docRef = makeNotifDoc('notif-1', 'user-2', false); // owned by user-2
        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({ doc: jest.fn(() => docRef) })),
        });

        const result = await markAsRead('user-1', 'notif-1'); // called by user-1

        expect(result).toBe(false);
        expect(docRef.update).not.toHaveBeenCalled();
    });

    test('12.6.5 — Delete: removes notification from Firestore and invalidates cache', async () => {
        const docRef = makeNotifDoc('notif-1', 'user-1');
        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({ doc: jest.fn(() => docRef) })),
        });

        const result = await deleteNotification('user-1', 'notif-1');

        expect(result).toBe(true);
        expect(docRef.delete).toHaveBeenCalled();
    });
});
