import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

export class ApiError extends Error {
    constructor(
        public message: string,
        public status: number = 500,
        public code: string = 'INTERNAL_ERROR',
        public context?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export function withErrorHandler(
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const startTime = Date.now();

        try {
            // Log API request
            logger.apiRequest(
                req.method,
                req.url,
                undefined, // userId can be extracted from headers/session if needed
                {
                    headers: Object.fromEntries(req.headers),
                    timestamp: new Date().toISOString()
                }
            );

            // Execute the handler
            const response = await handler(req);

            // Log successful response
            const duration = Date.now() - startTime;
            logger.info(`API Success: ${req.method} ${req.url}`, {
                status: response.status,
                duration: `${duration}ms`
            });

            return response;

        } catch (error: any) {
            const duration = Date.now() - startTime;

            // Log the error
            logger.apiError(
                req.method,
                req.url,
                error,
                undefined,
                {
                    duration: `${duration}ms`,
                    stack: error.stack
                }
            );

            // Handle different error types
            if (error instanceof ApiError) {
                return NextResponse.json({
                    success: false,
                    error: error.message,
                    errorCode: error.code,
                    ...(process.env.NODE_ENV === 'development' && {
                        context: error.context,
                        stack: error.stack
                    })
                }, { status: error.status });
            }

            // Handle database errors
            if (error.code && error.code.startsWith('23')) {
                return NextResponse.json({
                    success: false,
                    error: 'Database constraint violation',
                    errorCode: 'DB_CONSTRAINT_ERROR',
                    ...(process.env.NODE_ENV === 'development' && {
                        details: error.message
                    })
                }, { status: 400 });
            }

            // Handle generic errors
            return NextResponse.json({
                success: false,
                error: process.env.NODE_ENV === 'development'
                    ? error.message
                    : 'Internal server error',
                errorCode: 'INTERNAL_ERROR',
                ...(process.env.NODE_ENV === 'development' && {
                    stack: error.stack
                })
            }, { status: 500 });
        }
    };
}

/**
 * Common API error creators
 */
export const ApiErrors = {
    badRequest: (message: string, context?: any) =>
        new ApiError(message, 400, 'BAD_REQUEST', context),

    unauthorized: (message: string = 'Unauthorized') =>
        new ApiError(message, 401, 'UNAUTHORIZED'),

    forbidden: (message: string = 'Forbidden') =>
        new ApiError(message, 403, 'FORBIDDEN'),

    notFound: (message: string = 'Resource not found') =>
        new ApiError(message, 404, 'NOT_FOUND'),

    conflict: (message: string, context?: any) =>
        new ApiError(message, 409, 'CONFLICT', context),

    internal: (message: string = 'Internal server error', context?: any) =>
        new ApiError(message, 500, 'INTERNAL_ERROR', context),
};
