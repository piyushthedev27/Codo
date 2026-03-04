import { createChallenge, getChallenge, updateChallenge, deleteChallenge, ChallengeData } from '../../lib/services/challengeService';
import { adminDb } from '../../lib/firebase/admin';

jest.mock('../../lib/firebase/admin', () => ({
    adminDb: jest.fn()
}));

describe('Challenge Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a challenge and returns the ID', async () => {
        const mockSet = jest.fn();
        const mockDoc = jest.fn(() => ({
            id: 'mock-chal-id',
            set: mockSet
        }));

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({
                doc: mockDoc
            }))
        });

        const newChallenge = {
            title: 'Test',
            description: 'Test desc',
            difficulty: 'easy' as const,
            category: 'arrays',
            timeLimit: 1,
            memoryLimit: 128,
            testCases: [],
            createdBy: 'admin-1',
            isActive: true
        };

        const id = await createChallenge(newChallenge);

        expect(id).toBe('mock-chal-id');
        expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Test',
            id: 'mock-chal-id',
            createdBy: 'admin-1'
        }));
    });

    it('retrieves a challenge by ID', async () => {
        const mockData = { id: 'chal-1', title: 'Find Max' };
        const mockSnapshot = {
            exists: true,
            data: jest.fn(() => mockData)
        };
        const mockDoc = jest.fn(() => ({
            get: jest.fn(() => Promise.resolve(mockSnapshot))
        }));

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({
                doc: mockDoc
            }))
        });

        const result = await getChallenge('chal-1');
        expect(result).toEqual(mockData);
        expect(mockDoc).toHaveBeenCalledWith('chal-1');
    });

    it('updates a challenge', async () => {
        const mockUpdate = jest.fn();
        const mockDoc = jest.fn(() => ({
            update: mockUpdate
        }));

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({
                doc: mockDoc
            }))
        });

        await updateChallenge('chal-1', { title: 'New Title' });

        expect(mockDoc).toHaveBeenCalledWith('chal-1');
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            title: 'New Title'
        }));
    });

    it('deletes a challenge', async () => {
        const mockDelete = jest.fn();
        const mockDoc = jest.fn(() => ({
            delete: mockDelete
        }));

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({
                doc: mockDoc
            }))
        });

        await deleteChallenge('chal-1');

        expect(mockDoc).toHaveBeenCalledWith('chal-1');
        expect(mockDelete).toHaveBeenCalled();
    });
});
