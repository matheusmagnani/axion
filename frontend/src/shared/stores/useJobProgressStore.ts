import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrackedJob {
  jobId: string;
  queueName: string;
  label: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; name?: string; cpf?: string; message: string }> | null;
  successes: Array<{ row: number; name: string; cpf: string }> | null;
  dismissedAt?: number;
}

interface JobProgressState {
  jobs: Record<string, TrackedJob>;
  addJob: (job: TrackedJob) => void;
  updateJob: (jobId: string, data: Partial<TrackedJob>) => void;
  dismissJob: (jobId: string) => void;
  removeJob: (jobId: string) => void;
  getActiveJob: (queueName: string) => TrackedJob | undefined;
}

export const useJobProgressStore = create<JobProgressState>()(
  persist(
    (set, get) => ({
      jobs: {},

      addJob: (job) =>
        set((state) => ({
          jobs: { ...state.jobs, [job.jobId]: job },
        })),

      updateJob: (jobId, data) =>
        set((state) => {
          const existing = state.jobs[jobId];
          if (!existing) return state;
          return {
            jobs: { ...state.jobs, [jobId]: { ...existing, ...data } },
          };
        }),

      dismissJob: (jobId) =>
        set((state) => {
          const existing = state.jobs[jobId];
          if (!existing) return state;
          return {
            jobs: {
              ...state.jobs,
              [jobId]: { ...existing, dismissedAt: Date.now() },
            },
          };
        }),

      removeJob: (jobId) =>
        set((state) => {
          const { [jobId]: _, ...rest } = state.jobs;
          return { jobs: rest };
        }),

      getActiveJob: (queueName) => {
        const jobs = get().jobs;
        return Object.values(jobs).find(
          (j) =>
            j.queueName === queueName &&
            !j.dismissedAt &&
            (j.status === 'PENDING' || j.status === 'PROCESSING'),
        );
      },
    }),
    {
      name: 'axion-job-progress',
    },
  ),
);
