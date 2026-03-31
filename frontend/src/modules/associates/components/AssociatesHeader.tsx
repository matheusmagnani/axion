import { UsersThree } from '@phosphor-icons/react';
import { PageHeader, type FilterConfig } from '@shared/components/PageHeader';
import { JobProgressBar } from '@shared/components/JobProgressBar';
import { useJobProgressStore } from '@/shared/stores/useJobProgressStore';

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
      { value: '1', label: 'Ativo' },
      { value: '0', label: 'Inativo' },
      { value: '2', label: 'Pendente' },
    ],
  },
];

export function AssociatesHeader({ onSearch, onFilterChange, onAdd }: AssociatesHeaderProps) {
  const jobs = useJobProgressStore((s) => s.jobs);
  const hasActiveJob = Object.values(jobs).some(
    (j) => j.queueName === 'associate-import' && !j.dismissedAt,
  );

  return (
    <PageHeader
      title="Associados"
      icon={UsersThree}
      onSearch={onSearch}
      filters={filters}
      onFilterChange={onFilterChange}
      onAdd={onAdd}
      addLabel="Novo Associado"
    >
      {hasActiveJob && <JobProgressBar queueName="associate-import" />}
    </PageHeader>
  );
}
