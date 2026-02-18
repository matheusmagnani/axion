import type { ReactNode } from 'react';
import { Checkbox } from '@shared/components/ui/Checkbox';

interface ListCardProps {
  children: ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  columns: string;
  onClick?: () => void;
}

export function ListCard({ children, isSelected, onSelect, columns, onClick }: ListCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    if (!onClick) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, [role="checkbox"], a')) return;
    onClick();
  };

  return (
    <div
      data-card
      onClick={handleCardClick}
      className={`flex-shrink-0 grid ${columns} items-center bg-app-primary/30 py-4 px-4 rounded-[10px] border-[0.5px] border-app-secondary/30 relative ${onClick ? 'cursor-pointer hover:bg-app-primary/50 transition-colors' : ''}`}
    >
      {/* Selection overlay animation */}
      <div
        className={`
          absolute inset-0 rounded-[10px] border-[0.5px] border-app-secondary pointer-events-none
          transition-all duration-500 ease-out
          ${isSelected ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          clipPath: isSelected ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
        }}
      />

      {/* Checkbox */}
      <div className="flex items-center justify-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </div>

      {children}
    </div>
  );
}
