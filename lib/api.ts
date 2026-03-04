/**
 * Typed API client for Codo.
 * Uses relative /api paths — works seamlessly on Next.js (localhost & Vercel).
 */

import { auth } from '@/lib/firebase/client';

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    params?: Record<string, string | number | undefined>;
};

/**
 * Authenticated API request helper.
 * Automatically attaches Firebase ID token as Authorization header.
 */
export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = 'GET', body, params } = options;

    const currentUser = auth.currentUser;
    const token = currentUser ? await currentUser.getIdToken() : null;

    // Build URL (uses relative path — works on both local and Vercel)
    let url = `/api${path}`;
    if (params) {
        const qs = new URLSearchParams(
            Object.entries(params)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, String(v)])
        ).toString();
        if (qs) url += `?${qs}`;
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message ?? `API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

// ─── Typed API helpers ─────────────────────────────────────────────────────

export const api = {
    auth: {
        register: (email: string, password: string, username: string) =>
            apiRequest('/auth/register', { method: 'POST', body: { email, password, username } }),
        logout: () => apiRequest('/auth/logout', { method: 'POST' }),
        verify: () => apiRequest('/auth/verify'),
        passwordReset: (email: string) =>
            apiRequest('/auth/password-reset', { method: 'POST', body: { email } }),
    },

    users: {
        get: (userId: string) => apiRequest(`/users/${userId}`),
        update: (userId: string, data: Record<string, unknown>) =>
            apiRequest(`/users/${userId}`, { method: 'PUT', body: data }),
        statistics: (userId: string) => apiRequest(`/users/${userId}/statistics`),
        dashboard: (userId: string) => apiRequest(`/progress/user/${userId}/dashboard`),
        achievements: (userId: string) => apiRequest(`/progress/user/${userId}/achievements`),
        progress: (userId: string) => apiRequest(`/progress/user/${userId}/progress`),
    },

    challenges: {
        list: (params?: { difficulty?: string; category?: string; limit?: number }) =>
            apiRequest('/challenges', { params: params as Record<string, string | number> }),
        get: (id: string) => apiRequest(`/challenges/${id}`),
    },

    submissions: {
        submit: (challengeId: string, code: string, language: string) =>
            apiRequest('/submissions', { method: 'POST', body: { challengeId, code, language } }),
        get: (id: string) => apiRequest(`/submissions/${id}`),
        userHistory: (userId: string, params?: { challengeId?: string; limit?: number }) =>
            apiRequest(`/submissions/user/${userId}`, { params: params as Record<string, string | number> }),
        analysis: (submissionId: string) =>
            apiRequest(`/mistakes/submission/${submissionId}/analysis`),
    },

    leaderboards: {
        global: () => apiRequest('/leaderboards/global'),
        challenge: (challengeId: string) => apiRequest(`/leaderboards/challenge/${challengeId}`),
        userRank: (userId: string) => apiRequest(`/leaderboards/user/${userId}/rank`),
        guilds: () => apiRequest('/leaderboards/guilds'),
    },

    guilds: {
        create: (name: string, description: string, isPublic: boolean) =>
            apiRequest('/guilds', { method: 'POST', body: { name, description, isPublic } }),
        get: (id: string) => apiRequest(`/guilds/${id}`),
        members: (id: string) => apiRequest(`/guilds/${id}/members`),
        join: (id: string) => apiRequest(`/guilds/${id}/members`, { method: 'POST' }),
        invite: (guildId: string, invitedUserId: string) =>
            apiRequest(`/guilds/${guildId}/invitations`, { method: 'POST', body: { invitedUserId } }),
        acceptInvite: (guildId: string, invitationId: string) =>
            apiRequest(`/guilds/${guildId}/invitations/${invitationId}/accept`, { method: 'POST' }),
    },

    lessons: {
        list: (params?: { category?: string; difficulty?: string }) =>
            apiRequest('/lessons', { params: params as Record<string, string> }),
        get: (id: string) => apiRequest(`/lessons/${id}`),
        complete: (id: string) => apiRequest(`/lessons/${id}/complete`, { method: 'POST' }),
    },

    notifications: {
        list: () => apiRequest('/notifications'),
        unread: () => apiRequest('/notifications/unread'),
        markRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
        delete: (id: string) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),
    },
};
