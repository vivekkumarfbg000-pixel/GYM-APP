import { create } from 'zustand';
import { Member, Campaign, AttendanceRecord, Class, Lead, Product, Trainer } from './supabase';

// Member store
interface MemberStore {
    members: Member[];
    loading: boolean;
    error: string | null;
    setMembers: (members: Member[]) => void;
    addMember: (member: Member) => void;
    updateMember: (id: string, updates: Partial<Member>) => void;
    deleteMember: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useMemberStore = create<MemberStore>((set) => ({
    members: [],
    loading: false,
    error: null,
    setMembers: (members) => set({ members }),
    addMember: (member) => set((state) => ({ members: [member, ...state.members] })),
    updateMember: (id, updates) =>
        set((state) => ({
            members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m))
        })),
    deleteMember: (id) =>
        set((state) => ({
            members: state.members.filter((m) => m.id !== id)
        })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error })
}));

// Campaign store
interface CampaignStore {
    campaigns: Campaign[];
    loading: boolean;
    error: string | null;
    setCampaigns: (campaigns: Campaign[]) => void;
    addCampaign: (campaign: Campaign) => void;
    updateCampaign: (id: string, updates: Partial<Campaign>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
    campaigns: [],
    loading: false,
    error: null,
    setCampaigns: (campaigns) => set({ campaigns }),
    addCampaign: (campaign) => set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
    updateCampaign: (id, updates) =>
        set((state) => ({
            campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c))
        })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error })
}));

// Attendance store
interface AttendanceStore {
    records: AttendanceRecord[];
    loading: boolean;
    error: string | null;
    setRecords: (records: AttendanceRecord[]) => void;
    addRecord: (record: AttendanceRecord) => void;
    updateRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
    records: [],
    loading: false,
    error: null,
    setRecords: (records) => set({ records }),
    addRecord: (record) => set((state) => ({ records: [record, ...state.records] })),
    updateRecord: (id, updates) =>
        set((state) => ({
            records: state.records.map((r) => (r.id === id ? { ...r, ...updates } : r))
        })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error })
}));

// UI/UX store for app-wide state
interface UIStore {
    sidebarOpen: boolean;
    toast: {
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    } | null;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: true,
    toast: null,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    showToast: (message, type) =>
        set({
            toast: { show: true, message, type }
        }),
    hideToast: () => set({ toast: null })
}));

// Auth store
interface AuthStore {
    user: {
        id: string;
        email: string;
        name: string;
        gymName: string;
    } | null;
    loading: boolean;
    setUser: (user: AuthStore['user']) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user, loading: false }),
    setLoading: (loading) => set({ loading }),
    logout: () => set({ user: null })
}));
