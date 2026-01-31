import { UsersThree } from '@phosphor-icons/react';
import { PageHeader, type FilterConfig } from '@shared/components/PageHeader';

interface AssociatesHeaderProps {
  onSearch?: (value: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  onAdd?: () => void;
}

const filters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'PENDING', label: 'Pending' },
    ],
  },
];

export function AssociatesHeader({ onSearch, onFilterChange, onAdd }: AssociatesHeaderProps) {
  return (
    <PageHeader 
      title="Associates" 
      icon={UsersThree}
      onSearch={onSearch}
      filters={filters}
      onFilterChange={onFilterChange}
      onAdd={onAdd}
      addLabel="New Associate"
    />
  );
}
