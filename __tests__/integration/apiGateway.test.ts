/**
 * Integration test: API Gateway (12.7)
 * Tests rate limiting, error handling, validation, and response formatting.
 */

// Use fake timers to prevent rateLimiter's setInterval from keeping the Jest worker alive
jest.useFakeTimers();

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, STANDARD_RATE_LIMIT, INTENSIVE_RATE_LIMIT } from '../../lib/middleware/rateLimiter';
import { withErrorHandler, AppError } from '../../lib/middleware/errorHandler';
import { validateBody } from '../../lib/middleware/validation';
import { successResponse, errorResponse } from '../../lib/middleware/response';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('next/server', () => {
    const actual = jest.requireActual('next/server');
    return {
        ...actual,
        NextRequest: class {
            url: string;
            method: string;
            headers: Map<string, string>;
            constructor(url: string, init: any = {}) {
                this.url = url;
                this.method = init.method ?? 'GET';
                this.headers = new Map(Object.entries(init.headers ?? {}));
            }
            get(key: string) { return this.headers.get(key); }
        },
        NextResponse: {
            json: jest.fn((body, init) => ({
                body,
                status: init?.status ?? 200,
                headers: { get: () => null, set: jest.fn() },
            })),
        },
    };
});

function makeRequest(ip = '127.0.0.1') {
    return new (NextRequest as any)('http://localhost/api/test', {
        headers: { 'x-forwarded-for': ip },
    });
}

const dummyHandler = jest.fn(() =>
    Promise.resolve(NextResponse.json({ success: true }, { status: 200 }) as any)
);

beforeEach(() => {
    jest.clearAllMocks();
    // Reset rate limit store between tests by using unique IPs
});

// ---------------------------------------------------------------------------
// Rate Limiter Tests
// ---------------------------------------------------------------------------

describe('API Gateway — Rate Limiter (12.7.1–12.7.3)', () => {
    test('12.7.1 — Requests within limit pass through to handler', async () => {
        const limiter = withRateLimit(dummyHandler, { maxRequests: 5, windowMs: 60_000 }, 'test-pass');
        const req = makeRequest('10.0.0.1');
        await limiter(req);
        expect(dummyHandler).toHaveBeenCalledTimes(1);
    });

    test('12.7.2 — Request exactly at limit (maxRequests=1) passes', async () => {
        const limiter = withRateLimit(dummyHandler, { maxRequests: 1, windowMs: 60_000 }, 'test-exact');
        const req = makeRequest('10.0.0.2');
        await limiter(req);
        expect(dummyHandler).toHaveBeenCalledTimes(1);
    });

    test('12.7.3 — Request over the limit returns 429', async () => {
        const config = { maxRequests: 2, windowMs: 60_000 };
        const limiter = withRateLimit(dummyHandler, config, 'test-throttled');
        const req = makeRequest('10.0.0.3');

        await limiter(req); // req 1 → OK
        await limiter(req); // req 2 → OK
        const result = await limiter(req) as any; // req 3 → 429

        // The NextResponse.json mock captures this call
        const calls = (NextResponse.json as jest.Mock).mock.calls;
        const limitedCall = calls.find((c: any[]) => c[1]?.status === 429);
        expect(limitedCall).toBeDefined();
        expect(limitedCall[0].code).toBe('RATE_LIMITED');
    });
});

// ---------------------------------------------------------------------------
// Error Handler Tests
// ---------------------------------------------------------------------------

describe('API Gateway — Error Handler (12.7.4–12.7.5)', () => {
    test('12.7.4 — AppError maps to correct status code', async () => {
        const failingHandler = jest.fn(() => {
            throw new AppError('Not found', 404);
        });
        const wrapped = withErrorHandler(failingHandler);
        const req = makeRequest('10.1.1.1');

        await wrapped(req);

        const calls = (NextResponse.json as jest.Mock).mock.calls;
        const errCall = calls.find((c: any[]) => c[1]?.status === 404);
        expect(errCall).toBeDefined();
        expect(errCall[0].message).toBe('Not found');
    });

    test('12.7.5 — Unhandled error returns 500', async () => {
        const failingHandler = jest.fn(() => {
            throw new Error('Unexpected crash');
        });
        const wrapped = withErrorHandler(failingHandler);
        const req = makeRequest('10.1.1.2');

        await wrapped(req);

        const calls = (NextResponse.json as jest.Mock).mock.calls;
        const errCall = calls.find((c: any[]) => c[1]?.status === 500);
        expect(errCall).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('API Gateway — Validation (12.7.6–12.7.7)', () => {
    test('12.7.6 — Valid body passes schema check', () => {
        const result = validateBody(
            { language: 'javascript', code: 'console.log(1)' },
            { language: { type: 'string', required: true }, code: { type: 'string', required: true } }
        );
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('12.7.7 — Missing required field fails schema check with error message', () => {
        const result = validateBody(
            { language: 'javascript' }, // code missing
            { language: { type: 'string', required: true }, code: { type: 'string', required: true } }
        );
        expect(result.valid).toBe(false);
        expect(result.errors.some((e: string) => e.includes('code'))).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Response Shape Tests
// ---------------------------------------------------------------------------

describe('API Gateway — Response Formatting (12.7.8–12.7.9)', () => {
    test('12.7.8 — successResponse shape is correct', () => {
        const res = successResponse({ id: '123' }, 201);
        const calls = (NextResponse.json as jest.Mock).mock.calls;
        const call = calls[calls.length - 1];
        expect(call[0]).toMatchObject({ success: true, data: { id: '123' } });
        expect(call[1].status).toBe(201);
    });

    test('12.7.9 — errorResponse shape is correct', () => {
        const res = errorResponse('Unauthorised', 401);
        const calls = (NextResponse.json as jest.Mock).mock.calls;
        const call = calls[calls.length - 1];
        expect(call[0]).toMatchObject({ success: false, message: 'Unauthorised' });
        expect(call[1].status).toBe(401);
    });
});
