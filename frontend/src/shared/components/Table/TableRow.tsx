import type { ReactNode } from 'react';

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = '', onClick }: TableRowProps) {
  return (
    <tr 
      className={className}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
