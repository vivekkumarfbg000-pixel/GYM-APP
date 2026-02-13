'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, QrCode, Calendar, Menu, ScanLine } from 'lucide-react';

export function OwnerBottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { label: 'Home', icon: LayoutDashboard, path: '/owner-mobile/dashboard' },
        { label: 'Members', icon: Users, path: '/owner-mobile/members' },
        { label: 'Scan', icon: ScanLine, path: '/owner-mobile/scan', special: true },
        { label: 'Schedule', icon: Calendar, path: '/owner-mobile/schedule' },
        { label: 'Menu', icon: Menu, path: '/owner-mobile/menu' },
    ];

    return (
        <nav className="px-6 pb-6 pt-2 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
            <div className="w-full max-w-md pointer-events-auto">
                <div className="bg-zinc-900/90 rounded-2xl p-2 flex items-center justify-between shadow-2xl border border-zinc-800 backdrop-blur-xl">
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
                                    <div className="relative h-14 w-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transform transition-transform group-hover:scale-110 group-active:scale-95 border-4 border-zinc-950">
                                        <QrCode size={24} className="animate-pulse" />
                                    </div>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${active
                                    ? 'text-blue-400 bg-blue-500/10'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                    }`}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}
                                />
                                {active && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"></span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
