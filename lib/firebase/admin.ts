/**
 * Firebase Admin SDK — SERVER SIDE ONLY
 * Used in Next.js API Routes to verify tokens and access Firestore with admin privileges.
 * NEVER import this in client components!
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initAdminApp() {
    // Return existing app if already initialized
    if (getApps().length > 0) return getApps()[0];

    // Option 1: Full JSON service account key (recommended for Vercel)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
        try {
            return initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
        } catch {
            console.warn('Firebase Admin: Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON');
        }
    }

    // Option 2: Individual environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    }

    // No env vars set — warn and return undefined (safe for build time)
    if (process.env.NODE_ENV !== 'production') {
        console.warn(
            '⚠️  Firebase Admin SDK not configured. API routes require environment variables:\n' +
            '   FIREBASE_SERVICE_ACCOUNT_KEY (or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)'
        );
    }
    return undefined;
}

export function getAdminServices() {
    const app = initAdminApp();
    if (!app) {
        throw new Error(
            'Firebase Admin SDK not initialized. ' +
            'Please set FIREBASE_SERVICE_ACCOUNT_KEY (or the 3 individual vars) in your environment.'
        );
    }
    return {
        adminAuth: getAuth(app),
        adminDb: getFirestore(app),
    };
}

// Named exports for convenience — will throw at runtime if env vars are missing
export function getAdminAuth() {
    return getAdminServices().adminAuth;
}

export function getAdminDb() {
    return getAdminServices().adminDb;
}

// Re-export these as singletons lazily (no top-level initialization)
export { getAuth as initAuth, getFirestore as initFirestore };

// Default: lazy-initialized singletons for direct import in API routes
let _auth: ReturnType<typeof getAuth> | undefined;
let _db: ReturnType<typeof getFirestore> | undefined;

export function adminAuth() {
    if (!_auth) _auth = getAdminServices().adminAuth;
    return _auth;
}

export function adminDb() {
    if (!_db) _db = getAdminServices().adminDb;
    return _db;
}
