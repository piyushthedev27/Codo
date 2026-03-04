import { adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface ChallengeData {
    id?: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    timeLimit: number;
    memoryLimit: number;
    testCases: TestCase[];
    solutionCode?: string;
    createdBy: string;
    createdAt?: Date | FieldValue;
    updatedAt?: Date | FieldValue;
    isActive: boolean;
}

export async function createChallenge(data: Omit<ChallengeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const challengesRef = adminDb().collection('challenges');
    const docRef = challengesRef.doc();

    const newChallenge: ChallengeData = {
        ...data,
        id: docRef.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(newChallenge);
    return docRef.id;
}

export async function getChallenge(challengeId: string): Promise<ChallengeData | null> {
    const docRef = adminDb().collection('challenges').doc(challengeId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
        return null;
    }

    return snapshot.data() as ChallengeData;
}

export async function updateChallenge(challengeId: string, data: Partial<ChallengeData>): Promise<void> {
    const docRef = adminDb().collection('challenges').doc(challengeId);

    const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp()
    };

    // Remove id from update payload if it exists
    delete updateData.id;

    await docRef.update(updateData);
}

export async function deleteChallenge(challengeId: string): Promise<void> {
    const docRef = adminDb().collection('challenges').doc(challengeId);
    await docRef.delete();
}
