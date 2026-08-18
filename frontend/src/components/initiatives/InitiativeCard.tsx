import { Pencil, Trash2 } from 'lucide-react'
import type { Initiative } from '../../types/database'
import { priorityDotColor, statusMeta } from '../../utils/initiativeDisplay'
import { initiativeTypeLabels } from '../../utils/enumLabels'

interface InitiativeCardProps {
  initiative: Initiative
  businessUnitName: string
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function InitiativeCard({
  initiative,
  businessUnitName,
  onClick,
  onEdit,
  onDelete,
}: InitiativeCardProps) {
  const status = statusMeta[initiative.status]
  const StatusIcon = status.icon

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="group relative flex flex-col gap-3 rounded-lg border border-secondary-light/20 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-secondary-light/10 dark:bg-secondary-light/5"
    >
      {(onEdit || onDelete) && (
        <div className="absolute right-3 top-3 flex gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              aria-label="Edit initiative"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="rounded-md p-1.5 text-secondary-light transition-colors hover:bg-secondary-lighter hover:text-secondary dark:hover:bg-secondary-light/10 dark:hover:text-secondary-lighter"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label="Delete initiative"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="rounded-md p-1.5 text-secondary-light transition-colors hover:bg-accent-light/20 hover:text-accent dark:hover:bg-accent-dark/20"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-2 pr-12">
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
        <span>{initiativeTypeLabels[initiative.type]}</span>
      </div>

      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
      >
        <StatusIcon size={13} />
        {status.label}
      </span>
    </div>
  )
}
