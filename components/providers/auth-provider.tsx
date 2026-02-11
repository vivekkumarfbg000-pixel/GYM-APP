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
    // Valid fallback key to prevent "Forbidden use of secret API key" error
    const getSafeKey = () => {
        const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const hardcodedKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bWxqbWFjeG5rZ2VvZXdobGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjMzMDYsImV4cCI6MjA4NTU5OTMwNn0.IDNKUTKLPsahV59wdcFx1COuqKer5zAg8zJfVM0m4Yc';

        // We check for "service_role" in plain text AND Base64 ("c2VydmljZV9yb2xl")
        if (!envKey ||
            envKey.includes('service_role') ||
            envKey.includes('c2VydmljZV9yb2xl') ||
            envKey.startsWith('sb_secret')) {
            return hardcodedKey;
        }
        return envKey;
    };

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        getSafeKey()
    );

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
