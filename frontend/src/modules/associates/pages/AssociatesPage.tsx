import { useState, useRef, useEffect } from 'react';
import { AssociatesHeader } from '../components/AssociatesHeader';
import { AssociatesTable } from '../components/AssociatesTable';
import { AssociateForm, type AssociateFormData } from '../components/AssociateForm';
import { ImportSpreadsheetModal } from '../components/ImportSpreadsheetModal';
import { useCreateAssociate } from '../hooks/useAssociates';
import { Modal } from '@shared/components/ui';
import { useToast } from '@shared/hooks/useToast';
import { useCanAccess } from '@shared/hooks/useMyPermissions';
import { UserPlus, FileXls } from '@phosphor-icons/react';

export function AssociatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const createAssociate = useCreateAssociate();
  const { addToast } = useToast();
  const canCreate = useCanAccess('associates', 'create');
  const canEdit = useCanAccess('associates', 'edit');
  const canDelete = useCanAccess('associates', 'delete');

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setStatusFilter(value);
    }
  };

  const handleAdd = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="flex flex-col h-full px-2 md:px-4 lg:px-[25px] py-2 md:py-4 lg:py-[25px] w-full">
      {/* Fixed header */}
      <div className="flex-shrink-0 relative">
        <AssociatesHeader
          onSearch={setSearchTerm}
          onFilterChange={handleFilterChange}
          onAdd={canCreate ? handleAdd : undefined}
        />

        {/* Dropdown */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-1 z-50 bg-app-primary border border-app-secondary/30 rounded-xl shadow-xl overflow-hidden min-w-[220px]"
          >
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-app-secondary hover:bg-app-secondary/10 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Criar associado avulso
            </button>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsImportModalOpen(true);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-app-secondary hover:bg-app-secondary/10 transition-colors border-t border-app-secondary/10"
            >
              <FileXls className="w-5 h-5" />
              Importar Planilha
            </button>
          </div>
        )}
      </div>

      {/* Table with scrollable cards */}
      <div className="flex-1 min-h-0 mt-2">
        <AssociatesTable
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>

      {/* New Associate Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Associado"
      >
        <AssociateForm
          onSubmit={(data: AssociateFormData) => {
            createAssociate.mutate(data, {
              onSuccess: () => {
                setIsCreateModalOpen(false);
                addToast('Associado criado com sucesso!', 'success');
              },
              onError: (error) => {
                addToast(error.message, 'danger');
              },
            });
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Import Modal */}
      <ImportSpreadsheetModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
