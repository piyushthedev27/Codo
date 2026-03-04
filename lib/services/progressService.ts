import { adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Constants & Level Logic
// ---------------------------------------------------------------------------

const BASE_XP = 100;
const XP_GROWTH = 1.2;
const STATS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Calculate level from total XP based on a simple curve. */
export function calculateLevel(xp: number): number {
    if (xp < BASE_XP) return 1;

    let level = 1;
    let requiredXp = BASE_XP;
    let totalXpAccumulated = 0;

    while (xp >= totalXpAccumulated + requiredXp) {
        totalXpAccumulated += requiredXp;
        level++;
        requiredXp = Math.floor(BASE_XP * Math.pow(XP_GROWTH, level - 1));
    }

    return level;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserStats {
    level: number;
    experiencePoints: number;
    totalChallengesSolved: number;
    successRate: number;
    averageSolveTime: number;
    lastUpdated: Date | FieldValue;
}

export interface DashboardData {
    stats: UserStats;
    recentActivity: Record<string, unknown>[];
    levelProgress: {
        currentLevel: number;
        currentLevelXp: number;
        nextLevelXp: number;
        progressPercentage: number;
    };
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const statsCache = new Map<string, { data: UserStats; expiresAt: number }>();

function getCachedStats(userId: string): UserStats | null {
    const entry = statsCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        statsCache.delete(userId);
        return null;
    }
    return entry.data;
}

function setCachedStats(userId: string, data: UserStats): void {
    statsCache.set(userId, { data, expiresAt: Date.now() + STATS_CACHE_TTL_MS });
}

export function invalidateStatsCache(userId: string): void {
    statsCache.delete(userId);
}

// ---------------------------------------------------------------------------
// Service Logic
// ---------------------------------------------------------------------------

export async function updateUserStats(userId: string, isSuccess: boolean, executionTime: number): Promise<void> {
    const userRef = adminDb().collection('users').doc(userId);

    await adminDb().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) return;

        const data = userDoc.data()!;
        const currentSolved = data.totalChallengesSolved ?? 0;
        const currentTotalAttempts = data.totalAttempts ?? 0;
        const currentAvgTime = data.averageSolveTime ?? 0;

        const newTotalAttempts = currentTotalAttempts + 1;
        const newSolved = isSuccess ? currentSolved + 1 : currentSolved;
        const newSuccessRate = Math.round((newSolved / newTotalAttempts) * 100);

        let newAvgTime = currentAvgTime;
        if (isSuccess) {
            newAvgTime = Math.round((currentAvgTime * currentSolved + executionTime) / newSolved);
        }

        const updates: Record<string, unknown> = {
            totalAttempts: newTotalAttempts,
            totalChallengesSolved: newSolved,
            successRate: newSuccessRate,
            averageSolveTime: newAvgTime,
            updatedAt: FieldValue.serverTimestamp()
        };

        if (isSuccess) {
            const currentXp = data.experiencePoints ?? 0;
            const awardedXp = 50;
            const newTotalXp = currentXp + awardedXp;
            const newLevel = calculateLevel(newTotalXp);

            updates.experiencePoints = newTotalXp;
            updates.level = newLevel;
        }

        transaction.update(userRef, updates);
    });

    invalidateStatsCache(userId);
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
    const cached = getCachedStats(userId);
    if (cached) return cached;

    const userDoc = await adminDb().collection('users').doc(userId).get();
    if (!userDoc.exists) return null;

    const d = userDoc.data()!;
    const stats: UserStats = {
        level: d.level ?? 1,
        experiencePoints: d.experiencePoints ?? 0,
        totalChallengesSolved: d.totalChallengesSolved ?? 0,
        successRate: d.successRate ?? 0,
        averageSolveTime: d.averageSolveTime ?? 0,
        lastUpdated: d.updatedAt
    };

    setCachedStats(userId, stats);
    return stats;
}

export async function getUserDashboardData(userId: string): Promise<DashboardData | null> {
    const stats = await getUserStats(userId);
    if (!stats) return null;

    const submissionsSnap = await adminDb()
        .collection('submissions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

    const recentActivity = submissionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    const currentXp = stats.experiencePoints;
    const currentLevel = stats.level;

    let accumulatedXp = 0;
    for (let l = 1; l < currentLevel; l++) {
        accumulatedXp += Math.floor(BASE_XP * Math.pow(XP_GROWTH, l - 1));
    }

    const xpInThisLevel = currentXp - accumulatedXp;
    const xpRequiredForNextLevel = Math.floor(BASE_XP * Math.pow(XP_GROWTH, currentLevel - 1));
    const progressPercentage = Math.min(100, Math.round((xpInThisLevel / xpRequiredForNextLevel) * 100));

    return {
        stats,
        recentActivity,
        levelProgress: {
            currentLevel,
            currentLevelXp: xpInThisLevel,
            nextLevelXp: xpRequiredForNextLevel,
            progressPercentage
        }
    };
}

// ---------------------------------------------------------------------------
// Convenience Add XP Method
// ---------------------------------------------------------------------------

export async function addXP(
    userId: string,
    xpAmount: number
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    const userRef = adminDb().collection('users').doc(userId);
    let result = { newXP: 0, newLevel: 1, leveledUp: false };

    await adminDb().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const data = userDoc.exists ? userDoc.data()! : {};

        const currentXp = data.experiencePoints ?? 0;
        const currentLevel = data.level ?? 1;
        const newXP = currentXp + xpAmount;
        const newLevel = calculateLevel(newXP);

        transaction.set(userRef, {
            ...data,
            experiencePoints: newXP,
            level: newLevel,
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        result = { newXP, newLevel, leveledUp: newLevel > currentLevel };
    });

    invalidateStatsCache(userId);
    return result;
}
