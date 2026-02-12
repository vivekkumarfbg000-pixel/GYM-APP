'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Copy, CheckCircle2, Building2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [gymName, setGymName] = useState('');
    const [gymPassword, setGymPassword] = useState('');

    // UI States
    const [loading, setLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [createdGymPassword, setCreatedGymPassword] = useState('');

    const generateGymPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGymPassword(result);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!gymPassword || gymPassword.length < 6) {
                toast.error('Gym password must be at least 6 characters');
                setLoading(false);
                return;
            }

            // Step 1: Create Supabase Auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                    data: {
                        full_name: name,
                        gym_name: gymName,
                        role: 'gym_owner'
                    },
                },
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    toast.error('Account already exists. Please login.');
                } else {
                    toast.error(authError.message);
                }
                setLoading(false);
                return;
            }

            if (!authData?.user) {
                toast.error('Signup failed: No user data returned');
                setLoading(false);
                return;
            }

            // Step 2: Create gym owner in database
            const response = await fetch('/api/gym-owner/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone: phone || null,
                    gymName: gymName || null,
                    gymPassword,
                    authUserId: authData.user.id
                })
            });

            const result = await response.json();

            if (!result.success) {
                toast.error(result.error || 'Database creation failed');
                // Optional: we could cleanup the auth user here if strict consistency is needed
                setLoading(false);
                return;
            }

            // Success!
            setCreatedGymPassword(gymPassword);
            setSignupSuccess(true);
            toast.success('Gym Owner Account created!');

        } catch (err: any) {
            console.error('Signup error:', err);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Render Success Screen
    if (signupSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl z-10">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Welcome, Owner!</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Your gym "{gymName}" is ready.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-3">
                            <Label className="text-sm font-medium text-zinc-400">Gym Access Key</Label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xl font-mono font-bold text-blue-400 bg-zinc-900 px-4 py-3 rounded border border-zinc-800 tracking-wider">
                                    {createdGymPassword}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(createdGymPassword)}
                                    className="h-12 w-12 border-zinc-700 hover:bg-zinc-800 hover:text-white"
                                >
                                    <Copy className="h-5 w-5" />
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Share this key with your members. They will need it to register on the mobile app.
                            </p>
                        </div>

                        <Button
                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold"
                            onClick={() => router.push('/login')}
                        >
                            Go to Dashboard Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render Main Form
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 shadow-2xl z-10">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto mb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                            For Gym Owners
                        </span>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">
                        Create your Account
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-base">
                        Start managing your gym effortlessly with AI.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-6">

                        <div className="space-y-4">
                            {/* Personal Info */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Test Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                        <Input
                                            className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/30"
                                            placeholder="Owner Name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Email Address</Label>
                                    <Input
                                        type="email"
                                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/30"
                                        placeholder="owner@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Password</Label>
                                    <Input
                                        type="password"
                                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/30"
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-900 px-2 text-zinc-500">Gym Details</span>
                                </div>
                            </div>

                            {/* Gym Info */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Gym Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                                        <Input
                                            className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/30"
                                            placeholder="e.g. Spartan Fitness"
                                            value={gymName}
                                            onChange={e => setGymName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-zinc-300">
                                        Create Gym Code <span className="text-zinc-500 text-xs ml-2">(Required for Members to join)</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 font-mono tracking-wide focus-visible:ring-blue-500/30"
                                            placeholder="GYM-CODE"
                                            value={gymPassword}
                                            onChange={e => setGymPassword(e.target.value.toUpperCase())}
                                            required
                                            minLength={6}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={generateGymPassword}
                                            className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold text-base shadow-lg shadow-white/5 transition-all hover:scale-[1.01]"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Gym Account'}
                        </Button>

                        <div className="text-center text-sm text-zinc-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white hover:underline underline-offset-4 decoration-zinc-700">
                                Log in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
