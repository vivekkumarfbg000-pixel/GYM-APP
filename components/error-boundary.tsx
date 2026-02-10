'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to our logging system
        console.error('React Error Boundary caught error:', error, errorInfo);

        // Save error info to state
        this.setState({
            errorInfo
        });

        // Send error to logging service
        if (typeof window !== 'undefined') {
            // Send to our API endpoint for logging
            fetch('/api/logs/client-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: {
                        message: error.message,
                        stack: error.stack,
                        name: error.name
                    },
                    errorInfo: {
                        componentStack: errorInfo.componentStack
                    },
                    url: window.location.href,
                    userAgent: window.navigator.userAgent
                })
            }).catch(e => console.error('Failed to log error:', e));
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl">Something went wrong</CardTitle>
                            <CardDescription>
                                We apologize for the inconvenience. An unexpected error occurred.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <p className="text-sm font-mono text-red-600 mb-2">
                                        {this.state.error.message}
                                    </p>
                                    {this.state.error.stack && (
                                        <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                                            {this.state.error.stack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Button
                                    onClick={this.handleReset}
                                    className="w-full"
                                    variant="default"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>

                                <Button
                                    onClick={() => window.location.href = '/'}
                                    className="w-full"
                                    variant="outline"
                                >
                                    Go to Home
                                </Button>
                            </div>

                            <p className="text-xs text-center text-gray-500">
                                If this problem persists, please contact support.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook to manually report errors to the error boundary
 */
export function useErrorHandler() {
    const handleError = (error: Error) => {
        // This will trigger the nearest error boundary
        throw error;
    };

    return handleError;
}
