import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardText, Plus, PencilSimple, Trash, ToggleLeft, ToggleRight, List, Tag, Percent } from '@phosphor-icons/react';
import { Input, Modal } from '@shared/components/ui';
import { SettingsSection } from './SettingsSection';
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/usePlans';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '@shared/hooks/useToast';
import type { Plan } from '../services/planService';
import type { Product } from '../services/productService';

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calculateFinalPrice(products: Product[], productIds: number[], discountType: string | null, discountValue: string | number | null): number {
  const total = productIds.reduce((sum, id) => {
    const product = products.find((p) => p.id === id);
    return sum + (product ? parseFloat(String(product.price)) : 0);
  }, 0);

  if (!discountType || !discountValue) return total;

  const discount = typeof discountValue === 'string' ? parseFloat(discountValue) : discountValue;

  if (discountType === 'percentage') {
    return total * (1 - discount / 100);
  }
  if (discountType === 'fixed') {
    return Math.max(0, total - discount);
  }
  return total;
}

export function PlansSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [discountType, setDiscountType] = useState<string>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [nameError, setNameError] = useState('');
  const [productsError, setProductsError] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: plansData, isLoading } = usePlans();
  const { data: productsData } = useProducts();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const { addToast } = useToast();

  const plans = plansData?.data ?? [];
  const products = productsData?.data ?? [];
  const activeProducts = products.filter((p) => p.status === 1);

  const handleOpenMenu = (id: number, buttonEl: HTMLButtonElement) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const rect = buttonEl.getBoundingClientRect();
    const cardEl = buttonEl.closest('[data-plan-card]') as HTMLElement;
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

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedProductIds([]);
    setDiscountType('none');
    setDiscountValue('');
    setNameError('');
    setProductsError('');
    setDiscountError('');
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description ?? '');
    setSelectedProductIds(plan.productIds);
    setDiscountType(plan.discountType ?? 'none');
    if (plan.discountValue) {
      const val = parseFloat(String(plan.discountValue));
      if (plan.discountType === 'percentage') {
        setDiscountValue(String(val));
      } else {
        const cents = Math.round(val * 100).toString();
        setDiscountValue(formatDiscountMask(cents));
      }
    } else {
      setDiscountValue('');
    }
    setNameError('');
    setProductsError('');
    setDiscountError('');
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    resetForm();
  };

  const formatDiscountMask = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const cents = parseInt(digits, 10);
    return (cents / 100).toFixed(2).replace('.', ',');
  };

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (discountType === 'percentage') {
      const val = e.target.value.replace(/[^0-9.,]/g, '');
      setDiscountValue(val);
    } else {
      const masked = formatDiscountMask(e.target.value);
      setDiscountValue(masked);
    }
    if (discountError) setDiscountError('');
  };

  const parseDiscountValue = (): number | null => {
    if (discountType === 'none' || !discountValue.trim()) return null;
    if (discountType === 'percentage') {
      return parseFloat(discountValue.replace(',', '.'));
    }
    const cleaned = discountValue.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned);
  };

  const toggleProductId = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
    if (productsError) setProductsError('');
  };

  const previewTotal = useMemo(() => {
    const total = selectedProductIds.reduce((sum, id) => {
      const product = products.find((p) => p.id === id);
      return sum + (product ? parseFloat(String(product.price)) : 0);
    }, 0);
    return total;
  }, [selectedProductIds, products]);

  const previewFinal = useMemo(() => {
    const discountVal = parseDiscountValue();
    return calculateFinalPrice(
      products,
      selectedProductIds,
      discountType === 'none' ? null : discountType,
      discountVal
    );
  }, [selectedProductIds, products, discountType, discountValue]);

  const handleSave = async () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError('Nome do plano é obrigatório');
      hasError = true;
    } else if (name.trim().length < 2) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      hasError = true;
    }

    if (selectedProductIds.length === 0) {
      setProductsError('Selecione pelo menos um produto');
      hasError = true;
    }

    if (discountType !== 'none') {
      const val = parseDiscountValue();
      if (val === null || isNaN(val) || val < 0) {
        setDiscountError('Valor do desconto é inválido');
        hasError = true;
      } else if (discountType === 'percentage' && val > 100) {
        setDiscountError('Porcentagem não pode ser maior que 100');
        hasError = true;
      }
    }

    if (hasError) return;

    const discountVal = parseDiscountValue();

    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({
          id: editingPlan.id,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            productIds: selectedProductIds,
            discountType: discountType === 'none' ? null : discountType,
            discountValue: discountVal,
          },
        });
        addToast('Plano atualizado com sucesso!', 'success');
      } else {
        await createPlan.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          productIds: selectedProductIds,
          discountType: discountType === 'none' ? null : discountType,
          discountValue: discountVal,
        });
        addToast('Plano criado com sucesso!', 'success');
      }
      closeModal();
    } catch {
      addToast(editingPlan ? 'Erro ao atualizar plano' : 'Erro ao criar plano', 'danger');
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    const newStatus = plan.status === 1 ? 0 : 1;
    try {
      await updatePlan.mutateAsync({ id: plan.id, data: { status: newStatus } });
      addToast(
        newStatus === 1 ? 'Plano ativado com sucesso!' : 'Plano inativado com sucesso!',
        'success'
      );
      setOpenMenuId(null);
    } catch {
      addToast('Erro ao alterar status do plano', 'danger');
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePlan.mutateAsync(id);
      addToast('Plano excluído com sucesso!', 'success');
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    } catch {
      addToast('Erro ao excluir plano', 'danger');
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    }
  };

  const getPlanProductNames = (productIds: number[]): string => {
    return productIds
      .map((id) => products.find((p) => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const isSaving = createPlan.isPending || updatePlan.isPending;

  return (
    <>
      <SettingsSection
        title="Planos"
        description="Gerencie os planos da empresa"
        icon={<ClipboardText className="w-5 h-5" weight="fill" />}
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
            <span className="text-sm font-medium">Novo Plano</span>
          </button>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-app-secondary/30 border-t-app-secondary rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-10">
            <ClipboardText className="w-12 h-12 text-app-secondary/50 mx-auto mb-3" weight="light" />
            <p className="text-app-secondary">Nenhum plano cadastrado</p>
            <p className="text-app-secondary/60 text-sm mt-1">
              Clique em "Novo Plano" para adicionar o primeiro
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-4">
            {plans.map((plan) => {
              const finalPrice = calculateFinalPrice(products, plan.productIds, plan.discountType, plan.discountValue);
              const totalProducts = plan.productIds.reduce((sum, id) => {
                const product = products.find((p) => p.id === id);
                return sum + (product ? parseFloat(String(product.price)) : 0);
              }, 0);
              const hasDiscount = plan.discountType && plan.discountValue;

              return (
                <div
                  key={plan.id}
                  data-plan-card
                  className="flex items-center justify-between p-4 rounded-xl bg-app-bg/50 border border-app-secondary/10"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-app-secondary">{plan.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          plan.status === 1
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {plan.status === 1 ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {plan.description && (
                      <span className="text-xs text-app-secondary/60 truncate">
                        {plan.description}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
                    <span className="text-xs text-app-secondary">
                      {plan.productIds.length} produto{plan.productIds.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-app-secondary truncate max-w-[250px] text-center">
                      {getPlanProductNames(plan.productIds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs text-app-secondary">
                        {formatCurrency(totalProducts)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-app-secondary">
                          {plan.discountType === 'percentage'
                            ? `- ${parseFloat(String(plan.discountValue))}%`
                            : `- ${formatCurrency(parseFloat(String(plan.discountValue)))}`}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-app-secondary">
                        {formatCurrency(finalPrice)}
                      </span>
                    </div>

                    <div className="flex justify-center">
                    <button
                      onClick={(e) => handleOpenMenu(plan.id, e.currentTarget)}
                      className="p-2 hover:bg-black/10 rounded transition-colors"
                    >
                      <List className="w-6 h-6 text-app-secondary" weight="bold" />
                    </button>
                    {openMenuId === plan.id && createPortal(
                      <div
                        ref={menuRef}
                        className="fixed z-50 bg-app-primary border border-app-secondary/20 rounded-lg shadow-lg w-[160px]"
                        style={{ top: menuPos.top, right: menuPos.right, transform: 'translateY(-15px)' }}
                      >
                        <button
                          onClick={() => handleToggleStatus(plan)}
                          className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                        >
                          {plan.status === 1 ? (
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
                          onClick={() => openEditModal(plan)}
                          className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                        >
                          <PencilSimple className="w-6 h-6 text-app-secondary shrink-0" weight="regular" />
                          <span className="text-app-secondary flex-1 text-center">Editar</span>
                        </button>
                        {deleteConfirmId === plan.id ? (
                          <div className="flex items-center gap-1 px-2 py-1.5">
                            <button
                              onClick={() => handleDelete(plan.id)}
                              disabled={deletePlan.isPending}
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
                            onClick={() => setDeleteConfirmId(plan.id)}
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
                </div>
              );
            })}
          </div>
        )}
      </SettingsSection>

      {/* Modal Criar/Editar Plano */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
        className="w-[520px]"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome do Plano"
            placeholder="Ex: Plano Básico, Plano Premium..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            error={nameError}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Descrição</label>
            <textarea
              placeholder="Descreva o plano..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-app-bg/50 border border-app-secondary/20 text-app-secondary placeholder-app-gray/50 text-sm focus:outline-none focus:border-app-secondary/40 resize-none"
            />
          </div>

          {/* Seleção de Produtos */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Produtos</label>
            {activeProducts.length === 0 ? (
              <p className="text-xs text-app-secondary">Nenhum produto ativo disponível</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                {activeProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-app-bg/50 border border-app-secondary/10 cursor-pointer hover:border-app-secondary/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleProductId(product.id)}
                      className="w-4 h-4 rounded accent-app-secondary"
                    />
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="text-sm text-app-secondary truncate">{product.name}</span>
                      <span className="text-sm text-app-secondary font-medium ml-2 shrink-0">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {productsError && (
              <span className="text-xs text-red-400 mt-0.5">{productsError}</span>
            )}
          </div>

          {/* Tipo de Desconto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Tipo de Desconto</label>
            <select
              value={discountType}
              onChange={(e) => {
                setDiscountType(e.target.value);
                setDiscountValue('');
                if (discountError) setDiscountError('');
              }}
              className="w-full px-4 py-3 rounded-xl bg-app-bg/50 border border-app-secondary/20 text-app-secondary text-sm focus:outline-none focus:border-app-secondary/40 appearance-none"
            >
              <option value="none">Nenhum</option>
              <option value="percentage">Porcentagem (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>

          {/* Valor do Desconto */}
          {discountType !== 'none' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-app-secondary">
                {discountType === 'percentage' ? 'Desconto (%)' : 'Desconto (R$)'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-secondary text-sm">
                  {discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                </span>
                <input
                  type="text"
                  placeholder={discountType === 'percentage' ? 'Ex: 10' : '0,00'}
                  value={discountValue}
                  onChange={handleDiscountValueChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-app-bg/50 border border-app-secondary/20 text-app-secondary placeholder-app-gray/50 text-sm focus:outline-none focus:border-app-secondary/40"
                />
              </div>
              {discountError && (
                <span className="text-xs text-red-400 mt-0.5">{discountError}</span>
              )}
            </div>
          )}

          {/* Preview do Valor Final */}
          {selectedProductIds.length > 0 && (
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-app-secondary/5 border border-app-secondary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-app-secondary">Soma dos produtos</span>
                <span className="text-sm text-app-secondary">{formatCurrency(previewTotal)}</span>
              </div>
              {discountType !== 'none' && discountValue && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-app-secondary">Desconto</span>
                  <span className="text-sm text-app-secondary">
                    - {formatCurrency(previewTotal - previewFinal)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-app-secondary/10 pt-1 mt-1">
                <span className="text-sm font-medium text-app-secondary">Valor final</span>
                <span className="text-sm font-semibold text-app-secondary">{formatCurrency(previewFinal)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-app-secondary hover:bg-app-secondary/10 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-app-secondary/10 text-app-secondary hover:bg-app-secondary/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : editingPlan ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
