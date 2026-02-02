import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { List, CaretLeft, CaretRight, ToggleLeft, ToggleRight, PencilSimple } from '@phosphor-icons/react';
import { useAssociates, useUpdateAssociate } from '../hooks/useAssociates';
import { AssociateForm, type AssociateFormData } from './AssociateForm';

import { StatusBadge } from '@shared/components/Badge/StatusBadge';
import { Checkbox } from '@shared/components/ui/Checkbox';
import { Modal } from '@shared/components/ui';
import { formatCPF, formatPhone } from '@shared/utils/formatters';
import { useToast } from '@shared/hooks/useToast';

interface AssociatesTableProps {
  searchTerm?: string;
  statusFilter?: string;
}

export function AssociatesTable({ searchTerm = '', statusFilter = '' }: AssociatesTableProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter]);

  const { data: response, isLoading } = useAssociates({
    page,
    limit,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  });

  const associates = response?.data ?? [];
  const meta = response?.meta;
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const [editAssociate, setEditAssociate] = useState<{ id: number; name: string; cpf: string; email: string; phone: string } | null>(null);
  const updateAssociate = useUpdateAssociate();
  const { addToast } = useToast();

  const handleOpenMenu = (id: number, buttonEl: HTMLButtonElement) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const rect = buttonEl.getBoundingClientRect();
    const cardEl = buttonEl.closest('[data-card]') as HTMLElement;
    const cardRect = cardEl ? cardEl.getBoundingClientRect() : rect;
    setMenuPos({ top: cardRect.bottom, right: window.innerWidth - cardRect.right });
    setOpenMenuId(id);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(associates.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-app-secondary">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {meta && (
        <div className="flex-shrink-0 flex items-center justify-end gap-4 mb-[10px] py-3 px-4">
          <span className="text-app-secondary/70 text-sm">
            Mostrando {associates.length} de {meta.total}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-app-secondary text-sm">
              {meta.page}-{meta.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 text-app-secondary hover:bg-app-secondary/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <CaretLeft className="w-4 h-4" weight="bold" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="p-1 text-app-secondary hover:bg-app-secondary/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 grid grid-cols-[50px_1fr_1fr_120px_60px] items-center bg-app-primary py-3 px-4 rounded-[5px]">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={associates.length > 0 && selectedIds.size === associates.length}
            onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
          />
        </div>
        <div className="text-app-secondary text-lg font-normal text-center">Nome</div>
        <div className="text-app-secondary text-lg font-normal text-center">Contatos</div>
        <div className="text-app-secondary text-lg font-normal text-center">Status</div>
        <div className="text-app-secondary text-lg font-normal text-center">Ação</div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto mt-[10px] flex flex-col gap-[10px] scrollbar-overlay">
        {associates.length === 0 ? (
          <div className="px-5 py-10 text-center text-app-secondary/70 bg-[#16171C]/[0.36] rounded-[10px] border-[0.5px] border-app-secondary/50">
            Nenhum associado encontrado
          </div>
        ) : (
          associates.map((associate) => {
            const isSelected = selectedIds.has(associate.id);
            const isActive = associate.status === 'ACTIVE';
            return (
              <div
                key={associate.id}
                data-card
                className="flex-shrink-0 grid grid-cols-[50px_1fr_1fr_120px_60px] items-center bg-[#16171C]/[0.36] py-4 px-4 rounded-[10px] border-[0.5px] border-app-secondary/30 relative"
              >
                <div
                  className={`
                    absolute inset-0 rounded-[10px] border-[0.5px] border-app-secondary pointer-events-none
                    transition-all duration-500 ease-out
                    ${isSelected ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{
                    clipPath: isSelected ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                  }}
                />
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(associate.id)}
                  />
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-app-secondary/80 text-base font-light">
                    {associate.name}
                  </span>
                  <span className="text-app-secondary/50 text-sm">
                    {formatCPF(associate.cpf)}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-app-secondary/80 text-base">
                    {associate.email}
                  </span>
                  <span className="text-app-secondary/50 text-sm">
                    {formatPhone(associate.phone)}
                  </span>
                </div>

                <div className="flex justify-center">
                  <StatusBadge status={associate.status} />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={(e) => handleOpenMenu(associate.id, e.currentTarget)}
                    className="p-2 hover:bg-black/10 rounded transition-colors"
                  >
                    <List className="w-6 h-6 text-app-secondary" weight="bold" />
                  </button>
                  {openMenuId === associate.id && createPortal(
                    <div
                      ref={menuRef}
                      className="fixed z-50 bg-[#1E1F26] border border-app-secondary/20 rounded-lg shadow-lg w-[160px]"
                      style={{ top: menuPos.top, right: menuPos.right, transform: 'translateY(-15px)' }}
                    >
                      <button
                        onClick={() => {
                          const newStatus = isActive ? 'INACTIVE' : 'ACTIVE';
                          updateAssociate.mutate({ id: associate.id, data: { status: newStatus } }, {
                            onSuccess: () => {
                              addToast(
                                newStatus === 'ACTIVE' ? 'Associado ativado!' : 'Associado inativado!',
                                'success'
                              );
                              setOpenMenuId(null);
                            },
                            onError: (error) => {
                              addToast(error.message, 'danger');
                              setOpenMenuId(null);
                            },
                          });
                        }}
                        className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                      >
                        {isActive ? (
                          <>
                            <ToggleLeft className="w-6 h-6 text-red-400 shrink-0" weight="light" />
                            <span className="text-red-400 flex-1 text-center">Inativar</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-6 h-6 text-emerald-400 shrink-0" weight="fill" />
                            <span className="text-emerald-400 flex-1 text-center">Ativar</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditAssociate({
                            id: associate.id,
                            name: associate.name,
                            cpf: associate.cpf,
                            email: associate.email,
                            phone: associate.phone,
                          });
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                      >
                        <PencilSimple className="w-6 h-6 text-app-secondary shrink-0" weight="regular" />
                        <span className="text-app-secondary flex-1 text-center">Editar</span>
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected counter */}
      <div
        className={`
          flex-shrink-0 flex items-center justify-between mt-[10px] py-3 px-4
          bg-app-primary rounded-[5px] transition-all duration-300
          ${selectedIds.size > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none h-0 mt-0 py-0 overflow-hidden'}
        `}
      >
        <span className="text-app-secondary text-sm">
          <span className="font-medium">{selectedIds.size}</span>
          {selectedIds.size === 1 ? ' associado selecionado' : ' associados selecionados'}
        </span>
        <button
          onClick={() => setSelectedIds(new Set())}
          className="text-app-secondary/70 text-sm hover:text-app-secondary transition-colors"
        >
          Limpar seleção
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editAssociate !== null}
        onClose={() => setEditAssociate(null)}
        title="Editar Associado"
      >
        {editAssociate && (
          <AssociateForm
            initialData={{
              name: editAssociate.name,
              cpf: editAssociate.cpf,
              email: editAssociate.email,
              phone: editAssociate.phone,
            }}
            onSubmit={(data: AssociateFormData) => {
              updateAssociate.mutate({ id: editAssociate.id, data }, {
                onSuccess: () => {
                  setEditAssociate(null);
                  addToast('Associado atualizado com sucesso!', 'success');
                },
                onError: (error) => {
                  addToast(error.message, 'danger');
                },
              });
            }}
            onCancel={() => setEditAssociate(null)}
          />
        )}
      </Modal>
    </div>
  );
}
