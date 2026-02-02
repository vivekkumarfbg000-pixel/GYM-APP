'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TestSupabasePage() {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [error, setError] = useState<string | null>(null);
    const [memberCount, setMemberCount] = useState<number>(0);

    const testConnection = async () => {
        setStatus('checking');
        setError(null);

        try {
            if (!isSupabaseConfigured()) {
                throw new Error('Supabase environment variables not configured');
            }

            // Test members table
            const { data, error: queryError } = await supabase
                .from('members')
                .select('count')
                .limit(1);

            if (queryError) {
                throw new Error(`Database query failed: ${queryError.message}`);
            }

            // Count members
            const { count, error: countError } = await supabase
                .from('members')
                .select('*', { count: 'exact', head: true });

            if (countError) {
                console.warn('Count failed:', countError);
            }

            setMemberCount(count || 0);
            setStatus('connected');
            toast.success('Supabase connected successfully!');
        } catch (err: any) {
            setStatus('error');
            setError(err.message);
            toast.error('Failed to connect to Supabase');
        }
    };

    useEffect(() => {
        testConnection();
    }, []);

    return (
        <div className="container max-w-2xl mx-auto py-12">
            <Card>
                <CardHeader>
                    <CardTitle>Supabase Connection Test</CardTitle>
                    <CardDescription>
                        Testing connection to your Supabase database
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'checking' && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p>Testing connection...</p>
                        </div>
                    )}

                    {status === 'connected' && (
                        <div className="text-center py-8">
                            <div className="text-green-600 text-5xl mb-4">✓</div>
                            <h3 className="text-xl font-bold text-green-600 mb-2">
                                Connection Successful!
                            </h3>
                            <p className="text-gray-600">
                                Your app is connected to Supabase
                            </p>
                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    Members in database: <span className="font-bold">{memberCount}</span>
                                </p>
                            </div>
                            <div className="mt-6 space-x-4">
                                <Button
                                    onClick={() => window.location.href = '/dashboard/members'}
                                >
                                    Go to Members Page
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={testConnection}
                                >
                                    Test Again
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center py-8">
                            <div className="text-red-600 text-5xl mb-4">✕</div>
                            <h3 className="text-xl font-bold text-red-600 mb-2">
                                Connection Failed
                            </h3>
                            <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
                                <p className="text-sm font-mono text-red-700">
                                    {error}
                                </p>
                            </div>
                            <div className="mt-6 space-y-4 text-left">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold mb-2">Troubleshooting</h4>
                                    <ul className="text-sm space-y-1 list-disc list-inside">
                                        <li>Check that you ran the SQL schema in Supabase</li>
                                        <li>Verify environment variables in .env.local</li>
                                        <li>Restart the dev server</li>
                                        <li>Check Supabase project is not paused</li>
                                    </ul>
                                </div>
                                <Button
                                    onClick={testConnection}
                                    className="w-full"
                                >
                                    Retry Connection
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
