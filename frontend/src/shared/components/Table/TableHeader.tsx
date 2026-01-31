import type { ReactNode } from 'react';

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={className}>
      <tr>{children}</tr>
    </thead>
  );
}
