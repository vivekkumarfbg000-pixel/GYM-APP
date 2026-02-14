'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Valid fallback key to prevent "Forbidden use of secret API key" error
    const getSafeKey = () => {
        // FORCE SAFE KEY
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bWxqbWFjeG5rZ2VvZXdobGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjMzMDYsImV4cCI6MjA4NTU5OTMwNn0.IDNKUTKLPsahV59wdcFx1COuqKer5zAg8zJfVM0m4Yc';
    };

    // FIX: Initialize client ONCE to prevent recreation on every render
    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        getSafeKey()
    ));

    useEffect(() => {
        const getSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.warn('Auth session error:', error.message);
                } else if (data?.session) {
                    console.log('✅ Session restored:', data.session.user.email);
                } else {
                    console.log('⚠️ No active session found on mount');
                }
                setSession(data?.session ?? null);
                setUser(data?.session?.user ?? null);
            } catch (err) {
                console.error('Unexpected auth error:', err);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('🔄 Auth state changed:', _event);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Optional: Handle token refresh or automatic redirects here if needed
            if (_event === 'SIGNED_OUT') {
                router.refresh();
            }
        });

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
