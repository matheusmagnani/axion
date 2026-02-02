import { useState } from 'react';
import { Input } from '@shared/components/ui';
import { User, IdentificationCard, Envelope, Phone } from '@phosphor-icons/react';

export interface AssociateFormData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface AssociateFormProps {
  onSubmit: (data: AssociateFormData) => void;
  onCancel: () => void;
  initialData?: AssociateFormData;
}

export function AssociateForm({ onSubmit, onCancel, initialData }: AssociateFormProps) {
  const isEdit = !!initialData;

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
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

  const [formData, setFormData] = useState<AssociateFormData>({
    name: initialData?.name ?? '',
    cpf: initialData ? formatCPF(initialData.cpf) : '',
    email: initialData?.email ?? '',
    phone: initialData ? formatPhone(initialData.phone) : '',
  });

  const [errors, setErrors] = useState<Partial<AssociateFormData>>({});

  const handleChange = (field: keyof AssociateFormData, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<AssociateFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    const cpfClean = formData.cpf.replace(/\D/g, '');
    if (!cpfClean) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (cpfClean.length !== 11) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    const phoneClean = formData.phone.replace(/\D/g, '');
    if (!phoneClean) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (phoneClean.length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 min-w-[400px]">
      <Input
        label="Nome completo"
        placeholder="Digite o nome completo"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        icon={<User className="w-5 h-5" weight="regular" />}
      />

      <Input
        label="CPF"
        placeholder="000.000.000-00"
        value={formData.cpf}
        onChange={(e) => handleChange('cpf', e.target.value)}
        error={errors.cpf}
        icon={<IdentificationCard className="w-5 h-5" weight="regular" />}
        disabled={isEdit}
      />

      <Input
        label="Email"
        type="email"
        placeholder="exemplo@email.com"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        icon={<Envelope className="w-5 h-5" weight="regular" />}
      />

      <Input
        label="Telefone"
        placeholder="(00) 00000-0000"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
        icon={<Phone className="w-5 h-5" weight="regular" />}
      />

      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-app-secondary/70 hover:text-app-secondary transition-colors rounded-[10px] hover:bg-app-secondary/10"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-app-secondary text-app-primary font-medium rounded-[10px] hover:bg-app-secondary/90 transition-colors"
        >
          {isEdit ? 'Salvar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
}
