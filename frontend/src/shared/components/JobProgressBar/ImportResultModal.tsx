import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Modal } from '@shared/components/ui';
import { CheckCircle, XCircle, CaretRight, CircleNotch, ArrowLeft } from '@phosphor-icons/react';

interface ImportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueName: string;
  jobId: string;
  successCount: number;
  errorCount: number;
}

interface JobResultData {
  successes: Array<{ row: number; name: string; cpf: string }> | null;
  errors: Array<{ row: number; name?: string; cpf?: string; message: string }> | null;
}

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

type View = 'cards' | 'success' | 'error';

export function ImportResultModal({
  isOpen,
  onClose,
  queueName,
  jobId,
  successCount,
  errorCount,
}: ImportResultModalProps) {
  const [view, setView] = useState<View>('cards');

  const { data, isLoading } = useQuery<JobResultData>({
    queryKey: ['job-result-details', queueName, jobId],
    queryFn: async () => {
      const { data } = await api.get(`/api/jobs/${queueName}/${jobId}`);
      return { successes: data.successes, errors: data.errors };
    },
    enabled: isOpen && !!jobId,
    staleTime: 0,
  });

  const successes = data?.successes ?? null;
  const errors = data?.errors ?? null;

  const handleClose = () => {
    setView('cards');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={view === 'cards' ? 'Resultado da Importação' : undefined}
      className="w-[500px]"
    >
      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <CircleNotch className="w-6 h-6 text-app-secondary animate-spin" />
        </div>
      )}

      {/* Cards view */}
      {!isLoading && view === 'cards' && (
        <div className="space-y-3">
          {/* Success card */}
          <button
            onClick={() => setView('success')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-green-500/30 hover:bg-green-500/5 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-sm text-app-secondary flex-1 text-left">
              {successCount} {successCount === 1 ? 'associado importado' : 'associados importados'}
            </span>
            <CaretRight className="w-4 h-4 text-app-secondary/50" />
          </button>

          {/* Error card */}
          <button
            onClick={() => setView('error')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-red-500/30 hover:bg-red-500/5 transition-colors"
          >
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-app-secondary flex-1 text-left">
              {errorCount} {errorCount === 1 ? 'erro' : 'erros'}
            </span>
            <CaretRight className="w-4 h-4 text-app-secondary/50" />
          </button>
        </div>
      )}

      {/* Success list view */}
      {!isLoading && view === 'success' && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView('cards')}
              className="text-app-secondary/70 hover:text-app-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-medium text-app-secondary">Associados Importados</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-medium text-green-400">Sucesso {successCount}</span>
            </div>
          </div>

          {successes && successes.length > 0 ? (
            <div className="max-h-[350px] overflow-auto">
              {successes.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 border-b border-app-secondary/5 last:border-b-0"
                >
                  <span className="text-xs text-app-secondary/40 w-6 text-right">{i + 1}</span>
                  <span className="text-sm text-app-secondary flex-1 truncate">{item.name}</span>
                  <span className="text-xs text-app-secondary/60 font-mono">{formatCpf(item.cpf)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-app-secondary/50 text-center py-6">
              Nenhum associado importado.
            </p>
          )}
        </div>
      )}

      {/* Error list view */}
      {!isLoading && view === 'error' && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setView('cards')}
              className="text-app-secondary/70 hover:text-app-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-medium text-app-secondary">Erros da Importação</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-medium text-red-400">Erro{errorCount !== 1 ? 's' : ''} {errorCount}</span>
            </div>
          </div>

          {errors && errors.length > 0 ? (
            <div className="max-h-[350px] overflow-auto">
              {errors.map((item, i) => (
                <div
                  key={i}
                  className="py-2.5 border-b border-app-secondary/5 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-app-secondary/40 w-6 text-right">{i + 1}</span>
                    <span className="text-sm text-app-secondary flex-1 truncate">{item.name || '-'}</span>
                    <span className="text-xs text-app-secondary/60 font-mono">
                      {item.cpf ? formatCpf(item.cpf) : '-'}
                    </span>
                  </div>
                  <p className="text-xs text-red-400/80 ml-9 mt-0.5">{item.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-app-secondary/50 text-center py-6">
              Nenhum erro encontrado.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
