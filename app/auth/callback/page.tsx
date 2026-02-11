
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, db } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const next = searchParams.get('next') || '/dashboard';

            if (!code) {
                // If no code, maybe implicit flow or error
                return;
            }

            try {
                // Exchange code for session
                const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

                if (error) throw error;
                if (!session?.user) throw new Error('No user session created');

                // Fetch gym owner details to store in localStorage (consistent with login flow)
                const gymOwner = await db.gymOwners.getByAuthUserId(session.user.id);

                if (gymOwner) {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('gymflow_owner_id', gymOwner.id);
                        localStorage.setItem('gymflow_owner_name', gymOwner.name);
                        localStorage.setItem('gymflow_owner_email', gymOwner.email);
                        // gym_password might be needed? Login page saves it.
                        if (gymOwner.gym_password) {
                            localStorage.setItem('gymflow_gym_password', gymOwner.gym_password);
                        }
                    }
                    toast.success('Successfully logged in!');
                } else {
                    console.warn('Gym owner profile not found for user', session.user.id);
                }

                router.push(next);
            } catch (error: any) {
                console.error('Auth callback error:', error);
                toast.error(error.message || 'Authentication failed');
                router.push('/login');
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Verifying...</h2>
                <p className="text-gray-500">Please wait while we log you in.</p>
            </div>
        </div>
    );
}
