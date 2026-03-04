import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Success response
// ---------------------------------------------------------------------------

/**
 * Returns a consistent success JSON response.
 * Shape: `{ success: true, data: T }`
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
    return NextResponse.json({ success: true, data }, { status });
}

// ---------------------------------------------------------------------------
// Error response
// ---------------------------------------------------------------------------

/**
 * Returns a consistent error JSON response.
 * Shape: `{ success: false, message, code? }`
 */
export function errorResponse(
    message: string,
    status = 500,
    code?: string
): NextResponse {
    return NextResponse.json(
        { success: false, message, ...(code ? { code } : {}) },
        { status }
    );
}

// ---------------------------------------------------------------------------
// Paginated response
// ---------------------------------------------------------------------------

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Returns a paginated success response.
 * Shape: `{ success: true, data: T[], pagination: PaginationMeta }`
 */
export function paginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): NextResponse {
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
    return NextResponse.json({ success: true, data, pagination });
}

// ---------------------------------------------------------------------------
// Parse pagination query params helper
// ---------------------------------------------------------------------------

/**
 * Extracts and normalises `page` and `limit` from query string.
 * Defaults: page=1, limit=20, max limit=100.
 */
export function parsePagination(searchParams: URLSearchParams): {
    page: number;
    limit: number;
    offset: number;
} {
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}
