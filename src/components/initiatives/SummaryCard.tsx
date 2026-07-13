import type { Initiative, NextStep, Update } from '../../types/database'
import { statusMeta } from '../../utils/initiativeDisplay'
import { deriveNextStepStatus, nextStepStatusMeta } from '../../utils/nextStepStatus'
import { formatDate } from '../../utils/formatDate'

interface SummaryCardProps {
  initiative: Initiative
  businessUnitName: string
  recentUpdates: Update[]
  pendingNextSteps: NextStep[]
}

export function SummaryCard({
  initiative,
  businessUnitName,
  recentUpdates,
  pendingNextSteps,
}: SummaryCardProps) {
  const status = statusMeta[initiative.status]
  const StatusIcon = status.icon

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-secondary-light/20 bg-white p-5 dark:border-secondary-light/10 dark:bg-secondary-light/5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-secondary dark:text-secondary-lighter">
            {initiative.name}
          </h3>
          <p className="text-xs text-secondary-light">{businessUnitName}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
        >
          <StatusIcon size={13} />
          {status.label}
        </span>
      </div>

      <div>
        <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-light">
          Recent updates
        </h4>
        {recentUpdates.length === 0 ? (
          <p className="text-sm text-secondary-light">No updates yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {recentUpdates.map((update) => (
              <li key={update.id} className="text-sm text-secondary dark:text-secondary-lighter">
                <span className="text-secondary-light">{formatDate(update.date)} — </span>
                {update.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-light">
          Pending next steps
        </h4>
        {pendingNextSteps.length === 0 ? (
          <p className="text-sm text-secondary-light">Nothing pending.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {pendingNextSteps.map((step) => {
              const meta = nextStepStatusMeta[deriveNextStepStatus(step)]
              const StepIcon = meta.icon
              return (
                <li
                  key={step.id}
                  className="flex items-start gap-1.5 text-sm text-secondary dark:text-secondary-lighter"
                >
                  <StepIcon size={14} className={`mt-0.5 shrink-0 ${meta.className}`} />
                  <span>
                    {step.description}
                    {step.due_date && (
                      <span className="text-secondary-light"> (due {formatDate(step.due_date)})</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
