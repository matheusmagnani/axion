import { useState, useEffect, useCallback } from 'react';
import { Buildings, PencilSimple, FloppyDisk, X, CircleNotch } from '@phosphor-icons/react';
import { Input } from '@shared/components/ui';
import { SettingsSection } from './SettingsSection';
import { useCompanyInfo, useUpdateCompanyInfo } from '../hooks/useSettings';
import { useToast } from '@shared/hooks/useToast';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface FormData {
  name: string;
  tradeName: string;
  cnpj: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

const initialFormData: FormData = {
  name: '',
  tradeName: '',
  cnpj: '',
  department: '',
  email: '',
  phone: '',
  address: '',
  addressNumber: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
};

export function CompanyInfoSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const { data: companyInfo, isLoading } = useCompanyInfo();
  const updateCompanyInfo = useUpdateCompanyInfo();
  const { addToast } = useToast();

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        addToast('CEP não encontrado', 'warning');
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));

      // Limpa erros dos campos preenchidos
      setErrors(prev => ({
        ...prev,
        address: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
      }));
    } catch {
      addToast('Erro ao buscar CEP', 'danger');
    } finally {
      setIsLoadingCep(false);
    }
  }, [addToast]);

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 14);
    return cleaned
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length <= 10) {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatZipCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    return cleaned.replace(/(\d{5})(\d)/, '$1-$2');
  };

  useEffect(() => {
    if (companyInfo) {
      setFormData({
        name: companyInfo.name || '',
        tradeName: companyInfo.tradeName || '',
        cnpj: formatCNPJ(companyInfo.cnpj || ''),
        department: companyInfo.department || '',
        email: companyInfo.email || '',
        phone: formatPhone(companyInfo.phone || ''),
        address: companyInfo.address || '',
        addressNumber: companyInfo.addressNumber || '',
        complement: companyInfo.complement || '',
        neighborhood: companyInfo.neighborhood || '',
        city: companyInfo.city || '',
        state: companyInfo.state || '',
        zipCode: formatZipCode(companyInfo.zipCode || ''),
      });
    }
  }, [companyInfo]);

  const handleChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;

    if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'zipCode') {
      formattedValue = formatZipCode(value);
      // Busca endereço quando CEP estiver completo
      const cleanCep = value.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        fetchAddressByCep(cleanCep);
      }
    } else if (field === 'state') {
      formattedValue = value.toUpperCase().slice(0, 2);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Razão Social - obrigatório, mínimo 3 caracteres
    if (!formData.name.trim()) {
      newErrors.name = 'Razão social é obrigatória';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Razão social deve ter pelo menos 3 caracteres';
    }

    // Nome Fantasia - obrigatório, mínimo 2 caracteres
    if (!formData.tradeName.trim()) {
      newErrors.tradeName = 'Nome fantasia é obrigatório';
    } else if (formData.tradeName.trim().length < 2) {
      newErrors.tradeName = 'Nome fantasia deve ter pelo menos 2 caracteres';
    }

    // CNPJ - obrigatório, 14 dígitos
    const cnpjClean = formData.cnpj.replace(/\D/g, '');
    if (!cnpjClean) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (cnpjClean.length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }

    // Departamento - obrigatório
    if (!formData.department.trim()) {
      newErrors.department = 'Departamento é obrigatório';
    }

    // Email - obrigatório e válido
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Telefone - obrigatório, 10 ou 11 dígitos
    const phoneClean = formData.phone.replace(/\D/g, '');
    if (!phoneClean) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (phoneClean.length < 10 || phoneClean.length > 11) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
    }

    // CEP - obrigatório, 8 dígitos
    const zipCodeClean = formData.zipCode.replace(/\D/g, '');
    if (!zipCodeClean) {
      newErrors.zipCode = 'CEP é obrigatório';
    } else if (zipCodeClean.length !== 8) {
      newErrors.zipCode = 'CEP deve ter 8 dígitos';
    }

    // Endereço - obrigatório
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    // Número - obrigatório
    if (!formData.addressNumber.trim()) {
      newErrors.addressNumber = 'Número é obrigatório';
    }

    // Bairro - obrigatório
    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    // Cidade - obrigatória
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    // UF - obrigatório, 2 caracteres
    if (!formData.state.trim()) {
      newErrors.state = 'UF é obrigatória';
    } else if (formData.state.length !== 2) {
      newErrors.state = 'UF deve ter 2 caracteres';
    }

    // Complemento - opcional (não valida)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await updateCompanyInfo.mutateAsync({
        companyName: formData.name,
        tradeName: formData.tradeName,
        cnpj: formData.cnpj,
        department: formData.department,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        addressNumber: formData.addressNumber,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      });

      addToast('Informações da empresa atualizadas com sucesso!', 'success');
      setIsEditing(false);
    } catch {
      addToast('Erro ao atualizar informações da empresa', 'danger');
    }
  };

  const handleCancel = () => {
    if (companyInfo) {
      setFormData({
        name: companyInfo.name || '',
        tradeName: companyInfo.tradeName || '',
        cnpj: formatCNPJ(companyInfo.cnpj || ''),
        department: companyInfo.department || '',
        email: companyInfo.email || '',
        phone: formatPhone(companyInfo.phone || ''),
        address: companyInfo.address || '',
        addressNumber: companyInfo.addressNumber || '',
        complement: companyInfo.complement || '',
        neighborhood: companyInfo.neighborhood || '',
        city: companyInfo.city || '',
        state: companyInfo.state || '',
        zipCode: formatZipCode(companyInfo.zipCode || ''),
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const EditButton = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (isEditing) {
          handleSave();
        } else {
          setIsEditing(true);
        }
      }}
      disabled={updateCompanyInfo.isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-app-secondary/10 text-app-secondary hover:bg-app-secondary/20 transition-colors disabled:opacity-50"
    >
      {isEditing ? (
        <>
          <FloppyDisk className="w-4 h-4" weight="bold" />
          <span className="text-sm font-medium">
            {updateCompanyInfo.isPending ? 'Salvando...' : 'Salvar'}
          </span>
        </>
      ) : (
        <>
          <PencilSimple className="w-4 h-4" weight="bold" />
          <span className="text-sm font-medium">Editar</span>
        </>
      )}
    </button>
  );

  const CancelButton = () => (
    isEditing && !updateCompanyInfo.isPending ? (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleCancel();
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-app-gray hover:bg-app-secondary/10 transition-colors"
      >
        <X className="w-4 h-4" weight="bold" />
        <span className="text-sm font-medium">Cancelar</span>
      </button>
    ) : null
  );

  if (isLoading) {
    return (
      <SettingsSection
        title="Informações da Empresa"
        description="Dados cadastrais da empresa"
        icon={<Buildings className="w-5 h-5" weight="fill" />}
      >
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-2 border-app-secondary/30 border-t-app-secondary rounded-full animate-spin" />
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Informações da Empresa"
      description="Dados cadastrais da empresa"
      icon={<Buildings className="w-5 h-5" weight="fill" />}
      actions={
        <div className="flex items-center gap-2">
          <CancelButton />
          <EditButton />
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Razão Social"
          placeholder="Nome da empresa"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          disabled={!isEditing}
        />

        <Input
          label="Nome Fantasia"
          placeholder="Nome fantasia"
          value={formData.tradeName}
          onChange={(e) => handleChange('tradeName', e.target.value)}
          error={errors.tradeName}
          disabled={!isEditing}
        />

        <Input
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          value={formData.cnpj}
          onChange={(e) => handleChange('cnpj', e.target.value)}
          error={errors.cnpj}
          disabled={!isEditing}
        />

        <Input
          label="Departamento"
          placeholder="Ex: Tecnologia da Informação"
          value={formData.department}
          onChange={(e) => handleChange('department', e.target.value)}
          error={errors.department}
          disabled={!isEditing}
        />

        <Input
          label="Email"
          type="email"
          placeholder="contato@empresa.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          disabled={!isEditing}
        />

        <Input
          label="Telefone"
          placeholder="(00) 00000-0000"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          disabled={!isEditing}
        />

        <div className="relative">
          <Input
            label="CEP"
            placeholder="00000-000"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            error={errors.zipCode}
            disabled={!isEditing || isLoadingCep}
          />
          {isLoadingCep && (
            <div className="absolute right-3 top-9">
              <CircleNotch className="w-5 h-5 text-app-secondary animate-spin" weight="bold" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <Input
              label="Endereço"
              placeholder="Rua, Avenida..."
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              error={errors.address}
              disabled={!isEditing}
            />
          </div>
          <Input
            label="Número"
            placeholder="123"
            value={formData.addressNumber}
            onChange={(e) => handleChange('addressNumber', e.target.value)}
            error={errors.addressNumber}
            disabled={!isEditing}
          />
        </div>

        <Input
          label="Bairro"
          placeholder="Bairro"
          value={formData.neighborhood}
          onChange={(e) => handleChange('neighborhood', e.target.value)}
          error={errors.neighborhood}
          disabled={!isEditing}
        />

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <Input
              label="Cidade"
              placeholder="Cidade"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              error={errors.city}
              disabled={!isEditing}
            />
          </div>
          <Input
            label="UF"
            placeholder="UF"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            error={errors.state}
            disabled={!isEditing}
          />
        </div>

        <Input
          label="Complemento"
          placeholder="Apto, Sala, Bloco... (opcional)"
          value={formData.complement}
          onChange={(e) => handleChange('complement', e.target.value)}
          error={errors.complement}
          disabled={!isEditing}
        />
      </div>
    </SettingsSection>
  );
}
