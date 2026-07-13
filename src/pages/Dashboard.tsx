import { useMemo } from 'react'
import { useInitiatives } from '../hooks/useInitiatives'
import { useBusinessUnits } from '../hooks/useBusinessUnits'
import { InitiativeCard } from '../components/initiatives/InitiativeCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorState } from '../components/ErrorState'

export function Dashboard() {
  const { initiatives, loading, error, refetch } = useInitiatives()
  const { businessUnits } = useBusinessUnits()

  const businessUnitNameById = useMemo(
    () => new Map(businessUnits.map((bu) => [bu.id, bu.name])),
    [businessUnits],
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary dark:text-secondary-lighter">
          Dashboard
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <ErrorState message={`Couldn't load initiatives: ${error}`} onRetry={refetch} />
      )}

      {!loading && !error && initiatives.length === 0 && (
        <p className="py-16 text-center text-sm text-secondary-light">No initiatives yet.</p>
      )}

      {!loading && !error && initiatives.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((initiative) => (
            <InitiativeCard
              key={initiative.id}
              initiative={initiative}
              businessUnitName={businessUnitNameById.get(initiative.business_unit_id) ?? 'Unknown'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
