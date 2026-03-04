import {
    getGlobalGuildLeaderboard,
    getGuildMemberLeaderboard,
    getGuildStatistics,
    invalidateGuildLeaderboardCache,
} from '../../lib/services/guildLeaderboardService';
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
function buildQueryChain(docs: any[]) {
    const snapshot = { docs: docs.map(d => ({ id: d.id ?? d.uid, data: () => d })) };
    const get = jest.fn(() => Promise.resolve(snapshot));
    const limit = jest.fn(() => ({ get }));
    const orderBy2 = jest.fn(() => ({ limit, get }));
    const orderBy1 = jest.fn(() => ({ orderBy: orderBy2, limit, get }));
    const collection = jest.fn(() => ({ orderBy: orderBy1, get }));
    return { collection, get, snapshot };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
    jest.clearAllMocks();
    invalidateGuildLeaderboardCache();
});

// ===========================================================================
// Global Guild Leaderboard
// ===========================================================================
describe('getGlobalGuildLeaderboard', () => {
    test('returns top guilds ordered by solved challenges', async () => {
        const guilds = [
            { id: 'g1', name: 'Alpha', totalChallengesSolved: 100, averageSolveTime: 500, memberCount: 5 },
            { id: 'g2', name: 'Beta', totalChallengesSolved: 80, averageSolveTime: 400, memberCount: 3 },
        ];
        const { collection, get } = buildQueryChain(guilds);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await getGlobalGuildLeaderboard();

        expect(result.length).toBe(2);
        expect(result[0].name).toBe('Alpha');
        expect(result[0].rank).toBe(1);
        expect(result[1].rank).toBe(2);
        expect(get).toHaveBeenCalledTimes(1);
    });

    test('cache: consecutive calls hit cache', async () => {
        const guilds = [{ id: 'g1', name: 'Alpha', totalChallengesSolved: 100 }];
        const { collection, get } = buildQueryChain(guilds);
        (adminDb as jest.Mock).mockReturnValue({ collection });

        await getGlobalGuildLeaderboard();
        await getGlobalGuildLeaderboard();

        expect(get).toHaveBeenCalledTimes(1);
    });
});

// ===========================================================================
// Guild Member Leaderboard
// ===========================================================================
describe('getGuildMemberLeaderboard', () => {
    test('returns members ranked by performance', async () => {
        // Members in the guild
        const memberDocs = [{ id: 'm1' }, { id: 'm2' }];
        const membersGet = jest.fn(() => Promise.resolve({ docs: memberDocs.map(d => ({ id: d.id, data: () => d })) }));
        const membersCollection = jest.fn(() => ({ get: membersGet }));

        // Users data
        const userDocs = [
            { id: 'm1', username: 'alice', totalChallengesSolved: 10, averageSolveTime: 100 },
            { id: 'm2', username: 'bob', totalChallengesSolved: 20, averageSolveTime: 200 },
        ];
        const usersGet = jest.fn(() => Promise.resolve({ docs: userDocs.map(d => ({ id: d.id, data: () => d })) }));
        const usersWhere = jest.fn(() => ({ get: usersGet }));

        const collection = jest.fn((name) => {
            if (name === 'guilds') return { doc: () => ({ collection: membersCollection }) };
            return { where: usersWhere }; // users
        });

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await getGuildMemberLeaderboard('g1');

        expect(result.length).toBe(2);
        expect(result[0].uid).toBe('m2'); // Bob has 20 solves
        expect(result[0].rank).toBe(1);
        expect(result[1].uid).toBe('m1'); // Alice has 10
        expect(result[1].rank).toBe(2);
    });
});

// ===========================================================================
// Guild Statistics
// ===========================================================================
describe('getGuildStatistics', () => {
    test('returns aggregated stats for a guild', async () => {
        const guildData = {
            totalChallengesSolved: 50,
            memberCount: 2,
            averageSolveTime: 300
        };
        const guildGet = jest.fn(() => Promise.resolve({ exists: true, data: () => guildData }));
        const guildDoc = jest.fn(() => ({ get: guildGet }));
        const collection = jest.fn(() => ({ doc: guildDoc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const stats = await getGuildStatistics('g1');

        expect(stats).not.toBeNull();
        expect(stats?.totalChallengesSolved).toBe(50);
        expect(stats?.activityLevel).toBe('High'); // 50/2 = 25 > 10
    });

    test('returns null if guild not found', async () => {
        const guildGet = jest.fn(() => Promise.resolve({ exists: false }));
        const guildDoc = jest.fn(() => ({ get: guildGet }));
        const collection = jest.fn(() => ({ doc: guildDoc }));
        (adminDb as jest.Mock).mockReturnValue({ collection });

        const stats = await getGuildStatistics('missing');
        expect(stats).toBeNull();
    });
});
