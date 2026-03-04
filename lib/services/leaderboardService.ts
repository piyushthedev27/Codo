import { FieldValue } from 'firebase-admin/firestore';
import type { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../firebase/admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GlobalLeaderboardEntry {
    rank: number;
    uid: string;
    username: string;
    displayName: string;
    challengesSolved: number;
    avgExecutionTime: number; // ms — used for tie-breaking
    xp: number;
    level: number;
}

export interface ChallengeLeaderboardEntry {
    rank: number;
    uid: string;
    username: string;
    displayName: string;
    bestTime: number; // ms
    submittedAt: Date | FieldValue | Timestamp;
}

export interface UserRankResult {
    uid: string;
    rank: number | null; // null if user has no solves
    challengesSolved: number;
}

export interface NearbyResult {
    above: GlobalLeaderboardEntry[];
    user: GlobalLeaderboardEntry | null;
    below: GlobalLeaderboardEntry[];
}

// ---------------------------------------------------------------------------
// In-memory Cache (30-second TTL)
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
    data: T;
    expiresAt: number; // epoch ms
}

const CACHE_TTL_MS = 30_000; // 30 seconds

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

/** Clears all leaderboard cache entries — call after a successful submission. */
export function invalidateLeaderboardCache(): void {
    cache.clear();
}

// ---------------------------------------------------------------------------
// Global Leaderboard
// ---------------------------------------------------------------------------

/**
 * Returns the top-100 users ranked by:
 *   1. challengesSolved (desc)
 *   2. avgExecutionTime (asc) — tie-breaker (lower is better)
 */
export async function getGlobalLeaderboard(): Promise<GlobalLeaderboardEntry[]> {
    const CACHE_KEY = 'global';
    const cached = getFromCache<GlobalLeaderboardEntry[]>(CACHE_KEY);
    if (cached) return cached;

    const snapshot = await adminDb()
        .collection('users')
        .orderBy('challengesSolved', 'desc')
        .orderBy('avgExecutionTime', 'asc')
        .limit(100)
        .get();

    const leaderboard: GlobalLeaderboardEntry[] = snapshot.docs.map((doc, index) => {
        const d = doc.data();
        return {
            rank: index + 1,
            uid: doc.id,
            username: d.username ?? '',
            displayName: d.displayName ?? '',
            challengesSolved: d.challengesSolved ?? 0,
            avgExecutionTime: d.avgExecutionTime ?? 0,
            xp: d.xp ?? 0,
            level: d.level ?? 1,
        };
    });

    setInCache(CACHE_KEY, leaderboard);
    return leaderboard;
}

// ---------------------------------------------------------------------------
// Challenge-specific Leaderboard
// ---------------------------------------------------------------------------

/**
 * Returns the top-50 users who solved a specific challenge, ranked by
 * fastest execution time (asc).  If a user has multiple passing submissions
 * only their best time is kept.
 */
export async function getChallengeLeaderboard(
    challengeId: string
): Promise<ChallengeLeaderboardEntry[]> {
    const CACHE_KEY = `challenge:${challengeId}`;
    const cached = getFromCache<ChallengeLeaderboardEntry[]>(CACHE_KEY);
    if (cached) return cached;

    const snapshot = await adminDb()
        .collection('submissions')
        .where('challengeId', '==', challengeId)
        .where('status', '==', 'success')
        .orderBy('executionTime', 'asc')
        .get();

    // Keep each user's best (first seen) time — Firestore already ordered asc
    const seen = new Map<string, ChallengeLeaderboardEntry>();
    for (const doc of snapshot.docs) {
        const d = doc.data();
        if (!seen.has(d.userId)) {
            seen.set(d.userId, {
                rank: 0, // set below
                uid: d.userId,
                username: d.username ?? '',
                displayName: d.displayName ?? '',
                bestTime: d.executionTime,
                submittedAt: d.createdAt,
            });
        }
    }

    // Enrich with user display data & assign rank
    const entries = Array.from(seen.values()).slice(0, 50);
    const userIds = entries.map(e => e.uid);

    if (userIds.length > 0) {
        // Fetch user profiles in batches of 30 (Firestore 'in' limit)
        const batches: string[][] = [];
        for (let i = 0; i < userIds.length; i += 30) batches.push(userIds.slice(i, i + 30));

        const userMap = new Map<string, Record<string, unknown>>();
        for (const batch of batches) {
            const users = await adminDb().collection('users').where('__name__', 'in', batch).get();
            users.docs.forEach(u => userMap.set(u.id, u.data()));
        }

        for (const entry of entries) {
            const u = userMap.get(entry.uid) as { username?: string; displayName?: string } | undefined;
            if (u) {
                entry.username = u.username ?? '';
                entry.displayName = u.displayName ?? '';
            }
        }
    }

    const leaderboard = entries.map((e, i) => ({ ...e, rank: i + 1 }));
    setInCache(CACHE_KEY, leaderboard);
    return leaderboard;
}

// ---------------------------------------------------------------------------
// User Rank
// ---------------------------------------------------------------------------

/** Returns the given user's rank (1-indexed) in the global leaderboard. */
export async function getUserRank(userId: string): Promise<UserRankResult> {
    const CACHE_KEY = `rank:${userId}`;
    const cached = getFromCache<UserRankResult>(CACHE_KEY);
    if (cached) return cached;

    const board = await getGlobalLeaderboard();
    const entry = board.find(e => e.uid === userId);

    const result: UserRankResult = {
        uid: userId,
        rank: entry ? entry.rank : null,
        challengesSolved: entry ? entry.challengesSolved : 0,
    };

    setInCache(CACHE_KEY, result);
    return result;
}

// ---------------------------------------------------------------------------
// Nearby Competitors
// ---------------------------------------------------------------------------

/**
 * Returns up to 5 users ranked above and 5 ranked below the given user
 * on the global leaderboard.
 */
export async function getUserNearby(userId: string): Promise<NearbyResult> {
    const CACHE_KEY = `nearby:${userId}`;
    const cached = getFromCache<NearbyResult>(CACHE_KEY);
    if (cached) return cached;

    const board = await getGlobalLeaderboard();
    const idx = board.findIndex(e => e.uid === userId);

    if (idx === -1) {
        const result: NearbyResult = { above: [], user: null, below: [] };
        setInCache(CACHE_KEY, result);
        return result;
    }

    const above = board.slice(Math.max(0, idx - 5), idx);
    const user = board[idx];
    const below = board.slice(idx + 1, idx + 6);

    const result: NearbyResult = { above, user, below };
    setInCache(CACHE_KEY, result);
    return result;
}
