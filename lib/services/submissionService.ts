import { adminDb } from '../firebase/admin';
import { ExecutionOutput } from './executionEngine';
import { FieldValue } from 'firebase-admin/firestore';

export interface SubmissionData {
    userId: string;
    challengeId: string;
    code: string;
    language: string;
    status: ExecutionOutput['status'];
    executionTime: number; // ms
    memoryUsed: number; // MB
    testResults: unknown[];
    errorMessage: string | null;
}

export async function saveSubmission(data: SubmissionData): Promise<string> {
    const submissionsRef = adminDb().collection('submissions');
    const docRef = submissionsRef.doc();

    await docRef.set({
        id: docRef.id,
        userId: data.userId,
        challengeId: data.challengeId,
        code: data.code,
        language: data.language,
        status: data.status,
        executionTime: data.executionTime,
        memoryUsed: data.memoryUsed,
        testResults: data.testResults,
        errorMessage: data.errorMessage,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });

    return docRef.id;
}

export async function getSubmission(submissionId: string): Promise<SubmissionData | null> {
    const docRef = adminDb().collection('submissions').doc(submissionId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
        return null;
    }

    return snapshot.data() as SubmissionData;
}

export async function getUserSubmissions(
    userId: string,
    limit: number = 20,
    challengeId?: string
): Promise<SubmissionData[]> {
    let query: FirebaseFirestore.Query = adminDb().collection('submissions')
        .where('userId', '==', userId);

    if (challengeId) {
        query = query.where('challengeId', '==', challengeId);
    }

    query = query.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as SubmissionData);
}
