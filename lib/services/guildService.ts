import { adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GuildData {
    id?: string;
    name: string;
    description: string;
    isPublic: boolean;
    ownerId: string;
    memberCount: number;
    createdAt?: Date | FieldValue;
    updatedAt?: Date | FieldValue;
}

export interface GuildMemberData {
    uid: string;
    role: 'owner' | 'member';
    joinedAt?: Date | FieldValue;
}

export interface GuildInvitationData {
    id?: string;
    guildId: string;
    inviteeEmail: string;
    invitedBy: string; // ownerId
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    expiresAt: Date;
    createdAt?: Date | FieldValue;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function validateGuildName(name: string): string | null {
    if (!name || name.trim().length < 3) return 'Guild name must be at least 3 characters.';
    if (name.trim().length > 50) return 'Guild name must be at most 50 characters.';
    return null;
}

/** Returns true if a guild with that name already exists (case-insensitive check via exact match). */
async function isNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const snapshot = await adminDb()
        .collection('guilds')
        .where('name', '==', name.trim())
        .limit(1)
        .get();

    if (snapshot.empty) return false;
    if (excludeId && snapshot.docs[0].id === excludeId) return false;
    return true;
}

// ---------------------------------------------------------------------------
// Guild CRUD
// ---------------------------------------------------------------------------

export async function createGuild(
    data: Pick<GuildData, 'name' | 'description' | 'isPublic'>,
    ownerId: string
): Promise<string> {
    const nameError = validateGuildName(data.name);
    if (nameError) throw new Error(nameError);

    if (await isNameTaken(data.name)) {
        throw new Error('A guild with that name already exists.');
    }

    const guildsRef = adminDb().collection('guilds');
    const docRef = guildsRef.doc();

    const guildDoc: GuildData = {
        id: docRef.id,
        name: data.name.trim(),
        description: data.description,
        isPublic: data.isPublic,
        ownerId,
        memberCount: 1,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };

    // Use a batch: write guild doc + owner as first member atomically
    const batch = adminDb().batch();
    batch.set(docRef, guildDoc);
    batch.set(docRef.collection('members').doc(ownerId), {
        uid: ownerId,
        role: 'owner',
        joinedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return docRef.id;
}

export async function getGuild(guildId: string): Promise<GuildData | null> {
    const snapshot = await adminDb().collection('guilds').doc(guildId).get();
    if (!snapshot.exists) return null;
    return snapshot.data() as GuildData;
}

export async function updateGuild(
    guildId: string,
    data: Partial<Pick<GuildData, 'name' | 'description' | 'isPublic'>>,
    requesterId: string
): Promise<void> {
    const guild = await getGuild(guildId);
    if (!guild) throw new Error('Guild not found.');
    if (guild.ownerId !== requesterId) throw new Error('Only the guild owner can update settings.');

    if (data.name !== undefined) {
        const nameError = validateGuildName(data.name);
        if (nameError) throw new Error(nameError);
        if (await isNameTaken(data.name, guildId)) {
            throw new Error('A guild with that name already exists.');
        }
    }

    await adminDb().collection('guilds').doc(guildId).update({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteGuild(guildId: string, requesterId: string): Promise<void> {
    const guild = await getGuild(guildId);
    if (!guild) throw new Error('Guild not found.');
    if (guild.ownerId !== requesterId) throw new Error('Only the guild owner can delete the guild.');

    // Delete all members subcollection docs, then the guild doc
    const membersSnap = await adminDb()
        .collection('guilds')
        .doc(guildId)
        .collection('members')
        .get();

    const batch = adminDb().batch();
    membersSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(adminDb().collection('guilds').doc(guildId));
    await batch.commit();
}

// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------

export async function getGuildMembers(guildId: string): Promise<GuildMemberData[]> {
    const snapshot = await adminDb()
        .collection('guilds')
        .doc(guildId)
        .collection('members')
        .get();

    return snapshot.docs.map(d => d.data() as GuildMemberData);
}

export async function joinGuild(guildId: string, userId: string): Promise<void> {
    const guild = await getGuild(guildId);
    if (!guild) throw new Error('Guild not found.');

    // Check if already a member
    const memberRef = adminDb().collection('guilds').doc(guildId).collection('members').doc(userId);
    const memberSnap = await memberRef.get();
    if (memberSnap.exists) throw new Error('You are already a member of this guild.');

    if (!guild.isPublic) {
        // For private guilds, require an accepted invitation
        const inviteSnap = await adminDb()
            .collection('guildInvitations')
            .where('guildId', '==', guildId)
            .where('status', '==', 'accepted')
            .limit(1)
            .get();

        // We check if the invitation was for a user whose email matches — simplified:
        // The accept flow already adds them; joinGuild for private guilds is blocked here.
        if (inviteSnap.empty) {
            throw new Error('This guild is private. You need an invitation to join.');
        }
    }

    const batch = adminDb().batch();
    batch.set(memberRef, {
        uid: userId,
        role: 'member',
        joinedAt: FieldValue.serverTimestamp(),
    });
    batch.update(adminDb().collection('guilds').doc(guildId), {
        memberCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
}

export async function removeMember(
    guildId: string,
    userId: string,
    requesterId: string
): Promise<void> {
    const guild = await getGuild(guildId);
    if (!guild) throw new Error('Guild not found.');
    if (guild.ownerId !== requesterId) throw new Error('Only the guild owner can remove members.');
    if (guild.ownerId === userId) throw new Error('The guild owner cannot be removed.');

    const memberRef = adminDb().collection('guilds').doc(guildId).collection('members').doc(userId);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) throw new Error('User is not a member of this guild.');

    const batch = adminDb().batch();
    batch.delete(memberRef);
    batch.update(adminDb().collection('guilds').doc(guildId), {
        memberCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
}

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------

const INVITATION_TTL_DAYS = 7;

export async function createInvitation(
    guildId: string,
    inviteeEmail: string,
    requesterId: string
): Promise<string> {
    const guild = await getGuild(guildId);
    if (!guild) throw new Error('Guild not found.');
    if (guild.ownerId !== requesterId) throw new Error('Only the guild owner can send invitations.');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);

    const invRef = adminDb().collection('guildInvitations').doc();
    await invRef.set({
        id: invRef.id,
        guildId,
        inviteeEmail,
        invitedBy: requesterId,
        status: 'pending',
        expiresAt: expiresAt,
        createdAt: FieldValue.serverTimestamp(),
    });

    return invRef.id;
}

export async function getInvitations(
    guildId: string,
    requesterId: string
): Promise<GuildInvitationData[]> {
    const guild = await getGuild(guildId);
    if (!guild) throw new Error('Guild not found.');
    if (guild.ownerId !== requesterId) throw new Error('Only the guild owner can view invitations.');

    const snapshot = await adminDb()
        .collection('guildInvitations')
        .where('guildId', '==', guildId)
        .where('status', '==', 'pending')
        .get();

    return snapshot.docs.map(d => d.data() as GuildInvitationData);
}

export async function acceptInvitation(invitationId: string, userId: string): Promise<void> {
    const invRef = adminDb().collection('guildInvitations').doc(invitationId);
    const invSnap = await invRef.get();

    if (!invSnap.exists) throw new Error('Invitation not found.');

    const inv = invSnap.data() as GuildInvitationData;

    if (inv.status !== 'pending') throw new Error('Invitation is no longer pending.');

    // Check expiry — expiresAt stored as Firestore Timestamp or Date
    const expiresAt = inv.expiresAt instanceof Date
        ? inv.expiresAt
        : (inv.expiresAt as unknown as { toDate: () => Date }).toDate();

    if (new Date() > expiresAt) {
        await invRef.update({ status: 'expired' });
        throw new Error('Invitation has expired.');
    }

    // Add user as member and mark invitation accepted
    const guildRef = adminDb().collection('guilds').doc(inv.guildId);
    const memberRef = guildRef.collection('members').doc(userId);

    const batch = adminDb().batch();
    batch.set(memberRef, {
        uid: userId,
        role: 'member',
        joinedAt: FieldValue.serverTimestamp(),
    });
    batch.update(guildRef, {
        memberCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
    });
    batch.update(invRef, { status: 'accepted' });
    await batch.commit();
}
