'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ErrorState({
    title = 'Something went wrong',
    message = 'An error occurred while loading this page',
    onRetry
}: {
    title?: string;
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <Card className="border-red-200 bg-red-50">
            <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-red-700">{message}</p>
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        variant="outline"
                        className="border-red-300 hover:bg-red-100"
                    >
                        Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export function ErrorBoundary({
    children,
    fallback
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    // For now, this is a simple wrapper. In production, you'd use react-error-boundary
    return <>{children}</>;
}

export function EmptyState({
    icon = '📭',
    title = 'No data found',
    description = 'Get started by adding your first item',
    action
}: {
    icon?: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent className="pt-12 pb-12">
                <div className="text-center">
                    <div className="text-6xl mb-4">{icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{description}</p>
                    {action}
                </div>
            </CardContent>
        </Card>
    );
}
