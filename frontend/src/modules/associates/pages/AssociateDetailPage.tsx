import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PencilSimple, Trash, FileText, CurrencyDollar } from '@phosphor-icons/react';
import { useAssociate, useUpdateAssociate, useDeleteAssociate } from '../hooks/useAssociates';
import { AssociateForm, type AssociateFormData } from '../components/AssociateForm';
import type { Contract, Billing } from '../services/associatesService';
import { StatusBadge } from '@shared/components/Badge/StatusBadge';
import { Modal } from '@shared/components/ui';
import { useCanAccess } from '@shared/hooks/useMyPermissions';
import { useToast } from '@shared/hooks/useToast';
import { formatCPF, formatPhone } from '@shared/utils/formatters';

const contractStatusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Ativo', className: 'bg-green-500/20 text-green-400 border-green-500/50' },
  ENDED: { label: 'Encerrado', className: 'bg-app-secondary/20 text-app-secondary/70 border-app-secondary/30' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-500/20 text-red-400 border-red-500/50' },
  PENDING: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
};

const billingStatusLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
  PAID: { label: 'Pago', className: 'bg-green-500/20 text-green-400 border-green-500/50' },
  OVERDUE: { label: 'Vencido', className: 'bg-red-500/20 text-red-400 border-red-500/50' },
  CANCELLED: { label: 'Cancelado', className: 'bg-app-secondary/20 text-app-secondary/70 border-app-secondary/30' },
};

