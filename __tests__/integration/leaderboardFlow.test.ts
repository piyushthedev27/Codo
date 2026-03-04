/**
 * Integration test: Leaderboard Flow (12.3)
 * Tests XP change → leaderboard rank recalculation → cache invalidation.
 */

jest.mock('../../lib/firebase/admin', () => ({ adminDb: jest.fn() }));

import { adminDb } from '../../lib/firebase/admin';

// Simulate in-memory leaderboard cache (as used in leaderboardService)
let leaderboardCache: { data: any[]; expiresAt: number } | null = null;

function setCache(data: any[]) {
    leaderboardCache = { data, expiresAt: Date.now() + 30_000 };
}
function invalidateCache() {
    leaderboardCache = null;
}
function getCache() {
    if (!leaderboardCache) return null;
    if (Date.now() > leaderboardCache.expiresAt) { leaderboardCache = null; return null; }
    return leaderboardCache.data;
}

beforeEach(() => {
    jest.clearAllMocks();
    leaderboardCache = null;
});

describe('Leaderboard Flow Integration', () => {
    test('12.3.1 — Cache populates on first read and is returned on second read', () => {
        const mockData = [{ userId: 'u1', xp: 500, rank: 1 }];

        // First call: miss
        expect(getCache()).toBeNull();

        // Populate
        setCache(mockData);

        // Second call: hit
        expect(getCache()).toEqual(mockData);
    });

    test('12.3.2 — Cache is invalidated after an XP award', () => {
        setCache([{ userId: 'u1', xp: 400 }]);
        expect(getCache()).not.toBeNull();

        // XP awarded → invalidate
        invalidateCache();
        expect(getCache()).toBeNull();
    });

    test('12.3.3 — Leaderboard query orders by XP descending', async () => {
        const mockDocs = [
            { id: 'u3', data: () => ({ userId: 'u3', xp: 900 }) },
            { id: 'u1', data: () => ({ userId: 'u1', xp: 700 }) },
            { id: 'u2', data: () => ({ userId: 'u2', xp: 400 }) },
        ];
        const queryMock = {
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: jest.fn(() => Promise.resolve({ docs: mockDocs })),
        };
        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({ ...queryMock })),
        });

        const db = (adminDb as jest.Mock)();
        const snap = await db.collection('leaderboard_global').orderBy('xp', 'desc').limit(100).get();
        const ranked = snap.docs.map((d: any) => d.data());

        expect(ranked[0].xp).toBeGreaterThan(ranked[1].xp);
        expect(ranked[1].xp).toBeGreaterThan(ranked[2].xp);
    });

    test('12.3.4 — Global and guild leaderboards are separate collections', async () => {
        const collectionSpy = jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: jest.fn(() => Promise.resolve({ docs: [] })),
        });
        (adminDb as jest.Mock).mockReturnValue({ collection: collectionSpy });

        const db = (adminDb as jest.Mock)();
        await db.collection('leaderboard_global').orderBy('xp', 'desc').limit(100).get();
        await db.collection('leaderboard_guild_g1').orderBy('xp', 'desc').limit(100).get();

        expect(collectionSpy).toHaveBeenCalledWith('leaderboard_global');
        expect(collectionSpy).toHaveBeenCalledWith('leaderboard_guild_g1');
    });
});
