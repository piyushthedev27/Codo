import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { generateCinemaScript, clearCinemaCache, stopCleanupInterval } from '@/lib/services/cinemaService';

// Mock dependencies
jest.mock('@/lib/firebase/admin');
jest.mock('@/lib/services/cinemaService');

// Import the route handler after mocking
// We need to import the actual handler function for testing
const handler = async (request: NextRequest) => {
    const { POST } = await import('@/app/api/cinema/generate/route');
    // The POST export is wrapped with rate limiting, but for unit tests we can call it directly
    return POST(request);
};

describe('POST /api/cinema/generate', () => {
    const mockVerifyIdToken = jest.fn();

    beforeAll(() => {
        (adminAuth as jest.Mock).mockReturnValue({
            verifyIdToken: mockVerifyIdToken
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (clearCinemaCache as jest.Mock).mockImplementation(() => {});
        (stopCleanupInterval as jest.Mock).mockImplementation(() => {});
    });

    it('should return 401 if no authorization header', async () => {
        const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
            method: 'POST',
            body: JSON.stringify({ topic: 'Arrays' })
        });

        const response = await handler(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Unauthorized');
    });

    it('should return 401 if authorization header is invalid', async () => {
        const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
            method: 'POST',
            headers: {
                'Authorization': 'InvalidToken'
            },
            body: JSON.stringify({ topic: 'Arrays' })
        });

        const response = await handler(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Unauthorized');
    });

    it('should return 400 if topic is missing', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });

        const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({})
        });

        const response = await handler(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('topic');
    });

    it('should return 400 if topic is empty string', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });

        const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({ topic: '   ' })
        });

        const response = await handler(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('topic');
    });

    it('should generate cinema script successfully', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });

        const mockScript = {
            title: 'Understanding Arrays',
            states: [
                {
                    id: 'intro',
                    narration: 'Welcome to arrays!',
                    codeSnippet: 'const arr = [1, 2, 3];',
                    duration: 3000,
                    next: 'explanation',
                    choices: null
                },
                {
                    id: 'explanation',
                    narration: 'Arrays store multiple values.',
                    codeSnippet: null,
                    duration: 2000,
                    next: null,
                    choices: null
                }
            ]
        };

        (generateCinemaScript as jest.Mock).mockResolvedValue({
            script: mockScript,
            cached: false
        });

        const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({ topic: 'Arrays' })
        });

        const response = await handler(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.script).toEqual(mockScript);
        expect(data.cached).toBe(false);
        expect(generateCinemaScript).toHaveBeenCalledWith({
            topic: 'Arrays'
        });
    });

    it('should return cached cinema script', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });

        const mockScript = {
            title: 'Understanding Loops',
            states: [
                {
                    id: 'intro',
                    narration: 'Let\'s learn about loops!',
                    codeSnippet: 'for (let i = 0; i < 10; i++) {}',
                    duration: 3000,
                    next: null,
                    choices: null
                }
            ]
        };

        (generateCinemaScript as jest.Mock).mockResolvedValue({
            script: mockScript,
            cached: true
        });

        const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({ topic: 'Loops', challengeId: 'challenge-123' })
        });

        const response = await handler(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.script).toEqual(mockScript);
        expect(data.cached).toBe(true);
        expect(generateCinemaScript).toHaveBeenCalledWith({
            topic: 'Loops',
            challengeId: 'challenge-123'
        });
    });

    it('should return 500 if cinema generation fails', async () => {
        mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });
        (generateCinemaScript as jest.Mock).mockRejectedValue(new Error('AI service error'));

        const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer valid-token'
            },
            body: JSON.stringify({ topic: 'Functions' })
        });

        const response = await handler(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toContain('Failed to generate cinema script');
        expect(data.details).toBe('AI service error');
    });
});
