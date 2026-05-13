import { create } from 'zustand';
import { authAPI } from '../api/client';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('dreamspace_token') || null,
    loading: true,

    setAuth: (user, token) => {
        localStorage.setItem('dreamspace_token', token);
        set({ user, token, loading: false });
    },

    logout: () => {
        localStorage.removeItem('dreamspace_token');
        set({ user: null, token: null, loading: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('dreamspace_token');
        if (!token) { set({ loading: false }); return; }
        try {
            const data = await authAPI.me();
            set({ user: data.user, token, loading: false });
        } catch {
            localStorage.removeItem('dreamspace_token');
            set({ user: null, token: null, loading: false });
        }
    },
}));

export default useAuthStore;
