'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function MobileRegisterPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        gymPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone,
                    age: form.age ? parseInt(form.age) : null,
                    gymPassword: form.gymPassword
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Registration successful! Please wait for gym owner approval.');
                // Redirect to pending screen or login with message
                router.push('/mobile/login?registered=true');
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col px-6 py-12">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <div className="mb-8">
                    <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                        <UserPlus size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500">Join your gym to track your fitness journey.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            placeholder="Full Name"
                            className="bg-gray-50 border-gray-100 h-12 mt-1"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email Address"
                            className="bg-gray-50 border-gray-100 h-12 mt-1"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Phone Number"
                                className="bg-gray-50 border-gray-100 h-12 mt-1"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="age">Age *</Label>
                            <Input
                                id="age"
                                type="number"
                                placeholder="Age"
                                className="bg-gray-50 border-gray-100 h-12 mt-1"
                                value={form.age}
                                onChange={e => setForm({ ...form, age: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="gymPassword">Gym Password *</Label>
                        <Input
                            id="gymPassword"
                            type="text"
                            placeholder="Ask your gym owner for this"
                            className="bg-gray-50 border-gray-100 h-12 mt-1"
                            value={form.gymPassword}
                            onChange={e => setForm({ ...form, gymPassword: e.target.value.toUpperCase() })}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the password provided by your gym owner to connect your account
                        </p>
                    </div>
                    <div>
                        <Label htmlFor="password">Create Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Create Password"
                            className="bg-gray-50 border-gray-100 h-12 mt-1"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 mt-4" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Already have an account?{' '}
                        <Link href="/mobile/login" className="text-blue-600 font-bold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
