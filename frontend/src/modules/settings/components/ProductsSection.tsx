import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Package, Plus, PencilSimple, Trash, ToggleLeft, ToggleRight, List, Image, X } from '@phosphor-icons/react';
import { Input, Modal } from '@shared/components/ui';
import { SettingsSection } from './SettingsSection';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useRemoveProductImage } from '../hooks/useProducts';
import { useToast } from '@shared/hooks/useToast';
import type { Product } from '../services/productService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProductsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: productsData, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const removeProductImage = useRemoveProductImage();
  const { addToast } = useToast();

  const products = productsData?.data ?? [];

  const handleOpenMenu = (id: number, buttonEl: HTMLButtonElement) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const rect = buttonEl.getBoundingClientRect();
    const cardEl = buttonEl.closest('[data-product-card]') as HTMLElement;
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
    setPrice('');
    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(false);
    setNameError('');
    setPriceError('');
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description ?? '');
    const cents = Math.round(parseFloat(product.price) * 100).toString();
    setPrice(formatPriceMask(cents));
    setImageFile(null);
    setRemoveCurrentImage(false);
    setImagePreview(product.image ? `${API_URL}/uploads/${product.image}` : null);
    setNameError('');
    setPriceError('');
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const formatPriceMask = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const cents = parseInt(digits, 10);
    const formatted = (cents / 100).toFixed(2).replace('.', ',');
    return formatted;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatPriceMask(e.target.value);
    setPrice(masked);
    if (priceError) setPriceError('');
  };

  const parsePriceBR = (val: string): number => {
    const cleaned = val.replace(/\s/g, '').replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned);
  };

  const handleSave = async () => {
    let hasError = false;
    if (!name.trim()) {
      setNameError('Nome do produto é obrigatório');
      hasError = true;
    } else if (name.trim().length < 2) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      hasError = true;
    }

    const priceNum = parsePriceBR(price);
    if (!price.trim() || isNaN(priceNum)) {
      setPriceError('Valor é obrigatório');
      hasError = true;
    } else if (priceNum < 0) {
      setPriceError('Valor deve ser maior ou igual a zero');
      hasError = true;
    }

    if (hasError) return;

    try {
      if (editingProduct) {
        if (removeCurrentImage && !imageFile) {
          await removeProductImage.mutateAsync(editingProduct.id);
        }
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            price: priceNum,
            ...(imageFile && { image: imageFile }),
          },
        });
        addToast('Produto atualizado com sucesso!', 'success');
      } else {
        await createProduct.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          ...(imageFile && { image: imageFile }),
        });
        addToast('Produto criado com sucesso!', 'success');
      }
      closeModal();
    } catch {
      addToast(editingProduct ? 'Erro ao atualizar produto' : 'Erro ao criar produto', 'danger');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 1 ? 0 : 1;
    try {
      await updateProduct.mutateAsync({ id: product.id, data: { status: newStatus } });
      addToast(
        newStatus === 1 ? 'Produto ativado com sucesso!' : 'Produto inativado com sucesso!',
        'success'
      );
      setOpenMenuId(null);
    } catch {
      addToast('Erro ao alterar status do produto', 'danger');
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync(id);
      addToast('Produto excluído com sucesso!', 'success');
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    } catch {
      addToast('Erro ao excluir produto', 'danger');
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveCurrentImage(false);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isSaving = createProduct.isPending || updateProduct.isPending || removeProductImage.isPending;

  return (
    <>
      <SettingsSection
        title="Produtos"
        description="Gerencie os produtos da empresa"
        icon={<Package className="w-5 h-5" weight="fill" />}
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
            <span className="text-sm font-medium">Novo Produto</span>
          </button>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-app-secondary/30 border-t-app-secondary rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-12 h-12 text-app-secondary/50 mx-auto mb-3" weight="light" />
            <p className="text-app-secondary">Nenhum produto cadastrado</p>
            <p className="text-app-secondary/60 text-sm mt-1">
              Clique em "Novo Produto" para adicionar o primeiro
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-4">
            {products.map((product) => (
              <div
                key={product.id}
                data-product-card
                className="flex items-center justify-between p-4 rounded-xl bg-app-bg/50 border border-app-secondary/10"
              >
                <div className="flex items-center gap-4">
                  {product.image ? (
                    <img
                      src={`${API_URL}/uploads/${product.image}`}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-app-secondary/10 flex items-center justify-center">
                      <Image className="w-5 h-5 text-app-secondary/50" weight="light" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-app-secondary">{product.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 1
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {product.status === 1 ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm font-semibold text-app-secondary/80">
                        {formatCurrency(product.price)}
                      </span>
                      {product.description && (
                        <span className="text-xs text-app-secondary/60 truncate max-w-[200px]">
                          {product.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={(e) => handleOpenMenu(product.id, e.currentTarget)}
                    className="p-2 hover:bg-black/10 rounded transition-colors"
                  >
                    <List className="w-6 h-6 text-app-secondary" weight="bold" />
                  </button>
                  {openMenuId === product.id && createPortal(
                    <div
                      ref={menuRef}
                      className="fixed z-50 bg-app-primary border border-app-secondary/20 rounded-lg shadow-lg w-[160px]"
                      style={{ top: menuPos.top, right: menuPos.right, transform: 'translateY(-15px)' }}
                    >
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                      >
                        {product.status === 1 ? (
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
                        onClick={() => openEditModal(product)}
                        className="flex items-center w-full pl-3 pr-4 py-1.5 text-sm hover:bg-app-secondary/10 rounded-lg transition-colors"
                      >
                        <PencilSimple className="w-6 h-6 text-app-secondary shrink-0" weight="regular" />
                        <span className="text-app-secondary flex-1 text-center">Editar</span>
                      </button>
                      {deleteConfirmId === product.id ? (
                        <div className="flex items-center gap-1 px-2 py-1.5">
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteProduct.isPending}
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
                          onClick={() => setDeleteConfirmId(product.id)}
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

      {/* Modal Criar/Editar Produto */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        className="w-[480px]"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome do Produto"
            placeholder="Ex: Plano Básico, Mensalidade..."
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
              placeholder="Descreva o produto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-app-bg/50 border border-app-secondary/20 text-app-secondary placeholder-app-gray/50 text-sm focus:outline-none focus:border-app-secondary/40 resize-none"
            />
          </div>

          <Input
            label="Valor (R$)"
            placeholder="0,00"
            value={price}
            onChange={handlePriceChange}
            error={priceError}
          />

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-app-secondary">Imagem</label>
            {imagePreview ? (
              <div className="relative w-24 h-24">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-xl object-cover border border-app-secondary/20"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" weight="bold" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-app-secondary/20 flex flex-col items-center justify-center gap-1 hover:border-app-secondary/40 transition-colors"
              >
                <Image className="w-6 h-6 text-app-secondary/50" weight="light" />
                <span className="text-xs text-app-gray">Upload</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

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
              {isSaving ? 'Salvando...' : editingProduct ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
