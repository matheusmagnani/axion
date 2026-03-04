import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlass, Percent, Tag } from '@phosphor-icons/react';
import { Modal, Input } from '@shared/components/ui';
import { useSearchAssociates } from '../hooks/useBillings';
import { usePlans } from '@/modules/settings/hooks/usePlans';
import { useProducts } from '@/modules/settings/hooks/useProducts';
import type { SearchAssociate, CreateBillingDTO } from '../services/billingService';
import type { Plan } from '@/modules/settings/services/planService';
import type { Product } from '@/modules/settings/services/productService';

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

interface CreateBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBillingDTO) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateBillingModal({ isOpen, onClose, onSubmit, isSubmitting }: CreateBillingModalProps) {
  // Associate search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssociate, setSelectedAssociate] = useState<SearchAssociate | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Steps
  const [billingType, setBillingType] = useState<'subscription' | 'single' | null>(null);
  const [origin, setOrigin] = useState<'plan' | 'product' | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  // Discount
  const [discountType, setDiscountType] = useState<string>('none');
  const [discountValue, setDiscountValue] = useState('');

  // Final fields
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: associatesData, isLoading: isSearching } = useSearchAssociates(searchTerm);
  const { data: plansData } = usePlans();
  const { data: productsData } = useProducts();

  const associates = associatesData ?? [];
  const plans = (plansData?.data ?? []).filter((p: Plan) => p.status === 1);
  const products = (productsData?.data ?? []).filter((p: Product) => p.status === 1);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedAssociate(null);
      setBillingType(null);
      setOrigin(null);
      setSelectedPlanId(null);
      setSelectedProductIds([]);
      setDiscountType('none');
      setDiscountValue('');
      setDescription('');
      setDueDate('');
      setErrors({});
      setIsSearchFocused(false);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive dropdown visibility from state + data
  const showDropdown = isSearchFocused && searchTerm.length >= 2;

  const updateDropdownPos = useCallback(() => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (showDropdown) updateDropdownPos();
  }, [showDropdown, updateDropdownPos]);

  // Auto-generate description
  useEffect(() => {
    if (!selectedAssociate) return;

    let desc = '';
    if (origin === 'plan' && selectedPlanId) {
      const plan = plans.find((p: Plan) => p.id === selectedPlanId);
      if (plan) {
        desc = `${billingType === 'subscription' ? 'Assinatura' : 'Cobrança'} - ${plan.name}`;
      }
    } else if (origin === 'product' && selectedProductIds.length > 0) {
      const names = selectedProductIds
        .map((id) => products.find((p: Product) => p.id === id)?.name)
        .filter(Boolean);
      desc = `${billingType === 'subscription' ? 'Assinatura' : 'Cobrança'} - ${names.join(', ')}`;
    }

    if (desc) setDescription(desc);
  }, [selectedAssociate, billingType, origin, selectedPlanId, selectedProductIds, plans, products]);

  // Calculate subtotal based on selection
  const subtotal = useMemo(() => {
    if (origin === 'plan' && selectedPlanId) {
      const plan = plans.find((p: Plan) => p.id === selectedPlanId);
      if (!plan) return 0;
      // Sum plan products
      const total = plan.productIds.reduce((sum: number, id: number) => {
        const product = products.find((p: Product) => p.id === id);
        return sum + (product ? parseFloat(String(product.price)) : 0);
      }, 0);
      // Apply plan discount
      if (plan.discountType && plan.discountValue) {
        const dv = parseFloat(String(plan.discountValue));
        if (plan.discountType === 'percentage') return total * (1 - dv / 100);
        if (plan.discountType === 'fixed') return Math.max(0, total - dv);
      }
      return total;
    }

    if (origin === 'product' && selectedProductIds.length > 0) {
      return selectedProductIds.reduce((sum, id) => {
        const product = products.find((p: Product) => p.id === id);
        return sum + (product ? parseFloat(String(product.price)) : 0);
      }, 0);
    }

    return 0;
  }, [origin, selectedPlanId, selectedProductIds, plans, products]);

  // Parse additional discount value
  const parseAdditionalDiscount = (): number => {
    if (discountType === 'none' || !discountValue.trim()) return 0;
    if (discountType === 'percentage') {
      const pct = parseFloat(discountValue.replace(',', '.'));
      return isNaN(pct) ? 0 : subtotal * (pct / 100);
    }
    const cleaned = discountValue.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val;
  };

  const additionalDiscount = parseAdditionalDiscount();
  const finalValue = Math.max(0, subtotal - additionalDiscount);

  const formatDiscountMask = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const cents = parseInt(digits, 10);
    return (cents / 100).toFixed(2).replace('.', ',');
  };

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (discountType === 'percentage') {
      setDiscountValue(e.target.value.replace(/[^0-9.,]/g, ''));
    } else {
      setDiscountValue(formatDiscountMask(e.target.value));
    }
  };

  const toggleProductId = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAssociate = (associate: SearchAssociate) => {
    setSelectedAssociate(associate);
    setSearchTerm('');
    setIsSearchFocused(false);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!selectedAssociate) newErrors.associate = 'Selecione um associado';
    if (!billingType) newErrors.type = 'Selecione o tipo';
    if (!origin) newErrors.origin = 'Selecione a origem';
    if (origin === 'plan' && !selectedPlanId) newErrors.plan = 'Selecione um plano';
    if (origin === 'product' && selectedProductIds.length === 0) newErrors.products = 'Selecione pelo menos um produto';
    if (!dueDate) newErrors.dueDate = 'Informe a data de vencimento';
    if (!description.trim()) newErrors.description = 'Informe a descrição';

    if (discountType !== 'none' && discountValue.trim()) {
      if (discountType === 'percentage') {
        const pct = parseFloat(discountValue.replace(',', '.'));
        if (isNaN(pct) || pct < 0 || pct > 100) newErrors.discount = 'Porcentagem inválida (0-100)';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const discountVal = discountType === 'none' || !discountValue.trim()
      ? null
      : discountType === 'percentage'
        ? parseFloat(discountValue.replace(',', '.'))
        : parseFloat(discountValue.replace(/\./g, '').replace(',', '.'));

    const data: CreateBillingDTO = {
      associateId: selectedAssociate!.id,
      type: billingType!,
      origin: origin!,
      planId: origin === 'plan' ? selectedPlanId : null,
      productIds: origin === 'product' ? selectedProductIds : (origin === 'plan' && selectedPlanId ? plans.find((p: Plan) => p.id === selectedPlanId)?.productIds ?? [] : []),
      discountType: discountType === 'none' ? null : discountType,
      discountValue: discountVal,
      description: description.trim(),
      dueDate,
      value: Math.round(finalValue * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
    };

    await onSubmit(data);
  };

  const showTypeStep = !!selectedAssociate;
  const showOriginStep = !!billingType;
  const showSelectionStep = !!origin;
  const showSummary = (origin === 'plan' && !!selectedPlanId) || (origin === 'product' && selectedProductIds.length > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Cobrança" className="w-[560px]">
      <div className="flex flex-col gap-4">

        {/* Step 1: Search Associate */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-app-secondary">Associado</label>
          {selectedAssociate ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-app-bg/50 border border-app-secondary/20">
              <div className="flex flex-col">
                <span className="text-sm text-app-secondary font-medium">{selectedAssociate.name}</span>
                <span className="text-xs text-app-secondary/60">{formatCpf(selectedAssociate.cpf)}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedAssociate(null);
                  setBillingType(null);
                  setOrigin(null);
                  setSelectedPlanId(null);
                  setSelectedProductIds([]);
                  setDiscountType('none');
                  setDiscountValue('');
                  setDescription('');
                }}
                className="text-xs text-app-secondary/60 hover:text-app-secondary transition-colors"
              >
                Alterar
              </button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-secondary/50" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    updateDropdownPos();
                  }}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-app-bg/50 border border-app-secondary/20 text-app-secondary placeholder-app-gray/50 text-sm focus:outline-none focus:border-app-secondary/40"
                />
              </div>
              {showDropdown && createPortal(
                <div
                  ref={dropdownRef}
                  className="fixed z-[100] bg-app-primary border border-app-secondary/20 rounded-xl shadow-lg max-h-[200px] overflow-y-auto"
                  style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
                >
                  {isSearching ? (
                    <div className="px-4 py-3 text-center">
                      <span className="text-sm text-app-secondary/60">Buscando...</span>
                    </div>
                  ) : associates.length > 0 ? (
                    associates.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleSelectAssociate(a)}
                        className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-app-secondary/10 transition-colors text-left"
                      >
                        <span className="text-sm text-app-secondary">{a.name}</span>
                        <span className="text-xs text-app-secondary/50">{formatCpf(a.cpf)}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3">
                      <span className="text-sm text-app-secondary/60">Nenhum associado encontrado</span>
                    </div>
                  )}
                </div>,
                document.body
              )}
            </div>
          )}
          {errors.associate && <span className="text-xs text-red-400">{errors.associate}</span>}
        </div>

        {/* Step 2: Type */}
        {showTypeStep && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Tipo</label>
            <div className="flex gap-3">
              {[
                { value: 'subscription' as const, label: 'Assinatura' },
                { value: 'single' as const, label: 'Cobrança Avulsa' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setBillingType(opt.value);
                    setOrigin(null);
                    setSelectedPlanId(null);
                    setSelectedProductIds([]);
                    setDiscountType('none');
                    setDiscountValue('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
                    billingType === opt.value
                      ? 'bg-app-secondary/15 border-app-secondary/40 text-app-secondary'
                      : 'bg-app-bg/50 border-app-secondary/10 text-app-secondary/60 hover:border-app-secondary/25'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.type && <span className="text-xs text-red-400">{errors.type}</span>}
          </div>
        )}

        {/* Step 3: Origin */}
        {showOriginStep && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Origem</label>
            <div className="flex gap-3">
              {[
                { value: 'plan' as const, label: 'Plano' },
                { value: 'product' as const, label: 'Produto Avulso' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setOrigin(opt.value);
                    setSelectedPlanId(null);
                    setSelectedProductIds([]);
                    setDiscountType('none');
                    setDiscountValue('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
                    origin === opt.value
                      ? 'bg-app-secondary/15 border-app-secondary/40 text-app-secondary'
                      : 'bg-app-bg/50 border-app-secondary/10 text-app-secondary/60 hover:border-app-secondary/25'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.origin && <span className="text-xs text-red-400">{errors.origin}</span>}
          </div>
        )}

        {/* Step 4: Selection */}
        {showSelectionStep && origin === 'plan' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Plano</label>
            {plans.length === 0 ? (
              <p className="text-xs text-app-secondary/60">Nenhum plano ativo disponível</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                {plans.map((plan: Plan) => {
                  const planTotal = plan.productIds.reduce((sum: number, id: number) => {
                    const product = products.find((p: Product) => p.id === id);
                    return sum + (product ? parseFloat(String(product.price)) : 0);
                  }, 0);

                  let planFinal = planTotal;
                  if (plan.discountType && plan.discountValue) {
                    const dv = parseFloat(String(plan.discountValue));
                    if (plan.discountType === 'percentage') planFinal = planTotal * (1 - dv / 100);
                    else if (plan.discountType === 'fixed') planFinal = Math.max(0, planTotal - dv);
                  }

                  return (
                    <label
                      key={plan.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                        selectedPlanId === plan.id
                          ? 'bg-app-secondary/10 border-app-secondary/30'
                          : 'bg-app-bg/50 border-app-secondary/10 hover:border-app-secondary/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id)}
                        className="w-4 h-4 accent-app-secondary"
                      />
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-app-secondary truncate">{plan.name}</span>
                          {plan.description && (
                            <span className="text-xs text-app-secondary/50 truncate">{plan.description}</span>
                          )}
                        </div>
                        <span className="text-sm text-app-secondary font-medium ml-2 shrink-0">
                          {formatCurrency(planFinal)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.plan && <span className="text-xs text-red-400">{errors.plan}</span>}
          </div>
        )}

        {showSelectionStep && origin === 'product' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Produtos</label>
            {products.length === 0 ? (
              <p className="text-xs text-app-secondary/60">Nenhum produto ativo disponível</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                {products.map((product: Product) => (
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
            {errors.products && <span className="text-xs text-red-400">{errors.products}</span>}
          </div>
        )}

        {/* Step 5: Summary */}
        {showSummary && (
          <>
            {/* Additional discount - inline */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-app-secondary">Desconto adicional</label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value);
                    setDiscountValue('');
                  }}
                  className="w-[160px] px-3 py-2 rounded-xl bg-app-bg/50 border border-app-secondary/20 text-app-secondary text-sm focus:outline-none focus:border-app-secondary/40 appearance-none shrink-0"
                >
                  <option value="none">Nenhum</option>
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
                {discountType !== 'none' && (
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-secondary text-sm">
                      {discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                    </span>
                    <input
                      type="text"
                      placeholder={discountType === 'percentage' ? 'Ex: 10' : '0,00'}
                      value={discountValue}
                      onChange={handleDiscountValueChange}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-app-bg/50 border border-app-secondary/20 text-app-secondary placeholder-app-gray/50 text-sm focus:outline-none focus:border-app-secondary/40"
                    />
                  </div>
                )}
              </div>
              {errors.discount && <span className="text-xs text-red-400">{errors.discount}</span>}
            </div>

            {/* Price summary */}
            <div className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-app-secondary/5 border border-app-secondary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-app-secondary">Subtotal</span>
                <span className="text-sm text-app-secondary">{formatCurrency(subtotal)}</span>
              </div>
              {additionalDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-app-secondary">Desconto adicional</span>
                  <span className="text-sm text-app-secondary">- {formatCurrency(additionalDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-app-secondary/10 pt-0.5 mt-0.5">
                <span className="text-sm font-medium text-app-secondary">Valor final</span>
                <span className="text-sm font-semibold text-app-secondary">{formatCurrency(finalValue)}</span>
              </div>
            </div>

            {/* Description + Due date - side by side */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <Input
                  label="Descrição"
                  placeholder="Descrição da cobrança..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={errors.description}
                />
              </div>
              <div className="flex flex-col gap-1.5 w-[180px] shrink-0">
                <Input
                  label="Vencimento"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  error={errors.dueDate}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-app-secondary hover:bg-app-secondary/10 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-app-secondary/10 text-app-secondary hover:bg-app-secondary/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Criando...' : 'Criar Cobrança'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
