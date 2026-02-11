import { useState } from 'react';
import { Users } from '@phosphor-icons/react';
import { PageHeader, type FilterConfig } from '@shared/components/PageHeader';
import { CollaboratorsTable } from '../components/CollaboratorsTable';
import { CollaboratorForm, type CollaboratorFormData } from '../components/CollaboratorForm';
import { useCreateCollaborator } from '../hooks/useCollaborators';
import { Modal } from '@shared/components/ui';
import { useToast } from '@shared/hooks/useToast';

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
          onAdd={() => setIsModalOpen(true)}
          addLabel="Novo Colaborador"
        />
      </div>

      <div className="flex-1 min-h-0 mt-2">
        <CollaboratorsTable
          searchTerm={searchTerm}
          activeFilter={activeFilter}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Colaborador"
      >
        <CollaboratorForm
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
