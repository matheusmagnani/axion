import { ReactNode } from 'react';
import { MagicBentoCard } from '@shared/components/ui';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  actions?: ReactNode;
}

export function SettingsSection({
  title,
  description,
  icon,
  children,
  isExpanded = true,
  onToggle,
  actions,
}: SettingsSectionProps) {
  return (
    <MagicBentoCard className="bg-app-primary rounded-2xl border border-app-secondary/20">
      <div
        className={`flex items-center justify-between p-6 ${onToggle ? 'cursor-pointer hover:bg-app-secondary/5 transition-colors' : ''}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-app-secondary/10 flex items-center justify-center text-app-secondary">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-app-secondary">{title}</h3>
            {description && (
              <p className="text-sm text-app-secondary font-extralight mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-2 border-t border-app-secondary/10">
          {children}
        </div>
      </div>
    </MagicBentoCard>
  );
}
