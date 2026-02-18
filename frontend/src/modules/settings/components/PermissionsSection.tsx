import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShieldCheck, CaretDown } from '@phosphor-icons/react';
import { Checkbox } from '@shared/components/ui';
import { SettingsSection } from './SettingsSection';
import { useRoles } from '../hooks/useRoles';
import { usePermissions, useUpdatePermissions } from '../hooks/usePermissions';
import { useToast } from '@shared/hooks/useToast';

const MODULES = ['associates', 'billings', 'connections', 'collaborators', 'settings'] as const;
const ACTIONS = ['read', 'create', 'edit', 'delete'] as const;

const MODULE_LABELS: Record<string, string> = {
  associates: 'Associados',
  billings: 'Cobranças',
  connections: 'Conexões',
  collaborators: 'Colaboradores',
  settings: 'Configurações',
};

const ACTION_LABELS: Record<string, string> = {
  read: 'Leitura',
  create: 'Criação',
  edit: 'Edição',
  delete: 'Exclusão',
};

type PermissionMap = Record<string, Record<string, boolean>>;

function buildPermissionMap(permissions: { module: string; action: string; allowed: boolean }[]): PermissionMap {
  const map: PermissionMap = {};
  for (const mod of MODULES) {
    map[mod] = {};
    for (const act of ACTIONS) {
      map[mod][act] = false;
    }
  }
  for (const p of permissions) {
    if (map[p.module]) {
      map[p.module][p.action] = p.allowed;
    }
  }
  return map;
}

