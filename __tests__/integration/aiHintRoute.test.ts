/**
 * Integration tests for AI Hint Route (Task 12.2)
 */

import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { generateHint } from '@/lib/services/aiHintService';

jest.mock('@/lib/firebase/admin');
jest.mock('@/lib/services/aiHintService');

describe('AI Hint Route Integration (12.2)', () => {
    const mockVerifyIdToken = jest.fn();
    const mockGenerateHint = generateHint as jest.MockedFunction<typeof generateHint>;

    beforeEach(() => {
        jest.clearAllMocks();
        (adminAuth as jest.Mock).mockReturnValue({
            verifyIdToken: mockVerifyIdToken
        });
    });

    describe('Authentication', () => {
        it('should reject requests without Authorization header', async () => {
            const request = new NextRequest('http://localhost:3000/api/ai/hint', {
                method: 'POST',
                body: JSON.stringify({
                    challengeId: 'challenge-123',
                    currentCode: 'console.log("test")',
                    language: 'javascript'
                })
            });

            const { POST } = await import('@/app/api/ai/hint/route');
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toContain('Unauthorized');
        });

        it('should accept requests with valid token', async () => {
            mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' } as any);
            mockGenerateHint.mockResolvedValue({
                hint: 'Try checking your loop condition',
                cached: false
            });

            const request = new NextRequest('http://localhost:3000/api/ai/hint', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({
                    challengeId: 'challenge-123',
                    currentCode: 'console.log("test")',
                    language: 'javascript'
                })
            });

            const { POST } = await import('@/app/api/ai/hint/route');
            const response = await POST(request);

            expect(response.status).toBe(200);
            expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
        });
    });

    describe('Request Validation', () => {
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' } as any);
        });

        it('should reject requests without challengeId', async () => {
            const request = new NextRequest('http://localhost:3000/api/ai/hint', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({
                    currentCode: 'console.log("test")',
                    language: 'javascript'
                })
            });

            const { POST } = await import('@/app/api/ai/hint/route');
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('challengeId');
        });

        it('should accept all supported languages', async () => {
            mockGenerateHint.mockResolvedValue({
                hint: 'Test hint',
                cached: false
            });

            const supportedLanguages = ['javascript', 'python', 'java', 'cpp'];

            for (const language of supportedLanguages) {
                const request = new NextRequest('http://localhost:3000/api/ai/hint', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer valid-token'
                    },
                    body: JSON.stringify({
                        challengeId: 'challenge-123',
                        currentCode: 'test code',
                        language
                    })
                });

                const { POST } = await import('@/app/api/ai/hint/route');
                const response = await POST(request);

                expect(response.status).toBe(200);
            }
        });
    });

    describe('Hint Generation', () => {
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ uid: 'test-user' } as any);
        });

        it('should call generateHint with correct parameters', async () => {
            mockGenerateHint.mockResolvedValue({
                hint: 'Try checking your loop condition',
                cached: false
            });

            const request = new NextRequest('http://localhost:3000/api/ai/hint', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({
                    challengeId: 'challenge-123',
                    currentCode: 'for(let i=0; i<=10; i++) { }',
                    language: 'javascript'
                })
            });

            const { POST } = await import('@/app/api/ai/hint/route');
            await POST(request);

            expect(mockGenerateHint).toHaveBeenCalledWith({
                userId: 'test-user',
                challengeId: 'challenge-123',
                currentCode: 'for(let i=0; i<=10; i++) { }',
                language: 'javascript'
            });
        });

        it('should return hint with mistake context', async () => {
            const mockHintResponse = {
                hint: 'Based on your previous errors, check for null values',
                cached: false,
                mistakeContext: {
                    totalMistakes: 5,
                    commonErrors: ['null-pointer', 'syntax-error'],
                    recentErrors: ['Cannot read property of null']
                }
            };

            mockGenerateHint.mockResolvedValue(mockHintResponse);

            const request = new NextRequest('http://localhost:3000/api/ai/hint', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer valid-token'
                },
                body: JSON.stringify({
                    challengeId: 'challenge-123',
                    currentCode: 'let x = null; x.value;',
                    language: 'javascript'
                })
            });

            const { POST } = await import('@/app/api/ai/hint/route');
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.mistakeContext).toEqual(mockHintResponse.mistakeContext);
        });
    });
});
