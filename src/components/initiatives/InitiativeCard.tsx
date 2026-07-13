import type { Initiative } from '../../types/database'
import { priorityDotColor, statusMeta } from '../../utils/initiativeDisplay'

interface InitiativeCardProps {
  initiative: Initiative
  businessUnitName: string
  onClick?: () => void
}

export function InitiativeCard({ initiative, businessUnitName, onClick }: InitiativeCardProps) {
  const status = statusMeta[initiative.status]
  const StatusIcon = status.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-3 rounded-lg border border-secondary-light/20 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-secondary-light/10 dark:bg-secondary-light/5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-secondary dark:text-secondary-lighter">{initiative.name}</h3>
        <span
          title={`${initiative.priority} priority`}
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${priorityDotColor[initiative.priority]}`}
        />
      </div>

      {initiative.description && (
        <p className="line-clamp-2 text-sm text-secondary-light">{initiative.description}</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-light">
        {initiative.owner && <span>Owner: {initiative.owner}</span>}
        <span>{businessUnitName}</span>
        <span>{initiative.type}</span>
      </div>

      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
      >
        <StatusIcon size={13} />
        {status.label}
      </span>
    </button>
  )
}
