import { useState } from 'react';
import { Input } from '@shared/components/ui';
import { User, IdentificationCard, Envelope, Phone } from '@phosphor-icons/react';

interface AssociateFormProps {
  onSubmit: (data: AssociateFormData) => void;
  onCancel: () => void;
}

export interface AssociateFormData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

export function AssociateForm({ onSubmit, onCancel }: AssociateFormProps) {
  const [formData, setFormData] = useState<AssociateFormData>({
    name: '',
    cpf: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<AssociateFormData>>({});

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

  const handleChange = (field: keyof AssociateFormData, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<AssociateFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const cpfClean = formData.cpf.replace(/\D/g, '');
    if (!cpfClean) {
      newErrors.cpf = 'CPF is required';
    } else if (cpfClean.length !== 11) {
      newErrors.cpf = 'Invalid CPF';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    const phoneClean = formData.phone.replace(/\D/g, '');
    if (!phoneClean) {
      newErrors.phone = 'Phone is required';
    } else if (phoneClean.length < 10) {
      newErrors.phone = 'Invalid phone';
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
      {/* Name */}
      <Input
        label="Full name"
        placeholder="Enter full name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        icon={<User className="w-5 h-5" weight="regular" />}
      />

      {/* CPF */}
      <Input
        label="CPF"
        placeholder="000.000.000-00"
        value={formData.cpf}
        onChange={(e) => handleChange('cpf', e.target.value)}
        error={errors.cpf}
        icon={<IdentificationCard className="w-5 h-5" weight="regular" />}
      />

      {/* Email */}
      <Input
        label="Email"
        type="email"
        placeholder="example@email.com"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        icon={<Envelope className="w-5 h-5" weight="regular" />}
      />

      {/* Phone */}
      <Input
        label="Phone"
        placeholder="(00) 00000-0000"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
        icon={<Phone className="w-5 h-5" weight="regular" />}
      />

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-secondary/70 hover:text-secondary transition-colors rounded-[10px] hover:bg-secondary/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-secondary text-primary font-medium rounded-[10px] hover:bg-secondary/90 transition-colors"
        >
          Register
        </button>
      </div>
    </form>
  );
}
