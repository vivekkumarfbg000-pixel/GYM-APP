import { supabase } from './supabase';

// Auth helper functions
export const auth = {
    // Sign in with email and password
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    },

    // Sign up new user
    async signUp(email: string, password: string, metadata?: Record<string, any>) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Get current user
    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    // Reset password
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    },

    // Update user info
    async updateUser(updates: { email?: string; password?: string; data?: Record<string, any> }) {
        const { data, error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        return data;
    }
};

// Demo/fallback auth for when Supabase is not configured
export const demoAuth = {
    async signIn(email: string, password: string) {
        // Simulate auth delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Accept any email/password for demo
        return {
            user: {
                id: 'demo-user-id',
                email: email,
                user_metadata: {
                    name: 'Demo User',
                    gymName: 'Your Gym Name'
                }
            },
            session: {
                access_token: 'demo-token',
                user: {
                    id: 'demo-user-id',
                    email: email
                }
            }
        };
    },

    async signOut() {
        await new Promise(resolve => setTimeout(resolve, 200));
    },

    async getSession() {
        // Check if there's a demo session in localStorage
        if (typeof window !== 'undefined') {
            const demoSession = localStorage.getItem('demo-session');
            if (demoSession) {
                return JSON.parse(demoSession);
            }
        }
        return null;
    }
};
