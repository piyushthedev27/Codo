import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (
    request: NextRequest,
    context?: unknown
) => Promise<NextResponse> | NextResponse;

interface RateLimitConfig {
    maxRequests: number;   // max requests per window
    windowMs: number;      // rolling window in milliseconds
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

/** 100 requests per minute — standard API endpoints */
export const STANDARD_RATE_LIMIT: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60 * 1000,
};

/** 10 requests per minute — code execution / resource-intensive endpoints */
export const INTENSIVE_RATE_LIMIT: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60 * 1000,
};

// ---------------------------------------------------------------------------
// Sliding window store
// ---------------------------------------------------------------------------

/** key = `${ip}:${configKey}` → sorted list of timestamps */
const requestStore = new Map<string, number[]>();

/** Clean up old entries every 5 minutes to prevent memory leaks */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requestStore.entries()) {
        // Remove entries where all timestamps are older than 1 hour
        const recent = timestamps.filter((t) => now - t < 60 * 60 * 1000);
        if (recent.length === 0) {
            requestStore.delete(key);
        } else {
            requestStore.set(key, recent);
        }
    }
}, CLEANUP_INTERVAL_MS);

// ---------------------------------------------------------------------------
// Core check function
// ---------------------------------------------------------------------------

function isRateLimited(identifier: string, config: RateLimitConfig): {
    limited: boolean;
    remaining: number;
    resetAfterMs: number;
} {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const timestamps = (requestStore.get(identifier) ?? []).filter(
        (t) => t > windowStart
    );

    if (timestamps.length >= config.maxRequests) {
        const oldest = timestamps[0];
        const resetAfterMs = config.windowMs - (now - oldest);
        return { limited: true, remaining: 0, resetAfterMs };
    }

    timestamps.push(now);
    requestStore.set(identifier, timestamps);

    return {
        limited: false,
        remaining: config.maxRequests - timestamps.length,
        resetAfterMs: 0,
    };
}

// ---------------------------------------------------------------------------
// IP extraction helper
// ---------------------------------------------------------------------------

function getClientIp(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        'unknown'
    );
}

// ---------------------------------------------------------------------------
// Middleware wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps a Next.js route handler with rate limiting.
 *
 * @param handler  The route handler to protect.
 * @param config   Rate limit configuration (use STANDARD_RATE_LIMIT or INTENSIVE_RATE_LIMIT).
 * @param keyPrefix  Optional prefix to namespace keys (defaults to handler name).
 */
export function withRateLimit(
    handler: RouteHandler,
    config: RateLimitConfig = STANDARD_RATE_LIMIT,
    keyPrefix = 'default'
): RouteHandler {
    return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
        const ip = getClientIp(request);
        const key = `${keyPrefix}:${ip}`;
        const { limited, remaining, resetAfterMs } = isRateLimited(key, config);

        if (limited) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Too many requests. Please try again later.',
                    code: 'RATE_LIMITED',
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil(resetAfterMs / 1000)),
                        'X-RateLimit-Limit': String(config.maxRequests),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        const response = await handler(request, context);

        // Attach rate limit headers to successful responses
        response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
        response.headers.set('X-RateLimit-Remaining', String(remaining));

        return response;
    };
}
