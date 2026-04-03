import { useNavigate } from 'react-router-dom';
import { Building2, User, Calendar, Tag } from 'lucide-react';
import type { Initiative } from '../types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface InitiativeCardProps {
  initiative: Initiative;
}

export default function InitiativeCard({ initiative }: InitiativeCardProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(initiative.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => navigate(`/initiatives/${initiative.id}`)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-secondary dark:text-white group-hover:text-primary dark:group-hover:text-accent-light transition-colors line-clamp-2">
          {initiative.name}
        </h3>
        <PriorityBadge priority={initiative.priority} size="sm" />
      </div>

      {/* Type tag */}
      <div className="flex items-center gap-1.5 mb-3">
        <Tag className="w-3.5 h-3.5 text-secondary-light flex-shrink-0" />
        <span className="text-xs text-secondary-light truncate">{initiative.type}</span>
      </div>

      {/* Status */}
      <div className="mb-4">
        <StatusBadge status={initiative.status} size="sm" />
      </div>

      {/* Meta */}
      <div className="space-y-1.5 text-xs text-secondary-light">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{initiative.owner}</span>
        </div>
        {initiative.business_unit_name && (
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{initiative.business_unit_name}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Description preview */}
      {initiative.description && (
        <p className="mt-3 text-xs text-secondary-light line-clamp-2 border-t border-gray-100 dark:border-gray-700 pt-3">
          {initiative.description}
        </p>
      )}
    </div>
  );
}
