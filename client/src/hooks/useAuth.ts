import { useAuthStore } from '../stores/authStore';
import type { CurrentUser } from '../api/auth';

interface UseAuthReturn {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const store = useAuthStore();

  const login = async (username: string, password: string) => {
    await store.login(username, password);
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    login,
    logout: store.logout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,
  };
};

export default useAuth;
