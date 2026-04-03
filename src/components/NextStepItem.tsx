import { Edit2, Trash2, AlertTriangle, Calendar, User, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { NextStep } from '../types';

interface NextStepItemProps {
  nextStep: NextStep;
  onEdit: (nextStep: NextStep) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  pending: {
    icon: Circle,
    className: 'text-secondary-light',
    label: 'Pending',
  },
  started: {
    icon: Clock,
    className: 'text-yellow-500',
    label: 'In Progress',
  },
  completed: {
    icon: CheckCircle2,
    className: 'text-green-500',
    label: 'Completed',
  },
};

export default function NextStepItem({ nextStep, onEdit, onDelete }: NextStepItemProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = nextStep.due_date ? new Date(nextStep.due_date) : null;
  const isOverdue =
    dueDate &&
    dueDate < today &&
    nextStep.status !== 'completed';

  const config = statusConfig[nextStep.status];
  const StatusIcon = config.icon;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${
        isOverdue
          ? 'border-primary/40 bg-red-50/50 dark:bg-red-900/10'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="mt-0.5 flex-shrink-0">
          <StatusIcon className={`w-5 h-5 ${config.className}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium ${
                nextStep.status === 'completed'
                  ? 'line-through text-secondary-light'
                  : 'text-secondary dark:text-white'
              }`}
            >
              {nextStep.title}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(nextStep)}
                className="p-1.5 rounded text-secondary-light hover:text-primary hover:bg-secondary-lighter dark:hover:bg-gray-700 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(nextStep.id)}
                className="p-1.5 rounded text-secondary-light hover:text-primary hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mt-1.5">
            {nextStep.responsible && (
              <span className="flex items-center gap-1 text-xs text-secondary-light">
                <User className="w-3 h-3" />
                {nextStep.responsible}
              </span>
            )}
            {dueDate && (
              <span
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-primary font-medium' : 'text-secondary-light'
                }`}
              >
                <Calendar className="w-3 h-3" />
                Due {formatDate(nextStep.due_date!)}
              </span>
            )}
            <span className={`text-xs ${config.className}`}>{config.label}</span>
          </div>

          {/* Overdue warning */}
          {isOverdue && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Overdue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
