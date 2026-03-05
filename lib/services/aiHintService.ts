import { AIService } from '../ai/ai-service';
import { getChallenge } from './challengeService';
import { getUserSubmissions } from './submissionService';
import { getUsersMistakeStats } from './mistakeAnalysisService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HintRequest {
    userId: string;
    challengeId: string;
    currentCode: string;
    language: string;
}

export interface HintResponse {
    hint: string;
    cached: boolean;
    mistakeContext?: {
        totalMistakes: number;
        commonErrors: string[];
        recentErrors: string[];
    };
}

// ---------------------------------------------------------------------------
// In-Memory Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
    hint: string;
    expiresAt: number;
}

const hintCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a cache key based on challenge ID and code hash
 */
function generateCacheKey(challengeId: string, code: string): string {
    // Simple hash function for code
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        const char = code.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return `${challengeId}:${hash}`;
}

/**
 * Get cached hint if available and not expired
 */
function getCachedHint(cacheKey: string): string | null {
    const entry = hintCache.get(cacheKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        hintCache.delete(cacheKey);
        return null;
    }

    return entry.hint;
}

/**
 * Store hint in cache
 */
function cacheHint(cacheKey: string, hint: string): void {
    hintCache.set(cacheKey, {
        hint,
        expiresAt: Date.now() + CACHE_TTL_MS
    });
}

/**
 * Clean up expired cache entries (run periodically)
 */
function cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of hintCache.entries()) {
        if (now > entry.expiresAt) {
            hintCache.delete(key);
        }
    }
}

// Run cache cleanup every 5 minutes
setInterval(cleanupCache, 5 * 60 * 1000);

// ---------------------------------------------------------------------------
// Hint Generation
// ---------------------------------------------------------------------------

/**
 * Generate a personalized hint based on user's mistake history
 */
export async function generateHint(request: HintRequest): Promise<HintResponse> {
    const { userId, challengeId, currentCode, language } = request;

    // Check cache first
    const cacheKey = generateCacheKey(challengeId, currentCode);
    const cachedHint = getCachedHint(cacheKey);

    if (cachedHint) {
        return {
            hint: cachedHint,
            cached: true
        };
    }

    // Get challenge details
    const challenge = await getChallenge(challengeId);
    if (!challenge) {
        throw new Error('Challenge not found');
    }

    // Get user's mistake history for context
    const mistakeStats = await getUsersMistakeStats(userId);
    const recentSubmissions = await getUserSubmissions(userId, 5, challengeId);

    // Build mistake context
    const mistakeContext = {
        totalMistakes: mistakeStats.totalMistakes,
        commonErrors: mistakeStats.commonTypes.slice(0, 3).map(t => t.type),
        recentErrors: [] as string[]
    };

    // Get recent error messages for this challenge
    // Note: We'll use the submission's error message directly since submissions don't have IDs exposed
    for (const submission of recentSubmissions) {
        if (submission.status !== 'success' && submission.errorMessage) {
            mistakeContext.recentErrors.push(submission.errorMessage);
        }
    }

    // Generate hint using AI service with mistake context
    let enhancedPrompt = `Challenge: ${challenge.title}\nDescription: ${challenge.description}\n\n`;

    if (mistakeContext.totalMistakes > 0) {
        enhancedPrompt += `User's mistake history:\n`;
        enhancedPrompt += `- Total mistakes: ${mistakeContext.totalMistakes}\n`;

        if (mistakeContext.commonErrors.length > 0) {
            enhancedPrompt += `- Common error types: ${mistakeContext.commonErrors.join(', ')}\n`;
        }

        if (mistakeContext.recentErrors.length > 0) {
            enhancedPrompt += `- Recent errors on this challenge: ${mistakeContext.recentErrors.slice(0, 2).join('; ')}\n`;
        }

        enhancedPrompt += `\nPlease provide a hint that addresses their common mistakes.\n\n`;
    }

    // Generate hint using the AI service
    const hint = await AIService.generateHint(
        challenge.title,
        enhancedPrompt + challenge.description,
        currentCode,
        language
    );

    if (!hint) {
        throw new Error('Failed to generate hint');
    }

    // Cache the hint
    cacheHint(cacheKey, hint);

    return {
        hint,
        cached: false,
        mistakeContext: mistakeContext.totalMistakes > 0 ? mistakeContext : undefined
    };
}

/**
 * Invalidate cache for a specific challenge
 */
export function invalidateHintCache(challengeId: string): void {
    for (const key of hintCache.keys()) {
        if (key.startsWith(`${challengeId}:`)) {
            hintCache.delete(key);
        }
    }
}

/**
 * Clear all cached hints
 */
export function clearHintCache(): void {
    hintCache.clear();
}

/**
 * Get cache statistics
 */
export function getHintCacheStats(): { size: number; keys: string[] } {
    return {
        size: hintCache.size,
        keys: Array.from(hintCache.keys())
    };
}
