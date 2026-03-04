/**
 * Structured logger for CODO — outputs JSON-line logs compatible with
 * Firebase Cloud Logging and Vercel Log Drains.
 *
 * Each log entry includes a `severity` field recognized by GCP:
 * DEFAULT, DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL
 */

// ---------------------------------------------------------------------------
// Base formatter
// ---------------------------------------------------------------------------

function log(severity: string, payload: Record<string, unknown>): void {
    const entry = JSON.stringify({
        severity,
        timestamp: new Date().toISOString(),
        ...payload,
    });
    if (severity === 'ERROR' || severity === 'CRITICAL') {
        console.error(entry);
    } else {
        console.log(entry);
    }
}

// ---------------------------------------------------------------------------
// Request logging (Requirement 16.1)
// ---------------------------------------------------------------------------

/**
 * Logs an API request with relevant metadata.
 */
export function logRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    userId?: string
): void {
    log('INFO', {
        type: 'request',
        method,
        path,
        statusCode,
        durationMs,
        ...(userId ? { userId } : {}),
    });
}

// ---------------------------------------------------------------------------
// Submission logging (Requirement 16.2)
// ---------------------------------------------------------------------------

/**
 * Logs a code submission with execution metrics.
 */
export function logSubmission(
    userId: string,
    challengeId: string,
    language: string,
    verdict: 'accepted' | 'wrong_answer' | 'time_limit' | 'compile_error' | 'runtime_error',
    executionMs: number
): void {
    log('INFO', {
        type: 'submission',
        userId,
        challengeId,
        language,
        verdict,
        executionMs,
    });
}

// ---------------------------------------------------------------------------
// Error logging (Requirement 16.4)
// ---------------------------------------------------------------------------

/**
 * Logs an error with stack trace and optional context.
 */
export function logError(
    error: unknown,
    context?: Record<string, unknown>
): void {
    const isError = error instanceof Error;
    log('ERROR', {
        type: 'error',
        message: isError ? error.message : String(error),
        stack: isError ? error.stack : undefined,
        ...(context ?? {}),
    });
}

// ---------------------------------------------------------------------------
// Generic info / debug helpers
// ---------------------------------------------------------------------------

export function logInfo(message: string, data?: Record<string, unknown>): void {
    log('INFO', { type: 'info', message, ...(data ?? {}) });
}

export function logDebug(message: string, data?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
        log('DEBUG', { type: 'debug', message, ...(data ?? {}) });
    }
}
