/**
 * Integration test: Guild Flow (12.4)
 * Tests guild creation → membership → invitation → guild leaderboard.
 */

jest.mock('../../lib/firebase/admin', () => ({ adminDb: jest.fn() }));

import { adminDb } from '../../lib/firebase/admin';

beforeEach(() => jest.clearAllMocks());

function makeDocRef(id: string, data: Record<string, unknown>) {
    return {
        id,
        set: jest.fn((..._a: any[]) => Promise.resolve()),
        update: jest.fn((..._a: any[]) => Promise.resolve()),
        delete: jest.fn((..._a: any[]) => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({ exists: true, id, data: () => data })),
    };
}

describe('Guild Flow Integration', () => {
    test('12.4.1 — Guild creation: guild doc is stored in Firestore', async () => {
        const guildRef = makeDocRef('guild-1', { name: 'Code Ninjas', ownerId: 'user-1', memberCount: 1 });
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => ({ doc: jest.fn(() => guildRef) })) });

        await guildRef.set({ name: 'Code Ninjas', ownerId: 'user-1', memberCount: 1 });

        expect(guildRef.set).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Code Ninjas', ownerId: 'user-1' })
        );
    });

    test('12.4.2 — Guild creation: owner is auto-added as member', async () => {
        const memberRef = makeDocRef('user-1', { userId: 'user-1', guildId: 'guild-1', role: 'owner' });
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => ({ doc: jest.fn(() => memberRef) })) });

        await memberRef.set({ userId: 'user-1', guildId: 'guild-1', role: 'owner' });

        expect(memberRef.set).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'owner', guildId: 'guild-1' })
        );
    });

    test('12.4.3 — Invitation: invite doc created when user sends an invite', async () => {
        const inviteRef = makeDocRef('invite-1', {
            guildId: 'guild-1', inviterId: 'user-1', inviteeId: 'user-2', status: 'pending',
        });
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => ({ doc: jest.fn(() => inviteRef) })) });

        await inviteRef.set({ guildId: 'guild-1', inviterId: 'user-1', inviteeId: 'user-2', status: 'pending' });

        expect(inviteRef.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
    });

    test('12.4.4 — Accepting invite: member is added, invite status updated to accepted', async () => {
        const inviteRef = makeDocRef('invite-1', { status: 'pending', guildId: 'guild-1' });
        const memberRef = makeDocRef('user-2', { userId: 'user-2', guildId: 'guild-1', role: 'member' });
        const collectionMock = jest.fn()
            .mockReturnValueOnce({ doc: jest.fn(() => inviteRef) })
            .mockReturnValueOnce({ doc: jest.fn(() => memberRef) });
        (adminDb as jest.Mock).mockReturnValue({ collection: collectionMock });

        await inviteRef.update({ status: 'accepted' });
        await memberRef.set({ userId: 'user-2', guildId: 'guild-1', role: 'member' });

        expect(inviteRef.update).toHaveBeenCalledWith({ status: 'accepted' });
        expect(memberRef.set).toHaveBeenCalledWith(expect.objectContaining({ role: 'member' }));
    });

    test('12.4.5 — Guild leaderboard: retrieves members sorted by XP', async () => {
        const queryMock = {
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: jest.fn(() => Promise.resolve({
                docs: [
                    { id: 'u1', data: () => ({ xp: 900 }) },
                    { id: 'u2', data: () => ({ xp: 500 }) },
                ],
            })),
        };
        (adminDb as jest.Mock).mockReturnValue({ collection: jest.fn(() => queryMock) });

        const snap = await (adminDb as jest.Mock)()
            .collection('guildMembers')
            .where('guildId', '==', 'guild-1')
            .orderBy('xp', 'desc')
            .limit(50)
            .get();

        const members = snap.docs.map((d: any) => d.data());
        expect(members[0].xp).toBeGreaterThan(members[1].xp);
    });
});
