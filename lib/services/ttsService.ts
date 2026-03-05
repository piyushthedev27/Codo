import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TTSRequest {
    text: string;
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    model?: 'tts-1' | 'tts-1-hd';
}

export interface TTSResponse {
    audio: Buffer;
    cached: boolean;
    contentType: string;
}

// ---------------------------------------------------------------------------
// In-Memory Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
    audio: Buffer;
    contentType: string;
    expiresAt: number;
}

const audioCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (same as cinema scripts)

/**
 * Generate a cache key based on text and voice
 */
function generateCacheKey(text: string, voice: string, model: string): string {
    // Create a simple hash-like key from text, voice, and model
    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
    // Use first 100 chars + length + voice + model to create a unique key
    const textKey = normalized.length > 100 
        ? normalized.substring(0, 100) + `_len${normalized.length}`
        : normalized;
    return `${textKey}_${voice}_${model}`.replace(/[^a-z0-9_]/g, '_');
}

/**
 * Get cached audio if available and not expired
 */
function getCachedAudio(cacheKey: string): { audio: Buffer; contentType: string } | null {
    const entry = audioCache.get(cacheKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        audioCache.delete(cacheKey);
        return null;
    }

    return {
        audio: entry.audio,
        contentType: entry.contentType
    };
}

/**
 * Store audio in cache
 */
function cacheAudio(cacheKey: string, audio: Buffer, contentType: string): void {
    audioCache.set(cacheKey, {
        audio,
        contentType,
        expiresAt: Date.now() + CACHE_TTL_MS
    });
}

/**
 * Clean up expired cache entries (run periodically)
 */
function cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of audioCache.entries()) {
        if (now > entry.expiresAt) {
            audioCache.delete(key);
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
// TTS Service
// ---------------------------------------------------------------------------

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client
 */
function getOpenAIClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

/**
 * Reset the OpenAI client (useful for testing)
 */
export function resetOpenAIClient(): void {
    openaiClient = null;
}

/**
 * Convert text to speech using OpenAI TTS
 */
export async function textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const { text, voice = 'alloy', model = 'tts-1' } = request;

    if (!text || text.trim().length === 0) {
        throw new Error('Text is required for TTS generation');
    }

    // Validate text length (OpenAI has a 4096 character limit)
    if (text.length > 4096) {
        throw new Error('Text exceeds maximum length of 4096 characters');
    }

    // Check cache first
    const cacheKey = generateCacheKey(text, voice, model);
    const cachedAudio = getCachedAudio(cacheKey);
    
    if (cachedAudio) {
        return {
            audio: cachedAudio.audio,
            contentType: cachedAudio.contentType,
            cached: true
        };
    }

    // Generate audio using OpenAI TTS
    const client = getOpenAIClient();
    
    const mp3 = await client.audio.speech.create({
        model,
        voice,
        input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const contentType = 'audio/mpeg';

    // Cache the audio
    cacheAudio(cacheKey, buffer, contentType);

    return {
        audio: buffer,
        contentType,
        cached: false
    };
}

/**
 * Convert cinema narration to speech
 * This is a convenience method for cinema scripts
 */
export async function cinemaToSpeech(narration: string, voice?: TTSRequest['voice']): Promise<TTSResponse> {
    return textToSpeech({
        text: narration,
        voice: voice || 'alloy',
        model: 'tts-1' // Use standard quality for cinema to reduce costs
    });
}

/**
 * Invalidate cache for specific text
 */
export function invalidateTTSCache(text: string, voice = 'alloy', model = 'tts-1'): void {
    const cacheKey = generateCacheKey(text, voice, model);
    audioCache.delete(cacheKey);
}

/**
 * Clear all cached audio
 */
export function clearTTSCache(): void {
    audioCache.clear();
}

/**
 * Get cache statistics
 */
export function getTTSCacheStats(): { size: number; totalBytes: number } {
    let totalBytes = 0;
    for (const entry of audioCache.values()) {
        totalBytes += entry.audio.length;
    }
    return {
        size: audioCache.size,
        totalBytes
    };
}
