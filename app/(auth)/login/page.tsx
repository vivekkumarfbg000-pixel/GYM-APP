'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { db, supabase } from '@/lib/supabase';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot Password State
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!resetEmail) {
            toast.error('Please enter your email address');
            return;
        }

        setResetLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                // Redirect to our new dedicated update page
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });

            if (error) throw error;

            toast.success('Password reset link sent!');
            setIsForgotPasswordOpen(false);
            setResetEmail('');
        } catch (err: any) {
            console.error('Reset password error:', err);
            toast.error(err.message || 'Failed to send reset link');
        } finally {
            setResetLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Step 1: Try Supabase Auth login
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes('Invalid login credentials')) {
                    toast.error('Invalid email or password.');
                } else if (authError.message.includes('Email not confirmed')) {
                    toast.error('Please confirm your email address.');
                } else {
                    toast.error(authError.message);
                }
                setLoading(false);
                return;
            }

            if (!authData?.user) {
                toast.error('Login failed. Please try again.');
                setLoading(false);
                return;
            }

            // Step 2: Fetch gym owner from database
            const gymOwner = await db.gymOwners.getByEmail(email);

            if (!gymOwner) {
                // If auth exists but no gym owner profile, they might be a member trying to login here
                // Check if they are a member (optional, or just deny)
                toast.error('Access Denied. This login is for Gym Owners only.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            // Save gym owner session data
            if (typeof window !== 'undefined') {
                localStorage.setItem('gymflow_owner_id', gymOwner.id);
                localStorage.setItem('gymflow_owner_name', gymOwner.name);
                localStorage.setItem('gymflow_owner_email', gymOwner.email);
                localStorage.setItem('gymflow_gym_password', gymOwner.gym_password);
            }

            toast.success(`Welcome back, ${gymOwner.name}!`);
            router.push('/dashboard');
            router.refresh();

        } catch (err: any) {
            console.error('Login error:', err);
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl z-10">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto mb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                            Owner Portal
                        </span>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-base">
                        Sign in to your GymFlow Dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        type="email"
                                        className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/30"
                                        placeholder="owner@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-zinc-300">Password</Label>
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPasswordOpen(true)}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                    <Input
                                        type="password"
                                        className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/30"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold text-base shadow-lg shadow-white/5 transition-all hover:scale-[1.01]"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>

                        <div className="text-center text-sm text-zinc-500">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-white hover:underline underline-offset-4 decoration-zinc-700">
                                Create Gym Account
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Forgot Password Dialog */}
            {isForgotPasswordOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 text-zinc-500 hover:text-white"
                            onClick={() => setIsForgotPasswordOpen(false)}
                        >
                            ✕
                        </Button>
                        <CardHeader>
                            <CardTitle className="text-white">Reset Password</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Enter your email to receive a reset link.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <Input
                                    type="email"
                                    className="bg-zinc-950 border-zinc-800 text-white"
                                    placeholder="owner@example.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={resetLoading}>
                                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </form>
                            <div className="mt-4 text-center">
                                <Button
                                    variant="link"
                                    className="text-zinc-500 hover:text-white"
                                    onClick={() => router.push('/repair-account')}
                                >
                                    Lost Gym Access? Use Verification Tool
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
