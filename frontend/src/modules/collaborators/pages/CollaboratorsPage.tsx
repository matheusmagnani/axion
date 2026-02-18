import { useState } from 'react';
import { Users } from '@phosphor-icons/react';
import { PageHeader, type FilterConfig } from '@shared/components/PageHeader';
import { CollaboratorsTable } from '../components/CollaboratorsTable';
import { CollaboratorForm, type CollaboratorFormData } from '../components/CollaboratorForm';
import { useCreateCollaborator } from '../hooks/useCollaborators';
import { Modal } from '@shared/components/ui';
import { useToast } from '@shared/hooks/useToast';
import { useRoles } from '@modules/settings/hooks/useRoles';
import { useCanAccess } from '@shared/hooks/useMyPermissions';

const filters: FilterConfig[] = [
  {
    key: 'active',
    label: 'Status',
    options: [
      { value: 'true', label: 'Ativo' },
      { value: 'false', label: 'Inativo' },
    ],
  },
];

export function CollaboratorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createCollaborator = useCreateCollaborator();
  const { addToast } = useToast();
  const { data: rolesData } = useRoles();
  const canCreate = useCanAccess('collaborators', 'create');
  const canEdit = useCanAccess('collaborators', 'edit');
  const canDelete = useCanAccess('collaborators', 'delete');

  const activeRoles = (rolesData?.data ?? [])
    .filter(r => r.status === 1)
    .map(r => ({ id: r.id, name: r.name }));

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'active') {
      setActiveFilter(value);
    }
  };

  return (
    <div className="flex flex-col h-full px-2 md:px-4 lg:px-[25px] py-2 md:py-4 lg:py-[25px] w-full">
      <div className="flex-shrink-0">
        <PageHeader
          title="Colaboradores"
          icon={Users}
          onSearch={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAdd={canCreate ? () => setIsModalOpen(true) : undefined}
          addLabel="Novo Colaborador"
        />
      </div>

      <div className="flex-1 min-h-0 mt-2">
        <CollaboratorsTable
          searchTerm={searchTerm}
          activeFilter={activeFilter}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Colaborador"
      >
        <CollaboratorForm
          roles={activeRoles}
          onSubmit={(data: CollaboratorFormData) => {
            createCollaborator.mutate(data, {
              onSuccess: () => {
                setIsModalOpen(false);
                addToast('Colaborador criado com sucesso!', 'success');
              },
              onError: (error) => {
                addToast(error.message, 'danger');
              },
            });
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
