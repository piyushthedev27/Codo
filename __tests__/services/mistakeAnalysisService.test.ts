import {
    analyzeSubmission,
    getMistakeAnalysisBySubmission,
    getUsersMistakeStats,
} from '../../lib/services/mistakeAnalysisService';
import { adminDb } from '../../lib/firebase/admin';

// ---------------------------------------------------------------------------
// Mock Firebase Admin
// ---------------------------------------------------------------------------
jest.mock('../../lib/firebase/admin', () => ({
    adminDb: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
    jest.clearAllMocks();
});

// ===========================================================================
// Submission Analysis
// ===========================================================================
describe('analyzeSubmission', () => {
    test('categorizes compilation errors correctly', async () => {
        const docSet = jest.fn();
        const docRef = { id: 'a1', set: docSet };
        const analysisDoc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc: analysisDoc }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        await analyzeSubmission('s1', 'u1', 'c1', 'compilation_error', 'unexpected token {');

        expect(docSet).toHaveBeenCalled();
        const analysis = docSet.mock.calls[0][0];
        expect(analysis.errorCategory).toBe('compilation');
        expect(analysis.commonMistakeType).toBe('syntax-error');
        expect(analysis.suggestions.length).toBeGreaterThan(0);
    });

    test('categorizes timeouts correctly', async () => {
        const docSet = jest.fn();
        const docRef = { id: 'a2', set: docSet };
        const analysisDoc = jest.fn(() => docRef);
        const collection = jest.fn(() => ({ doc: analysisDoc }));
        (adminDb as jest.Mock).mockReturnValue({ collection });

        await analyzeSubmission('s2', 'u1', 'c1', 'timeout', null);

        const analysis = docSet.mock.calls[0][0];
        expect(analysis.errorCategory).toBe('timeout');
        expect(analysis.commonMistakeType).toBe('infinite-loop');
    });

    test('returns null for successful submissions', async () => {
        const result = await analyzeSubmission('s3', 'u1', 'c1', 'success', null);
        expect(result).toBeNull();
    });
});

// ===========================================================================
// Stats Aggregation
// ===========================================================================
describe('getUsersMistakeStats', () => {
    test('aggregates counts and types', async () => {
        const analysisDocs = [
            { errorCategory: 'logic', commonMistakeType: 'off-by-one' },
            { errorCategory: 'logic', commonMistakeType: 'off-by-one' },
            { errorCategory: 'compilation', commonMistakeType: 'syntax-error' },
        ];

        const snapshot = {
            size: 3,
            docs: analysisDocs.map(d => ({ data: () => d }))
        };
        const get = jest.fn(() => Promise.resolve(snapshot));
        const where = jest.fn(() => ({ get }));
        const collection = jest.fn(() => ({ where }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const stats = await getUsersMistakeStats('u1');

        expect(stats.totalMistakes).toBe(3);
        expect(stats.byCategory['logic']).toBe(2);
        expect(stats.byCategory['compilation']).toBe(1);
        expect(stats.commonTypes[0].type).toBe('off-by-one');
        expect(stats.commonTypes[0].count).toBe(2);
    });
});
