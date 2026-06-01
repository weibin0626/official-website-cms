import { create } from 'zustand';
import * as authApi from '../api/auth';
import type { CurrentUser, LoginResult } from '../api/auth';
import { useSiteStore } from './siteStore';

interface AuthState {
  token: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  permissions: string[];
  loading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasPermission: (resource: string, action: string) => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  permissions: [],
  loading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const result = await authApi.login({ username, password });
      localStorage.setItem('token', result.token);
      set({
        token: result.token,
        isAuthenticated: true,
        loading: false,
      });

      // After login, fetch full user info
      const user = await authApi.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        permissions: user.permissions,
      });

      // Sync sites to siteStore
      // Priority: localStorage (user's last switch) > user.currentSiteId (from JWT) > first site
      const siteStore = useSiteStore.getState();
      if (user.sites && user.sites.length > 0) {
        const sites = user.sites as any[];
        const storedSiteId = localStorage.getItem('currentSiteId');
        const currentSiteId = (storedSiteId && sites.find((s: any) => s.id === storedSiteId))
          ? storedSiteId
          : (user.currentSiteId || sites[0]?.id || null);
        const currentSite = sites.find((s: any) => s.id === currentSiteId) || sites[0] || null;
        useSiteStore.setState({
          sites,
          currentSite,
          currentSiteId,
        });
        localStorage.setItem('currentSiteId', currentSiteId);
      }

      return result;
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || '登录失败',
        isAuthenticated: false,
        token: null,
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      permissions: [],
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, token: null, user: null, permissions: [] });
      return false;
    }

    try {
      const user = await authApi.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        token,
        isAuthenticated: true,
        permissions: user.permissions,
      });

      // Sync sites to siteStore
      // Priority: localStorage (user's last switch) > user.currentSiteId (from JWT) > first site
      if (user.sites && user.sites.length > 0) {
        const sites = user.sites as any[];
        const storedSiteId = localStorage.getItem('currentSiteId');
        const currentSiteId = (storedSiteId && sites.find((s: any) => s.id === storedSiteId))
          ? storedSiteId
          : (user.currentSiteId || sites[0]?.id || null);
        const currentSite = sites.find((s: any) => s.id === currentSiteId) || sites[0] || null;
        useSiteStore.setState({
          sites,
          currentSite,
          currentSiteId,
        });
        localStorage.setItem('currentSiteId', currentSiteId);
      }

      return true;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ isAuthenticated: false, token: null, user: null, permissions: [] });
      return false;
    }
  },

  hasPermission: (resource: string, action: string) => {
    const { user, permissions } = get();

    // super_admin has all permissions
    if (user?.currentRoleCode === 'SUPER_ADMIN') {
      return true;
    }

    const permKey = `${resource}:${action}`;
    return permissions.includes(permKey) || permissions.includes(`${resource}:*`) || permissions.includes('*:*');
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
