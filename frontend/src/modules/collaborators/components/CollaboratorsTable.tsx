import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { List, CaretLeft, CaretRight, ToggleLeft, ToggleRight, Key } from '@phosphor-icons/react';
import { useCollaborators, useToggleCollaboratorActive, useChangeCollaboratorPassword } from '../hooks/useCollaborators';
import { Checkbox } from '@shared/components/ui/Checkbox';
import { Modal } from '@shared/components/ui';
import { ListCard } from '@shared/components/ListCard';
import { ChangePasswordForm } from './ChangePasswordForm';
import { useToast } from '@shared/hooks/useToast';
import { authService } from '@modules/auth/services/authService';

interface CollaboratorsTableProps {
  searchTerm?: string;
  activeFilter?: string;
}

export function CollaboratorsTable({ searchTerm = '', activeFilter = '' }: CollaboratorsTableProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => { setPage(1); }, [searchTerm, activeFilter]);

  const { data: response, isLoading } = useCollaborators({
    page,
    limit,
    search: searchTerm || undefined,
    active: activeFilter || undefined,
  });

  const collaborators = response?.data ?? [];
  const meta = response?.meta;
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const [passwordModalId, setPasswordModalId] = useState<number | null>(null);
  const toggleActive = useToggleCollaboratorActive();
  const changePassword = useChangeCollaboratorPassword();
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
      setSelectedIds(new Set(collaborators.map(c => c.id)));
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
        <div className="flex-shrink-0 flex items-center justify-end gap-4 py-2 px-4">
          <span className="text-app-secondary/70 text-sm">
            Mostrando {collaborators.length} de {meta.total}
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
            checked={collaborators.length > 0 && selectedIds.size === collaborators.length}
            onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
          />
        </div>
        <div className="text-app-secondary text-lg font-normal text-center">Nome</div>
        <div className="text-app-secondary text-lg font-normal text-center">Email</div>
        <div className="text-app-secondary text-lg font-normal text-center">Status</div>
        <div className="text-app-secondary text-lg font-normal text-center">Ação</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto mt-[10px] flex flex-col gap-[10px] scrollbar-overlay">
        {collaborators.length === 0 ? (
          <div className="px-5 py-10 text-center text-app-secondary/70 bg-app-primary/50 rounded-[10px] border-[0.5px] border-app-secondary/50">
            Nenhum colaborador encontrado
          </div>
        ) : (
          collaborators.map((collaborator) => {
            const isSelected = selectedIds.has(collaborator.id);
            return (
              <ListCard
                key={collaborator.id}
                isSelected={isSelected}
                onSelect={() => toggleSelect(collaborator.id)}
                columns="grid-cols-[50px_1fr_1fr_120px_60px]"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-app-secondary/80 text-base font-light">
                      {collaborator.name}
                    </span>
                    {collaborator.id === authService.getUser()?.id && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-app-secondary/20 text-app-secondary">
                        Você
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-app-secondary/80 text-base">
                    {collaborator.email}
                  </span>
                </div>

                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      collaborator.active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {collaborator.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={(e) => handleOpenMenu(collaborator.id, e.currentTarget)}
                    className="p-2 hover:bg-black/10 rounded transition-colors"
                  >
                    <List className="w-6 h-6 text-app-secondary" weight="bold" />
                  </button>
                  {openMenuId === collaborator.id && createPortal(
                    <div
                      ref={menuRef}
                      className="fixed z-50 bg-app-primary border border-app-secondary/20 rounded-lg shadow-lg w-[160px]"
                      style={{ top: menuPos.top, right: menuPos.right, transform: 'translateY(-15px)' }}
                    >
                      <button
                        onClick={() => {
                          toggleActive.mutate(collaborator.id, {
                            onSuccess: (data) => {
                              addToast(
                                data.active ? 'Colaborador ativado!' : 'Colaborador inativado!',
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
                        {collaborator.active ? (
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
                          setPasswordModalId(collaborator.id);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                      >
                        <Key className="w-6 h-6 text-app-secondary shrink-0" weight="regular" />
                        <span className="text-app-secondary flex-1 text-center">Alterar senha</span>
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
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
          {selectedIds.size === 1 ? ' colaborador selecionado' : ' colaboradores selecionados'}
        </span>
        <button
          onClick={() => setSelectedIds(new Set())}
          className="text-app-secondary/70 text-sm hover:text-app-secondary transition-colors"
        >
          Limpar seleção
        </button>
      </div>

      <Modal
        isOpen={passwordModalId !== null}
        onClose={() => setPasswordModalId(null)}
        title="Alterar Senha"
      >
        <ChangePasswordForm
          onSubmit={(password) => {
            if (passwordModalId === null) return;
            changePassword.mutate({ id: passwordModalId, password }, {
              onSuccess: () => {
                setPasswordModalId(null);
                addToast('Senha alterada com sucesso!', 'success');
              },
              onError: (error) => {
                addToast(error.message, 'danger');
              },
            });
          }}
          onCancel={() => setPasswordModalId(null)}
        />
      </Modal>

    </div>
  );
}
