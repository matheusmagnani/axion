interface StatusBadgeProps {
  status: number;
}

const statusConfig: Record<number, { label: string; className: string }> = {
  0: {
    label: 'Inativo',
    className: 'bg-red-500/20 text-red-400 border-red-500/50',
  },
  1: {
    label: 'Ativo',
    className: 'bg-green-500/20 text-green-400 border-green-500/50',
  },
  2: {
    label: 'Pendente',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig[0];

  return (
    <span className={`
      inline-flex items-center justify-center px-2 md:px-3 py-0.5 md:py-1 rounded-full
      text-xs md:text-sm font-medium border whitespace-nowrap
      ${config.className}
    `}>
      {config.label}
    </span>
  );
}
