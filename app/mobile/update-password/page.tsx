'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Lock, CheckCircle } from 'lucide-react';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [updated, setUpdated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Verify session exists (handled by Supabase client when redirected from email)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Invalid or expired reset link');
                router.push('/mobile/login');
            }
        };
        checkSession();
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                toast.error(error.message);
            } else {
                setUpdated(true);
                toast.success('Password updated successfully!');

                // Keep them logged in and redirect to dashboard after a delay
                setTimeout(() => {
                    router.push('/mobile/dashboard');
                }, 2000);
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (updated) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <div className="bg-green-50 p-6 rounded-full mb-6 relative">
                    <CheckCircle size={48} className="text-green-600 relative z-10" />
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                    Your password has been changed successfully. Redirecting you to the dashboard...
                </p>
                <p className="text-xs text-gray-400">
                    If not redirected, <span onClick={() => router.push('/mobile/dashboard')} className="text-blue-600 cursor-pointer underline">click here</span>.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-50 flex items-center justify-center mb-6 rounded-2xl text-blue-600">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Create a strong password for your account
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleUpdate}>
                    <div className="space-y-4">
                        <div>
                            <Input
                                type="password"
                                required
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-gray-50 h-12"
                            />
                        </div>
                        <div>
                            <Input
                                type="password"
                                required
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-gray-50 h-12"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
