import type { InitiativeStatus } from '../types';

interface StatusBadgeProps {
  status: InitiativeStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<InitiativeStatus, { label: string; className: string }> = {
  Requested: {
    label: 'Requested',
    className: 'bg-accent-light text-accent-dark',
  },
  'In Design': {
    label: 'In Design',
    className: 'bg-primary text-white',
  },
  'In Assessment': {
    label: 'In Assessment',
    className: 'bg-primary-dark text-white',
  },
  Approved: {
    label: 'Approved',
    className: 'bg-accent text-white',
  },
  'In Development': {
    label: 'In Development',
    className: 'bg-accent-dark text-white',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
