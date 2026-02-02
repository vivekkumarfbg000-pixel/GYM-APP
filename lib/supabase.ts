import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client (it will work in demo mode even without real credentials)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

// Database types (matching database schema with snake_case)
export type DbMember = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    membership_type: string;
    membership_end_date: string | null;
    join_date: string;
    segment: string;
    engagement_score: number;
    churn_risk: number;
    check_in_frequency: number;
    last_check_in: string | null;
    total_revenue: number;
    pt_sessions: number;
    created_at: string;
    updated_at: string;
};

export type DbCampaign = {
    id: string;
    name: string;
    segment: string;
    message_template: string;
    response_rate: number;
    revenue: number;
    status: 'draft' | 'active' | 'completed';
    sent_date: string | null;
    created_at: string;
    updated_at: string;
};

export type DbAttendance = {
    id: string;
    member_id: string;
    check_in: string;
    check_out: string | null;
    duration: number | null;
    created_at: string;
};

export type DbClass = {
    id: string;
    name: string;
    instructor: string | null;
    schedule: string | null;
    capacity: number;
    enrolled: number;
    category: string | null;
    created_at: string;
    updated_at: string;
};

export type DbLead = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    source: string | null;
    status: string;
    interest: string | null;
    follow_up_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type DbProduct = {
    id: string;
    name: string;
    category: string | null;
    price: number;
    stock: number;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type DbTrainer = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
    rating: number;
    sessions_conducted: number;
    created_at: string;
    updated_at: string;
};

// Database helper object (for future use)
export const db = {
    members: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        getById: async (id: string) => {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        create: async (member: Partial<DbMember>) => {
            const { data, error } = await supabase
                .from('members')
                .insert([member])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: Partial<DbMember>) => {
            const { data, error } = await supabase
                .from('members')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        search: async (query: string) => {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    },
    campaigns: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    },
    attendance: {
        getToday: async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('attendance')
                .select(`
                    *,
                    members (
                        id,
                        name,
                        email,
                        segment
                    )
                `)
                .gte('check_in', `${today}T00:00:00`)
                .lte('check_in', `${today}T23:59:59`)
                .order('check_in', { ascending: false });
            if (error) throw error;
            return data;
        }
    }
};


