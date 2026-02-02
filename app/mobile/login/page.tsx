'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Smartphone } from 'lucide-react';

export default function MobileLoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if member exists via our API
            const response = await fetch(`/api/members?search=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                // Find exact match
                const member = data.data.find((m: any) => m.email.toLowerCase() === email.toLowerCase());

                if (member) {
                    // Success - save to local storage (MVP auth security)
                    localStorage.setItem('gymflow_member_id', member.id);
                    localStorage.setItem('gymflow_member_name', member.name);
                    toast.success(`Welcome back, ${member.name.split(' ')[0]}!`);
                    router.push('/mobile/dashboard');
                } else {
                    toast.error('Email not found. Ask your gym owner to add you.');
                }
            } else {
                toast.error('Member not found');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Failed to login. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Smartphone className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Member Login</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your registered email to access your workout companion
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Continue'}
                    </Button>
                </form>

                <div className="text-center text-xs text-gray-500 mt-8">
                    <p>Demo Mode: Use any email from the dashboard</p>
                    <p>Example: john.smith@example.com</p>
                </div>
            </div>
        </div>
    );
}
