'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, Dumbbell, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
    const pathname = usePathname();

    const tabs = [
        { href: '/mobile/dashboard', label: 'Home', icon: Home },
        { href: '/mobile/workout', label: 'Track', icon: Activity },
        { href: '/mobile/diet', label: 'Coach', icon: Dumbbell },
        { href: '/mobile/community', label: 'Community', icon: Users },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
            <div className="max-w-md mx-auto grid grid-cols-4 h-16 relative">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`relative flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute top-0 w-12 h-1 bg-blue-600 rounded-b-lg"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
