import { adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MistakeAnalysis {
    id?: string;
    submissionId: string;
    userId: string;
    challengeId: string;
    errorCategory: 'compilation' | 'runtime' | 'logic' | 'timeout' | 'memory';
    description: string;
    suggestions: string[];
    relatedLessons: string[];
    commonMistakeType: string;
    createdAt: Date | FieldValue;
}

export interface MistakeStats {
    totalMistakes: number;
    byCategory: Record<string, number>;
    commonTypes: Array<{ type: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Analysis Logic
// ---------------------------------------------------------------------------

export async function analyzeSubmission(
    submissionId: string,
    userId: string,
    challengeId: string,
    status: string,
    errorMessage: string | null
): Promise<string | null> {
    if (status === 'success') return null;

    let category: MistakeAnalysis['errorCategory'] = 'logic';
    let description = 'Logical error in the code.';
    let suggestions: string[] = ['Check your algorithm and edge cases.'];
    let commonMistakeType = 'unknown';

    if (status === 'compilation_error') {
        category = 'compilation';
        description = 'The code failed to compile.';
        suggestions = ['Check for syntax errors or missing imports.', 'Verify variable names and types.'];
        if (errorMessage?.includes('unexpected token')) commonMistakeType = 'syntax-error';
    } else if (status === 'runtime_error') {
        category = 'runtime';
        description = 'The code encountered an error during execution.';
        suggestions = ['Check for null pointers or undefined variables.', 'Verify array bounds.'];
        if (errorMessage?.includes('cannot read property')) commonMistakeType = 'null-pointer';
    } else if (status === 'timeout') {
        category = 'timeout';
        description = 'The execution took too long.';
        suggestions = ['Optimize your algorithm.', 'Check for infinite loops.'];
        commonMistakeType = 'infinite-loop';
    } else if (status === 'memory_limit_exceeded') {
        category = 'memory';
        description = 'The code used too much memory.';
        suggestions = ['Reduce memory usage.', 'Avoid creating large objects unnecessarily.'];
        commonMistakeType = 'memory-leak';
    }

    const analysisRef = adminDb().collection('mistakeAnalysis');
    const docRef = analysisRef.doc();

    const analysis: MistakeAnalysis = {
        id: docRef.id,
        submissionId,
        userId,
        challengeId,
        errorCategory: category,
        description,
        suggestions,
        relatedLessons: [],
        commonMistakeType,
        createdAt: FieldValue.serverTimestamp()
    };

    await docRef.set(analysis);
    return docRef.id;
}

export async function getMistakeAnalysisBySubmission(submissionId: string): Promise<MistakeAnalysis | null> {
    const snapshot = await adminDb()
        .collection('mistakeAnalysis')
        .where('submissionId', '==', submissionId)
        .limit(1)
        .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as MistakeAnalysis;
}

export async function getUsersMistakeStats(userId: string): Promise<MistakeStats> {
    const snapshot = await adminDb()
        .collection('mistakeAnalysis')
        .where('userId', '==', userId)
        .get();

    const stats: MistakeStats = {
        totalMistakes: snapshot.size,
        byCategory: {},
        commonTypes: []
    };

    const typeCount: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
        const data = doc.data() as MistakeAnalysis;
        stats.byCategory[data.errorCategory] = (stats.byCategory[data.errorCategory] || 0) + 1;
        if (data.commonMistakeType) {
            typeCount[data.commonMistakeType] = (typeCount[data.commonMistakeType] || 0) + 1;
        }
    });

    stats.commonTypes = Object.entries(typeCount)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

    return stats;
}
