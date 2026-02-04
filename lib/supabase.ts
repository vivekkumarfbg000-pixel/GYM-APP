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
    streak_current: number;
    streak_longest: number;
    last_activity_date: string | null;
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

export type DbAiWorkout = {
    id: string;
    member_id: string;
    goal: string;
    duration: number;
    risk_level: 'low' | 'medium' | 'high';
    plan_data: any; // JSONB
    ai_notes: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    reviewed_by: string | null;
    created_at: string;
    updated_at: string;
};

export type DbDietChat = {
    id: string;
    member_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
};

export type DbPost = {
    id: string;
    member_id: string;
    content: string;
    image_url: string | null;
    likes: number;
    created_at: string;
};

export type DbChallenge = {
    id: string;
    title: string;
    description: string;
    goal_type: string;
    goal_target: number;
    start_date: string;
    end_date: string;
    participants_count: number;
    image_url: string | null;
    created_at: string;
};

export type DbAchievement = {
    id: string;
    member_id: string;
    badge_id: string;
    unlocked_at: string;
};

export type DbDuel = DbChallenge & {
    is_duel: boolean;
    creator_id: string;
    opponent_id: string | null;
    status: 'pending' | 'active' | 'completed';
    winner_id: string | null;
};

export type DbDietPlan = {
    id: string;
    member_id: string;
    goal: string;
    diet_type: string;
    calories_target: number;
    plan_data: any; // JSON
    status: 'active' | 'archived';
    created_at: string;
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
        },
        getAtRisk: async () => {
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .gte('churn_risk', 50)
                .order('churn_risk', { ascending: false })
                .limit(5);
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
        },
        create: async (campaign: Partial<DbCampaign>) => {
            const { data, error } = await supabase
                .from('campaigns')
                .insert([campaign])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: Partial<DbCampaign>) => {
            const { data, error } = await supabase
                .from('campaigns')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase
                .from('campaigns')
                .delete()
                .eq('id', id);
            if (error) throw error;
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
    },
    workouts: {
        create: async (workout: Partial<DbAiWorkout>) => {
            const { data, error } = await supabase
                .from('ai_workouts')
                .insert([workout])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        getPending: async () => {
            const { data, error } = await supabase
                .from('ai_workouts')
                .select(`
                    *,
                    members (
                        id,
                        name,
                        email,
                        segment
                    )
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        getByMember: async (memberId: string) => {
            const { data, error } = await supabase
                .from('ai_workouts')
                .select('*')
                .eq('member_id', memberId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle(); // Returns null if no workout found instead of error

            // If error is PGRST116 (0 rows), it's handled by maybeSingle
            if (error) throw error;
            return data;
        },
        update: async (id: string, updates: Partial<DbAiWorkout>) => {
            const { data, error } = await supabase
                .from('ai_workouts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },
    dietChats: {
        create: async (chat: Partial<DbDietChat>) => {
            const { data, error } = await supabase
                .from('diet_chats')
                .insert([chat])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        getHistory: async (memberId: string) => {
            const { data, error } = await supabase
                .from('diet_chats')
                .select('*')
                .eq('member_id', memberId)
                .order('created_at', { ascending: true }) // Oldest first for chat history
                .limit(50);
            if (error) throw error;
            return data;
        },
        clearHistory: async (memberId: string) => {
            const { error } = await supabase
                .from('diet_chats')
                .delete()
                .eq('member_id', memberId);
            if (error) throw error;
        }
    },
    community: {
        getFeed: async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    members (
                       name,
                       segment
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            return data;
        },
        createPost: async (post: Partial<DbPost>) => {
            const { data, error } = await supabase
                .from('posts')
                .insert([post])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        getLeaderboard: async () => {
            const { data, error } = await supabase
                .from('members')
                .select('id, name, points, level, streak_current')
                .order('points', { ascending: false })
                .limit(10);
            if (error) throw error;
            return data;
        },
        getChallenges: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .order('end_date', { ascending: true });
            if (error) throw error;
            return data;
        },
        joinChallenge: async (memberId: string, challengeId: string) => {
            const { error } = await supabase
                .from('challenge_participants')
                .insert([{ member_id: memberId, challenge_id: challengeId }]);
            if (error) throw error;

            // Increment count
            await supabase.rpc('increment_challenge_participants', { row_id: challengeId });
        },
        getMemberChallenges: async (memberId: string) => {
            const { data, error } = await supabase
                .from('challenge_participants')
                .select('challenge_id, progress, completed')
                .eq('member_id', memberId);
            if (error) throw error;
            return data;
        }
    },
    achievements: {
        getUnlocked: async (memberId: string) => {
            const { data, error } = await supabase
                .from('member_achievements')
                .select('*')
                .eq('member_id', memberId);
            if (error) throw error;
            return data;
        },
        unlock: async (memberId: string, badgeId: string) => {
            // Check if already unlocked
            const { data: existing } = await supabase
                .from('member_achievements')
                .select('*')
                .match({ member_id: memberId, badge_id: badgeId })
                .single();

            if (existing) return null; // Already unlocked

            const { data, error } = await supabase
                .from('member_achievements')
                .insert([{ member_id: memberId, badge_id: badgeId }])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },
    duels: {
        create: async (duel: Partial<DbDuel>) => {
            const { data, error } = await supabase
                .from('challenges')
                .insert([{ ...duel, is_duel: true, participants_count: 2 }]) // Force is_duel
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        getMyDuels: async (memberId: string) => {
            const { data, error } = await supabase
                .from('challenges')
                .select(`
                    *,
                    creator:creator_id(name),
                    opponent:opponent_id(name)
                `)
                .eq('is_duel', true)
                .or(`creator_id.eq.${memberId},opponent_id.eq.${memberId}`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    },
    dietPlans: {
        create: async (plan: Partial<DbDietPlan>) => {
            // Archive old plans first
            if (plan.member_id) {
                await supabase
                    .from('diet_plans')
                    .update({ status: 'archived' })
                    .eq('member_id', plan.member_id)
                    .eq('status', 'active');
            }

            const { data, error } = await supabase
                .from('diet_plans')
                .insert([plan])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        getActive: async (memberId: string) => {
            const { data, error } = await supabase
                .from('diet_plans')
                .select('*')
                .eq('member_id', memberId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data;
        }
    }
};
