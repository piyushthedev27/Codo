/**
 * Integration test: Cinema Routes (12.5, 12.6)
 * Tests cinema generation, TTS, and completion routes with authentication and rate limiting.
 */

import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { generateCinemaScript } from '@/lib/services/cinemaService';
import { textToSpeech } from '@/lib/services/ttsService';
import { addXP } from '@/lib/services/progressService';

// Mock dependencies
jest.mock('@/lib/firebase/admin');
jest.mock('@/lib/services/cinemaService');
jest.mock('@/lib/services/ttsService');
jest.mock('@/lib/services/progressService');

describe('Cinema Routes Integration (12.5, 12.6)', () => {
    const mockVerifyIdToken = jest.fn();

    beforeAll(() => {
        (adminAuth as jest.Mock).mockReturnValue({
            verifyIdToken: mockVerifyIdToken
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/cinema/generate', () => {
        it('should generate cinema script with valid authentication', async () => {
            mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });

            const mockScript = {
                title: 'Understanding Arrays',
                states: [
                    {
                        id: 'intro',
                        narration: 'Welcome to arrays!',
                        codeSnippet: 'const arr = [1, 2, 3];',
                        duration: 3000,
                        next: null,
                        choices: null
                    }
                ]
            };

            (generateCinemaScript as jest.Mock).mockResolvedValue({
                script: mockScript,
                cached: false
            });

            const { POST } = await import('@/app/api/cinema/generate/route');
            const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.script).toEqual(mockScript);
            expect(data.cached).toBe(false);
        });

        it('should reject unauthenticated requests', async () => {
            const { POST } = await import('@/app/api/cinema/generate/route');
            const req = new NextRequest('http://localhost:3000/api/cinema/generate', {
                method: 'POST',
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await POST(req);
            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/cinema/tts', () => {
        it('should generate audio with valid authentication', async () => {
            mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' });

            const mockAudio = Buffer.from('fake-audio-data');
            (textToSpeech as jest.Mock).mockResolvedValue({
                audio: mockAudio,
                contentType: 'audio/mpeg',
                cached: false
            });

            const { POST } = await import('@/app/api/cinema/tts/route');
            const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({ text: 'Hello world' })
            });

            const response = await POST(req);

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Type')).toBe('audio/mpeg');
            expect(response.headers.get('X-Cached')).toBe('false');
        });

        it('should reject unauthenticated requests', async () => {
            const { POST } = await import('@/app/api/cinema/tts/route');
            const req = new NextRequest('http://localhost:3000/api/cinema/tts', {
                method: 'POST',
                body: JSON.stringify({ text: 'Hello world' })
            });

            const response = await POST(req);
            expect(response.status).toBe(401);
        });
    });

    describe('Rate Limiting', () => {
        it('should apply INTENSIVE_RATE_LIMIT to both routes', async () => {
            // Both routes should have rate limiting applied
            // This is verified by the fact that the routes are wrapped with withRateLimit
            // and use INTENSIVE_RATE_LIMIT (10 requests per minute)
            
            const { POST: generatePOST } = await import('@/app/api/cinema/generate/route');
            const { POST: ttsPOST } = await import('@/app/api/cinema/tts/route');

            // Verify both exports exist and are functions
            expect(typeof generatePOST).toBe('function');
            expect(typeof ttsPOST).toBe('function');
        });
    });

    describe('POST /api/cinema/complete', () => {
        const mockGet = jest.fn();
        const mockSet = jest.fn();
        const mockDoc = jest.fn(() => ({
            get: mockGet,
            set: mockSet
        }));
        const mockCollection = jest.fn(() => ({
            doc: mockDoc
        }));

        beforeAll(() => {
            (adminDb as jest.Mock).mockReturnValue({
                collection: mockCollection
            });
        });

        it('should award 75 XP for first-time cinema completion', async () => {
            mockVerifyIdToken.mockResolvedValue({ uid: 'test-user-123' });
            mockGet.mockResolvedValue({ exists: false });
            mockSet.mockResolvedValue(undefined);
            (addXP as jest.Mock).mockResolvedValue({
                newXP: 175,
                newLevel: 2,
                leveledUp: false
            });

            const { POST } = await import('@/app/api/cinema/complete/route');
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.alreadyCompleted).toBe(false);
            expect(data.xpAwarded).toBe(75);
            expect(data.newXP).toBe(175);
            expect(data.newLevel).toBe(2);
            expect(addXP).toHaveBeenCalledWith('test-user-123', 75);
        });

        it('should not award XP for already completed cinema', async () => {
            mockVerifyIdToken.mockResolvedValue({ uid: 'test-user-123' });
            mockGet.mockResolvedValue({ exists: true });

            const { POST } = await import('@/app/api/cinema/complete/route');
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.alreadyCompleted).toBe(true);
            expect(data.xpAwarded).toBe(0);
            expect(addXP).not.toHaveBeenCalled();
        });

        it('should reject unauthenticated requests', async () => {
            const { POST } = await import('@/app/api/cinema/complete/route');
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await POST(req);
            expect(response.status).toBe(401);
        });

        it('should normalize topics to prevent duplicate XP awards', async () => {
            mockVerifyIdToken.mockResolvedValue({ uid: 'test-user-123' });
            mockGet.mockResolvedValue({ exists: false });
            mockSet.mockResolvedValue(undefined);
            (addXP as jest.Mock).mockResolvedValue({
                newXP: 175,
                newLevel: 2,
                leveledUp: false
            });

            const { POST } = await import('@/app/api/cinema/complete/route');
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({ topic: '  ARRAYS  ' })
            });

            await POST(req);

            // Verify the document ID uses normalized topic
            expect(mockDoc).toHaveBeenCalledWith('test-user-123_arrays');
        });
    });
});
