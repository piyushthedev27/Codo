import { adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Lesson {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    content: string; // Markdown
    learningObjectives: string[];
    prerequisites: string[]; // Lesson IDs
    challengeIds: string[]; // Ordered Challenge IDs
    createdBy: string;
    createdAt: Date | FieldValue;
    updatedAt: Date | FieldValue;
    isActive: boolean;
}

export interface UserLessonProgress {
    id: string;
    userId: string;
    lessonId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    progressPercentage: number;
    completedChallenges: number;
    totalChallenges: number;
    completedAt: Date | FieldValue | null;
    createdAt: Date | FieldValue;
    updatedAt: Date | FieldValue;
}

// ---------------------------------------------------------------------------
// Lesson Retrieval
// ---------------------------------------------------------------------------

/**
 * Returns a list of lessons, optionally filtered by category and difficulty.
 */
export async function getLessons(filters: { category?: string; difficulty?: string } = {}): Promise<Lesson[]> {
    let query: FirebaseFirestore.Query = adminDb().collection('lessons').where('isActive', '==', true);

    if (filters.category) {
        query = query.where('category', '==', filters.category);
    }
    if (filters.difficulty) {
        query = query.where('difficulty', '==', filters.difficulty);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lesson));
}

/**
 * Returns a single lesson by ID.
 */
export async function getLessonById(lessonId: string): Promise<Lesson | null> {
    const doc = await adminDb().collection('lessons').doc(lessonId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Lesson;
}

/**
 * Returns the challenges associated with a lesson in order.
 */
export async function getLessonChallenges(lessonId: string): Promise<Record<string, unknown>[]> {
    const lesson = await getLessonById(lessonId);
    if (!lesson || !lesson.challengeIds || lesson.challengeIds.length === 0) return [];

    // Fetch challenges in batches of 30
    const challenges: Record<string, unknown>[] = [];
    for (let i = 0; i < lesson.challengeIds.length; i += 30) {
        const batch = lesson.challengeIds.slice(i, i + 30);
        const snapshot = await adminDb()
            .collection('challenges')
            .where('__name__', 'in', batch)
            .get();

        // Mantain order
        const batchChallenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        batch.forEach(id => {
            const found = batchChallenges.find(c => c.id === id);
            if (found) challenges.push(found);
        });
    }

    return challenges;
}

// ---------------------------------------------------------------------------
// Progress Tracking
// ---------------------------------------------------------------------------

/**
 * Returns the lesson progress for a specific user.
 */
export async function getUserLessonProgress(userId: string): Promise<UserLessonProgress[]> {
    const snapshot = await adminDb()
        .collection('progress')
        .where('userId', '==', userId)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserLessonProgress));
}

/**
 * Returns progress for a specific user and lesson.
 */
export async function getSpecificUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | null> {
    const snapshot = await adminDb()
        .collection('progress')
        .where('userId', '==', userId)
        .where('lessonId', '==', lessonId)
        .limit(1)
        .get();

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserLessonProgress;
}

/**
 * Marks a lesson as completed for a user.
 */
export async function completeLesson(userId: string, lessonId: string): Promise<void> {
    const lesson = await getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const progressRef = adminDb().collection('progress');
    const existingProgress = await getSpecificUserLessonProgress(userId, lessonId);

    if (existingProgress) {
        if (existingProgress.status === 'completed') return;

        await progressRef.doc(existingProgress.id).update({
            status: 'completed',
            progressPercentage: 100,
            completedChallenges: lesson.challengeIds.length,
            completedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
    } else {
        await progressRef.add({
            userId,
            lessonId,
            status: 'completed',
            progressPercentage: 100,
            completedChallenges: lesson.challengeIds.length,
            totalChallenges: lesson.challengeIds.length,
            completedAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
    }
}

/**
 * Checks if a user has completed the prerequisites for a lesson.
 */
export async function checkPrerequisites(userId: string, lessonId: string): Promise<boolean> {
    const lesson = await getLessonById(lessonId);
    if (!lesson || !lesson.prerequisites || lesson.prerequisites.length === 0) return true;

    const progress = await getUserLessonProgress(userId);
    const completedLessonIds = progress
        .filter(p => p.status === 'completed')
        .map(p => p.lessonId);

    return lesson.prerequisites.every(prereqId => completedLessonIds.includes(prereqId));
}
