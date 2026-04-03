import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import type { InitiativePriority } from '../types';

interface PriorityBadgeProps {
  priority: InitiativePriority;
  size?: 'sm' | 'md';
}

const priorityConfig: Record<
  InitiativePriority,
  { className: string; icon: typeof ArrowUp }
> = {
  High: {
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: ArrowUp,
  },
  Medium: {
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: ArrowRight,
  },
  Low: {
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: ArrowDown,
  },
};

export default function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = priorityConfig[priority] ?? {
    className: 'bg-gray-100 text-gray-600',
    icon: ArrowRight,
  };
  const Icon = config.icon;

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-3 py-1 text-sm gap-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}
    >
      <Icon className={iconSize} />
      {priority}
    </span>
  );
}
