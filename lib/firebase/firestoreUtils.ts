import { adminDb } from './admin';
import type { DocumentReference, DocumentData } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BatchSetItem {
    ref: DocumentReference<DocumentData>;
    data: DocumentData;
}

export interface BatchUpdateItem {
    ref: DocumentReference<DocumentData>;
    data: Partial<DocumentData>;
}

// Firestore batch limit is 500 operations per batch
const BATCH_LIMIT = 500;

// ---------------------------------------------------------------------------
// Batch Set
// ---------------------------------------------------------------------------

/**
 * Atomically writes multiple documents using Firestore batch writes.
 * Automatically splits into multiple batches if more than 500 items.
 */
export async function batchSet(items: BatchSetItem[]): Promise<void> {
    if (items.length === 0) return;

    for (let i = 0; i < items.length; i += BATCH_LIMIT) {
        const chunk = items.slice(i, i + BATCH_LIMIT);
        const batch = adminDb().batch();
        for (const { ref, data } of chunk) {
            batch.set(ref, data);
        }
        await batch.commit();
    }
}

// ---------------------------------------------------------------------------
// Batch Update
// ---------------------------------------------------------------------------

/**
 * Atomically updates multiple documents using Firestore batch writes.
 * Automatically splits into multiple batches if more than 500 items.
 */
export async function batchUpdate(items: BatchUpdateItem[]): Promise<void> {
    if (items.length === 0) return;

    for (let i = 0; i < items.length; i += BATCH_LIMIT) {
        const chunk = items.slice(i, i + BATCH_LIMIT);
        const batch = adminDb().batch();
        for (const { ref, data } of chunk) {
            batch.update(ref, data);
        }
        await batch.commit();
    }
}

// ---------------------------------------------------------------------------
// Batch Delete
// ---------------------------------------------------------------------------

/**
 * Atomically deletes multiple documents using Firestore batch writes.
 * Automatically splits into multiple batches if more than 500 items.
 */
export async function batchDelete(refs: DocumentReference<DocumentData>[]): Promise<void> {
    if (refs.length === 0) return;

    for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
        const chunk = refs.slice(i, i + BATCH_LIMIT);
        const batch = adminDb().batch();
        for (const ref of chunk) {
            batch.delete(ref);
        }
        await batch.commit();
    }
}

// ---------------------------------------------------------------------------
// Transaction Wrapper
// ---------------------------------------------------------------------------

/**
 * Typed wrapper around Firestore runTransaction.
 * Provides a clean API for complex multi-document atomic updates.
 */
export async function runTransaction<T>(
    fn: (transaction: FirebaseFirestore.Transaction) => Promise<T>
): Promise<T> {
    return adminDb().runTransaction(fn);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Collects all document refs from a Firestore query snapshot.
 */
export async function getRefsFromQuery(
    query: FirebaseFirestore.Query<DocumentData>
): Promise<DocumentReference<DocumentData>[]> {
    const snap = await query.get();
    return snap.docs.map((doc) => doc.ref);
}
