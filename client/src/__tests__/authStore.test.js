import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAuthStore from '../store/authStore';

describe('useAuthStore (Unit Test)', () => {
    beforeEach(() => {
        localStorage.clear();
        useAuthStore.setState({ user: null, token: null, loading: true });
    });

    it('sets authentication state correctly on setAuth', () => {
        const mockUser = { id: 1, name: 'Test User', email: 'test@test.com' };
        const mockToken = 'fake-jwt-token';

        useAuthStore.getState().setAuth(mockUser, mockToken);

        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe(mockToken);
        expect(state.loading).toBe(false);
        expect(localStorage.getItem('dreamspace_token')).toBe(mockToken);
    });

    it('clears authentication state on logout', () => {
        // Setup initial logged-in state
        localStorage.setItem('dreamspace_token', 'token-123');
        useAuthStore.setState({ user: { name: 'User' }, token: 'token-123', loading: false });

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.loading).toBe(false);
        expect(localStorage.getItem('dreamspace_token')).toBeNull();
    });
});
