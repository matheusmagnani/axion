interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-green-500/20 text-green-400 border-green-500/50',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-red-500/20 text-red-400 border-red-500/50',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-500/20 text-green-400 border-green-500/50',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-red-500/20 text-red-400 border-red-500/50',
  },
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

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
