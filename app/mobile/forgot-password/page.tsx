'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get the current origin for the redirect URL
            const origin = window.location.origin;
            const redirectUrl = `${origin}/mobile/update-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) {
                toast.error(error.message);
            } else {
                setSent(true);
                toast.success('Password reset email sent!');
            }
        } catch (error) {
            console.error('Reset error:', error);
            toast.error('Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <div className="bg-green-50 p-6 rounded-full mb-6">
                    <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                    We've sent a password reset link to <strong>{email}</strong>.
                </p>
                <Link href="/mobile/login" className="w-full max-w-xs">
                    <Button variant="outline" className="w-full">
                        Back to Login
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col p-6">
            <Link href="/mobile/login" className="mb-8 text-gray-500 hover:text-gray-900 w-fit">
                <ArrowLeft size={24} />
            </Link>

            <div className="w-full max-w-sm mx-auto space-y-8 flex-1 flex flex-col justify-center -mt-20">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-50 flex items-center justify-center mb-6 rounded-2xl text-blue-600">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        No worries! Enter your email and we'll send you reset instructions.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleReset}>
                    <div>
                        <Input
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-50 h-12"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <div className="text-center mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">
                            ⚠️ Not receiving the email?
                        </p>
                        <p className="text-sm text-gray-600">
                            Ask your <strong>Gym Owner</strong> to reset your password directly from their Dashboard.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
