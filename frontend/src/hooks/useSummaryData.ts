import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { socket } from '../lib/socket'
import type { Initiative, NextStep, Update } from '../types/database'

export interface InitiativeSummary {
  initiative: Initiative
  recentUpdates: Update[]
  pendingNextSteps: NextStep[]
}

export function useSummaryData() {
  const [summaries, setSummaries] = useState<InitiativeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      const data = await api.get<InitiativeSummary[]>('/api/summary')
      setSummaries(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()

    socket.on('summary:changed', fetchSummary)
    return () => {
      socket.off('summary:changed', fetchSummary)
    }
  }, [fetchSummary])

  return { summaries, loading, error, refetch: fetchSummary }
}
