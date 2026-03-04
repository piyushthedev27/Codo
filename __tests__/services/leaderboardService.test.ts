import {
    getGlobalLeaderboard,
    getChallengeLeaderboard,
    getUserRank,
    getUserNearby,
    invalidateLeaderboardCache,
    GlobalLeaderboardEntry,
} from '../../lib/services/leaderboardService';
import { adminDb } from '../../lib/firebase/admin';
import fc from 'fast-check';

// ---------------------------------------------------------------------------
// Mock Firebase Admin
// ---------------------------------------------------------------------------
jest.mock('../../lib/firebase/admin', () => ({
    adminDb: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers to build mock Firestore query chains
// ---------------------------------------------------------------------------
function buildQueryChain(docs: any[]) {
    const snapshot = { docs: docs.map(d => ({ id: d.uid ?? d.userId, data: () => d })) };
    const get = jest.fn(() => Promise.resolve(snapshot));
    const limit = jest.fn(() => ({ get }));
    const orderBy2 = jest.fn(() => ({ limit, get }));
    const orderBy1 = jest.fn(() => ({ orderBy: orderBy2, limit, get }));
    const where2 = jest.fn(() => ({ orderBy: orderBy1, get }));
    const where1 = jest.fn(() => ({ where: where2, orderBy: orderBy1, get }));
    const collection = jest.fn(() => ({ orderBy: orderBy1, where: where1, get }));
    return { collection, get, snapshot };
}

// ---------------------------------------------------------------------------
// Reset module-level cache between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
    jest.clearAllMocks();
    invalidateLeaderboardCache(); // clear shared in-memory cache
});

// ===========================================================================
// Global Leaderboard
// ===========================================================================
describe('getGlobalLeaderboard', () => {
    test('Property 28: ranking is monotonically non-increasing by challengesSolved', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(
                    fc.record({
                        uid: fc.uuid(),
                        username: fc.string(),
                        displayName: fc.string(),
                        challengesSolved: fc.nat({ max: 500 }),
                        avgExecutionTime: fc.nat({ max: 5000 }),
                        xp: fc.nat(),
                        level: fc.nat({ max: 100 }),
                    }),
                    { minLength: 1, maxLength: 50 }
                ),
                async (users) => {
                    invalidateLeaderboardCache();

                    // Sort the way Firestore would (challengesSolved desc, avgExecutionTime asc)
                    const sorted = [...users].sort((a, b) =>
                        b.challengesSolved !== a.challengesSolved
                            ? b.challengesSolved - a.challengesSolved
                            : a.avgExecutionTime - b.avgExecutionTime
                    );

                    const { collection } = buildQueryChain(sorted);
                    (adminDb as jest.Mock).mockReturnValue({ collection });

                    const result = await getGlobalLeaderboard();

                    // Ranks must be assigned 1..N
                    expect(result.map(e => e.rank)).toEqual(
                        Array.from({ length: result.length }, (_, i) => i + 1)
                    );

                    // challengesSolved must be non-increasing
                    for (let i = 1; i < result.length; i++) {
                        expect(result[i].challengesSolved).toBeLessThanOrEqual(
                            result[i - 1].challengesSolved
                        );
                    }
                }
            ),
            { numRuns: 50 }
        );
    });

    test('returns empty array when no users exist', async () => {
        const { collection } = buildQueryChain([]);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await getGlobalLeaderboard();
        expect(result).toEqual([]);
    });

    test('cache: second call within TTL does not re-query Firestore', async () => {
        const users = [
            { uid: 'u1', username: 'Alice', displayName: 'Alice', challengesSolved: 10, avgExecutionTime: 100, xp: 500, level: 3 },
        ];
        const { collection, get } = buildQueryChain(users);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        await getGlobalLeaderboard();
        await getGlobalLeaderboard(); // second call — should be cached

        // Firestore .get() should only have been invoked once
        expect(get).toHaveBeenCalledTimes(1);
    });

    test('invalidateLeaderboardCache: forces re-fetch on next call', async () => {
        const users = [
            { uid: 'u1', username: 'Alice', displayName: 'Alice', challengesSolved: 5, avgExecutionTime: 200, xp: 200, level: 2 },
        ];
        const { collection, get } = buildQueryChain(users);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        await getGlobalLeaderboard();
        invalidateLeaderboardCache();
        await getGlobalLeaderboard(); // should hit Firestore again

        expect(get).toHaveBeenCalledTimes(2);
    });
});

