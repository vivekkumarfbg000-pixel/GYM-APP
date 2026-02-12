'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, PlusCircle, Users, User, Dumbbell } from 'lucide-react';

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { label: 'Home', icon: Home, path: '/mobile/dashboard' },
        { label: 'Community', icon: Users, path: '/mobile/community' },
        { label: 'Workout', icon: PlusCircle, path: '/mobile/workout', special: true },
        { label: 'Progress', icon: Trophy, path: '/mobile/progress' },
        { label: 'Profile', icon: User, path: '/mobile/profile' },
    ];

    return (
        <nav className="px-6 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent">
            <div className="glass-panel rounded-2xl p-2 flex items-center justify-between shadow-lg shadow-blue-500/10 border border-white/40 backdrop-blur-xl">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    if (item.special) {
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className="relative -top-6 group"
                            >
                                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
                                <div className="relative h-14 w-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transform transition-transform group-hover:scale-110 group-active:scale-95 border-4 border-white dark:border-gray-900">
                                    <Dumbbell size={24} className="animate-pulse-glow" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${active
                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Icon
                                size={22}
                                strokeWidth={active ? 2.5 : 2}
                                className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}
                            />
                            {active && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"></span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
