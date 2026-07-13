import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useInitiative } from '../hooks/useInitiative'
import { useBusinessUnits } from '../hooks/useBusinessUnits'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorState } from '../components/ErrorState'
import { priorityDotColor, statusMeta } from '../utils/initiativeDisplay'
import { formatDate } from '../utils/formatDate'

export function InitiativeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { initiative, loading, error, refetch } = useInitiative(id)
  const { businessUnits } = useBusinessUnits()

  const businessUnitName = businessUnits.find(
    (bu) => bu.id === initiative?.business_unit_id,
  )?.name

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-1.5 text-sm text-secondary-light transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </button>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <ErrorState message={`Couldn't load this initiative: ${error}`} onRetry={refetch} />
      )}

      {!loading && !error && !initiative && (
        <p className="py-16 text-center text-sm text-secondary-light">
          This initiative doesn't exist or you don't have access to it.
        </p>
      )}

      {!loading && !error && initiative && (
        <div className="flex flex-col gap-4 rounded-lg border border-secondary-light/20 bg-white p-6 dark:border-secondary-light/10 dark:bg-secondary-light/5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold text-secondary dark:text-secondary-lighter">
              {initiative.name}
            </h1>
            <span
              title={`${initiative.priority} priority`}
              className={`mt-2 h-3 w-3 shrink-0 rounded-full ${priorityDotColor[initiative.priority]}`}
            />
          </div>

          {initiative.description && (
            <p className="text-sm text-secondary-light">{initiative.description}</p>
          )}

          {(() => {
            const status = statusMeta[initiative.status]
            const StatusIcon = status.icon
            return (
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
              >
                <StatusIcon size={13} />
                {status.label}
              </span>
            )
          })()}

          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-secondary-light/20 pt-4 text-sm dark:border-secondary-light/10 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-secondary-light">Owner</dt>
              <dd className="mt-0.5 text-secondary dark:text-secondary-lighter">
                {initiative.owner || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-light">Business unit</dt>
              <dd className="mt-0.5 text-secondary dark:text-secondary-lighter">
                {businessUnitName ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-light">Type</dt>
              <dd className="mt-0.5 text-secondary dark:text-secondary-lighter">
                {initiative.type}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-light">Timeline</dt>
              <dd className="mt-0.5 text-secondary dark:text-secondary-lighter">
                {formatDate(initiative.start_date)} – {formatDate(initiative.end_date)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
