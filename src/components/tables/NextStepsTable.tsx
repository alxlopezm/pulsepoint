import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { NextStep } from '../../types/database'
import { deriveNextStepStatus, nextStepStatusMeta } from '../../utils/nextStepStatus'
import { formatDate } from '../../utils/formatDate'

interface NextStepsTableProps {
  nextSteps: NextStep[]
  onEdit: (nextStep: NextStep) => void
  onDelete: (nextStep: NextStep) => void
}

export function NextStepsTable({ nextSteps, onEdit, onDelete }: NextStepsTableProps) {
  const [showAll, setShowAll] = useState(false)

  const visible = showAll
    ? nextSteps
    : nextSteps.filter((step) => deriveNextStepStatus(step) !== 'completed')

  return (
    <div>
      <div className="mb-3 flex w-fit rounded-md border border-secondary-light/30 p-0.5 text-xs dark:border-secondary-light/20">
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className={`rounded px-3 py-1 font-medium transition-colors ${
            !showAll
              ? 'bg-primary text-white'
              : 'text-secondary-light hover:text-secondary dark:hover:text-secondary-lighter'
          }`}
        >
          Pending only
        </button>
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className={`rounded px-3 py-1 font-medium transition-colors ${
            showAll
              ? 'bg-primary text-white'
              : 'text-secondary-light hover:text-secondary dark:hover:text-secondary-lighter'
          }`}
        >
          All
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-secondary-light">
          No {showAll ? '' : 'pending '}next steps.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-secondary-light/20 text-xs text-secondary-light dark:border-secondary-light/10">
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Description</th>
                <th className="py-2 pr-4 font-medium">Responsible</th>
                <th className="py-2 pr-4 font-medium">Due</th>
                <th className="py-2 pr-4 font-medium">Completed</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((step) => {
                const derived = deriveNextStepStatus(step)
                const meta = nextStepStatusMeta[derived]
                const StatusIcon = meta.icon
                return (
                  <tr
                    key={step.id}
                    className="border-b border-secondary-light/10 last:border-0 dark:border-secondary-light/5"
                  >
                    <td className="py-3 pr-3 align-top">
                      <StatusIcon size={16} className={meta.className} aria-label={meta.label} />
                    </td>
                    <td className="py-3 pr-4 align-top text-secondary dark:text-secondary-lighter">
                      {step.description}
                    </td>
                    <td className="py-3 pr-4 align-top text-secondary-light">
                      {step.responsible || '—'}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 align-top text-secondary-light">
                      {formatDate(step.due_date)}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 align-top text-secondary-light">
                      {formatDate(step.completion_date)}
                    </td>
                    <td className="py-3 align-top">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="Edit next step"
                          onClick={() => onEdit(step)}
                          className="rounded-md p-1.5 text-secondary-light transition-colors hover:bg-secondary-lighter hover:text-secondary dark:hover:bg-secondary-light/10 dark:hover:text-secondary-lighter"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete next step"
                          onClick={() => onDelete(step)}
                          className="rounded-md p-1.5 text-secondary-light transition-colors hover:bg-accent-light/20 hover:text-accent dark:hover:bg-accent-dark/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
