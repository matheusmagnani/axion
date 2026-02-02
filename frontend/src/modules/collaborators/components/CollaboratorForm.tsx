import { useState } from 'react';
import { Input } from '@shared/components/ui';
import { User, Envelope, Lock } from '@phosphor-icons/react';

export interface CollaboratorFormData {
  name: string;
  email: string;
  password?: string;
}

interface CollaboratorFormProps {
  onSubmit: (data: CollaboratorFormData) => void;
  onCancel: () => void;
  initialData?: { name: string; email: string };
}

export function CollaboratorForm({ onSubmit, onCancel, initialData }: CollaboratorFormProps) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (isEdit) {
        onSubmit({ name: formData.name, email: formData.email });
      } else {
        onSubmit(formData);
      }
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
        label="Email"
        type="email"
        placeholder="exemplo@email.com"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        icon={<Envelope className="w-5 h-5" weight="regular" />}
      />

      {!isEdit && (
        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          icon={<Lock className="w-5 h-5" weight="regular" />}
        />
      )}

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
