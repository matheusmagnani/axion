import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PencilSimple, Trash, ToggleLeft, ToggleRight } from '@phosphor-icons/react';
import { useAssociate, useUpdateAssociate, useDeleteAssociate } from '../hooks/useAssociates';
import { AssociateForm, type AssociateFormData } from '../components/AssociateForm';
import { StatusBadge } from '@shared/components/Badge/StatusBadge';
import { MagicBentoCard } from '@shared/components/ui/MagicBentoCard';
import { Modal, CopyText } from '@shared/components/ui';
import { useCanAccess } from '@shared/hooks/useMyPermissions';
import { useToast } from '@shared/hooks/useToast';
import { formatCPF, formatPhone } from '@shared/utils/formatters';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
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
  const [activeTab, setActiveTab] = useState<'contracts' | 'billings'>('contracts');

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
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate('/associates')}
          className="p-2 hover:bg-app-secondary/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-app-secondary" weight="bold" />
        </button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => {
                const newStatus = associate.status === 1 ? 0 : 1;
                updateAssociate.mutate({ id: associate.id, data: { status: newStatus } }, {
                  onSuccess: () => {
                    addToast(newStatus === 1 ? 'Associado ativado!' : 'Associado inativado!', 'success');
                  },
                  onError: (error) => {
                    addToast(error.message, 'danger');
                  },
                });
              }}
              className="p-2 hover:bg-app-secondary/10 rounded-lg transition-colors relative group"
              title={associate.status === 1 ? 'Inativar' : 'Ativar'}
            >
              {associate.status === 1 ? (
                <ToggleRight className="w-8 h-8 text-green-400" weight="fill" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-app-secondary/50" weight="light" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-app-secondary bg-app-primary border border-app-secondary/20 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {associate.status === 1 ? 'Inativar' : 'Ativar'}
              </span>
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

      {/* Header */}
      <MagicBentoCard className="bg-app-primary rounded-lg border border-app-secondary/20 p-10 mb-2">
        <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-app-secondary text-4xl font-semibold">{associate.name}</h1>
            <StatusBadge status={associate.status} />
          </div>

          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-app-secondary hover:bg-app-secondary/10 rounded-lg transition-colors border border-app-secondary/20"
            >
              <PencilSimple className="w-4 h-4" weight="regular" />
              Editar
            </button>
          )}
        </div>

        <div className="border-t border-app-secondary/15 mt-8 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-app-secondary/50 text-xs block mb-1">CPF</span>
            <CopyText value={associate.cpf}>
              <span className="text-app-secondary text-sm">{formatCPF(associate.cpf)}</span>
            </CopyText>
          </div>
          <div>
            <span className="text-app-secondary/50 text-xs block mb-1">Email</span>
            <CopyText value={associate.email}>
              <span className="text-app-secondary text-sm">{associate.email}</span>
            </CopyText>
          </div>
          <div>
            <span className="text-app-secondary/50 text-xs block mb-1">Telefone</span>
            <CopyText value={associate.phone}>
              <span className="text-app-secondary text-sm">{formatPhone(associate.phone)}</span>
            </CopyText>
          </div>
          <div>
            <span className="text-app-secondary/50 text-xs block mb-1">Data de Cadastro</span>
            <span className="text-app-secondary text-sm">{formatDate(associate.createdAt)}</span>
          </div>
        </div>
        </div>
      </MagicBentoCard>

      {/* Tabs Section */}
      <div className="bg-app-primary rounded-lg border border-app-secondary/20 flex-1 flex flex-col min-h-0">
        <div className="flex items-center border-b border-app-secondary/15 px-10">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'contracts'
                ? 'text-app-secondary'
                : 'text-app-secondary/40 hover:text-app-secondary/70'
            }`}
          >
            Contratos
            {activeTab === 'contracts' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-app-secondary rounded-t" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('billings')}
            className={`px-4 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'billings'
                ? 'text-app-secondary'
                : 'text-app-secondary/40 hover:text-app-secondary/70'
            }`}
          >
            Cobranças
            {activeTab === 'billings' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-app-secondary rounded-t" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'contracts' && (
            <div className="text-app-secondary/50 text-sm text-center py-6">
              Contratos em breve
            </div>
          )}
          {activeTab === 'billings' && (
            <div className="text-app-secondary/50 text-sm text-center py-6">
              Cobranças em breve
            </div>
          )}
        </div>
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
            Tem certeza que deseja excluir <strong className="text-app-secondary">{associate.name}</strong>?
            <br />Contratos, cobranças e demais registros vinculados também serão excluídos.
            <br />Esta ação não pode ser desfeita.
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
