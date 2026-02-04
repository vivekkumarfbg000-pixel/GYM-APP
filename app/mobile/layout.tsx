'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Activity, User, Dumbbell, Users } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

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
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="max-w-md mx-auto grid grid-cols-4 h-16">
                    <Link
                        href="/mobile/dashboard"
                        className={`flex flex-col items-center justify-center space-y-1 ${pathname === '/mobile/dashboard' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                    >
                        <Home size={24} />
                        <span className="text-xs">Home</span>
                    </Link>

                    <Link
                        href="/mobile/workout"
                        className={`flex flex-col items-center justify-center space-y-1 ${pathname === '/mobile/workout' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                    >
                        <Activity size={24} />
                        <span className="text-xs">Track</span>
                    </Link>

                    <Link
                        href="/mobile/diet"
                        className={`flex flex-col items-center justify-center space-y-1 ${pathname === '/mobile/diet' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                    >
                        <Dumbbell size={24} />
                        <span className="text-xs">Coach</span>
                    </Link>

                    <Link
                        href="/mobile/community"
                        className={`flex flex-col items-center justify-center space-y-1 ${pathname === '/mobile/community' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                    >
                        <Users size={24} /> // Using Users icon from lucide-react (ensure import)
                        <span className="text-xs">Community</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
