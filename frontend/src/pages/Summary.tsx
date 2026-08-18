import { useMemo } from 'react'
import { useSummaryData } from '../hooks/useSummaryData'
import { useBusinessUnits } from '../hooks/useBusinessUnits'
import { SummaryCard } from '../components/initiatives/SummaryCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorState } from '../components/ErrorState'

export function Summary() {
  const { summaries, loading, error, refetch } = useSummaryData()
  const { businessUnits } = useBusinessUnits()

  const businessUnitNameById = useMemo(
    () => new Map(businessUnits.map((bu) => [bu.id, bu.name])),
    [businessUnits],
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-secondary dark:text-secondary-lighter">
        Summary
      </h1>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <ErrorState message={`Couldn't load summary: ${error}`} onRetry={refetch} />
      )}

      {!loading && !error && summaries.length === 0 && (
        <p className="py-16 text-center text-sm text-secondary-light">No initiatives yet.</p>
      )}

      {!loading && !error && summaries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map(({ initiative, recentUpdates, pendingNextSteps }) => (
            <SummaryCard
              key={initiative.id}
              initiative={initiative}
              businessUnitName={businessUnitNameById.get(initiative.business_unit_id) ?? 'Unknown'}
              recentUpdates={recentUpdates}
              pendingNextSteps={pendingNextSteps}
            />
          ))}
        </div>
      )}
    </div>
  )
}
