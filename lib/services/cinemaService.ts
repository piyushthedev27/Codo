import { AIService } from '../ai/ai-service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CinemaState {
    id: string;
    narration: string;
    codeSnippet: string | null;
    duration: number;
    next: string | null;
    choices: Array<{
        label: string;
        nextState: string;
    }> | null;
}

export interface CinemaScript {
    title: string;
    states: CinemaState[];
}

export interface CinemaRequest {
    topic: string;
    challengeId?: string;
}

export interface CinemaResponse {
    script: CinemaScript;
    cached: boolean;
}

// ---------------------------------------------------------------------------
// In-Memory Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
    script: CinemaScript;
    expiresAt: number;
}

const cinemaCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a cache key based on topic
 */
function generateCacheKey(topic: string): string {
    // Normalize topic to lowercase and remove extra spaces
    return topic.toLowerCase().trim().replace(/\s+/g, '_');
}

/**
 * Get cached cinema script if available and not expired
 */
function getCachedScript(cacheKey: string): CinemaScript | null {
    const entry = cinemaCache.get(cacheKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        cinemaCache.delete(cacheKey);
        return null;
    }

    return entry.script;
}

/**
 * Store cinema script in cache
 */
function cacheScript(cacheKey: string, script: CinemaScript): void {
    cinemaCache.set(cacheKey, {
        script,
        expiresAt: Date.now() + CACHE_TTL_MS
    });
}

/**
 * Clean up expired cache entries (run periodically)
 */
function cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of cinemaCache.entries()) {
        if (now > entry.expiresAt) {
            cinemaCache.delete(key);
        }
    }
}

// Run cache cleanup every 24 hours
let cleanupInterval: NodeJS.Timeout | null = null;

if (typeof setInterval !== 'undefined') {
    cleanupInterval = setInterval(cleanupCache, 24 * 60 * 60 * 1000);
}

/**
 * Stop the cleanup interval (useful for testing)
 */
export function stopCleanupInterval(): void {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
}

// ---------------------------------------------------------------------------
// Cinema Script Generation
// ---------------------------------------------------------------------------

/**
 * Generate an animated code explanation script using AI
 */
export async function generateCinemaScript(request: CinemaRequest): Promise<CinemaResponse> {
    const { topic } = request;

    if (!topic || topic.trim().length === 0) {
        throw new Error('Topic is required for cinema generation');
    }

    // Check cache first
    const cacheKey = generateCacheKey(topic);
    const cachedScript = getCachedScript(cacheKey);
    
    if (cachedScript) {
        return {
            script: cachedScript,
            cached: true
        };
    }

    // Generate cinema script using AI service
    // The AI service already has a generateVideoScript method that returns the correct format
    const scriptData = await AIService.generateVideoScript(topic);

    // Validate the script structure
    if (!scriptData || !scriptData.title || !Array.isArray(scriptData.states)) {
        throw new Error('Invalid cinema script format received from AI');
    }

    // Validate that we have an intro state
    const hasIntro = scriptData.states.some((state: CinemaState) => state.id === 'intro');
    if (!hasIntro) {
        throw new Error('Cinema script must have an intro state');
    }

    const script: CinemaScript = {
        title: scriptData.title,
        states: scriptData.states
    };

    // Cache the script
    cacheScript(cacheKey, script);

    return {
        script,
        cached: false
    };
}

/**
 * Invalidate cache for a specific topic
 */
export function invalidateCinemaCache(topic: string): void {
    const cacheKey = generateCacheKey(topic);
    cinemaCache.delete(cacheKey);
}

/**
 * Clear all cached cinema scripts
 */
export function clearCinemaCache(): void {
    cinemaCache.clear();
}

/**
 * Get cache statistics
 */
export function getCinemaCacheStats(): { size: number; keys: string[] } {
    return {
        size: cinemaCache.size,
        keys: Array.from(cinemaCache.keys())
    };
}
