import {
    calculateLevel,
    getUserStats,
    getUserDashboardData,
    updateUserStats,
    invalidateStatsCache,
} from '../../lib/services/progressService';
import { adminDb } from '../../lib/firebase/admin';

// ---------------------------------------------------------------------------
// Mock Firebase Admin
// ---------------------------------------------------------------------------
jest.mock('../../lib/firebase/admin', () => ({
    adminDb: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
    jest.clearAllMocks();
    invalidateStatsCache('u1');
});

// ===========================================================================
// Level Calculation
// ===========================================================================
describe('calculateLevel', () => {
    test('returns level 1 for low XP', () => {
        expect(calculateLevel(50)).toBe(1);
    });

    test('returns level 2 for 100 XP', () => {
        expect(calculateLevel(100)).toBe(2);
    });

    test('returns level 3 for higher XP', () => {
        // Base(100) + Base*1.2(120) = 220
        expect(calculateLevel(220)).toBe(3);
    });
});

// ===========================================================================
// Stats Retrieval
// ===========================================================================
describe('getUserStats', () => {
    test('returns stats from Firestore', async () => {
        const userData = {
            level: 5,
            experiencePoints: 1000,
            totalChallengesSolved: 20,
            successRate: 80,
            averageSolveTime: 500,
            updatedAt: { seconds: 12345678 }
        };
        const userGet = jest.fn(() => Promise.resolve({ exists: true, data: () => userData }));
        const userDoc = jest.fn(() => ({ get: userGet }));
        const collection = jest.fn(() => ({ doc: userDoc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const stats = await getUserStats('u1');

        expect(stats).not.toBeNull();
        expect(stats?.level).toBe(5);
        expect(userGet).toHaveBeenCalledTimes(1);
    });

    test('cache: consecutive calls hit cache', async () => {
        const userData = { level: 1 };
        const userGet = jest.fn(() => Promise.resolve({ exists: true, data: () => userData }));
        const userDoc = jest.fn(() => ({ get: userGet }));
        const collection = jest.fn(() => ({ doc: userDoc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        await getUserStats('u1');
        await getUserStats('u1');

        expect(userGet).toHaveBeenCalledTimes(1);
    });
});

// ===========================================================================
// Stats Update
// ===========================================================================
describe('updateUserStats', () => {
    test('updates stats in a transaction', async () => {
        const userData = {
            totalChallengesSolved: 10,
            totalAttempts: 20,
            averageSolveTime: 100,
            experiencePoints: 50
        };

        const userRef = { id: 'u1' };
        const userDoc = { exists: true, data: () => userData };

        const transaction = {
            get: jest.fn(() => Promise.resolve(userDoc)),
            update: jest.fn()
        };

        const runTransaction = jest.fn((cb) => cb(transaction));
        const doc = jest.fn(() => userRef);
        const collection = jest.fn(() => ({ doc }));

        (adminDb as jest.Mock).mockReturnValue({ collection, runTransaction });

        await updateUserStats('u1', true, 200);

        expect(runTransaction).toHaveBeenCalled();
        expect(transaction.update).toHaveBeenCalled();

        const updates = transaction.update.mock.calls[0][1];
        expect(updates.totalChallengesSolved).toBe(11);
        expect(updates.totalAttempts).toBe(21);
        expect(updates.averageSolveTime).toBe(109); // (100*10 + 200) / 11 = 1200/11 approx 109
        expect(updates.experiencePoints).toBe(100); // 50 + 50
        expect(updates.level).toBe(2); // XP 100 is level 2
    });
});
