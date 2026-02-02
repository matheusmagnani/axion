import { useState } from 'react';
import { AssociatesHeader } from '../components/AssociatesHeader';
import { AssociatesTable } from '../components/AssociatesTable';
import { AssociateForm, type AssociateFormData } from '../components/AssociateForm';
import { useCreateAssociate } from '../hooks/useAssociates';
import { Modal } from '@shared/components/ui';
import { useToast } from '@shared/hooks/useToast';

export function AssociatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createAssociate = useCreateAssociate();
  const { addToast } = useToast();

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setStatusFilter(value);
    }
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full px-2 md:px-4 lg:px-[25px] py-2 md:py-4 lg:py-[25px] w-full">
      {/* Fixed header */}
      <div className="flex-shrink-0">
        <AssociatesHeader
          onSearch={setSearchTerm}
          onFilterChange={handleFilterChange}
          onAdd={handleAdd}
        />
      </div>

      {/* Table with scrollable cards */}
      <div className="flex-1 min-h-0 mt-4 md:mt-[37px]">
        <AssociatesTable
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      </div>

      {/* New Associate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Associado"
      >
        <AssociateForm
          onSubmit={(data: AssociateFormData) => {
            createAssociate.mutate(data, {
              onSuccess: () => {
                setIsModalOpen(false);
                addToast('Associado criado com sucesso!', 'success');
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
