import { useState } from 'react';
import { AssociatesHeader } from '../components/AssociatesHeader';
import { AssociatesTable } from '../components/AssociatesTable';
import { AssociateForm, type AssociateFormData } from '../components/AssociateForm';
import { Modal } from '@shared/components/ui';

export function AssociatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setStatusFilter(value);
    }
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full px-3 md:px-6 lg:px-[45px] py-4 md:py-8 lg:py-[49px] w-full">
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
        title="New Associate"
      >
        <AssociateForm
          onSubmit={(data: AssociateFormData) => {
            console.log('New associate:', data);
            // TODO: Save associate via API
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
