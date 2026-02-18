import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { permissionService } from '../services/permissionService';
import type { UpdatePermissionItem } from '../services/permissionService';

export function usePermissions(roleId: number | null) {
  return useQuery({
    queryKey: ['permissions', roleId],
    queryFn: () => permissionService.getByRoleId(roleId!),
    enabled: !!roleId,
    placeholderData: keepPreviousData,
  });
}

export function useUpdatePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: UpdatePermissionItem[] }) =>
      permissionService.updateByRoleId(roleId, permissions),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permissions', variables.roleId] });
    },
  });
}
