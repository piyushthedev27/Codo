import {
    generateCinemaScript,
    invalidateCinemaCache,
    clearCinemaCache,
    getCinemaCacheStats,
    stopCleanupInterval,
} from '../../lib/services/cinemaService';
import { AIService } from '../../lib/ai/ai-service';

// ---------------------------------------------------------------------------
// Mock AI Service
// ---------------------------------------------------------------------------
jest.mock('../../lib/ai/ai-service', () => ({
    AIService: {
        generateVideoScript: jest.fn(),
    },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockCinemaScript = {
    title: 'Introduction to Arrays',
    states: [
        {
            id: 'intro',
            narration: 'Welcome to this lesson on arrays!',
            codeSnippet: 'const arr = [1, 2, 3];',
            duration: 5,
            next: 'state1',
            choices: null,
        },
        {
            id: 'state1',
            narration: 'Arrays are ordered collections of elements.',
            codeSnippet: 'arr[0] // returns 1',
            duration: 4,
            next: null,
            choices: [
                { label: 'Learn about methods', nextState: 'methods' },
                { label: 'Learn about iteration', nextState: 'iteration' },
            ],
        },
        {
            id: 'methods',
            narration: 'Arrays have many useful methods like push, pop, and map.',
            codeSnippet: 'arr.push(4); // [1, 2, 3, 4]',
            duration: 6,
            next: null,
            choices: null,
        },
        {
            id: 'iteration',
            narration: 'You can iterate over arrays using for loops or forEach.',
            codeSnippet: 'arr.forEach(item => console.log(item));',
            duration: 6,
            next: null,
            choices: null,
        },
    ],
};

beforeEach(() => {
    jest.clearAllMocks();
    clearCinemaCache();
});

afterAll(() => {
    stopCleanupInterval();
});

// ===========================================================================
// generateCinemaScript
// ===========================================================================
describe('generateCinemaScript', () => {
    test('generates a cinema script using AI service', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue(mockCinemaScript);

        const result = await generateCinemaScript({ topic: 'Arrays in JavaScript' });

        expect(result.script).toEqual(mockCinemaScript);
        expect(result.cached).toBe(false);
        expect(AIService.generateVideoScript).toHaveBeenCalledWith('Arrays in JavaScript');
    });

    test('returns cached script on subsequent calls', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue(mockCinemaScript);

        // First call - should generate
        const result1 = await generateCinemaScript({ topic: 'Arrays in JavaScript' });
        expect(result1.cached).toBe(false);

        // Second call - should use cache
        const result2 = await generateCinemaScript({ topic: 'Arrays in JavaScript' });
        expect(result2.cached).toBe(true);
        expect(result2.script).toEqual(mockCinemaScript);

        // AI service should only be called once
        expect(AIService.generateVideoScript).toHaveBeenCalledTimes(1);
    });

    test('normalizes topic for cache key (case insensitive)', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue(mockCinemaScript);

        await generateCinemaScript({ topic: 'Arrays in JavaScript' });
        const result = await generateCinemaScript({ topic: 'ARRAYS IN JAVASCRIPT' });

        expect(result.cached).toBe(true);
        expect(AIService.generateVideoScript).toHaveBeenCalledTimes(1);
    });

    test('throws error when topic is empty', async () => {
        await expect(generateCinemaScript({ topic: '' })).rejects.toThrow(
            'Topic is required for cinema generation'
        );
    });

    test('throws error when AI returns invalid format (missing title)', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue({
            states: [],
        });

        await expect(generateCinemaScript({ topic: 'Test' })).rejects.toThrow(
            'Invalid cinema script format received from AI'
        );
    });

    test('throws error when AI returns invalid format (missing states)', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue({
            title: 'Test',
        });

        await expect(generateCinemaScript({ topic: 'Test' })).rejects.toThrow(
            'Invalid cinema script format received from AI'
        );
    });

    test('throws error when script has no intro state', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue({
            title: 'Test',
            states: [
                {
                    id: 'notintro',
                    narration: 'Test',
                    codeSnippet: null,
                    duration: 5,
                    next: null,
                    choices: null,
                },
            ],
        });

        await expect(generateCinemaScript({ topic: 'Test' })).rejects.toThrow(
            'Cinema script must have an intro state'
        );
    });
});

// ===========================================================================
// invalidateCinemaCache
// ===========================================================================
describe('invalidateCinemaCache', () => {
    test('removes specific topic from cache', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue(mockCinemaScript);

        // Generate and cache
        await generateCinemaScript({ topic: 'Arrays' });
        
        // Verify cached
        let result = await generateCinemaScript({ topic: 'Arrays' });
        expect(result.cached).toBe(true);

        // Invalidate
        invalidateCinemaCache('Arrays');

        // Should regenerate
        result = await generateCinemaScript({ topic: 'Arrays' });
        expect(result.cached).toBe(false);
        expect(AIService.generateVideoScript).toHaveBeenCalledTimes(2);
    });
});

// ===========================================================================
// clearCinemaCache
// ===========================================================================
describe('clearCinemaCache', () => {
    test('removes all entries from cache', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue(mockCinemaScript);

        // Generate multiple scripts
        await generateCinemaScript({ topic: 'Arrays' });
        await generateCinemaScript({ topic: 'Objects' });

        let stats = getCinemaCacheStats();
        expect(stats.size).toBe(2);

        // Clear cache
        clearCinemaCache();

        stats = getCinemaCacheStats();
        expect(stats.size).toBe(0);
    });
});

// ===========================================================================
// getCinemaCacheStats
// ===========================================================================
describe('getCinemaCacheStats', () => {
    test('returns cache size and keys', async () => {
        (AIService.generateVideoScript as jest.Mock).mockResolvedValue(mockCinemaScript);

        await generateCinemaScript({ topic: 'Arrays' });
        await generateCinemaScript({ topic: 'Objects' });

        const stats = getCinemaCacheStats();
        expect(stats.size).toBe(2);
        expect(stats.keys).toContain('arrays');
        expect(stats.keys).toContain('objects');
    });

    test('returns empty stats when cache is empty', () => {
        const stats = getCinemaCacheStats();
        expect(stats.size).toBe(0);
        expect(stats.keys).toEqual([]);
    });
});
