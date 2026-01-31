import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { associatesService, type Associate, type CreateAssociateDTO, type UpdateAssociateDTO, type ListAssociatesParams } from '../services/associatesService';

export function useAssociates(params?: ListAssociatesParams) {
  return useQuery<Associate[]>({
    queryKey: ['associates', params],
    queryFn: () => associatesService.getAll(params),
  });
}

export function useAssociate(id: number) {
  return useQuery<Associate | null>({
    queryKey: ['associates', id],
    queryFn: () => associatesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAssociate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssociateDTO) => associatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associates'] });
    },
  });
}

export function useUpdateAssociate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAssociateDTO }) => 
      associatesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associates'] });
    },
  });
}

export function useDeleteAssociate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => associatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associates'] });
    },
  });
}
