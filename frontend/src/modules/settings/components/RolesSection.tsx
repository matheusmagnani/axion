import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserGear, Plus, PencilSimple, Trash, ToggleLeft, ToggleRight, List } from '@phosphor-icons/react';
import { Input, Modal } from '@shared/components/ui';
import { SettingsSection } from './SettingsSection';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../hooks/useRoles';
import { useToast } from '@shared/hooks/useToast';
import type { Role } from '../services/roleService';

export function RolesSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [nameError, setNameError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: rolesData, isLoading } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const { addToast } = useToast();

  const roles = rolesData?.data ?? [];

  const handleOpenMenu = (id: number, buttonEl: HTMLButtonElement) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const rect = buttonEl.getBoundingClientRect();
    const cardEl = buttonEl.closest('[data-role-card]') as HTMLElement;
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

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleName('');
    setNameError('');
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setNameError('');
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setRoleName('');
    setNameError('');
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setNameError('Nome do setor é obrigatório');
      return;
    }
    if (roleName.trim().length < 2) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    try {
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, data: { name: roleName.trim() } });
        addToast('Setor atualizado com sucesso!', 'success');
      } else {
        await createRole.mutateAsync({ name: roleName.trim() });
        addToast('Setor criado com sucesso!', 'success');
      }
      closeModal();
    } catch {
      addToast(editingRole ? 'Erro ao atualizar setor' : 'Erro ao criar setor', 'danger');
    }
  };

  const handleToggleStatus = async (role: Role) => {
    const newStatus = role.status === 1 ? 0 : 1;
    try {
      await updateRole.mutateAsync({ id: role.id, data: { status: newStatus } });
      addToast(
        newStatus === 1 ? 'Setor ativado com sucesso!' : 'Setor inativado com sucesso!',
        'success'
      );
      setOpenMenuId(null);
    } catch {
      addToast('Erro ao alterar status do setor', 'danger');
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRole.mutateAsync(id);
      addToast('Setor excluído com sucesso!', 'success');
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    } catch {
      addToast('Erro ao excluir setor. Verifique se não há usuários vinculados.', 'danger');
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    }
  };

  const isSaving = createRole.isPending || updateRole.isPending;

  return (
    <>
      <SettingsSection
        title="Setores"
        description="Gerencie os setores da empresa"
        icon={<UserGear className="w-5 h-5" weight="fill" />}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        actions={
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
              openCreateModal();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-app-secondary/10 text-app-secondary hover:bg-app-secondary/20 transition-colors"
          >
            <Plus className="w-4 h-4" weight="bold" />
            <span className="text-sm font-medium">Novo Setor</span>
          </button>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-app-secondary/30 border-t-app-secondary rounded-full animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-10">
            <UserGear className="w-12 h-12 text-app-secondary/50 mx-auto mb-3" weight="light" />
            <p className="text-app-secondary">Nenhum setor cadastrado</p>
            <p className="text-app-secondary/60 text-sm mt-1">
              Clique em "Novo Setor" para adicionar o primeiro
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-4">
            {roles.map((role) => (
              <div
                key={role.id}
                data-role-card
                className="flex items-center justify-between p-4 rounded-xl bg-app-bg/50 border border-app-secondary/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-app-secondary">{role.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      role.status === 1
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {role.status === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                  {role._count.users > 0 && (
                    <span className="text-xs text-app-gray">
                      {role._count.users} {role._count.users === 1 ? 'usuário' : 'usuários'}
                    </span>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={(e) => handleOpenMenu(role.id, e.currentTarget)}
                    className="p-2 hover:bg-black/10 rounded transition-colors"
                  >
                    <List className="w-6 h-6 text-app-secondary" weight="bold" />
                  </button>
                  {openMenuId === role.id && createPortal(
                    <div
                      ref={menuRef}
                      className="fixed z-50 bg-app-primary border border-app-secondary/20 rounded-lg shadow-lg w-[160px]"
                      style={{ top: menuPos.top, right: menuPos.right, transform: 'translateY(-15px)' }}
                    >
                      <button
                        onClick={() => handleToggleStatus(role)}
                        className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                      >
                        {role.status === 1 ? (
                          <>
                            <ToggleLeft className="w-6 h-6 text-app-secondary shrink-0" weight="light" />
                            <span className="text-app-secondary flex-1 text-center">Inativar</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-6 h-6 text-green-400 shrink-0" weight="fill" />
                            <span className="text-green-400 flex-1 text-center">Ativar</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(role)}
                        className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                      >
                        <PencilSimple className="w-6 h-6 text-app-secondary shrink-0" weight="regular" />
                        <span className="text-app-secondary flex-1 text-center">Editar</span>
                      </button>
                      {deleteConfirmId === role.id ? (
                        <div className="flex items-center gap-1 px-2 py-1.5">
                          <button
                            onClick={() => handleDelete(role.id)}
                            disabled={deleteRole.isPending}
                            className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 flex-1"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-lg text-xs font-medium text-app-gray hover:bg-app-secondary/10 transition-colors flex-1"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(role.id)}
                          className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                        >
                          <Trash className="w-6 h-6 text-red-400 shrink-0" weight="regular" />
                          <span className="text-red-400 flex-1 text-center">Excluir</span>
                        </button>
                      )}
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      {/* Modal Criar/Editar Setor */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRole ? 'Editar Setor' : 'Novo Setor'}
        className="w-[400px]"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome do Setor"
            placeholder="Ex: Financeiro, Marketing, TI..."
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value);
              if (nameError) setNameError('');
            }}
            error={nameError}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-app-gray hover:bg-app-secondary/10 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-app-secondary/10 text-app-secondary hover:bg-app-secondary/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : editingRole ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
