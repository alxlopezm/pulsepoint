import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { socket } from '../lib/socket'
import type { NextStep } from '../types/database'

export function useNextSteps(initiativeId: string | undefined) {
  const [nextSteps, setNextSteps] = useState<NextStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNextSteps = useCallback(async () => {
    if (!initiativeId) return
    try {
      const data = await api.get<NextStep[]>(`/api/initiatives/${initiativeId}/next-steps`)
      setNextSteps(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load next steps')
    } finally {
      setLoading(false)
    }
  }, [initiativeId])

  useEffect(() => {
    if (!initiativeId) return
    setLoading(true)
    fetchNextSteps()

    const handleChange = (payload: { initiativeId: string }) => {
      if (payload.initiativeId === initiativeId) fetchNextSteps()
    }
    socket.on('next-steps:changed', handleChange)
    return () => {
      socket.off('next-steps:changed', handleChange)
    }
  }, [initiativeId, fetchNextSteps])

  return { nextSteps, loading, error, refetch: fetchNextSteps }
}
