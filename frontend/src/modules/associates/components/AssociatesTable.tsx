import { useState } from 'react';
import { List } from '@phosphor-icons/react';
import { useAssociates } from '../hooks/useAssociates';
import { useSort } from '@shared/hooks/useSort';
import type { Associate } from '../services/associatesService';
import { StatusBadge } from '@shared/components/Badge/StatusBadge';
import { Checkbox } from '@shared/components/ui/Checkbox';
import { formatCPF, formatPhone } from '@shared/utils/formatters';

interface AssociatesTableProps {
  searchTerm?: string;
  statusFilter?: string;
}

export function AssociatesTable({ searchTerm = '', statusFilter = '' }: AssociatesTableProps) {
  const { data: associates = [], isLoading } = useAssociates();
  const { sortedData } = useSort<Associate>(associates);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredData.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Filters
  const filteredData = sortedData.filter(associate => {
    const matchesSearch = associate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         associate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         associate.cpf.includes(searchTerm);
    const matchesStatus = !statusFilter || associate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 grid grid-cols-[50px_1fr_1fr_120px_60px] items-center bg-primary py-3 px-4 rounded-[5px]">
        {/* Checkbox - Select all */}
        <div className="flex items-center justify-center">
          <Checkbox 
            checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
            onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
          />
        </div>
        {/* Name */}
        <div className="text-secondary text-lg font-normal text-center">
          Name
        </div>
        {/* Contacts */}
        <div className="text-secondary text-lg font-normal text-center">
          Contacts
        </div>
        {/* Status */}
        <div className="text-secondary text-lg font-normal text-center">
          Status
        </div>
        {/* Action */}
        <div className="text-secondary text-lg font-normal text-center">
          Action
        </div>
      </div>

      {/* Cards - With Scroll */}
      <div className="flex-1 overflow-y-auto mt-[10px] flex flex-col gap-[10px] pr-2">
        {filteredData.length === 0 ? (
          <div className="px-5 py-10 text-center text-secondary/70 bg-[#16171C]/[0.36] rounded-[10px] border-[0.5px] border-secondary/50">
            No associates found
          </div>
        ) : (
          filteredData.map((associate) => {
            const isSelected = selectedIds.has(associate.id);
            return (
              <div
                key={associate.id}
                className="flex-shrink-0 grid grid-cols-[50px_1fr_1fr_120px_60px] items-center bg-[#16171C]/[0.36] py-4 px-4 rounded-[10px] border-[0.5px] border-secondary/30 relative overflow-hidden"
              >
                {/* Animated border */}
                <div 
                  className={`
                    absolute inset-0 rounded-[10px] border-[0.5px] border-secondary pointer-events-none
                    transition-all duration-500 ease-out
                    ${isSelected ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{
                    clipPath: isSelected 
                      ? 'inset(0 0 0 0)' 
                      : 'inset(0 100% 0 0)'
                  }}
                />
                {/* Checkbox */}
                <div className="flex items-center justify-center">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(associate.id)}
                  />
                </div>
              
              {/* Name and CPF */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-secondary/80 text-base font-light">
                  {associate.name}
                </span>
                <span className="text-secondary/50 text-sm">
                  {formatCPF(associate.cpf)}
                </span>
              </div>
              
              {/* Email and Phone */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-secondary/80 text-base">
                  {associate.email}
                </span>
                <span className="text-secondary/50 text-sm">
                  {formatPhone(associate.phone)}
                </span>
              </div>
              
              {/* Status */}
              <div className="flex justify-center">
                <StatusBadge status={associate.status} />
              </div>
              
              {/* Action */}
              <div className="flex justify-center">
                <button className="p-2 hover:bg-black/10 rounded transition-colors">
                  <List className="w-6 h-6 text-secondary" weight="bold" />
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Footer - Selected counter */}
      <div 
        className={`
          flex-shrink-0 flex items-center justify-between mt-[10px] py-3 px-4 
          bg-primary rounded-[5px] transition-all duration-300
          ${selectedIds.size > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
        `}
      >
        <span className="text-secondary text-sm">
          <span className="font-medium">{selectedIds.size}</span>
          {selectedIds.size === 1 ? ' associate selected' : ' associates selected'}
        </span>
        <button 
          onClick={() => setSelectedIds(new Set())}
          className="text-secondary/70 text-sm hover:text-secondary transition-colors"
        >
          Clear selection
        </button>
      </div>
    </div>
  );
}
