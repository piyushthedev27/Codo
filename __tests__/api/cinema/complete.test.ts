import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { addXP } from '@/lib/services/progressService';

// Mock dependencies
jest.mock('@/lib/firebase/admin');
jest.mock('@/lib/services/progressService');

const mockAddXP = addXP as jest.MockedFunction<typeof addXP>;

describe('POST /api/cinema/complete', () => {
    const mockVerifyIdToken = jest.fn();
    const mockUserId = 'test-user-123';
    const mockToken = 'valid-token';

    // Mock Firestore document reference
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
        (adminAuth as jest.Mock).mockReturnValue({
            verifyIdToken: mockVerifyIdToken
        });
        (adminDb as jest.Mock).mockReturnValue({
            collection: mockCollection
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Import the route handler after mocking
    const handler = async (request: NextRequest) => {
        const { POST } = await import('@/app/api/cinema/complete/route');
        return POST(request);
    };

    describe('Authentication', () => {
        it('should return 401 if no authorization header', async () => {
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toContain('Unauthorized');
        });

        it('should return 401 if authorization header is invalid', async () => {
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
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

        it('should return 401 if token verification fails', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toContain('Unauthorized');
        });
    });

    describe('Input Validation', () => {
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ uid: mockUserId });
        });

        it('should return 400 if topic is missing', async () => {
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({})
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('topic');
        });

        it('should return 400 if topic is empty string', async () => {
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: '   ' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('topic');
        });

        it('should return 400 if topic is not a string', async () => {
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 123 })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('topic');
        });
    });

    describe('Cinema Completion - First Time', () => {
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ uid: mockUserId });
            // Mock that cinema has not been completed before
            mockGet.mockResolvedValue({ exists: false });
            mockSet.mockResolvedValue(undefined);
        });

        it('should award 75 XP for first-time cinema completion', async () => {
            mockAddXP.mockResolvedValue({
                newXP: 175,
                newLevel: 2,
                leveledUp: false
            });

            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.alreadyCompleted).toBe(false);
            expect(data.xpAwarded).toBe(75);
            expect(data.newXP).toBe(175);
            expect(data.newLevel).toBe(2);
            expect(data.leveledUp).toBe(false);
            expect(data.message).toContain('completed successfully');

            // Verify addXP was called with correct parameters
            expect(mockAddXP).toHaveBeenCalledWith(mockUserId, 75);
        });

        it('should record cinema completion in Firestore', async () => {
            mockAddXP.mockResolvedValue({
                newXP: 175,
                newLevel: 2,
                leveledUp: false
            });

            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Binary Search Trees' })
            });

            await handler(req);

            // Verify completion was recorded
            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: mockUserId,
                    topic: 'binary search trees', // normalized
                    xpAwarded: 75
                })
            );
        });

        it('should normalize topic to lowercase', async () => {
            mockAddXP.mockResolvedValue({
                newXP: 175,
                newLevel: 2,
                leveledUp: false
            });

            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: '  DYNAMIC Programming  ' })
            });

            await handler(req);

            // Verify the document ID uses normalized topic
            expect(mockDoc).toHaveBeenCalledWith(`${mockUserId}_dynamic programming`);
        });

        it('should indicate level up when it occurs', async () => {
            mockAddXP.mockResolvedValue({
                newXP: 200,
                newLevel: 3,
                leveledUp: true
            });

            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Graphs' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.leveledUp).toBe(true);
            expect(data.newLevel).toBe(3);
        });
    });

    describe('Cinema Completion - Already Completed', () => {
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ uid: mockUserId });
            // Mock that cinema has already been completed
            mockGet.mockResolvedValue({ exists: true });
        });

        it('should not award XP if cinema already completed', async () => {
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.alreadyCompleted).toBe(true);
            expect(data.xpAwarded).toBe(0);
            expect(data.message).toContain('already completed');

            // Verify addXP was NOT called
            expect(mockAddXP).not.toHaveBeenCalled();
            // Verify set was NOT called (no duplicate record)
            expect(mockSet).not.toHaveBeenCalled();
        });

        it('should handle multiple completion attempts for same topic', async () => {
            // First call
            const req1 = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Sorting Algorithms' })
            });

            const response1 = await handler(req1);
            const data1 = await response1.json();

            expect(data1.alreadyCompleted).toBe(true);
            expect(data1.xpAwarded).toBe(0);

            // Second call with new request object
            const req2 = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Sorting Algorithms' })
            });

            const response2 = await handler(req2);
            const data2 = await response2.json();

            expect(data2.alreadyCompleted).toBe(true);
            expect(data2.xpAwarded).toBe(0);

            // Verify addXP was never called
            expect(mockAddXP).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ uid: mockUserId });
            mockGet.mockResolvedValue({ exists: false });
        });

        it('should return 500 if addXP fails', async () => {
            mockAddXP.mockRejectedValue(new Error('Database error'));

            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toContain('Failed to complete cinema');
            expect(data.details).toBe('Database error');
        });

        it('should return 500 if Firestore get fails', async () => {
            mockGet.mockRejectedValue(new Error('Firestore connection error'));

            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toContain('Failed to complete cinema');
        });

        it('should return 500 if Firestore set fails', async () => {
            mockAddXP.mockResolvedValue({
                newXP: 175,
                newLevel: 2,
                leveledUp: false
            });
            mockSet.mockRejectedValue(new Error('Firestore write error'));

            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'Arrays' })
            });

            const response = await handler(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toContain('Failed to complete cinema');
        });
    });

    describe('Topic Normalization', () => {
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ uid: mockUserId });
            mockGet.mockResolvedValue({ exists: false });
            mockSet.mockResolvedValue(undefined);
            mockAddXP.mockResolvedValue({
                newXP: 175,
                newLevel: 2,
                leveledUp: false
            });
        });

        it('should treat topics with different casing as the same', async () => {
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: 'ARRAYS' })
            });

            await handler(req);

            // Verify the document ID uses lowercase
            expect(mockDoc).toHaveBeenCalledWith(`${mockUserId}_arrays`);
        });

        it('should trim whitespace from topics', async () => {
            const req = new NextRequest('http://localhost:3000/api/cinema/complete', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                },
                body: JSON.stringify({ topic: '  Linked Lists  ' })
            });

            await handler(req);

            // Verify the document ID uses trimmed topic
            expect(mockDoc).toHaveBeenCalledWith(`${mockUserId}_linked lists`);
        });
    });
});