export function PermissionsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [localPermissions, setLocalPermissions] = useState<PermissionMap>(() => buildPermissionMap([]));
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: rolesData } = useRoles();
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions(selectedRoleId);
  const updatePermissions = useUpdatePermissions();
  const { addToast } = useToast();

  const activeRoles = (rolesData?.data ?? []).filter((r) => r.status === 1);

  useEffect(() => {
    if (permissions) {
      setLocalPermissions(buildPermissionMap(permissions));
      setHasChanges(false);
    }
  }, [permissions]);

  useEffect(() => {
    if (!selectedRoleId && activeRoles.length > 0) {
      setSelectedRoleId(activeRoles[0].id);
    }
  }, [activeRoles, selectedRoleId]);

  const handleToggle = useCallback((module: string, action: string) => {
    setLocalPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action],
      },
    }));
    setHasChanges(true);
  }, []);

  const handleToggleModule = useCallback((module: string) => {
    setLocalPermissions((prev) => {
      const allChecked = ACTIONS.every((act) => prev[module]?.[act]);
      const newValue = !allChecked;
      const updated = { ...prev[module] };
      for (const act of ACTIONS) {
        updated[act] = newValue;
      }
      return { ...prev, [module]: updated };
    });
    setHasChanges(true);
  }, []);

  const handleToggleAll = useCallback(() => {
    setLocalPermissions((prev) => {
      const allChecked = MODULES.every((mod) =>
        ACTIONS.every((act) => prev[mod]?.[act])
      );
      const newValue = !allChecked;
      const newMap: PermissionMap = {};
      for (const mod of MODULES) {
        newMap[mod] = {};
        for (const act of ACTIONS) {
          newMap[mod][act] = newValue;
        }
      }
      return newMap;
    });
    setHasChanges(true);
  }, []);

  const isModuleAllChecked = useCallback(
    (module: string) => ACTIONS.every((act) => localPermissions[module]?.[act]),
    [localPermissions]
  );

  const isModuleSomeChecked = useCallback(
    (module: string) =>
      ACTIONS.some((act) => localPermissions[module]?.[act]) &&
      !ACTIONS.every((act) => localPermissions[module]?.[act]),
    [localPermissions]
  );

  const isAllChecked = useMemo(
    () => MODULES.every((mod) => ACTIONS.every((act) => localPermissions[mod]?.[act])),
    [localPermissions]
  );

  const isSomeChecked = useMemo(
    () =>
      MODULES.some((mod) => ACTIONS.some((act) => localPermissions[mod]?.[act])) &&
      !isAllChecked,
    [localPermissions, isAllChecked]
  );

  const handleSave = async () => {
    if (!selectedRoleId) return;

    const permissionsArray = MODULES.flatMap((mod) =>
      ACTIONS.map((act) => ({
        module: mod,
        action: act,
        allowed: localPermissions[mod]?.[act] ?? false,
      }))
    );

    try {
      await updatePermissions.mutateAsync({
        roleId: selectedRoleId,
        permissions: permissionsArray,
      });
      addToast('Permissões atualizadas com sucesso!', 'success');
      setHasChanges(false);
    } catch {
      addToast('Erro ao atualizar permissões', 'danger');
    }
  };

  return (
    <SettingsSection
      title="Permissões"
      description="Defina as permissões de cada setor"
      icon={<ShieldCheck className="w-5 h-5" weight="fill" />}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col gap-5 pt-2">
        {/* Abas de setor */}
        {activeRoles.length === 0 ? (
          <p className="text-sm text-app-secondary/50">Nenhum setor ativo</p>
        ) : (
          <div className="flex items-center gap-2">
            {activeRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRoleId(role.id);
                  setHasChanges(false);
                }}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedRoleId === role.id
                    ? 'bg-app-secondary text-app-primary'
                    : 'bg-app-bg/50 text-app-secondary/70 border border-app-secondary/10 hover:bg-app-secondary/10'
                }`}
              >
                {role.name}
              </button>
            ))}
          </div>
        )}

        {/* Cards de permissões */}
        {selectedRoleId && (
          isLoadingPermissions ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-app-secondary/30 border-t-app-secondary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Selecionar todos */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-app-secondary/5 border border-app-secondary/20">
                <Checkbox
                  size="sm"
                  checked={isAllChecked}
                  data-indeterminate={isSomeChecked || undefined}
                  onCheckedChange={handleToggleAll}
                />
                <span className="text-sm font-medium text-app-secondary">
                  Selecionar todas as permissões
                </span>
              </div>

              {/* Cards por módulo */}
              <div className="flex flex-col gap-3">
                {MODULES.map((module) => (
                  <div
                    key={module}
                    className="rounded-xl bg-app-bg/50 border border-app-secondary/10 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModules((prev) => {
                          const next = new Set(prev);
                          if (next.has(module)) next.delete(module);
                          else next.add(module);
                          return next;
                        })
                      }
                      className="flex items-center gap-4 w-full px-4 py-3 cursor-pointer hover:bg-app-secondary/5 transition-colors"
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          size="sm"
                          checked={isModuleAllChecked(module)}
                          data-indeterminate={isModuleSomeChecked(module) || undefined}
                          onCheckedChange={() => handleToggleModule(module)}
                        />
                      </div>
                      <span className="text-sm font-medium text-app-secondary flex-1 text-left">
                        {MODULE_LABELS[module]}
                      </span>
                      <CaretDown
                        className={`w-4 h-4 text-app-secondary/50 transition-transform duration-200 ${
                          expandedModules.has(module) ? 'rotate-180' : ''
                        }`}
                        weight="bold"
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-200 ${
                        expandedModules.has(module) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center justify-between px-4 pb-3 pt-1 pl-12 pr-10">
                          {ACTIONS.map((action) => (
                            <label
                              key={action}
                              className="flex items-center gap-1.5 cursor-pointer"
                            >
                              <Checkbox
                                size="sm"
                                checked={localPermissions[module]?.[action] ?? false}
                                onCheckedChange={() => handleToggle(module, action)}
                              />
                              <span className="text-sm text-app-secondary/70">
                                {ACTION_LABELS[action]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || updatePermissions.isPending}
                  className="px-5 py-2 rounded-xl bg-app-secondary/10 text-app-secondary hover:bg-app-secondary/20 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {updatePermissions.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </>
          )
        )}
      </div>
    </SettingsSection>
  );
}
