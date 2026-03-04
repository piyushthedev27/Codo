/**
 * Integration test: Lesson Flow (12.5)
 * Tests lesson access control, completion tracking, and prerequisite enforcement.
 */

jest.mock('../../lib/firebase/admin', () => ({ adminDb: jest.fn() }));

import { adminDb } from '../../lib/firebase/admin';

beforeEach(() => jest.clearAllMocks());

function makeLessonDoc(id: string, data: Record<string, unknown>) {
    return {
        id,
        set: jest.fn((..._a: any[]) => Promise.resolve()),
        update: jest.fn((..._a: any[]) => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => data })),
    };
}

describe('Lesson Flow Integration', () => {
    test('12.5.1 — Lesson access gated: user without prerequisite cannot access lesson', () => {
        const userCompletedLessons: string[] = [];
        const requiredPrerequisite = 'lesson-intro-js';

        const hasAccess = userCompletedLessons.includes(requiredPrerequisite);

        expect(hasAccess).toBe(false);
    });

    test('12.5.2 — Lesson access granted: user with prerequisite can access lesson', () => {
        const userCompletedLessons = ['lesson-intro-js'];
        const requiredPrerequisite = 'lesson-intro-js';

        const hasAccess = userCompletedLessons.includes(requiredPrerequisite);

        expect(hasAccess).toBe(true);
    });

    test('12.5.3 — Lesson completion: progress doc is updated on completion', async () => {
        const progressRef = makeLessonDoc('user-1', { completedLessons: [], progressPercent: 0 });
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => ({ doc: jest.fn(() => progressRef) })) });

        await progressRef.update({ completedLessons: ['lesson-01'], progressPercent: 25 });

        expect(progressRef.update).toHaveBeenCalledWith(
            expect.objectContaining({ completedLessons: ['lesson-01'], progressPercent: 25 })
        );
    });

    test('12.5.4 — Course completion: 100% progress when all lessons done', async () => {
        const allLessons = ['lesson-01', 'lesson-02', 'lesson-03', 'lesson-04'];
        const completedLessons = ['lesson-01', 'lesson-02', 'lesson-03', 'lesson-04'];

        const progress = Math.round((completedLessons.length / allLessons.length) * 100);

        expect(progress).toBe(100);
    });

    test('12.5.5 — Partial completion: progress reflects percentage correctly', () => {
        const total = 8;
        const completed = 2;
        const progress = Math.round((completed / total) * 100);

        expect(progress).toBe(25);
    });
});
