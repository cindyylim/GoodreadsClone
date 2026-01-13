import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/utils/auth';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    login: (user) => set({ user }),
    logout: () => set({ user: null }),
    setUser: (user) => set({ user }),
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/users/profile');
            set({ user: response.data });
        } catch {
            set({ user: null });
        } finally {
            set({ isLoading: false });
        }
    },
}));
