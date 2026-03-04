import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import os from 'os';

const execAsync = promisify(exec);

export type Language = 'javascript' | 'python' | 'java' | 'cpp';

export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

export interface ExecutionInput {
    code: string;
    language: Language;
    testCases: TestCase[];
    timeLimit?: number; // seconds, default 5
    memoryLimit?: number; // MB, default 256
}

export interface TestCaseResult {
    testCaseId: number;
    passed: boolean;
    output: string;
    expectedOutput: string;
    error?: string;
}

export interface ExecutionOutput {
    status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'memory_limit';
    results: TestCaseResult[];
    executionTime: number; // ms
    memoryUsed: number; // MB
    compilationError?: string;
}

/**
 * Creates a distinct temporary directory for execution to avoid collisions
 */
async function createTempDir(): Promise<string> {
    const tmpDir = path.join(os.tmpdir(), `codo-execution-${crypto.randomBytes(8).toString('hex')}`);
    await fs.mkdir(tmpDir, { recursive: true });
    return tmpDir;
}

async function removeTempDir(dir: string): Promise<void> {
    try {
        await fs.rm(dir, { recursive: true, force: true });
    } catch (e) {
        console.error(`Failed to remove temp dir ${dir}`, e);
    }
}

/**
 * Executes a single test case by passing input to stdin and capturing stdout/stderr
 */
async function runTestCase(command: string, args: string[], input: string, timeLimitMs: number, cwd: string): Promise<{ stdout: string, stderr: string, time: number, timeout: boolean, memoryError: boolean }> {
    return new Promise((resolve) => {
        const start = Date.now();
        const proc = spawn(command, args, { cwd });

        let stdout = '';
        let stderr = '';
        let isComplete = false;
        let isTimeout = false;

        // Timeout handling
        const timer = setTimeout(() => {
            if (!isComplete) {
                isTimeout = true;
                isComplete = true;
                proc.kill('SIGKILL');
                resolve({ stdout, stderr, time: Date.now() - start, timeout: true, memoryError: false });
            }
        }, timeLimitMs);

        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });

        proc.on('close', () => {
            if (!isComplete) {
                isComplete = true;
                clearTimeout(timer);

                // Extremely rudimentary memory limit check based on native process errors
                const memoryError = stderr.toLowerCase().includes('memoryerror') || stderr.toLowerCase().includes('java.lang.outofmemoryerror');

                resolve({ stdout, stderr, time: Date.now() - start, timeout: isTimeout, memoryError });
            }
        });

        proc.on('error', (err) => {
            if (!isComplete) {
                isComplete = true;
                clearTimeout(timer);
                resolve({ stdout, stderr: stderr + "\n" + err.message, time: Date.now() - start, timeout: false, memoryError: false });
            }
        });

        // Feed input
        if (input) {
            proc.stdin.write(input);
        }
        proc.stdin.end();
    });
}

export async function executeCode(input: ExecutionInput): Promise<ExecutionOutput> {
    const { code, language, testCases, timeLimit = 5, memoryLimit = 256 } = input;

    // Validate language
    if (!['javascript', 'python', 'java', 'cpp'].includes(language)) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const tmpDir = await createTempDir();
    let command = '';
    let args: string[] = [];
    let compilationError = '';
    let hasCompilationPhase = false;

    try {
        if (language === 'javascript') {
            const fileName = path.join(tmpDir, 'solution.js');
            await fs.writeFile(fileName, code);
            command = 'node';
            args = [fileName];
        } else if (language === 'python') {
            const fileName = path.join(tmpDir, 'solution.py');
            await fs.writeFile(fileName, code);
            command = process.platform === 'win32' ? 'python' : 'python3';
            args = [fileName];
        } else if (language === 'java') {
            hasCompilationPhase = true;
            const fileName = path.join(tmpDir, 'Main.java');
            await fs.writeFile(fileName, code);
            try {
                await execAsync(`javac Main.java`, { cwd: tmpDir, timeout: 5000 });
                command = 'java';
                args = ['-Xmx' + memoryLimit + 'm', 'Main'];
            } catch (err: unknown) {
                const error = err as { stderr?: string; message?: string };
                compilationError = error.stderr || error.message || 'Unknown compilation error';
            }
        } else if (language === 'cpp') {
            hasCompilationPhase = true;
            const fileName = path.join(tmpDir, 'main.cpp');
            const outputName = process.platform === 'win32' ? 'main.exe' : './main';
            await fs.writeFile(fileName, code);
            try {
                await execAsync(`g++ main.cpp -o main`, { cwd: tmpDir, timeout: 5000 });
                command = path.join(tmpDir, outputName);
                args = [];
            } catch (err: unknown) {
                const error = err as { stderr?: string; message?: string };
                compilationError = error.stderr || error.message || 'Unknown compilation error';
            }
        }

        if (hasCompilationPhase && compilationError) {
            return {
                status: 'compilation_error',
                results: [],
                executionTime: 0,
                memoryUsed: 0,
                compilationError: compilationError
            };
        }

        const runResults: TestCaseResult[] = [];
        let totalTime = 0;
        let executionStatus: ExecutionOutput['status'] = 'success';

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const result = await runTestCase(command, args, tc.input, timeLimit * 1000, tmpDir);

            totalTime += result.time;

            if (result.timeout) {
                executionStatus = 'timeout';
                break;
            }
            if (result.memoryError) {
                executionStatus = 'memory_limit';
                break;
            }

            const isPassed = result.stdout.trim() === tc.expectedOutput.trim() && !result.stderr;

            runResults.push({
                testCaseId: i,
                passed: isPassed,
                output: result.stdout.trim(),
                expectedOutput: tc.expectedOutput.trim(),
                error: result.stderr ? result.stderr.trim() : undefined
            });

            if (result.stderr && executionStatus === 'success') {
                executionStatus = 'runtime_error';
            }
        }

        return {
            status: executionStatus,
            results: runResults,
            executionTime: totalTime,
            memoryUsed: 0
        };
    } finally {
        await removeTempDir(tmpDir); // Clean up
    }
}
