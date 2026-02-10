import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withErrorHandler } from '@/lib/api-error-handler';

async function handler(req: NextRequest) {
    const body = await req.json();

    const { error, errorInfo, url, userAgent } = body;

    // Log the client-side error
    logger.error(
        `Client Error: ${error.message}`,
        {
            name: error.name,
            message: error.message,
            stack: error.stack
        } as Error,
        {
            componentStack: errorInfo?.componentStack,
            url,
            userAgent,
            source: 'client'
        }
    );

    return NextResponse.json({
        success: true,
        message: 'Error logged successfully'
    });
}

export const POST = withErrorHandler(handler);
