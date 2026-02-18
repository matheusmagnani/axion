import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collaboratorsService, type Collaborator, type CreateCollaboratorDTO, type UpdateCollaboratorDTO, type ListCollaboratorsParams, type PaginatedResponse } from '../services/collaboratorsService';

export function useCollaborators(params?: ListCollaboratorsParams) {
  return useQuery<PaginatedResponse<Collaborator>>({
    queryKey: ['collaborators', params],
    queryFn: () => collaboratorsService.getAll(params),
  });
}

export function useCreateCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollaboratorDTO) => collaboratorsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
    },
  });
}

export function useUpdateCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCollaboratorDTO }) =>
      collaboratorsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
    },
  });
}

export function useChangeCollaboratorPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      collaboratorsService.changePassword(id, password),
  });
}

export function useToggleCollaboratorActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => collaboratorsService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
    },
  });
}

export function useDeleteCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => collaboratorsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
    },
  });
}
