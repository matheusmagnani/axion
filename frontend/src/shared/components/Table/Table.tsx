import type { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`rounded-[10px] ${className}`}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}
