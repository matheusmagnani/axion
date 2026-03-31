import { useState, useCallback } from 'react';
import { Modal } from '@shared/components/ui';
import { SpreadsheetReader, type ColumnConfig } from '@shared/components/SpreadsheetReader';
import { useImportAssociates } from '../hooks/useAssociates';
import { useJobProgressStore } from '@/shared/stores/useJobProgressStore';
import { useToast } from '@shared/hooks/useToast';
import { UploadSimple } from '@phosphor-icons/react';

interface ImportSpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const columns: ColumnConfig[] = [
  {
    key: 'name',
    label: 'Nome',
    aliases: ['nome completo', 'name', 'full name', 'nome do associado'],
    required: true,
  },
  {
    key: 'cpf',
    label: 'CPF',
    aliases: ['cpf', 'documento', 'doc'],
    required: true,
  },
  {
    key: 'email',
    label: 'Email',
    aliases: ['e-mail', 'email', 'correio'],
    required: true,
  },
  {
    key: 'phone',
    label: 'Telefone',
    aliases: ['telefone', 'phone', 'celular', 'tel', 'fone', 'whatsapp'],
    required: true,
  },
];

const templateData = [
  {
    name: 'João da Silva',
    cpf: '12345678901',
    email: 'joao@email.com',
    phone: '11999999999',
  },
];

export function ImportSpreadsheetModal({ isOpen, onClose }: ImportSpreadsheetModalProps) {
  const [hasData, setHasData] = useState(false);
  const [selectedData, setSelectedData] = useState<Record<string, string>[]>([]);
  const importMutation = useImportAssociates();
  const addJob = useJobProgressStore((s) => s.addJob);
  const { addToast } = useToast();

  const handleDataReady = useCallback((data: Record<string, string>[]) => {
    setHasData(data.length > 0);
    setSelectedData(data);
  }, []);

  const handleSelectionChange = useCallback((data: Record<string, string>[]) => {
    setSelectedData(data);
  }, []);

  const handleImport = async () => {
    if (selectedData.length === 0) return;

    try {
      const associates = selectedData.map((row) => ({
        name: row.name,
        cpf: row.cpf,
        email: row.email,
        phone: row.phone,
      }));

      const result = await importMutation.mutateAsync(associates);

      // Track in store
      addJob({
        jobId: result.jobId,
        queueName: 'associate-import',
        label: 'Importando associados',
        status: 'PENDING',
        totalRows: associates.length,
        successCount: 0,
        errorCount: 0,
        errors: null,
        successes: null,
      });

      addToast('Importação iniciada!', 'success');
      setHasData(false);
      setSelectedData([]);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar importação';
      addToast(message, 'danger');
    }
  };

  const handleClose = () => {
    setHasData(false);
    setSelectedData([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Associados"
      className="w-[600px]"
    >
      <SpreadsheetReader
        columns={columns}
        onDataReady={handleDataReady}
        onSelectionChange={handleSelectionChange}
        selectable
        templateData={templateData}
        templateFileName="modelo_associados.xlsx"
      />

      {hasData && (
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleImport}
            disabled={importMutation.isPending || selectedData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-app-secondary text-app-primary rounded-lg font-medium text-sm hover:bg-app-secondary/90 transition-colors disabled:opacity-50"
          >
            <UploadSimple className="w-4 h-4" />
            {importMutation.isPending
              ? 'Enviando...'
              : `Importar ${selectedData.length} associado${selectedData.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </Modal>
  );
}
