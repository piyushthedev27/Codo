import {
    createGuild,
    getGuild,
    updateGuild,
    deleteGuild,
    joinGuild,
    getGuildMembers,
    removeMember,
    createInvitation,
    getInvitations,
    acceptInvitation,
    validateGuildName
} from '../../lib/services/guildService';
import { adminDb } from '../../lib/firebase/admin';
import fc from 'fast-check';
import { FieldValue } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Mock Firebase Admin
// ---------------------------------------------------------------------------
const mockBatch = {
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
};

jest.mock('../../lib/firebase/admin', () => {
    return {
        adminDb: jest.fn(),
    };
});

describe('Guild Service Properties', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default adminDb mock
        (adminDb as jest.Mock).mockReturnValue({
            batch: jest.fn(() => mockBatch),
            collection: jest.fn().mockReturnThis(),
            doc: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: jest.fn(() => Promise.resolve({ empty: true, exists: false })),
        });
    });

    // -----------------------------------------------------------------------
    // Property 33: Guild Name Validation & Creation
    // -----------------------------------------------------------------------
    test('Property 33: guild name < 3 chars rejected', () => {
        fc.assert(
            fc.property(
                fc.string({ maxLength: 2 }),
                (name) => validateGuildName(name) !== null
            )
        );
    });

    test('Property 33: guild name > 50 chars rejected', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 51 }),
                (name) => validateGuildName(name) !== null
            )
        );
    });

    test('Property 33: createGuild sets owner and memberCount=1', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
                fc.string(),
                fc.boolean(),
                fc.uuid(),
                async (name, desc, isPub, ownerId) => {
                    mockBatch.set.mockClear();

                    // Mock name check to false
                    const mockGet = jest.fn(() => Promise.resolve({ empty: true }));
                    const mockLimit = jest.fn(() => ({ get: mockGet }));
                    const mockWhere = jest.fn(() => ({ limit: mockLimit }));

                    const mockDoc = { id: 'mock-guild-id', collection: jest.fn().mockReturnThis(), doc: jest.fn().mockReturnThis() };
                    const mockCollection = jest.fn((colName) => {
                        if (colName === 'guilds') return { doc: () => mockDoc, where: mockWhere };
                        return { doc: () => ({ id: 'mock-id' }) };
                    });

                    (adminDb as jest.Mock).mockReturnValue({
                        collection: mockCollection,
                        batch: () => mockBatch,
                    });

                    await createGuild({ name, description: desc, isPublic: isPub }, ownerId);

                    expect(mockBatch.set).toHaveBeenCalledTimes(2);

                    const guildArg = mockBatch.set.mock.calls[0][1];
                    expect(guildArg.name).toBe(name.trim());
                    expect(guildArg.ownerId).toBe(ownerId);
                    expect(guildArg.memberCount).toBe(1);

                    const memberArg = mockBatch.set.mock.calls[1][1];
                    expect(memberArg.uid).toBe(ownerId);
                    expect(memberArg.role).toBe('owner');
                }
            ),
            { numRuns: 10 }
        );
    });

    // -----------------------------------------------------------------------
    // Property 34: Membership Access Control
    // -----------------------------------------------------------------------
    test('Property 34: joinGuild succeeds for public guild', async () => {
        const mockGuildDoc = {
            exists: true,
            data: () => ({ isPublic: true, ownerId: 'owner' })
        };
        const mockMemberDoc = { exists: false };

        mockBatch.set.mockClear();
        mockBatch.update.mockClear();

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn((name) => ({
                doc: jest.fn(() => ({
                    get: jest.fn(() => name === 'guilds' ? Promise.resolve(mockGuildDoc) : Promise.resolve(mockMemberDoc)),
                    collection: jest.fn(() => ({
                        doc: jest.fn(() => ({
                            get: jest.fn(() => Promise.resolve(mockMemberDoc))
                        }))
                    }))
                }))
            })),
            batch: () => mockBatch,
        });

        await joinGuild('g1', 'u1');
        expect(mockBatch.set).toHaveBeenCalled();
        expect(mockBatch.update).toHaveBeenCalled();
    });

    test('Property 34: private guild join without invite rejected', async () => {
        const mockGuildDoc = {
            exists: true,
            data: () => ({ isPublic: false, ownerId: 'owner' })
        };
        const mockMemberDoc = { exists: false };
        const mockInviteSnap = { empty: true };

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn((name) => {
                if (name === 'guildInvitations') {
                    return {
                        where: jest.fn().mockReturnThis(),
                        limit: jest.fn().mockReturnValue({ get: () => Promise.resolve(mockInviteSnap) })
                    };
                }
                return {
                    doc: jest.fn(() => ({
                        get: jest.fn(() => Promise.resolve(mockGuildDoc)),
                        collection: jest.fn(() => ({
                            doc: jest.fn(() => ({
                                get: jest.fn(() => Promise.resolve(mockMemberDoc))
                            }))
                        }))
                    }))
                };
            }),
            batch: () => mockBatch,
        });

        await expect(joinGuild('g1', 'u1'))
            .rejects
            .toThrow('This guild is private. You need an invitation to join.');
    });

    // -----------------------------------------------------------------------
    // Property 35: Invitation Expiration
    // -----------------------------------------------------------------------
    test('Property 35: createInvitation sets 7-day TTL', async () => {
        const mockGuildDoc = {
            exists: true,
            data: () => ({ isPublic: false, ownerId: 'owner' })
        };

        mockBatch.set.mockClear();
        const mockDoc = jest.fn(() => ({
            id: 'inv1',
            set: mockBatch.set,
            get: jest.fn(() => Promise.resolve(mockGuildDoc))
        }));

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({
                doc: mockDoc
            })),
            batch: () => mockBatch,
        });

        await createInvitation('g1', 'test@test.com', 'owner');

        expect(mockBatch.set).toHaveBeenCalled();
        const callArgs = mockBatch.set.mock.calls[0][0];

        const now = new Date();
        const expiresAt = callArgs.expiresAt as Date;
        const diffDays = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        expect(diffDays).toBe(7);
        expect(callArgs.status).toBe('pending');
    });

    test('Property 35: expired invitation rejected on accept', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const mockInvDoc = {
            exists: true,
            data: () => ({
                status: 'pending',
                expiresAt: pastDate,
                guildId: 'g1'
            })
        };

        const mockUpdate = jest.fn();

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({
                doc: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve(mockInvDoc)),
                    update: mockUpdate
                }))
            })),
            batch: () => mockBatch,
        });

        await expect(acceptInvitation('inv1', 'u1'))
            .rejects
            .toThrow('Invitation has expired.');

        expect(mockUpdate).toHaveBeenCalledWith({ status: 'expired' });
    });

    // -----------------------------------------------------------------------
    // Properties 37/38/39: Owner Authorization
    // -----------------------------------------------------------------------
    test('Property 37/39: Non-owner cannot remove member or update settings', async () => {
        const mockGuildDoc = {
            exists: true,
            data: () => ({ isPublic: true, ownerId: 'owner' })
        };

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({
                doc: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve(mockGuildDoc)),
                    collection: jest.fn()
                }))
            })),
            batch: () => mockBatch,
        });

        await expect(removeMember('g1', 'u1', 'non-owner'))
            .rejects
            .toThrow('Only the guild owner can remove members.');

        await expect(updateGuild('g1', { description: 'new' }, 'non-owner'))
            .rejects
            .toThrow('Only the guild owner can update settings.');
    });
});
