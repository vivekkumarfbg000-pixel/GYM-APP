'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RepairAccountPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [gymPassword, setGymPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleRepair = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/gym-owner/repair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    gymPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Repair failed');
            }

            setSuccess(true);
            toast.success('Account repaired successfully!');
        } catch (error: any) {
            console.error('Repair failed:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-700">Access Restored!</CardTitle>
                        <CardDescription>
                            Your login account has been successfully repaired and linked to your gym profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-sm text-green-800">
                            You can now log in using your email and the <strong>new password</strong> you just set.
                        </div>
                        <Button className="w-full" onClick={() => router.push('/login')}>
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-center">Repair Gym Owner Access</CardTitle>
                    <CardDescription className="text-center">
                        Use this verification tool if you are unable to login to your Gym Owner dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRepair} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="owner@gym.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="gymPassword">Gym Access Password</Label>
                                <span className="text-xs text-blue-600 font-medium">Verification Key</span>
                            </div>
                            <Input
                                id="gymPassword"
                                type="text"
                                placeholder="e.g. GYM2024"
                                value={gymPassword}
                                onChange={(e) => setGymPassword(e.target.value)}
                                required
                                className="border-blue-200 bg-blue-50 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500">
                                This is the code your members use to join your gym. We use this to verify it's really you.
                            </p>
                        </div>

                        <div className="my-4 h-px bg-gray-200" />

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Login Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Set new secure password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying & Repairing...
                                </>
                            ) : (
                                <>
                                    Verify & Restore Access
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <div className="text-center mt-4">
                            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
