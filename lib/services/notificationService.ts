import { adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType =
    | 'friend_activity'
    | 'level_up'
    | 'achievement'
    | 'guild_invite'
    | 'challenge_complete'
    | 'system';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    isRead: boolean;
    metadata?: Record<string, unknown>;
    createdAt: Date | FieldValue;
}

export interface CreateNotificationInput {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// In-memory cache for unread count
// ---------------------------------------------------------------------------

const UNREAD_CACHE_TTL_MS = 30 * 1000; // 30 seconds

const unreadCache = new Map<string, { count: number; expiresAt: number }>();

function getCachedUnreadCount(userId: string): number | null {
    const entry = unreadCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        unreadCache.delete(userId);
        return null;
    }
    return entry.count;
}

function setCachedUnreadCount(userId: string, count: number): void {
    unreadCache.set(userId, { count, expiresAt: Date.now() + UNREAD_CACHE_TTL_MS });
}

export function invalidateUnreadCache(userId: string): void {
    unreadCache.delete(userId);
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Create a new notification for a user and persist to Firestore.
 */
export async function createNotification(input: CreateNotificationInput): Promise<string> {
    const { userId, type, title, body, metadata } = input;

    const docRef = adminDb().collection('notifications').doc();
    await docRef.set({
        userId,
        type,
        title,
        body,
        isRead: false,
        metadata: metadata ?? {},
        createdAt: FieldValue.serverTimestamp(),
    });

    // Invalidate cache so next unread fetch reflects the new notification
    invalidateUnreadCache(userId);

    return docRef.id;
}

/**
 * Retrieve all notifications for a user (ordered newest first).
 */
export async function getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const snap = await adminDb()
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

    return snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, 'id'>),
    }));
}

/**
 * Retrieve only unread notifications for a user.
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
    const snap = await adminDb()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .orderBy('createdAt', 'desc')
        .get();

    const notifications: Notification[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, 'id'>),
    }));

    // Update cache with fresh count
    setCachedUnreadCount(userId, notifications.length);

    return notifications;
}

/**
 * Get the unread count for a user (uses cache when available).
 */
export async function getUnreadCount(userId: string): Promise<number> {
    const cached = getCachedUnreadCount(userId);
    if (cached !== null) return cached;

    const snap = await adminDb()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();

    const count = snap.size;
    setCachedUnreadCount(userId, count);
    return count;
}

/**
 * Mark a notification as read.
 * Verifies ownership before updating.
 */
export async function markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const ref = adminDb().collection('notifications').doc(notificationId);
    const doc = await ref.get();

    if (!doc.exists) return false;
    if (doc.data()!.userId !== userId) return false;

    await ref.update({ isRead: true });
    invalidateUnreadCache(userId);
    return true;
}

/**
 * Delete a notification.
 * Verifies ownership before deleting.
 */
export async function deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const ref = adminDb().collection('notifications').doc(notificationId);
    const doc = await ref.get();

    if (!doc.exists) return false;
    if (doc.data()!.userId !== userId) return false;

    await ref.delete();
    invalidateUnreadCache(userId);
    return true;
}

// ---------------------------------------------------------------------------
// Helper creators
// ---------------------------------------------------------------------------

/**
 * Notify a user when a friend completes a challenge.
 */
export async function createFriendActivityNotification(
    userId: string,
    friendName: string,
    activity: string
): Promise<string> {
    return createNotification({
        userId,
        type: 'friend_activity',
        title: 'Friend Activity',
        body: `${friendName} ${activity}`,
        metadata: { friendName, activity },
    });
}

/**
 * Notify a user about a milestone (level-up or achievement).
 */
export async function createMilestoneNotification(
    userId: string,
    milestone: { type: 'level_up' | 'achievement'; value: string | number }
): Promise<string> {
    const isLevelUp = milestone.type === 'level_up';
    return createNotification({
        userId,
        type: isLevelUp ? 'level_up' : 'achievement',
        title: isLevelUp ? `Level Up! 🎉` : `Achievement Unlocked! 🏆`,
        body: isLevelUp
            ? `Congratulations! You reached Level ${milestone.value}!`
            : `You unlocked the "${milestone.value}" achievement!`,
        metadata: { milestone },
    });
}
