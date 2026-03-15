import { create } from 'zustand';
import { authAPI } from '../api/client';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('roomforge_token') || null,
    loading: true,

    setAuth: (user, token) => {
        localStorage.setItem('roomforge_token', token);
        set({ user, token, loading: false });
    },

    logout: () => {
        localStorage.removeItem('roomforge_token');
        set({ user: null, token: null, loading: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('roomforge_token');
        if (!token) { set({ loading: false }); return; }
        try {
            const data = await authAPI.me();
            set({ user: data.user, token, loading: false });
        } catch {
            localStorage.removeItem('roomforge_token');
            set({ user: null, token: null, loading: false });
        }
    },
}));

export default useAuthStore;
