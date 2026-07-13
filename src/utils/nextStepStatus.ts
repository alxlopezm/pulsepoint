import { AlertTriangle, CheckCircle2, Clock, type LucideIcon } from 'lucide-react'
import type { NextStep, NextStepDerivedStatus } from '../types/database'

function todayISODate() {
  return new Date().toISOString().slice(0, 10)
}

export function deriveNextStepStatus(
  nextStep: Pick<NextStep, 'completion_date' | 'due_date'>,
): NextStepDerivedStatus {
  if (nextStep.completion_date) return 'completed'
  if (nextStep.due_date && nextStep.due_date < todayISODate()) return 'overdue'
  return 'pending'
}

interface NextStepStatusMeta {
  label: string
  icon: LucideIcon
  className: string
}

export const nextStepStatusMeta: Record<NextStepDerivedStatus, NextStepStatusMeta> = {
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
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'text-secondary-light',
  },
}
