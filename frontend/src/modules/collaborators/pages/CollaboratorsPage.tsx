import { useState } from 'react';
import { Users } from '@phosphor-icons/react';
import { PageHeader, type FilterConfig } from '@shared/components/PageHeader';

const filters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'vacation', label: 'Vacation' },
    ],
  },
  {
    key: 'role',
    label: 'Role',
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'manager', label: 'Manager' },
      { value: 'attendant', label: 'Attendant' },
    ],
  },
];

export function CollaboratorsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (key: string, value: string) => {
    console.log('Filter changed:', key, value);
  };

  const handleAdd = () => {
    console.log('Add new collaborator');
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-[37px] px-3 md:px-6 lg:px-[45px] py-4 md:py-8 lg:py-[49px] w-full">
      <PageHeader 
        title="Collaborators" 
        icon={Users}
        onSearch={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAdd={handleAdd}
        addLabel="New Collaborator"
      />
      
      <div className="w-full text-center py-20">
        <p className="text-secondary/70 text-lg">Under development...</p>
        {searchTerm && <p className="text-secondary/50 text-sm mt-2">Searching: {searchTerm}</p>}
      </div>
    </div>
  );
}
