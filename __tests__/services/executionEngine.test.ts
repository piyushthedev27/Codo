import { executeCode, ExecutionInput, Language, TestCase } from '../../lib/services/executionEngine';
import fc from 'fast-check';
import * as child_process from 'child_process';
import EventEmitter from 'events';

// Mock child_process module
jest.mock('child_process', () => {
    return {
        exec: jest.fn(),
        spawn: jest.fn()
    };
});

describe('Execution Engine Properties', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Property 12 & 15: Timeout handling during execution', async () => {
        // Mock spawn to simulate a long-running process that doesn't close over time
        const mockSpawn = child_process.spawn as jest.Mock;
        mockSpawn.mockImplementation(() => {
            const proc = new EventEmitter();
            (proc as any).stdout = new EventEmitter();
            (proc as any).stderr = new EventEmitter();
            (proc as any).stdin = { write: jest.fn(), end: jest.fn() };
            (proc as any).kill = jest.fn();
            // We intentionally do NOT emit 'close' so it triggers the timeout
            return proc;
        });

        await fc.assert(
            fc.asyncProperty(
                fc.string(),
                fc.constantFrom('javascript', 'python', 'java', 'cpp' as Language),
                fc.array(fc.record({ input: fc.string(), expectedOutput: fc.string() }), { minLength: 1, maxLength: 5 }),
                async (code, language, testCases) => {
                    const input: ExecutionInput = {
                        code,
                        language: language as Language,
                        testCases,
                        timeLimit: 0.1 // 100ms for fast testing
                    };

                    // For java and cpp we need to mock exec for compilation to resolve immediately
                    if (language === 'java' || language === 'cpp') {
                        (child_process.exec as unknown as jest.Mock).mockImplementationOnce((cmd, opts, callback) => {
                            callback(null, { stdout: '', stderr: '' });
                        });
                    }

                    const output = await executeCode(input);
                    // Due to timeout, it should eventually break the testcase loop
                    expect(output.status).toBe('timeout');
                }
            ), { numRuns: 3, timeout: 5000 }
        );
    });

    test('Property 14: Compilation Errors Details', async () => {
        const mockExec = child_process.exec as unknown as jest.Mock;

        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom('java', 'cpp' as Language),
                fc.string({ minLength: 5 }),
                async (language, errorMsg) => {
                    mockExec.mockImplementationOnce((cmd, opts, callback) => {
                        callback({ stderr: errorMsg }, { stdout: '', stderr: errorMsg });
                    });

                    const input: ExecutionInput = {
                        code: 'invalid code',
                        language: language as Language,
                        testCases: [{ input: '', expectedOutput: '' }]
                    };

                    const output = await executeCode(input);
                    expect(output.status).toBe('compilation_error');
                    expect(output.compilationError).toBe(errorMsg);
                }
            )
        );
    });

    test('Property 13 & 16: Execution results completeness and Memory limit', async () => {
        const mockSpawn = child_process.spawn as jest.Mock;

        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom('javascript', 'python' as Language),
                fc.string(),
                fc.string(),
                fc.boolean(), // Simulate memory error in stderr
                async (language, expectedOut, stderrMsg, isMemoryError) => {
                    mockSpawn.mockImplementation(() => {
                        const proc = new EventEmitter();
                        (proc as any).stdout = new EventEmitter();
                        (proc as any).stderr = new EventEmitter();
                        (proc as any).stdin = { write: jest.fn(), end: jest.fn() };
                        (proc as any).kill = jest.fn();

                        // Simulate async execution
                        setTimeout(() => {
                            (proc as any).stdout.emit('data', expectedOut);
                            if (isMemoryError) {
                                (proc as any).stderr.emit('data', 'MemoryError: Out of memory');
                            } else if (stderrMsg) {
                                (proc as any).stderr.emit('data', stderrMsg);
                            }
                            proc.emit('close', 0);
                        }, 10);

                        return proc;
                    });

                    const input: ExecutionInput = {
                        code: 'valid code',
                        language: language as Language,
                        testCases: [{ input: '', expectedOutput: expectedOut }],
                        timeLimit: 1
                    };

                    const output = await executeCode(input);

                    if (isMemoryError) {
                        expect(output.status).toBe('memory_limit');
                    } else if (stderrMsg) {
                        expect(output.status).toBe('runtime_error');
                        if (output.results.length > 0) {
                            expect(output.results[0].error).toContain(stderrMsg);
                        }
                    } else {
                        expect(output.status).toBe('success');
                        if (output.results.length > 0) {
                            expect(output.results[0].passed).toBe(true);
                            expect(output.results[0].output).toBe(expectedOut.trim());
                        }
                    }
                    if (output.results.length > 0) {
                        expect(output.results[0].expectedOutput).toBe(expectedOut.trim());
                    }
                    expect(typeof output.executionTime).toBe('number');
                }
            ), { numRuns: 10 }
        );
    });
});
