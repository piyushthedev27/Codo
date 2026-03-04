import {
    recordLatency,
    getP95Latency,
    getLatencySamples,
    trackExecution,
    getAvgExecutionTime,
    recordCacheHit,
    recordCacheMiss,
    getCacheHitRate,
    getPerformanceReport,
    _resetMetrics,
} from '../../lib/utils/performanceMonitor';

beforeEach(() => {
    _resetMetrics();
});

// ===========================================================================
// Latency Tracking
// ===========================================================================
describe('recordLatency / getP95Latency', () => {
    test('returns -1 for unknown endpoint', () => {
        expect(getP95Latency('GET /api/unknown')).toBe(-1);
    });

    test('returns the single sample when only one recorded', () => {
        recordLatency('GET /api/challenges', 120);
        expect(getP95Latency('GET /api/challenges')).toBe(120);
    });

    test('calculates p95 correctly for 100 samples', () => {
        // Record values 1–100
        for (let i = 1; i <= 100; i++) {
            recordLatency('GET /api/test', i);
        }
        // p95 of 1..100 → index = ceil(100 * 0.95) - 1 = 94 → value 95 (sorted array, 0-indexed)
        expect(getP95Latency('GET /api/test')).toBe(95);
    });

    test('tracks latency separately per endpoint', () => {
        recordLatency('GET /api/a', 10);
        recordLatency('GET /api/b', 500);
        expect(getP95Latency('GET /api/a')).toBe(10);
        expect(getP95Latency('GET /api/b')).toBe(500);
    });

    test('getLatencySamples returns a copy not a reference', () => {
        recordLatency('GET /api/x', 50);
        const samples = getLatencySamples('GET /api/x');
        samples.push(999);
        expect(getLatencySamples('GET /api/x')).toHaveLength(1);
    });
});

// ===========================================================================
// Execution Tracking
// ===========================================================================
describe('trackExecution / getAvgExecutionTime', () => {
    test('returns -1 for unknown label', () => {
        expect(getAvgExecutionTime('python')).toBe(-1);
    });

    test('calculates average correctly', () => {
        trackExecution('javascript', 100);
        trackExecution('javascript', 200);
        trackExecution('javascript', 300);
        expect(getAvgExecutionTime('javascript')).toBe(200);
    });

    test('tracks independently per language label', () => {
        trackExecution('python', 400);
        trackExecution('java', 100);
        expect(getAvgExecutionTime('python')).toBe(400);
        expect(getAvgExecutionTime('java')).toBe(100);
    });
});

// ===========================================================================
// Cache Hit Rate
// ===========================================================================
describe('recordCacheHit / recordCacheMiss / getCacheHitRate', () => {
    test('returns -1 for unknown cache key', () => {
        expect(getCacheHitRate('leaderboard')).toBe(-1);
    });

    test('returns 1.0 for all hits', () => {
        recordCacheHit('leaderboard');
        recordCacheHit('leaderboard');
        recordCacheHit('leaderboard');
        expect(getCacheHitRate('leaderboard')).toBe(1);
    });

    test('returns 0 for all misses', () => {
        recordCacheMiss('stats');
        recordCacheMiss('stats');
        expect(getCacheHitRate('stats')).toBe(0);
    });

    test('returns correct ratio for mixed hits/misses', () => {
        recordCacheHit('guild');
        recordCacheHit('guild');
        recordCacheMiss('guild');
        recordCacheMiss('guild');
        expect(getCacheHitRate('guild')).toBeCloseTo(0.5);
    });

    test('tracks independently per cache key', () => {
        recordCacheHit('key-a');
        recordCacheMiss('key-b');
        expect(getCacheHitRate('key-a')).toBe(1);
        expect(getCacheHitRate('key-b')).toBe(0);
    });
});

// ===========================================================================
// Performance Report
// ===========================================================================
describe('getPerformanceReport', () => {
    test('returns a report with expected top-level keys', () => {
        recordLatency('GET /api/leaderboards', 50);
        recordCacheHit('leaderboard-cache');
        trackExecution('python', 1200);

        const report = getPerformanceReport();

        expect(report).toHaveProperty('latency');
        expect(report).toHaveProperty('execution');
        expect(report).toHaveProperty('cache');
        expect(report).toHaveProperty('generatedAt');
    });

    test('report latency section contains recorded endpoint', () => {
        recordLatency('POST /api/submissions', 340);
        const report = getPerformanceReport();
        expect(report.latency['POST /api/submissions']).toBeDefined();
        expect(report.latency['POST /api/submissions'].sampleCount).toBe(1);
    });

    test('report cache section contains hitRate', () => {
        recordCacheHit('stats-cache');
        recordCacheHit('stats-cache');
        recordCacheMiss('stats-cache');

        const report = getPerformanceReport();
        expect(report.cache['stats-cache'].hitRate).toBeCloseTo(2 / 3);
    });

    test('report is empty after reset', () => {
        recordLatency('GET /api/x', 10);
        _resetMetrics();
        const report = getPerformanceReport();
        expect(Object.keys(report.latency)).toHaveLength(0);
        expect(Object.keys(report.cache)).toHaveLength(0);
    });
});
