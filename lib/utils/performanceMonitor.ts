// ---------------------------------------------------------------------------
// Latency Tracking
// ---------------------------------------------------------------------------

const MAX_SAMPLES = 1000;

/** Stores per-endpoint latency samples (circular buffer) */
const latencySamples = new Map<string, number[]>();

/**
 * Records a request latency sample for an endpoint.
 * @param endpoint  e.g. "GET /api/submissions"
 * @param durationMs  Duration in milliseconds
 */
export function recordLatency(endpoint: string, durationMs: number): void {
    const samples = latencySamples.get(endpoint) ?? [];
    samples.push(durationMs);
    // Keep only the last MAX_SAMPLES values
    if (samples.length > MAX_SAMPLES) samples.shift();
    latencySamples.set(endpoint, samples);
}

/**
 * Calculates the p95 latency for an endpoint from recorded samples.
 * Returns -1 if no samples are available.
 */
export function getP95Latency(endpoint: string): number {
    const samples = latencySamples.get(endpoint);
    if (!samples || samples.length === 0) return -1;

    const sorted = [...samples].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[Math.max(0, index)];
}

/**
 * Returns all recorded latency samples for an endpoint.
 */
export function getLatencySamples(endpoint: string): number[] {
    return [...(latencySamples.get(endpoint) ?? [])];
}

// ---------------------------------------------------------------------------
// Execution Time Tracking
// ---------------------------------------------------------------------------

const executionSamples = new Map<string, number[]>();

/**
 * Records a code execution duration.
 * @param label  e.g. "javascript", "python", or submission ID
 * @param durationMs  Execution time in ms
 */
export function trackExecution(label: string, durationMs: number): void {
    const samples = executionSamples.get(label) ?? [];
    samples.push(durationMs);
    if (samples.length > MAX_SAMPLES) samples.shift();
    executionSamples.set(label, samples);
}

/**
 * Returns average execution time for a label.
 */
export function getAvgExecutionTime(label: string): number {
    const samples = executionSamples.get(label);
    if (!samples || samples.length === 0) return -1;
    return Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
}

// ---------------------------------------------------------------------------
// Cache Hit Rate Tracking
// ---------------------------------------------------------------------------

const cacheStats = new Map<string, { hits: number; misses: number }>();

/**
 * Records a cache hit for the given cache key.
 */
export function recordCacheHit(cacheKey: string): void {
    const stats = cacheStats.get(cacheKey) ?? { hits: 0, misses: 0 };
    stats.hits++;
    cacheStats.set(cacheKey, stats);
}

/**
 * Records a cache miss for the given cache key.
 */
export function recordCacheMiss(cacheKey: string): void {
    const stats = cacheStats.get(cacheKey) ?? { hits: 0, misses: 0 };
    stats.misses++;
    cacheStats.set(cacheKey, stats);
}

/**
 * Returns the cache hit rate (0–1) for the given cache key.
 * Returns -1 if no data recorded.
 */
export function getCacheHitRate(cacheKey: string): number {
    const stats = cacheStats.get(cacheKey);
    if (!stats) return -1;
    const total = stats.hits + stats.misses;
    if (total === 0) return -1;
    return stats.hits / total;
}

// ---------------------------------------------------------------------------
// Full Performance Report
// ---------------------------------------------------------------------------

export interface PerformanceReport {
    latency: Record<string, { p95: number; sampleCount: number }>;
    execution: Record<string, { avgMs: number; sampleCount: number }>;
    cache: Record<string, { hits: number; misses: number; hitRate: number }>;
    generatedAt: string;
}

/**
 * Returns a full snapshot of all performance metrics.
 */
export function getPerformanceReport(): PerformanceReport {
    const latency: PerformanceReport['latency'] = {};
    for (const [endpoint, samples] of latencySamples.entries()) {
        latency[endpoint] = {
            p95: getP95Latency(endpoint),
            sampleCount: samples.length,
        };
    }

    const execution: PerformanceReport['execution'] = {};
    for (const [label, samples] of executionSamples.entries()) {
        execution[label] = {
            avgMs: getAvgExecutionTime(label),
            sampleCount: samples.length,
        };
    }

    const cache: PerformanceReport['cache'] = {};
    for (const [key, stats] of cacheStats.entries()) {
        cache[key] = {
            ...stats,
            hitRate: getCacheHitRate(key),
        };
    }

    return {
        latency,
        execution,
        cache,
        generatedAt: new Date().toISOString(),
    };
}

// ---------------------------------------------------------------------------
// Reset (for testing)
// ---------------------------------------------------------------------------

export function _resetMetrics(): void {
    latencySamples.clear();
    executionSamples.clear();
    cacheStats.clear();
}
