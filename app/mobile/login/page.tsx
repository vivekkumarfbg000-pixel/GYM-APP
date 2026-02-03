'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Smartphone, Lock, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function MobileLoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingApproval, setPendingApproval] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setPendingApproval(true);
        }
    }, [searchParams]);

    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            if (data.user) {
                // Keep localStorage for compatibility with existing hooks
                localStorage.setItem('gymflow_member_id', data.user.id);
                localStorage.setItem('gymflow_member_name', data.user.user_metadata?.name || 'Member');

                toast.success(`Welcome back!`);
                router.push('/mobile/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    if (pendingApproval) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-yellow-50 p-6 rounded-full mb-6">
                    <Clock size={48} className="text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Approval Pending</h2>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                    Your account has been created! Please wait for the Gym Owner to approve your request.
                </p>
                <div className="space-y-3 w-full max-w-xs">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.location.reload()}
                    >
                        Check Status Again
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setPendingApproval(false)}
                    >
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Smartphone className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Member Login</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your credentials to continue
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <Input
                                type="email"
                                required
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-50 h-12"
                            />
                        </div>
                        <div>
                            <Input
                                type="password"
                                required
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-gray-50 h-12"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Log In'}
                    </Button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        Don't have an account?{' '}
                        <Link href="/mobile/register" className="text-blue-600 font-bold hover:underline">
                            Register Here
                        </Link>
                    </p>
                </div>

                <div className="text-center text-xs text-gray-400 mt-8">
                    <p>Demo Admin Login: admin@gymflow.com / admin123</p>
                </div>
            </div>
        </div>
    );
}

export default function MobileLoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MobileLoginContent />
        </Suspense>
    );
}
