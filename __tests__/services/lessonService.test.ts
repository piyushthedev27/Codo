import {
    getLessons,
    getLessonById,
    getLessonChallenges,
    getUserLessonProgress,
    completeLesson,
    checkPrerequisites,
} from '../../lib/services/lessonService';
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
// Lesson Retrieval
// ===========================================================================
describe('getLessons', () => {
    test('returns active lessons', async () => {
        const lessons = [{ id: 'l1', title: 'Start', isActive: true }];
        const lessonsGet = jest.fn(() => Promise.resolve({ docs: lessons.map(l => ({ id: l.id, data: () => l })) }));
        const where2 = { get: lessonsGet };
        const where1 = { where: jest.fn(() => where2), get: lessonsGet };
        const collection = jest.fn(() => ({ where: jest.fn(() => where1) }));

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await getLessons();
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('l1');
    });
});

describe('getLessonChallenges', () => {
    test('returns challenges in specified order', async () => {
        const lesson = { id: 'l1', challengeIds: ['c2', 'c1'] };
        const lessonGet = jest.fn(() => Promise.resolve({ exists: true, id: 'l1', data: () => lesson }));

        const challengeDocs = [
            { id: 'c1', title: 'C1' },
            { id: 'c2', title: 'C2' }
        ];
        const challengesGet = jest.fn(() => Promise.resolve({ docs: challengeDocs.map(c => ({ id: c.id, data: () => c })) }));
        const challengesWhere = jest.fn(() => ({ get: challengesGet }));

        const collection = jest.fn((name) => {
            if (name === 'lessons') return { doc: () => ({ get: lessonGet }) };
            return { where: challengesWhere }; // challenges
        });

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await getLessonChallenges('l1');

        expect(result.length).toBe(2);
        expect(result[0].id).toBe('c2'); // Respects lesson.challengeIds order
        expect(result[1].id).toBe('c1');
    });
});

// ===========================================================================
// Progress Tracking
// ===========================================================================
describe('completeLesson', () => {
    test('creates progress record if none exists', async () => {
        const lesson = { id: 'l1', challengeIds: ['c1'] };
        const lessonGet = jest.fn(() => Promise.resolve({ exists: true, id: 'l1', data: () => lesson }));

        const progressSnapshot = { empty: true };
        const progressGet = jest.fn(() => Promise.resolve(progressSnapshot));
        const progressWhere2 = jest.fn(() => ({ limit: () => ({ get: progressGet }) }));
        const progressWhere1 = jest.fn(() => ({ where: progressWhere2 }));
        const progressAdd = jest.fn((..._a: any[]) => Promise.resolve({ id: 'new-p' }));

        const collection = jest.fn((name) => {
            if (name === 'lessons') return { doc: () => ({ get: lessonGet }) };
            return { where: progressWhere1, add: progressAdd }; // progress
        });

        (adminDb as jest.Mock).mockReturnValue({ collection });

        await completeLesson('u1', 'l1');

        expect(progressAdd).toHaveBeenCalled();
        const callArgs = progressAdd.mock.calls[0][0];
        expect(callArgs.status).toBe('completed');
        expect(callArgs.progressPercentage).toBe(100);
    });
});

describe('checkPrerequisites', () => {
    test('returns true if no prerequisites', async () => {
        const lesson = { id: 'l2', prerequisites: [] };
        const lessonGet = jest.fn(() => Promise.resolve({ exists: true, id: 'l2', data: () => lesson }));
        const collection = jest.fn(() => ({ doc: () => ({ get: lessonGet }) }));
        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await checkPrerequisites('u1', 'l2');
        expect(result).toBe(true);
    });

    test('returns false if prerequisite not completed', async () => {
        const lesson = { id: 'l2', prerequisites: ['l1'] };
        const lessonGet = jest.fn(() => Promise.resolve({ exists: true, id: 'l2', data: () => lesson }));

        const userProgress = [
            { lessonId: 'l1', status: 'in_progress' }
        ];
        const progressGet = jest.fn(() => Promise.resolve({ docs: userProgress.map(p => ({ data: () => p })) }));
        const progressWhere = jest.fn(() => ({ get: progressGet }));

        const collection = jest.fn((name) => {
            if (name === 'lessons') return { doc: () => ({ get: lessonGet }) };
            return { where: progressWhere }; // progress
        });

        (adminDb as jest.Mock).mockReturnValue({ collection });

        const result = await checkPrerequisites('u1', 'l2');
        expect(result).toBe(false);
    });
});
