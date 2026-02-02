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
      { value: 'ACTIVE', label: 'Ativo' },
      { value: 'INACTIVE', label: 'Inativo' },
      { value: 'PENDING', label: 'Pendente' },
    ],
  },
];

export function AssociatesHeader({ onSearch, onFilterChange, onAdd }: AssociatesHeaderProps) {
  return (
    <PageHeader 
      title="Associados"
      icon={UsersThree}
      onSearch={onSearch}
      filters={filters}
      onFilterChange={onFilterChange}
      onAdd={onAdd}
      addLabel="Novo Associado"
    />
  );
}
