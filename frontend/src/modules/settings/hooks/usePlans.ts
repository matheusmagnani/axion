import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planService } from '../services/planService';
import type { CreatePlanDTO, UpdatePlanDTO } from '../services/planService';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: planService.list,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanDTO) => planService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanDTO }) =>
      planService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => planService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}
