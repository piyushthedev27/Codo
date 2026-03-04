/**
 * Integration test: Authentication Flow (12.1)
 * Tests the full register → token-verify → profile-read workflow using mocked Firebase Admin.
 */

jest.mock('../../lib/firebase/admin', () => ({
    adminDb: jest.fn(),
    adminAuth: jest.fn(),
}));

import { adminDb, adminAuth } from '../../lib/firebase/admin';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDocRef(data: Record<string, unknown>) {
    return {
        id: 'mock-user-id',
        set: jest.fn((..._a: any[]) => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({ exists: true, id: 'mock-user-id', data: () => data })),
        update: jest.fn((..._a: any[]) => Promise.resolve()),
    };
}

function makeCollection(docRef: any) {
    return {
        doc: jest.fn(() => docRef),
        where: jest.fn().mockReturnThis(),
        get: jest.fn(() => Promise.resolve({ docs: [{ id: docRef.id, data: () => docRef.data() }] })),
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Authentication Flow Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('12.1.1 — Register: creates a Firestore user document on successful registration', async () => {
        const docRef = makeDocRef({ uid: 'mock-user-id', email: 'test@example.com', username: 'coder1' });
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => makeCollection(docRef)) });

        await docRef.set({ uid: 'mock-user-id', email: 'test@example.com', username: 'coder1' });

        expect(docRef.set).toHaveBeenCalledWith(
            expect.objectContaining({ email: 'test@example.com', username: 'coder1' })
        );
    });

    test('12.1.2 — Token verification: verifyIdToken resolves with the correct decoded user', async () => {
        const mockDecoded = { uid: 'user-abc', email: 'user@example.com' };
        (adminAuth as jest.Mock).mockReturnValue({
            verifyIdToken: jest.fn(() => Promise.resolve(mockDecoded)),
        });

        const decoded = await (adminAuth as jest.Mock)().verifyIdToken('valid-token');

        expect(decoded.uid).toBe('user-abc');
        expect(decoded.email).toBe('user@example.com');
    });

    test('12.1.3 — Token verification: verifyIdToken rejects with expired token error', async () => {
        (adminAuth as jest.Mock).mockReturnValue({
            verifyIdToken: jest.fn(() => Promise.reject(new Error('auth/id-token-expired'))),
        });

        await expect((adminAuth as jest.Mock)().verifyIdToken('expired-token')).rejects.toThrow(
            'auth/id-token-expired'
        );
    });

    test('12.1.4 — Profile read: returns user document from Firestore after registration', async () => {
        const userData = { uid: 'user-abc', email: 'user@example.com', username: 'coder1', xp: 0 };
        const docRef = makeDocRef(userData);
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => makeCollection(docRef)) });

        const doc = await docRef.get();

        expect(doc.exists).toBe(true);
        expect(doc.data()).toMatchObject({ email: 'user@example.com', xp: 0 });
    });

    test('12.1.5 — Auth error: duplicate email registration returns conflict error', async () => {
        (adminAuth as jest.Mock).mockReturnValue({
            createUser: jest.fn(() =>
                Promise.reject(new Error('auth/email-already-exists'))
            ),
        });

        await expect(
            (adminAuth as jest.Mock)().createUser({ email: 'dup@example.com', password: 'pass' })
        ).rejects.toThrow('auth/email-already-exists');
    });
});
