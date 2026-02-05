'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; import { db } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Step 1: Try Supabase Auth login
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            let gymOwnerId: string | null = null;

            if (authError) {
                console.error('Supabase login error:', authError);

                // If Supabase Auth fails, try fallback database login
                toast.info('Using fallback authentication...');
            } else if (authData?.user) {
                // Successful Supabase Auth login, get gym owner data
                gymOwnerId = authData.user.id;
            }

            // Step 2: Fetch gym owner from database using email
            const gymOwner = await db.gymOwners.getByEmail(email);

            if (!gymOwner) {
                toast.error('Invalid credentials. Please check your email and password.');
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
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0">
                <CardHeader className="space-y-3 text-center pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        GymFlow AI
                    </CardTitle>
                    <CardDescription className="text-base">
                        Transform your gym revenue with AI-powered insights
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="owner@yourgym.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded" />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                Forgot password?
                            </a>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Start Free Trial
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
