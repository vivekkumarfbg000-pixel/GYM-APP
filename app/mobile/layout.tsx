'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { BottomNav } from '@/components/mobile/bottom-nav';

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();

    const isLoginPage = pathname?.includes('/login') || pathname?.includes('/register');

    useEffect(() => {
        if (!loading && !user && !isLoginPage) {
            router.push('/mobile/login');
        }
    }, [user, loading, isLoginPage, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (isLoginPage) {
        return <div className="min-h-screen bg-gray-50">{children}</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 theme-member">
            {/* Main Content */}
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-lg overflow-hidden relative">
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
