import { CheckCircle2, Code2, Inbox, PenTool, Search, type LucideIcon } from 'lucide-react'
import type { InitiativeStatus, Priority } from '../types/database'
import { initiativeStatusLabels } from './enumLabels'

export const priorityDotColor: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
}

interface StatusMeta {
  label: string
  icon: LucideIcon
  className: string
}

export const statusMeta: Record<InitiativeStatus, StatusMeta> = {
  requested: {
    label: initiativeStatusLabels.requested,
    icon: Inbox,
    className:
      'bg-secondary-light/20 text-secondary dark:bg-secondary-light/10 dark:text-secondary-lighter',
  },
  in_design: {
    label: initiativeStatusLabels.in_design,
    icon: PenTool,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  },
  in_assessment: {
    label: initiativeStatusLabels.in_assessment,
    icon: Search,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  approved: {
    label: initiativeStatusLabels.approved,
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  in_development: {
    label: initiativeStatusLabels.in_development,
    icon: Code2,
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
}
