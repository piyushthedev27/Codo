/**
 * Environment configuration loader and validator.
 * Ensures the application fails fast if critical environment variables are missing.
 */

export interface AppConfig {
    env: 'development' | 'production' | 'test';
    port: number;
    firebase: {
        projectId: string;
        clientEmail: string;
        privateKey: string;
    };
}

let cachedConfig: AppConfig | null = null;

export function getConfig(forceReload = false): AppConfig {
    if (cachedConfig && !forceReload) {
        return cachedConfig;
    }

    const env = (process.env.NODE_ENV as AppConfig['env']) || 'development';
    const port = parseInt(process.env.PORT || '3000', 10);

    let projectId = process.env.FIREBASE_PROJECT_ID;
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Support single JSON service account key injection
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
        try {
            const parsed = JSON.parse(serviceAccountJson);
            projectId = projectId ?? parsed.project_id;
            clientEmail = clientEmail ?? parsed.client_email;
            privateKey = privateKey ?? parsed.private_key;
        } catch {
            throw new Error('CONFIG ERROR: Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON format');
        }
    }

    // Validation
    const missing: string[] = [];
    if (!projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');

    // In Next.js, we might load this file during client-side build where secrets
    // aren't available. We only enforce secrets purely on the SERVER.
    if (typeof window === 'undefined' && missing.length > 0) {
        // We only throw in production or if executing backend logic.
        // During local dev, we might be relying on the emulator, but for CODO backend,
        // we strictly require credentials.
        throw new Error(
            `CONFIG ERROR: Missing required server environment variables: ${missing.join(', ')}\n` +
            `Please provide them individually or supply a valid FIREBASE_SERVICE_ACCOUNT_KEY JSON string.`
        );
    }

    cachedConfig = {
        env,
        port,
        firebase: {
            projectId: projectId ?? '',
            clientEmail: clientEmail ?? '',
            privateKey: privateKey?.replace(/\\n/g, '\n') ?? '',
        },
    };

    return cachedConfig;
}
