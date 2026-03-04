import { useState } from 'react';
import { CurrencyCircleDollar } from '@phosphor-icons/react';
import { PageHeader, type FilterConfig } from '@shared/components/PageHeader';
import { useCanAccess } from '@shared/hooks/useMyPermissions';
import { useToast } from '@shared/hooks/useToast';
import { useCreateBilling, useUpdateBilling } from '../hooks/useBillings';
import { BillingsList } from '../components/BillingsList';
import { CreateBillingModal } from '../components/CreateBillingModal';
import { Modal, Input } from '@shared/components/ui';
import type { Billing, CreateBillingDTO } from '../services/billingService';

const filters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'PENDING', label: 'Pendente' },
      { value: 'PAID', label: 'Pago' },
      { value: 'OVERDUE', label: 'Vencido' },
      { value: 'CANCELLED', label: 'Cancelado' },
    ],
  },
  {
    key: 'type',
    label: 'Tipo',
    options: [
      { value: 'subscription', label: 'Assinatura' },
      { value: 'single', label: 'Cobrança Avulsa' },
    ],
  },
];

export function BillingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBilling, setEditingBilling] = useState<Billing | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const canCreate = useCanAccess('billings', 'create');
  const canEdit = useCanAccess('billings', 'edit');
  const canDelete = useCanAccess('billings', 'delete');
  const { addToast } = useToast();

  const createBilling = useCreateBilling();
  const updateBilling = useUpdateBilling();

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') setFilterStatus(value);
    if (key === 'type') setFilterType(value);
  };

  const handleCreate = async (billingData: CreateBillingDTO) => {
    try {
      await createBilling.mutateAsync(billingData);
      addToast('Cobrança criada com sucesso!', 'success');
      setIsCreateModalOpen(false);
    } catch {
      addToast('Erro ao criar cobrança', 'danger');
    }
  };

  const handleEdit = (billing: Billing) => {
    setEditingBilling(billing);
    setEditDescription(billing.description);
    setEditDueDate(billing.dueDate.split('T')[0]);
    setEditStatus(billing.status);
  };

  const handleSaveEdit = async () => {
    if (!editingBilling) return;
    try {
      await updateBilling.mutateAsync({
        id: editingBilling.id,
        data: {
          description: editDescription,
          dueDate: editDueDate,
          status: editStatus,
        },
      });
      addToast('Cobrança atualizada com sucesso!', 'success');
      setEditingBilling(null);
    } catch {
      addToast('Erro ao atualizar cobrança', 'danger');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 px-2 md:px-4 lg:px-[25px] py-2 md:py-4 lg:py-[25px] w-full">
      <PageHeader
        title="Cobranças"
        icon={CurrencyCircleDollar}
        onSearch={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAdd={canCreate ? () => setIsCreateModalOpen(true) : undefined}
        addLabel="Nova Cobrança"
      />

      <BillingsList
        searchTerm={searchTerm}
        statusFilter={filterStatus}
        typeFilter={filterType}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEdit}
      />

      <CreateBillingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createBilling.isPending}
      />

      <Modal
        isOpen={!!editingBilling}
        onClose={() => setEditingBilling(null)}
        title="Editar Cobrança"
        className="w-[480px]"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Descrição"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />

          <Input
            label="Data de Vencimento"
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-app-bg/50 border border-app-secondary/20 text-app-secondary text-sm focus:outline-none focus:border-app-secondary/40 appearance-none"
            >
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="OVERDUE">Vencido</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setEditingBilling(null)}
              className="px-4 py-2 rounded-xl text-app-secondary hover:bg-app-secondary/10 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={updateBilling.isPending}
              className="px-4 py-2 rounded-xl bg-app-secondary/10 text-app-secondary hover:bg-app-secondary/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {updateBilling.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