function EnumBadge({ config }: { config: { label: string; className: string } }) {
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  );
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function ContractCard({ contract }: { contract: Contract }) {
  const config = contractStatusLabels[contract.status] ?? contractStatusLabels.PENDING;
  return (
    <div className="bg-app-primary/50 border border-app-secondary/20 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-app-secondary font-medium text-sm">#{contract.number}</span>
        <EnumBadge config={config} />
      </div>
      {contract.description && (
        <p className="text-app-secondary/70 text-sm">{contract.description}</p>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-app-secondary/60">Valor: <span className="text-app-secondary">{formatCurrency(contract.value)}</span></span>
        <span className="text-app-secondary/60">
          {formatDate(contract.startDate)}
          {contract.endDate ? ` - ${formatDate(contract.endDate)}` : ' - Em aberto'}
        </span>
      </div>
    </div>
  );
}

function BillingCard({ billing }: { billing: Billing }) {
  const config = billingStatusLabels[billing.status] ?? billingStatusLabels.PENDING;
  return (
    <div className="bg-app-primary/50 border border-app-secondary/20 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-app-secondary font-medium text-sm">{billing.description}</span>
        <EnumBadge config={config} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-app-secondary/60">Valor: <span className="text-app-secondary">{formatCurrency(billing.value)}</span></span>
        <span className="text-app-secondary/60">Vencimento: {formatDate(billing.dueDate)}</span>
      </div>
      {billing.paymentDate && (
        <span className="text-green-400/80 text-xs">Pago em {formatDate(billing.paymentDate)}</span>
      )}
    </div>
  );
}

export function AssociateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: associate, isLoading } = useAssociate(Number(id));
  const updateAssociate = useUpdateAssociate();
  const deleteAssociate = useDeleteAssociate();
  const { addToast } = useToast();

  const canEdit = useCanAccess('associates', 'edit');
  const canDelete = useCanAccess('associates', 'delete');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-app-secondary">Carregando...</p>
      </div>
    );
  }

  if (!associate) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-app-secondary">Associado não encontrado</p>
        <button
          onClick={() => navigate('/associates')}
          className="text-app-accent hover:underline text-sm"
        >
          Voltar para listagem
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteAssociate.mutate(associate.id, {
      onSuccess: () => {
        addToast('Associado excluído com sucesso!', 'success');
        navigate('/associates');
      },
      onError: (error) => {
        addToast(error.message, 'danger');
        setIsDeleteConfirm(false);
      },
    });
  };

  return (
    <div className="flex flex-col h-full px-2 md:px-4 lg:px-[25px] py-2 md:py-4 lg:py-[25px] w-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/associates')}
            className="p-2 hover:bg-app-secondary/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-app-secondary" weight="bold" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-app-secondary text-xl font-semibold">{associate.name}</h1>
            <StatusBadge status={associate.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-app-secondary hover:bg-app-secondary/10 rounded-lg transition-colors border border-app-secondary/20"
            >
              <PencilSimple className="w-4 h-4" weight="regular" />
              Editar
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setIsDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
            >
              <Trash className="w-4 h-4" weight="regular" />
              Excluir
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-app-primary rounded-lg border border-app-secondary/20 p-6 mb-6">
        <h2 className="text-app-secondary text-lg font-medium mb-4">Informações Pessoais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-app-secondary/50 text-xs block mb-1">CPF</span>
            <span className="text-app-secondary text-sm">{formatCPF(associate.cpf)}</span>
          </div>
          <div>
            <span className="text-app-secondary/50 text-xs block mb-1">Email</span>
            <span className="text-app-secondary text-sm">{associate.email}</span>
          </div>
          <div>
            <span className="text-app-secondary/50 text-xs block mb-1">Telefone</span>
            <span className="text-app-secondary text-sm">{formatPhone(associate.phone)}</span>
          </div>
          <div>
            <span className="text-app-secondary/50 text-xs block mb-1">Data de Cadastro</span>
            <span className="text-app-secondary text-sm">{formatDate(associate.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Contracts Section */}
      <div className="bg-app-primary rounded-lg border border-app-secondary/20 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-app-secondary" weight="regular" />
          <h2 className="text-app-secondary text-lg font-medium">Contratos</h2>
          <span className="text-app-secondary/50 text-sm">({associate.contracts.length})</span>
        </div>
        {associate.contracts.length === 0 ? (
          <p className="text-app-secondary/50 text-sm text-center py-6">Nenhum contrato encontrado</p>
        ) : (
          <div className="flex flex-col gap-3">
            {associate.contracts.map((contract) => (
              <ContractCard key={contract.id} contract={contract} />
            ))}
          </div>
        )}
      </div>

      {/* Billings Section */}
      <div className="bg-app-primary rounded-lg border border-app-secondary/20 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CurrencyDollar className="w-5 h-5 text-app-secondary" weight="regular" />
          <h2 className="text-app-secondary text-lg font-medium">Cobranças</h2>
          <span className="text-app-secondary/50 text-sm">({associate.billings.length})</span>
        </div>
        {associate.billings.length === 0 ? (
          <p className="text-app-secondary/50 text-sm text-center py-6">Nenhuma cobrança encontrada</p>
        ) : (
          <div className="flex flex-col gap-3">
            {associate.billings.map((billing) => (
              <BillingCard key={billing.id} billing={billing} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Associado"
      >
        <AssociateForm
          initialData={{
            name: associate.name,
            cpf: associate.cpf,
            email: associate.email,
            phone: associate.phone,
          }}
          onSubmit={(data: AssociateFormData) => {
            updateAssociate.mutate({ id: associate.id, data }, {
              onSuccess: () => {
                setIsEditModalOpen(false);
                addToast('Associado atualizado com sucesso!', 'success');
              },
              onError: (error) => {
                addToast(error.message, 'danger');
              },
            });
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirm}
        onClose={() => setIsDeleteConfirm(false)}
        title="Excluir Associado"
      >
        <div className="flex flex-col gap-4 min-w-[400px]">
          <p className="text-app-secondary/70 text-sm">
            Tem certeza que deseja excluir o associado <strong className="text-app-secondary">{associate.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteConfirm(false)}
              className="px-6 py-2.5 text-app-secondary/70 hover:text-app-secondary transition-colors rounded-[10px] hover:bg-app-secondary/10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2.5 bg-red-500/20 text-red-400 font-medium rounded-[10px] hover:bg-red-500/30 transition-colors border border-red-500/30"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
