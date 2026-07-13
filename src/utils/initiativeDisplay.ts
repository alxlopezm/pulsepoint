import { CheckCircle2, Code2, Inbox, PenTool, Search, type LucideIcon } from 'lucide-react'
import type { InitiativeStatus, Priority } from '../types/database'

export const priorityDotColor: Record<Priority, string> = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
}

interface StatusMeta {
  label: string
  icon: LucideIcon
  className: string
}

export const statusMeta: Record<InitiativeStatus, StatusMeta> = {
  Requested: {
    label: 'Requested',
    icon: Inbox,
    className:
      'bg-secondary-light/20 text-secondary dark:bg-secondary-light/10 dark:text-secondary-lighter',
  },
  'In Design': {
    label: 'In Design',
    icon: PenTool,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  },
  'In Assessment': {
    label: 'In Assessment',
    icon: Search,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  Approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  'In Development': {
    label: 'In Development',
    icon: Code2,
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
}
