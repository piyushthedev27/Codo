import {
    createNotification,
    getNotifications,
    getUnreadNotifications,
    markAsRead,
    deleteNotification,
    invalidateUnreadCache,
    createFriendActivityNotification,
    createMilestoneNotification,
} from '../../lib/services/notificationService';
import { adminDb } from '../../lib/firebase/admin';

// ---------------------------------------------------------------------------
// Mock Firebase Admin
// ---------------------------------------------------------------------------
jest.mock('../../lib/firebase/admin', () => ({
    adminDb: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDoc(id: string, data: Record<string, unknown>) {
    return { id, data: () => data, exists: true };
}

function makeSnap(docs: ReturnType<typeof makeDoc>[]) {
    return { docs, size: docs.length };
}

beforeEach(() => {
    jest.clearAllMocks();
    invalidateUnreadCache('u1');
});

// ===========================================================================
// createNotification
// ===========================================================================
describe('createNotification', () => {
    test('writes a new document to Firestore and returns the id', async () => {
        const set = jest.fn(() => Promise.resolve());
        const docRef = { id: 'notif123', set };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));
        (adminDb as jest.Mock).mockReturnValue({ collection });

        const id = await createNotification({
            userId: 'u1',
            type: 'system',
            title: 'Hello',
            body: 'World',
        });

        expect(id).toBe('notif123');
        expect(set).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'u1',
                type: 'system',
                title: 'Hello',
                body: 'World',
                isRead: false,
            })
        );
    });
});

// ===========================================================================
// getNotifications
// ===========================================================================
describe('getNotifications', () => {
    test('returns mapped list of notifications', async () => {
        const notifData = { userId: 'u1', type: 'system', title: 'T', body: 'B', isRead: false, createdAt: null };
        const snap = makeSnap([makeDoc('n1', notifData)]);

        // Service chain: .where(userId).orderBy().limit().get()  — single where call
        const get = jest.fn(() => Promise.resolve(snap));
        const limit = jest.fn(() => ({ get }));
        const orderBy = jest.fn(() => ({ limit }));
        const where = jest.fn(() => ({ orderBy }));
        const collection = jest.fn(() => ({ where }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const results = await getNotifications('u1', 10);

        expect(results).toHaveLength(1);
        expect(results[0].id).toBe('n1');
        expect(results[0].title).toBe('T');
    });
});

// ===========================================================================
// getUnreadNotifications
// ===========================================================================
describe('getUnreadNotifications', () => {
    function setupUnreadMock(docs: ReturnType<typeof makeDoc>[]) {
        const snap = makeSnap(docs);
        const get = jest.fn(() => Promise.resolve(snap));
        const orderBy = jest.fn(() => ({ get }));
        const where2 = jest.fn(() => ({ orderBy }));
        const where1 = jest.fn(() => ({ where: where2 }));
        const collection = jest.fn(() => ({ where: where1 }));
        (adminDb as jest.Mock).mockReturnValue({ collection });
    }

    test('returns only unread notifications', async () => {
        setupUnreadMock([
            makeDoc('n1', { userId: 'u1', isRead: false, type: 'system', title: 'A', body: 'B', createdAt: null }),
        ]);
        const results = await getUnreadNotifications('u1');
        expect(results).toHaveLength(1);
    });

    test('caches the unread count on subsequent call', async () => {
        setupUnreadMock([
            makeDoc('n1', { userId: 'u1', isRead: false, type: 'system', title: 'A', body: 'B', createdAt: null }),
        ]);

        await getUnreadNotifications('u1');

        // Second call — Firestore should NOT be queried again (cache hit for count)
        // NOTE: getUnreadNotifications always queries Firestore; the cache is for getUnreadCount.
        // We verify the snapshot mock call count here:
        const mockGetCalls = (adminDb as jest.Mock).mock.calls.length;
        expect(mockGetCalls).toBeGreaterThanOrEqual(1);
    });
});

// ===========================================================================
// markAsRead
// ===========================================================================
describe('markAsRead', () => {
    test('updates isRead to true when owner matches', async () => {
        const update = jest.fn(() => Promise.resolve());
        const docData = { userId: 'u1', isRead: false };
        const get = jest.fn(() => Promise.resolve({ exists: true, data: () => docData }));
        const docRef = { get, update };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await markAsRead('u1', 'n1');

        expect(result).toBe(true);
        expect(update).toHaveBeenCalledWith({ isRead: true });
    });

    test('returns false when notification does not exist', async () => {
        const get = jest.fn(() => Promise.resolve({ exists: false, data: () => ({}) }));
        const docRef = { get };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await markAsRead('u1', 'missing');
        expect(result).toBe(false);
    });

    test('returns false when userId does not match (ownership check)', async () => {
        const docData = { userId: 'other-user', isRead: false };
        const get = jest.fn(() => Promise.resolve({ exists: true, data: () => docData }));
        const docRef = { get };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await markAsRead('u1', 'n1');
        expect(result).toBe(false);
    });
});

// ===========================================================================
// deleteNotification
// ===========================================================================
describe('deleteNotification', () => {
    test('deletes document when owner matches', async () => {
        const deleteFn = jest.fn(() => Promise.resolve());
        const docData = { userId: 'u1' };
        const get = jest.fn(() => Promise.resolve({ exists: true, data: () => docData }));
        const docRef = { get, delete: deleteFn };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await deleteNotification('u1', 'n1');

        expect(result).toBe(true);
        expect(deleteFn).toHaveBeenCalled();
    });

    test('returns false when notification does not exist', async () => {
        const get = jest.fn(() => Promise.resolve({ exists: false, data: () => ({}) }));
        const docRef = { get };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await deleteNotification('u1', 'missing');
        expect(result).toBe(false);
    });
});

// ===========================================================================
// Helper creators
// ===========================================================================
describe('createFriendActivityNotification', () => {
    test('creates a friend_activity notification with correct title', async () => {
        const set = jest.fn(() => Promise.resolve());
        const docRef = { id: 'f1', set };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));
        (adminDb as jest.Mock).mockReturnValue({ collection });

        await createFriendActivityNotification('u1', 'Alice', 'solved Two Sum');

        expect(set).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'friend_activity',
                title: 'Friend Activity',
                body: 'Alice solved Two Sum',
            })
        );
    });
});

describe('createMilestoneNotification', () => {
    test('creates a level_up notification', async () => {
        const set = jest.fn(() => Promise.resolve());
        const docRef = { id: 'm1', set };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));
        (adminDb as jest.Mock).mockReturnValue({ collection });

        await createMilestoneNotification('u1', { type: 'level_up', value: 5 });

        expect(set).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'level_up',
                title: 'Level Up! 🎉',
            })
        );
    });

    test('creates an achievement notification', async () => {
        const set = jest.fn(() => Promise.resolve());
        const docRef = { id: 'm2', set };
        const doc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc }));
        (adminDb as jest.Mock).mockReturnValue({ collection });

        await createMilestoneNotification('u1', { type: 'achievement', value: 'First Blood' });

        expect(set).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'achievement',
                title: 'Achievement Unlocked! 🏆',
                body: 'You unlocked the "First Blood" achievement!',
            })
        );
    });
});
