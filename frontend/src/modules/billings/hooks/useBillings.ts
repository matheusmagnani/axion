import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billingService';
import type { ListBillingsParams, CreateBillingDTO, UpdateBillingDTO } from '../services/billingService';

export function useBillings(params?: ListBillingsParams) {
  return useQuery({
    queryKey: ['billings', params],
    queryFn: () => billingService.list(params),
  });
}

export function useCreateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBillingDTO) => billingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings'] });
    },
  });
}

export function useUpdateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBillingDTO }) =>
      billingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings'] });
    },
  });
}

export function useDeleteBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => billingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billings'] });
    },
  });
}

export function useSearchAssociates(search: string) {
  return useQuery({
    queryKey: ['billings', 'search-associates', search],
    queryFn: () => billingService.searchAssociates(search),
    enabled: search.length >= 2,
  });
}
