import { AlertTriangle, CheckCircle2, Clock, PlayCircle, type LucideIcon } from 'lucide-react'
import type { NextStep, NextStepStatus } from '../types/database'

function todayISODate() {
  return new Date().toISOString().slice(0, 10)
}

// Status is stored server-side and kept in sync on every write, but this
// covers the gap between "due date passed" and the next write/read sync.
export function effectiveNextStepStatus(
  nextStep: Pick<NextStep, 'status' | 'due_date'>,
): NextStepStatus {
  if (nextStep.status === 'completed') return 'completed'
  if (nextStep.due_date && nextStep.due_date < todayISODate()) return 'overdue'
  return nextStep.status
}

interface NextStepStatusMeta {
  label: string
  icon: LucideIcon
  className: string
}

export const nextStepStatusMeta: Record<NextStepStatus, NextStepStatusMeta> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'text-secondary-light',
  },
  started: {
    label: 'Started',
    icon: PlayCircle,
    className: 'text-blue-600 dark:text-blue-400',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertTriangle,
    className: 'text-accent',
  },
}
