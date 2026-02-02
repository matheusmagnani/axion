import { useState } from 'react';
import { CurrencyCircleDollar } from '@phosphor-icons/react';
import { PageHeader, type FilterConfig } from '@shared/components/PageHeader';

const filters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'paid', label: 'Pago' },
      { value: 'pending', label: 'Pendente' },
      { value: 'overdue', label: 'Vencido' },
      { value: 'cancelled', label: 'Cancelado' },
    ],
  },
  {
    key: 'type',
    label: 'Tipo',
    options: [
      { value: 'monthly', label: 'Mensalidade' },
      { value: 'fee', label: 'Taxa' },
      { value: 'penalty', label: 'Multa' },
    ],
  },
];

export function BillingsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (key: string, value: string) => {
    console.log('Filter changed:', key, value);
  };

  const handleAdd = () => {
    console.log('Add new billing');
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-[37px] px-2 md:px-4 lg:px-[25px] py-2 md:py-4 lg:py-[25px] w-full">
      <PageHeader 
        title="Cobranças"
        icon={CurrencyCircleDollar}
        onSearch={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAdd={handleAdd}
        addLabel="Nova Cobrança"
      />
      
      <div className="w-full text-center py-20">
        <p className="text-app-secondary/70 text-lg">Em desenvolvimento...</p>
        {searchTerm && <p className="text-app-secondary/50 text-sm mt-2">Buscando: {searchTerm}</p>}
      </div>
    </div>
  );
}
