import { adminDb } from '../firebase/admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GuildLeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    memberCount: number;
    totalChallengesSolved: number;
    averageSolveTime: number; // ms
}

export interface GuildMemberLeaderboardEntry {
    rank: number;
    uid: string;
    username: string;
    displayName: string;
    challengesSolved: number;
    avgExecutionTime: number;
}

export interface GuildStatistics {
    totalMembers: number;
    totalChallengesSolved: number;
    averageSolveTime: number;
    activityLevel: string; // e.g., 'Low', 'Medium', 'High'
}

// ---------------------------------------------------------------------------
// In-memory Cache (1-minute TTL)
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

const CACHE_TTL_MS = 60_000; // 1 minute
const cache = new Map<string, CacheEntry<unknown>>();

function getFromCache<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data as T;
}

function setInCache<T>(key: string, data: T): void {
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function invalidateGuildLeaderboardCache(): void {
    cache.clear();
}

// ---------------------------------------------------------------------------
// Guild Leaderboards
// ---------------------------------------------------------------------------

/**
 * Returns the top guilds ranked by:
 * 1. totalChallengesSolved (desc)
 * 2. averageSolveTime (asc)
 */
export async function getGlobalGuildLeaderboard(limit = 50): Promise<GuildLeaderboardEntry[]> {
    const CACHE_KEY = `global_guilds:${limit}`;
    const cached = getFromCache<GuildLeaderboardEntry[]>(CACHE_KEY);
    if (cached) return cached;

    const snapshot = await adminDb()
        .collection('guilds')
        .orderBy('totalChallengesSolved', 'desc')
        .orderBy('averageSolveTime', 'asc')
        .limit(limit)
        .get();

    const leaderboard: GuildLeaderboardEntry[] = snapshot.docs.map((doc, index) => {
        const d = doc.data();
        return {
            rank: index + 1,
            id: doc.id,
            name: d.name ?? 'Unknown Guild',
            memberCount: d.memberCount ?? 0,
            totalChallengesSolved: d.totalChallengesSolved ?? 0,
            averageSolveTime: d.averageSolveTime ?? 0,
        };
    });

    setInCache(CACHE_KEY, leaderboard);
    return leaderboard;
}

/**
 * Returns the ranking of members within a specific guild.
 */
export async function getGuildMemberLeaderboard(guildId: string): Promise<GuildMemberLeaderboardEntry[]> {
    const CACHE_KEY = `guild_members:${guildId}`;
    const cached = getFromCache<GuildMemberLeaderboardEntry[]>(CACHE_KEY);
    if (cached) return cached;

    // First get all member UIDs
    const membersSnapshot = await adminDb()
        .collection('guilds')
        .doc(guildId)
        .collection('members')
        .get();

    const memberUids = membersSnapshot.docs.map(doc => doc.id);
    if (memberUids.length === 0) return [];

    // Fetch user data for these members
    // Firestore 'in' query supports up to 30 elements.
    const userEntries: GuildMemberLeaderboardEntry[] = [];

    // Batching UIDs for 'in' query
    for (let i = 0; i < memberUids.length; i += 30) {
        const batch = memberUids.slice(i, i + 30);
        const usersSnapshot = await adminDb()
            .collection('users')
            .where('__name__', 'in', batch)
            .get();

        usersSnapshot.docs.forEach(doc => {
            const d = doc.data();
            userEntries.push({
                rank: 0, // Assigned after sorting
                uid: doc.id,
                username: d.username ?? '',
                displayName: d.displayName ?? '',
                challengesSolved: d.totalChallengesSolved ?? 0,
                avgExecutionTime: d.averageSolveTime ?? 0,
            });
        });
    }

    // Sort by challengesSolved (desc) then avgExecutionTime (asc)
    userEntries.sort((a, b) => {
        if (b.challengesSolved !== a.challengesSolved) {
            return b.challengesSolved - a.challengesSolved;
        }
        return a.avgExecutionTime - b.avgExecutionTime;
    });

    // Assign ranks
    const leaderboard = userEntries.map((e, i) => ({ ...e, rank: i + 1 }));

    setInCache(CACHE_KEY, leaderboard);
    return leaderboard;
}

/**
 * Aggregates statistics for a guild.
 */
export async function getGuildStatistics(guildId: string): Promise<GuildStatistics | null> {
    const CACHE_KEY = `guild_stats:${guildId}`;
    const cached = getFromCache<GuildStatistics>(CACHE_KEY);
    if (cached) return cached;

    const guildDoc = await adminDb().collection('guilds').doc(guildId).get();
    if (!guildDoc.exists) return null;

    const d = guildDoc.data()!;
    const totalChallengesSolved = d.totalChallengesSolved ?? 0;
    const memberCount = d.memberCount ?? 1;

    // Activity level logic (simple heuristic)
    let activityLevel = 'Low';
    if (totalChallengesSolved / memberCount > 10) activityLevel = 'High';
    else if (totalChallengesSolved / memberCount > 3) activityLevel = 'Medium';

    const stats: GuildStatistics = {
        totalMembers: memberCount,
        totalChallengesSolved,
        averageSolveTime: d.averageSolveTime ?? 0,
        activityLevel,
    };

    setInCache(CACHE_KEY, stats);
    return stats;
}
