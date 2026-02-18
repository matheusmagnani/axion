import { useQuery } from '@tanstack/react-query';
import { authService } from '@modules/auth/services/authService';
import { permissionService, type Permission } from '@modules/settings/services/permissionService';

const PATH_TO_MODULE: Record<string, string> = {
  '/associates': 'associates',
  '/billings': 'billings',
  '/connections': 'connections',
  '/collaborators': 'collaborators',
  '/settings': 'settings',
};

export { PATH_TO_MODULE };

export function useMyPermissions() {
  const user = authService.getUser();
  const roleId = user?.roleId as number | null;

  const { data: permissions = [], isLoading } = useQuery<Permission[]>({
    queryKey: ['my-permissions', roleId],
    queryFn: () => permissionService.getByRoleId(roleId!),
    enabled: roleId !== null && roleId !== undefined,
  });

  return { permissions, isLoading, isAdmin: roleId === null || roleId === undefined };
}

export function useCanAccess(module: string, action: string): boolean {
  const { permissions, isAdmin } = useMyPermissions();

  if (isAdmin) return true;

  const perm = permissions.find(p => p.module === module && p.action === action);
  return perm?.allowed ?? false;
}
