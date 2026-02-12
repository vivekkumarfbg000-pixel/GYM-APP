'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [gymName, setGymName] = useState('');
    const [gymPassword, setGymPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [createdGymPassword, setCreatedGymPassword] = useState('');

    // Generate random gym password
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
            toast.success('Gym password copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate gym password
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
                console.error('Supabase signup error:', authError);

                // Handle specific error cases
                if (authError.message.includes('already registered')) {
                    toast.error('This email is already registered. Please login instead.');
                } else {
                    toast.error(authError.message);
                }

                // CRITICAL FIX: Do NOT proceed if Auth fails. 
                // Previously, this continued to create a DB record without an Auth User, leading to broken accounts.
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
                    age: age ? parseInt(age) : null,
                    gymName: gymName || null,
                    gymPassword,
                    authUserId: authData?.user?.id || null
                })
            });

            const result = await response.json();

            if (!result.success) {
                toast.error(result.error || 'Signup failed');
                setLoading(false);
                return;
            }

            // Success!
            setCreatedGymPassword(gymPassword);
            setSignupSuccess(true);
            toast.success('Account created successfully!');

        } catch (err: any) {
            console.error('Signup error:', err);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Success screen showing gym password
    if (signupSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
                <Card className="w-full max-w-md shadow-2xl border-0">
                    <CardHeader className="space-y-3 text-center pb-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Account Created Successfully!
                        </CardTitle>
                        <CardDescription className="text-base">
                            Save your gym password - members will need it to join
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-3">
                            <Label className="text-sm font-medium text-blue-900">Your Gym Password</Label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-2xl font-bold text-blue-600 bg-white px-4 py-3 rounded border-2 border-blue-300 tracking-wider">
                                    {createdGymPassword}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(createdGymPassword)}
                                    className="h-12 w-12"
                                >
                                    <Copy className="h-5 w-5" />
                                </Button>
                            </div>
                            <p className="text-sm text-blue-700">
                                ⚠️ Share this password with your members so they can register and connect to your gym.
                            </p>
                        </div>

                        <Button
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            onClick={() => router.push('/login')}
                        >
                            Continue to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                        Start Free Trial
                    </CardTitle>
                    <CardDescription className="text-base">
                        Join GymFlow AI and transform your gym today
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Full Name *
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="1234567890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age" className="text-sm font-medium">
                                    Age
                                </Label>
                                <Input
                                    id="age"
                                    type="number"
                                    placeholder="35"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gymName" className="text-sm font-medium">
                                Gym Name
                            </Label>
                            <Input
                                id="gymName"
                                type="text"
                                placeholder="Spartan Gym"
                                value={gymName}
                                onChange={(e) => setGymName(e.target.value)}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address *
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
                                Password *
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gymPassword" className="text-sm font-medium">
                                Gym Password * <span className="text-gray-500 text-xs">(Members will use this to join)</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="gymPassword"
                                    type="text"
                                    placeholder="e.g., GYM2024"
                                    value={gymPassword}
                                    onChange={(e) => setGymPassword(e.target.value.toUpperCase())}
                                    required
                                    minLength={6}
                                    className="h-11"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateGymPassword}
                                    className="h-11 whitespace-nowrap"
                                >
                                    Generate
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Choose a unique password that your members will use to register
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
