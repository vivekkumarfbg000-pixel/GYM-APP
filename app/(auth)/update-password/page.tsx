'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [updated, setUpdated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Verify session exists
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, they might have clicked a magic link that expired or hasn't exchanged code yet.
                // But usually the auth-helper handles the exchange before we get here if the middleware is right.
                // Let's just warn for now.
                toast.error('Invalid or expired reset link. Please try again.');
                router.push('/login');
            }
        };
        checkSession();
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
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

                // Redirect user to dashboard after short delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (updated) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl z-10 animate-in fade-in zoom-in duration-300">
                    <CardContent className="pt-10 pb-10 text-center space-y-6">
                        <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Password Reset Complete</h2>
                            <p className="text-zinc-400">
                                Your password has been updated securely. <br />
                                Redirecting you to the dashboard...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl z-10">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <Lock className="w-6 h-6 text-blue-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Set New Password</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Create a strong password to secure your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">New Password</Label>
                                <Input
                                    type="password"
                                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus-visible:ring-blue-500/30"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Confirm Password</Label>
                                <Input
                                    type="password"
                                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus-visible:ring-blue-500/30"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-bold shadow-lg shadow-white/5"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