// ===========================================================================
// Challenge Leaderboard
// ===========================================================================
describe('getChallengeLeaderboard', () => {
    test('Property 29: challenge leaderboard ordered by bestTime ascending', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(
                    fc.record({
                        userId: fc.uuid(),
                        username: fc.string(),
                        displayName: fc.string(),
                        executionTime: fc.nat({ max: 5000 }),
                        createdAt: fc.constant(null),
                    }),
                    { minLength: 1, maxLength: 30 }
                ),
                async (submissions) => {
                    invalidateLeaderboardCache();

                    // De-duplicate by userId keeping first (lowest time already ordered)
                    const seen = new Set<string>();
                    const unique = submissions.filter(s => {
                        if (seen.has(s.userId)) return false;
                        seen.add(s.userId);
                        return true;
                    });

                    const sortedSubs = [...unique].sort((a, b) => a.executionTime - b.executionTime);

                    // Mock submissions query
                    const subSnapshot = {
                        docs: sortedSubs.map(s => ({
                            id: `sub-${s.userId}`,
                            data: () => ({ ...s, status: 'success', challengeId: 'c1' }),
                        })),
                    };
                    const subGet = jest.fn(() => Promise.resolve(subSnapshot));
                    const subOrderBy = jest.fn(() => ({ get: subGet }));
                    const subWhere2 = jest.fn(() => ({ orderBy: subOrderBy }));
                    const subWhere1 = jest.fn(() => ({ where: subWhere2 }));

                    // Mock users enrichment query
                    const userSnapshot = {
                        docs: sortedSubs.map(s => ({
                            id: s.userId,
                            data: () => ({ username: s.username, displayName: s.displayName }),
                        })),
                    };
                    const userGet = jest.fn(() => Promise.resolve(userSnapshot));
                    const userWhere2 = jest.fn(() => ({ get: userGet }));
                    const userCollection = jest.fn((name: string) => {
                        if (name === 'submissions') return { where: subWhere1 };
                        return { where: userWhere2 }; // users
                    });
                    (adminDb as jest.Mock).mockReturnValue({ collection: userCollection });

                    const result = await getChallengeLeaderboard('c1');

                    // Ranks must start at 1
                    if (result.length > 0) expect(result[0].rank).toBe(1);

                    // bestTime must be non-decreasing
                    for (let i = 1; i < result.length; i++) {
                        expect(result[i].bestTime).toBeGreaterThanOrEqual(result[i - 1].bestTime);
                    }
                }
            ),
            { numRuns: 30 }
        );
    });
});

// ===========================================================================
// User Rank
// ===========================================================================
describe('getUserRank', () => {
    test('Property 30: top user has rank 1, last has rank N', async () => {
        const users = [
            { uid: 'u1', username: 'A', displayName: 'A', challengesSolved: 20, avgExecutionTime: 100, xp: 1000, level: 5 },
            { uid: 'u2', username: 'B', displayName: 'B', challengesSolved: 10, avgExecutionTime: 200, xp: 500, level: 3 },
            { uid: 'u3', username: 'C', displayName: 'C', challengesSolved: 5, avgExecutionTime: 300, xp: 200, level: 2 },
        ];
        const { collection } = buildQueryChain(users);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        const rank1 = await getUserRank('u1');
        invalidateLeaderboardCache();
        const { collection: col2 } = buildQueryChain(users);
        (adminDb as jest.Mock).mockReturnValue({ collection: col2 });
        const rank3 = await getUserRank('u3');

        expect(rank1.rank).toBe(1);
        expect(rank3.rank).toBe(3);
    });

    test('returns null rank for unknown userId', async () => {
        const users = [
            { uid: 'u1', username: 'A', displayName: 'A', challengesSolved: 5, avgExecutionTime: 100, xp: 200, level: 2 },
        ];
        const { collection } = buildQueryChain(users);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await getUserRank('unknown-user');
        expect(result.rank).toBeNull();
        expect(result.challengesSolved).toBe(0);
    });
});

// ===========================================================================
// Nearby Competitors
// ===========================================================================
describe('getUserNearby', () => {
    test('returns correct above/below slices for a middle-ranked user', async () => {
        const users = Array.from({ length: 15 }, (_, i) => ({
            uid: `u${i}`,
            username: `User${i}`,
            displayName: `User ${i}`,
            challengesSolved: 100 - i * 5,
            avgExecutionTime: 100,
            xp: 1000 - i * 50,
            level: 10,
        }));
        const { collection } = buildQueryChain(users);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        // u7 is rank 8 (0-indexed 7)
        const result = await getUserNearby('u7');

        expect(result.user?.uid).toBe('u7');
        expect(result.above.length).toBeLessThanOrEqual(5);
        expect(result.below.length).toBeLessThanOrEqual(5);
        // All above entries must have a lower rank than the user
        result.above.forEach(a => expect(a.rank).toBeLessThan(result.user!.rank));
        // All below entries must have a higher rank than the user
        result.below.forEach(b => expect(b.rank).toBeGreaterThan(result.user!.rank));
    });

    test('returns empty above/below for unknown userId', async () => {
        const { collection } = buildQueryChain([]);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await getUserNearby('ghost');
        expect(result.above).toEqual([]);
        expect(result.user).toBeNull();
        expect(result.below).toEqual([]);
    });
});
