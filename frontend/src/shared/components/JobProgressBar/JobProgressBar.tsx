import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useJobStatus } from '@/shared/hooks/useJobStatus';
import { useJobProgressStore } from '@/shared/stores/useJobProgressStore';
import { CheckCircle, XCircle, CircleNotch, X } from '@phosphor-icons/react';
import { ImportResultModal } from './ImportResultModal';

const QUEUE_TO_QUERY_KEY: Record<string, string> = {
  'associate-import': 'associates',
};

interface JobProgressBarProps {
  queueName: string;
}

export function JobProgressBar({ queueName }: JobProgressBarProps) {
  const queryClient = useQueryClient();
  const jobs = useJobProgressStore((s) => s.jobs);
  const updateJob = useJobProgressStore((s) => s.updateJob);
  const dismissJob = useJobProgressStore((s) => s.dismissJob);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Find active or recently completed job for this queue
  const trackedJob = Object.values(jobs).find(
    (j) => j.queueName === queueName && !j.dismissedAt,
  );

  const jobId = trackedJob?.jobId ?? '';
  const trackedStatus = trackedJob?.status;
  const shouldPoll =
    !!trackedJob &&
    (trackedStatus === 'PENDING' || trackedStatus === 'PROCESSING');

  const { data } = useJobStatus(queueName, jobId, shouldPoll);

  // Sync polling data back to store — depend only on `data`, use ref for jobId
  const jobIdRef = useRef(jobId);
  jobIdRef.current = jobId;

  const stableUpdateJob = useCallback(
    (status: string, totalRows: number, successCount: number, errorCount: number, errors: unknown, successes: unknown) => {
      updateJob(jobIdRef.current, {
        status: status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
        totalRows,
        successCount,
        errorCount,
        errors: errors as Array<{ row: number; name?: string; cpf?: string; message: string }> | null,
        successes: successes as Array<{ row: number; name: string; cpf: string }> | null,
      });
    },
    [updateJob],
  );

  const prevSuccessRef = useRef(0);

  useEffect(() => {
    if (!data || !jobIdRef.current) return;
    stableUpdateJob(
      data.status,
      data.totalRows,
      data.successCount,
      data.errorCount,
      data.errors,
      data.successes,
    );

    // Invalidate related query when new records are created
    if (data.successCount > prevSuccessRef.current) {
      prevSuccessRef.current = data.successCount;
      const queryKey = QUEUE_TO_QUERY_KEY[queueName];
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
    }
  }, [data, stableUpdateJob, queueName, queryClient]);

  const isFinished = trackedStatus === 'COMPLETED' || trackedStatus === 'FAILED';

  if (!trackedJob) return null;

  const { status, totalRows, successCount, errorCount, label } = trackedJob;
  const processed = successCount + errorCount;
  const percent = totalRows > 0 ? Math.round((processed / totalRows) * 100) : 0;

  const isCompleted = status === 'COMPLETED';
  const isFailed = status === 'FAILED';
  const isProcessing = status === 'PROCESSING' || status === 'PENDING';

  return (
    <>
      <div
        className={`w-full max-w-md ${isFinished ? 'cursor-pointer' : ''}`}
        onClick={isFinished ? () => setIsResultModalOpen(true) : undefined}
        title={isFinished ? 'Ver detalhes da importação' : undefined}
      >
        <div className="flex items-center gap-2 mb-1">
          {isProcessing && (
            <CircleNotch className="w-4 h-4 text-app-secondary animate-spin" />
          )}
          {isCompleted && <CheckCircle className="w-4 h-4 text-green-400" />}
          {isFailed && <XCircle className="w-4 h-4 text-red-400" />}

          <span className="text-xs text-app-secondary/80 truncate flex-1">
            {isProcessing && `${label}... ${processed}/${totalRows}`}
            {isCompleted &&
              `Concluído! ${successCount} importados${errorCount > 0 ? `, ${errorCount} erros` : ''}`}
            {isFailed && 'Falha na importação'}
          </span>

          {isFinished && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissJob(jobId);
              }}
              className="flex-shrink-0 p-0.5 rounded hover:bg-app-secondary/10 transition-colors"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5 text-app-secondary/50 hover:text-app-secondary" weight="bold" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-app-secondary/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFailed
                ? 'bg-red-400'
                : isCompleted
                  ? 'bg-green-400'
                  : 'bg-app-secondary'
            }`}
            style={{ width: `${isCompleted ? 100 : percent}%` }}
          />
        </div>
      </div>

      {isFinished && (
        <ImportResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          queueName={queueName}
          jobId={jobId}
          successCount={trackedJob.successCount}
          errorCount={trackedJob.errorCount}
        />
      )}
    </>
  );
}
