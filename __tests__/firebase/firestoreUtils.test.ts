import { batchSet, batchUpdate, batchDelete, runTransaction } from '../../lib/firebase/firestoreUtils';
import { adminDb } from '../../lib/firebase/admin';

// ---------------------------------------------------------------------------
// Mock Firebase Admin
// ---------------------------------------------------------------------------
jest.mock('../../lib/firebase/admin', () => ({
    adminDb: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRef(id: string) {
    return { id } as any;
}

function makeBatch() {
    return {
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn(() => Promise.resolve()),
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

// ===========================================================================
// batchSet
// ===========================================================================
describe('batchSet', () => {
    test('calls batch.set for each item and commits', async () => {
        const batch = makeBatch();
        (adminDb as jest.Mock).mockReturnValue({ batch: () => batch });

        const items = [
            { ref: makeRef('doc1'), data: { name: 'Alice' } },
            { ref: makeRef('doc2'), data: { name: 'Bob' } },
        ];

        await batchSet(items);

        expect(batch.set).toHaveBeenCalledTimes(2);
        expect(batch.set).toHaveBeenCalledWith(makeRef('doc1'), { name: 'Alice' });
        expect(batch.set).toHaveBeenCalledWith(makeRef('doc2'), { name: 'Bob' });
        expect(batch.commit).toHaveBeenCalledTimes(1);
    });

    test('does nothing for empty array', async () => {
        const batch = makeBatch();
        (adminDb as jest.Mock).mockReturnValue({ batch: () => batch });

        await batchSet([]);

        expect(batch.commit).not.toHaveBeenCalled();
    });
});

// ===========================================================================
// batchUpdate
// ===========================================================================
describe('batchUpdate', () => {
    test('calls batch.update for each item and commits', async () => {
        const batch = makeBatch();
        (adminDb as jest.Mock).mockReturnValue({ batch: () => batch });

        const items = [
            { ref: makeRef('doc1'), data: { score: 100 } },
            { ref: makeRef('doc2'), data: { score: 200 } },
        ];

        await batchUpdate(items);

        expect(batch.update).toHaveBeenCalledTimes(2);
        expect(batch.commit).toHaveBeenCalledTimes(1);
    });

    test('does nothing for empty array', async () => {
        const batch = makeBatch();
        (adminDb as jest.Mock).mockReturnValue({ batch: () => batch });

        await batchUpdate([]);

        expect(batch.commit).not.toHaveBeenCalled();
    });
});

// ===========================================================================
// batchDelete
// ===========================================================================
describe('batchDelete', () => {
    test('calls batch.delete for each ref and commits', async () => {
        const batch = makeBatch();
        (adminDb as jest.Mock).mockReturnValue({ batch: () => batch });

        const refs = [makeRef('doc1'), makeRef('doc2'), makeRef('doc3')];

        await batchDelete(refs);

        expect(batch.delete).toHaveBeenCalledTimes(3);
        expect(batch.commit).toHaveBeenCalledTimes(1);
    });

    test('does nothing for empty array', async () => {
        const batch = makeBatch();
        (adminDb as jest.Mock).mockReturnValue({ batch: () => batch });

        await batchDelete([]);

        expect(batch.commit).not.toHaveBeenCalled();
    });
});

// ===========================================================================
// batchSet — chunking
// ===========================================================================
describe('batchSet (chunking)', () => {
    test('splits into multiple batches when more than 500 items', async () => {
        const batch = makeBatch();
        (adminDb as jest.Mock).mockReturnValue({ batch: () => batch });

        // 501 items → should trigger 2 commits
        const items = Array.from({ length: 501 }, (_, i) => ({
            ref: makeRef(`doc${i}`),
            data: { i },
        }));

        await batchSet(items);

        expect(batch.commit).toHaveBeenCalledTimes(2);
    });
});

// ===========================================================================
// runTransaction
// ===========================================================================
describe('runTransaction', () => {
    test('calls adminDb().runTransaction with the provided callback', async () => {
        const result = { ok: true };
        const runTransactionMock = jest.fn((fn: any) => fn({ get: jest.fn(), set: jest.fn() }));
        (adminDb as jest.Mock).mockReturnValue({ runTransaction: runTransactionMock });

        const fn = jest.fn(() => Promise.resolve(result));
        await runTransaction(fn);

        expect(runTransactionMock).toHaveBeenCalled();
        expect(fn).toHaveBeenCalled();
    });
});
