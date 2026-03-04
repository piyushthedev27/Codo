import { adminDb } from './admin';
import { batchDelete, getRefsFromQuery } from './firestoreUtils';

// ---------------------------------------------------------------------------
// Existence Validators
// ---------------------------------------------------------------------------

/**
 * Validates that a user document exists in Firestore.
 */
export async function validateUserExists(userId: string): Promise<boolean> {
    const doc = await adminDb().collection('users').doc(userId).get();
    return doc.exists;
}

/**
 * Validates that a challenge document exists in Firestore.
 */
export async function validateChallengeExists(challengeId: string): Promise<boolean> {
    const doc = await adminDb().collection('challenges').doc(challengeId).get();
    return doc.exists;
}

// ---------------------------------------------------------------------------
// Cascade Delete
// ---------------------------------------------------------------------------

/**
 * Cascades delete for a user — removes all their data across collections.
 * Collections cleaned: submissions, notifications, progress, mistakeAnalysis.
 */
export async function deleteUserData(userId: string): Promise<{
    submissionsDeleted: number;
    notificationsDeleted: number;
    mistakesDeleted: number;
}> {
    const db = adminDb();

    const [submissionRefs, notificationRefs, mistakeRefs] = await Promise.all([
        getRefsFromQuery(db.collection('submissions').where('userId', '==', userId)),
        getRefsFromQuery(db.collection('notifications').where('userId', '==', userId)),
        getRefsFromQuery(db.collection('mistakeAnalysis').where('userId', '==', userId)),
    ]);

    await Promise.all([
        batchDelete(submissionRefs),
        batchDelete(notificationRefs),
        batchDelete(mistakeRefs),
    ]);

    // Delete the user progress doc (single doc, direct delete)
    await db.collection('progress').doc(userId).delete().catch(() => { });

    // Delete the user doc itself
    await db.collection('users').doc(userId).delete();

    return {
        submissionsDeleted: submissionRefs.length,
        notificationsDeleted: notificationRefs.length,
        mistakesDeleted: mistakeRefs.length,
    };
}

// ---------------------------------------------------------------------------
// Orphan Cleanup
// ---------------------------------------------------------------------------

/**
 * Finds and deletes submissions that reference non-existent challenges.
 * Scans all submissions and verifies challenge existence.
 * NOTE: This is expensive for large datasets — run as a maintenance job, not on every request.
 */
export async function deleteOrphanedSubmissions(): Promise<number> {
    const db = adminDb();

    const submissionsSnap = await db.collection('submissions').get();
    if (submissionsSnap.empty) return 0;

    // Get unique challenge IDs referenced by submissions
    const challengeIds = [
        ...new Set(submissionsSnap.docs.map((d) => d.data().challengeId as string).filter(Boolean)),
    ];

    // Check which challenges actually exist
    const existenceChecks = await Promise.all(
        challengeIds.map(async (id) => ({ id, exists: await validateChallengeExists(id) }))
    );
    const missingChallengeIds = new Set(
        existenceChecks.filter((c) => !c.exists).map((c) => c.id)
    );

    if (missingChallengeIds.size === 0) return 0;

    // Collect orphaned submission refs
    const orphanedRefs = submissionsSnap.docs
        .filter((doc) => missingChallengeIds.has(doc.data().challengeId))
        .map((doc) => doc.ref);

    await batchDelete(orphanedRefs);
    return orphanedRefs.length;
}
