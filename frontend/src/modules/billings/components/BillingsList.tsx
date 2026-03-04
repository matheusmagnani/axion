import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { List, CaretLeft, CaretRight, PencilSimple, Trash } from '@phosphor-icons/react';
import { Checkbox } from '@shared/components/ui/Checkbox';
import { ListCard } from '@shared/components/ListCard';
import { useBillings, useDeleteBilling } from '../hooks/useBillings';
import { useToast } from '@shared/hooks/useToast';
import type { Billing } from '../services/billingService';

const billingStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400' },
  PAID: { label: 'Pago', className: 'bg-green-500/20 text-green-400' },
  OVERDUE: { label: 'Vencido', className: 'bg-red-500/20 text-red-400' },
  CANCELLED: { label: 'Cancelado', className: 'bg-app-gray/20 text-app-gray' },
};

const typeLabels: Record<string, string> = {
  subscription: 'Assinatura',
  single: 'Avulsa',
};

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

interface BillingsListProps {
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (billing: Billing) => void;
}

export function BillingsList({ searchTerm = '', statusFilter = '', typeFilter = '', canEdit = true, canDelete = true, onEdit }: BillingsListProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, typeFilter]);

  const { data: response, isLoading } = useBillings({
    page,
    limit,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const billings = response?.data ?? [];
  const meta = response?.meta;
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const deleteBilling = useDeleteBilling();
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
    setDeleteConfirmId(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
        setDeleteConfirmId(null);
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
      setSelectedIds(new Set(billings.map(b => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDelete = (id: number) => {
    deleteBilling.mutate(id, {
      onSuccess: () => {
        addToast('Cobrança cancelada com sucesso!', 'success');
        setOpenMenuId(null);
        setDeleteConfirmId(null);
      },
      onError: () => {
        addToast('Erro ao cancelar cobrança', 'danger');
        setDeleteConfirmId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 w-full">
        <p className="text-app-secondary">Carregando...</p>
      </div>
    );
  }

  const hasActions = canEdit || canDelete;

  return (
    <div className="flex flex-col h-full w-full">
      {meta && (
        <div className="flex-shrink-0 flex items-center justify-end gap-4 py-2 px-4">
          <span className="text-app-secondary/70 text-sm">
            Mostrando {billings.length} de {meta.total}
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
      <div className={`flex-shrink-0 grid ${hasActions ? 'grid-cols-[50px_1fr_1fr_100px_100px_120px_60px]' : 'grid-cols-[50px_1fr_1fr_100px_100px_120px]'} items-center bg-app-primary py-3 px-4 rounded-[5px]`}>
        <div className="flex items-center justify-center">
          <Checkbox
            checked={billings.length > 0 && selectedIds.size === billings.length}
            onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
          />
        </div>
        <div className="text-app-secondary text-lg font-normal text-center">Associado</div>
        <div className="text-app-secondary text-lg font-normal text-center">Descrição</div>
        <div className="text-app-secondary text-lg font-normal text-center">Valor</div>
        <div className="text-app-secondary text-lg font-normal text-center">Vencimento</div>
        <div className="text-app-secondary text-lg font-normal text-center">Status</div>
        {hasActions && <div className="text-app-secondary text-lg font-normal text-center">Ação</div>}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto mt-[10px] flex flex-col gap-[10px] scrollbar-overlay">
        {billings.length === 0 ? (
          <div className="px-5 py-10 text-center text-app-secondary/70 bg-app-primary/50 rounded-[10px] border-[0.5px] border-app-secondary/50">
            Nenhuma cobrança encontrada
          </div>
        ) : (
          billings.map((billing) => {
            const isSelected = selectedIds.has(billing.id);
            const statusCfg = billingStatusConfig[billing.status] ?? billingStatusConfig.PENDING;

            return (
              <ListCard
                key={billing.id}
                isSelected={isSelected}
                onSelect={() => toggleSelect(billing.id)}
                columns={hasActions ? 'grid-cols-[50px_1fr_1fr_100px_100px_120px_60px]' : 'grid-cols-[50px_1fr_1fr_100px_100px_120px]'}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-app-secondary/80 text-base font-light">
                    {billing.associate.name}
                  </span>
                  {billing.type && (
                    <span className="text-app-secondary/50 text-sm">
                      {typeLabels[billing.type] ?? billing.type}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-app-secondary/80 text-base truncate max-w-[200px]">
                    {billing.description}
                  </span>
                </div>

                <div className="flex justify-center">
                  <span className="text-app-secondary/80 text-base font-medium">
                    {formatCurrency(billing.value)}
                  </span>
                </div>

                <div className="flex justify-center">
                  <span className="text-app-secondary/80 text-base">
                    {formatDate(billing.dueDate)}
                  </span>
                </div>

                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {hasActions && (
                  <div className="flex justify-center">
                    {billing.status !== 'CANCELLED' ? (
                      <>
                        <button
                          onClick={(e) => handleOpenMenu(billing.id, e.currentTarget)}
                          className="p-2 hover:bg-black/10 rounded transition-colors"
                        >
                          <List className="w-6 h-6 text-app-secondary" weight="bold" />
                        </button>
                        {openMenuId === billing.id && createPortal(
                          <div
                            ref={menuRef}
                            className="fixed z-50 bg-app-primary border border-app-secondary/20 rounded-lg shadow-lg w-[160px]"
                            style={{ top: menuPos.top, right: menuPos.right, transform: 'translateY(-15px)' }}
                          >
                            {canEdit && (
                              <button
                                onClick={() => {
                                  onEdit(billing);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                              >
                                <PencilSimple className="w-6 h-6 text-app-secondary shrink-0" weight="regular" />
                                <span className="text-app-secondary flex-1 text-center">Editar</span>
                              </button>
                            )}
                            {canDelete && (
                              deleteConfirmId === billing.id ? (
                                <div className="flex items-center gap-1 px-2 py-1.5">
                                  <button
                                    onClick={() => handleDelete(billing.id)}
                                    className="flex-1 px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="flex-1 px-2 py-1 text-xs font-medium text-app-secondary/70 rounded hover:bg-app-secondary/10 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(billing.id)}
                                  className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                                >
                                  <Trash className="w-6 h-6 text-red-400 shrink-0" weight="regular" />
                                  <span className="text-red-400 flex-1 text-center">Cancelar</span>
                                </button>
                              )
                            )}
                          </div>,
                          document.body
                        )}
                      </>
                    ) : (
                      <span className="w-10" />
                    )}
                  </div>
                )}
              </ListCard>
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
          {selectedIds.size === 1 ? ' cobrança selecionada' : ' cobranças selecionadas'}
        </span>
        <button
          onClick={() => setSelectedIds(new Set())}
          className="text-app-secondary/70 text-sm hover:text-app-secondary transition-colors"
        >
          Limpar seleção
        </button>
      </div>
    </div>
  );
}
