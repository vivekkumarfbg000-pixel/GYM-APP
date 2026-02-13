'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OwnerBottomNav } from '@/components/mobile/owner-bottom-nav';

export default function OwnerMobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    // Simple auth check (mock for now, should verify 'gymflow_owner_id' in localstorage)
    useEffect(() => {
        const ownerId = localStorage.getItem('gymflow_owner_id');
        if (!ownerId) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-zinc-950 pb-24 text-white font-sans selection:bg-blue-500/30">
            <div className="mx-auto max-w-md min-h-screen bg-zinc-950 shadow-2xl shadow-blue-900/10 overflow-hidden relative border-x border-zinc-900">
                {children}
            </div>

            <OwnerBottomNav />
        </div>
    );
}
