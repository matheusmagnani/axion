import { useState } from 'react';
import { CurrencyCircleDollar } from '@phosphor-icons/react';
import { PageHeader, type FilterConfig } from '@shared/components/PageHeader';

const filters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'paid', label: 'Paid' },
      { value: 'pending', label: 'Pending' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'type',
    label: 'Type',
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: 'fee', label: 'Fee' },
      { value: 'penalty', label: 'Penalty' },
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
    <div className="flex flex-col items-center gap-4 md:gap-[37px] px-3 md:px-6 lg:px-[45px] py-4 md:py-8 lg:py-[49px] w-full">
      <PageHeader 
        title="Billings" 
        icon={CurrencyCircleDollar}
        onSearch={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAdd={handleAdd}
        addLabel="New Billing"
      />
      
      <div className="w-full text-center py-20">
        <p className="text-secondary/70 text-lg">Under development...</p>
        {searchTerm && <p className="text-secondary/50 text-sm mt-2">Searching: {searchTerm}</p>}
      </div>
    </div>
  );
}
