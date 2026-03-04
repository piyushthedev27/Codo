import { getConfig, AppConfig } from '../../lib/config/env';

describe('getConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should throw an error if required server variables are missing', () => {
        // Clear all firebase variables
        delete process.env.FIREBASE_PROJECT_ID;
        delete process.env.FIREBASE_CLIENT_EMAIL;
        delete process.env.FIREBASE_PRIVATE_KEY;
        delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        expect(() => getConfig(true)).toThrow(/Missing required server environment variables/);
    });

    it('should load configuration successfully from individual variables', () => {
        process.env.FIREBASE_PROJECT_ID = 'test-project';
        process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
        process.env.FIREBASE_PRIVATE_KEY = 'test-key\\nline2';

        const config = getConfig(true);

        expect(config.firebase.projectId).toBe('test-project');
        expect(config.firebase.clientEmail).toBe('test@example.com');
        expect(config.firebase.privateKey).toBe('test-key\nline2');
    });

    it('should load configuration successfully from FIREBASE_SERVICE_ACCOUNT_KEY JSON', () => {
        delete process.env.FIREBASE_PROJECT_ID;
        delete process.env.FIREBASE_CLIENT_EMAIL;
        delete process.env.FIREBASE_PRIVATE_KEY;

        process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
            project_id: 'json-project',
            client_email: 'json@example.com',
            private_key: 'json-key',
        });

        const config = getConfig(true);

        expect(config.firebase.projectId).toBe('json-project');
        expect(config.firebase.clientEmail).toBe('json@example.com');
        expect(config.firebase.privateKey).toBe('json-key');
    });

    it('should throw an error if FIREBASE_SERVICE_ACCOUNT_KEY is invalid JSON', () => {
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY = 'invalid-json';

        expect(() => getConfig(true)).toThrow(/Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON format/);
    });
});
