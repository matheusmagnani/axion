import { useState } from 'react';
import { Input } from '@shared/components/ui';
import { Lock } from '@phosphor-icons/react';

interface ChangePasswordFormProps {
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export function ChangePasswordForm({ onSubmit, onCancel }: ChangePasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 min-w-[400px]">
      <Input
        label="Nova senha"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
        icon={<Lock className="w-5 h-5" weight="regular" />}
      />

      <Input
        label="Confirmar senha"
        type="password"
        placeholder="Repita a senha"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }}
        error={errors.confirmPassword}
        icon={<Lock className="w-5 h-5" weight="regular" />}
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
          Alterar
        </button>
      </div>
    </form>
  );
}
