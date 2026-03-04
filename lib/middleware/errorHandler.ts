import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (
    request: NextRequest,
    context?: unknown
) => Promise<NextResponse> | NextResponse;

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Wraps a Next.js route handler with centralized error handling.
 * Catches AppError and generic Error instances and returns
 * a consistent JSON error response.
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
    return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
        try {
            return await handler(request, context);
        } catch (error: unknown) {
            if (error instanceof AppError) {
                console.error(`[AppError] ${error.code ?? 'UNKNOWN'}: ${error.message}`);
                return NextResponse.json(
                    {
                        success: false,
                        message: error.message,
                        code: error.code ?? 'APP_ERROR',
                    },
                    { status: error.statusCode }
                );
            }

            if (error instanceof Error) {
                console.error(`[UnhandledError] ${error.message}`, error.stack);
            } else {
                console.error('[UnhandledError] Unknown error', error);
            }

            return NextResponse.json(
                {
                    success: false,
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR',
                },
                { status: 500 }
            );
        }
    };
}
