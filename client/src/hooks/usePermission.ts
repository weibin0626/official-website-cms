import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

interface UsePermissionReturn {
  hasPermission: (resource: string, action: string) => boolean;
  isSuperAdmin: boolean;
  isSiteAdmin: boolean;
  isEditor: boolean;
  isReviewer: boolean;
  isViewer: boolean;
}

export const usePermission = (): UsePermissionReturn => {
  const store = useAuthStore();

  const hasPermission = useCallback(
    (resource: string, action: string) => {
      return store.hasPermission(resource, action);
    },
    [store],
  );

  const roleCode = store.user?.currentRoleCode;

  return {
    hasPermission,
    isSuperAdmin: roleCode === 'SUPER_ADMIN',
    isSiteAdmin: roleCode === 'SITE_ADMIN',
    isEditor: roleCode === 'EDITOR',
    isReviewer: roleCode === 'REVIEWER',
    isViewer: roleCode === 'VIEWER',
  };
};

export default usePermission;
