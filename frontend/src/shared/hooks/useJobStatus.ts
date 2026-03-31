import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface JobStatusResponse {
  id: number;
  jobId: string;
  queueName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; name?: string; cpf?: string; message: string }> | null;
  successes: Array<{ row: number; name: string; cpf: string }> | null;
  createdAt: string;
  updatedAt: string;
}

export function useJobStatus(queueName: string, jobId: string, enabled = true) {
  return useQuery<JobStatusResponse>({
    queryKey: ['job-status', queueName, jobId],
    queryFn: async () => {
      const { data } = await api.get<JobStatusResponse>(
        `/api/jobs/${queueName}/${jobId}`,
      );
      return data;
    },
    enabled: enabled && !!jobId && !!queueName,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'COMPLETED' || status === 'FAILED') return false;
      return 1000;
    },
  });
}
