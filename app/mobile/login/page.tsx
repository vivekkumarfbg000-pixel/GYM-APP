'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Clock } from 'lucide-react';

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Authenticate with Supabase
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes('Invalid login credentials')) {
                    toast.error('Invalid email or password');
                } else {
                    toast.error(authError.message);
                }
                setLoading(false);
                return;
            }

            if (!data?.user) {
                toast.error('Login failed');
                setLoading(false);
                return;
            }

            // 2. Verify User Role
            const role = data.user.user_metadata?.role;
            if (role !== 'member') {
                console.warn(`Login attempt by non-member role: ${role}`);
                await supabase.auth.signOut(); // Force logout

                if (role === 'gym_owner') {
                    toast.error('This app is for Members only. Gym Owners please use the Dashboard.');
                } else {
                    toast.error('Access denied. Member account required.');
                }
                setLoading(false);
                return;
            }

            // 3. Verify Member DB Record exists & get details
            // We use the auth ID to fetch the member record
            const { data: memberData, error: dbError } = await supabase
                .from('members')
                .select('id, name, status, gym_owner_id')
                .eq('id', data.user.id)
                .single();

            if (dbError || !memberData) {
                console.error('Member DB record missing for Auth User:', data.user.id);
                toast.error('Account corrupted: Login exists but Profile missing. Please contact support.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            // 4. Success - Set Session & Redirect
            localStorage.setItem('gymflow_member_id', memberData.id);
            localStorage.setItem('gymflow_member_name', memberData.name || data.user.user_metadata?.name || 'Member');

            // Optional: Store gym_owner_id if needed for multi-tenant context
            if (memberData.gym_owner_id) {
                localStorage.setItem('gymflow_gym_id', memberData.gym_owner_id);
            }

            toast.success(`Welcome back, ${memberData.name}!`);
            router.push('/mobile/dashboard');

        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.message || 'Connection failed');
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
                    <div className="mx-auto h-24 w-24 bg-transparent flex items-center justify-center mb-6 shadow-lg rounded-full overflow-hidden border-4 border-blue-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.jpg"
                            alt="GymFlow Logo"
                            className="h-full w-full object-cover"
                        />
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

                    <div className="flex justify-end">
                        <Link
                            href="/mobile/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            Forgot Password?
                        </Link>
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
