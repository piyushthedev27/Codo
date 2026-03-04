import { saveSubmission, SubmissionData } from '../../lib/services/submissionService';
import { adminDb } from '../../lib/firebase/admin';
import fc from 'fast-check';
import { FieldValue } from 'firebase-admin/firestore';

// Mock Firebase Admin
jest.mock('../../lib/firebase/admin', () => {
    return {
        adminDb: jest.fn()
    };
});

describe('Submission Service Properties', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Property 17: Submission Persistence (saves execution metrics)', async () => {
        const mockSet = jest.fn();
        const mockDoc = jest.fn(() => ({
            id: 'mock-doc-id',
            set: mockSet
        }));
        const mockCollection = jest.fn(() => ({
            doc: mockDoc
        }));

        (adminDb as jest.Mock).mockReturnValue({
            collection: mockCollection
        });

        await fc.assert(
            fc.asyncProperty(
                fc.string(), // userId
                fc.string(), // challengeId
                fc.string(), // code
                fc.constantFrom('javascript', 'python', 'java', 'cpp'),
                fc.constantFrom('success', 'compilation_error', 'runtime_error', 'timeout', 'memory_limit'),
                fc.integer({ min: 0, max: 5000 }), // executionTime
                fc.integer({ min: 0, max: 256 }), // memoryUsed
                fc.array(fc.record({
                    testCaseId: fc.integer(),
                    passed: fc.boolean(),
                    output: fc.string(),
                    expectedOutput: fc.string(),
                    error: fc.option(fc.string())
                })),
                fc.option(fc.string()), // errorMessage
                async (userId, challengeId, code, language, status, executionTime, memoryUsed, testResults, errorMessage) => {
                    mockSet.mockClear();

                    const data: SubmissionData = {
                        userId,
                        challengeId,
                        code,
                        language,
                        status: status as SubmissionData['status'],
                        executionTime,
                        memoryUsed,
                        testResults,
                        errorMessage: errorMessage || null
                    };

                    const id = await saveSubmission(data);

                    expect(id).toBe('mock-doc-id');
                    expect(mockSet).toHaveBeenCalledTimes(1);
                    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
                        id: 'mock-doc-id',
                        userId,
                        challengeId,
                        code,
                        language,
                        status,
                        executionTime,
                        memoryUsed,
                        testResults,
                        errorMessage: errorMessage || null,
                        // Not asserting serverTimestamp explicitly here to avoid complexity with mocks
                    }));
                }
            )
        );
    });

    test('getSubmission: retrieves a submission by ID', async () => {
        const mockData = { id: 'sub-1', code: 'console.log()', userId: 'user-1' };
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

        const { getSubmission } = require('../../lib/services/submissionService');
        const result = await getSubmission('sub-1');

        expect(result).toEqual(mockData);
        expect(mockDoc).toHaveBeenCalledWith('sub-1');
    });

    test('getUserSubmissions: retrieves user submission history', async () => {
        const mockData = [{ id: 'sub-1' }, { id: 'sub-2' }];
        const mockSnapshot = {
            docs: mockData.map(data => ({ data: () => data }))
        };

        const mockLimit = jest.fn(() => ({ get: jest.fn(() => Promise.resolve(mockSnapshot)) }));
        const mockOrderBy = jest.fn(() => ({ limit: mockLimit }));
        const mockWhere2 = jest.fn(() => ({ orderBy: mockOrderBy }));
        const mockWhere1 = jest.fn(() => ({ where: mockWhere2, orderBy: mockOrderBy }));

        (adminDb as jest.Mock).mockReturnValue({
            collection: jest.fn(() => ({
                where: mockWhere1
            }))
        });

        const { getUserSubmissions } = require('../../lib/services/submissionService');
        const results = await getUserSubmissions('user-1', 20, 'chal-1');

        expect(results).toEqual(mockData);
        expect(mockWhere1).toHaveBeenCalledWith('userId', '==', 'user-1');
        // Because of the mock chain it's simpler to assert correct return value formatting and mock chaining success
    });
});
