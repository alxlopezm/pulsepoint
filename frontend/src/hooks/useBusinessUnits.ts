import { useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import type { BusinessUnit } from '../types/database'

export function useBusinessUnits() {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get<BusinessUnit[]>('/api/business-units')
      .then((data) => {
        if (cancelled) return
        setBusinessUnits(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load business units')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { businessUnits, loading, error }
}
