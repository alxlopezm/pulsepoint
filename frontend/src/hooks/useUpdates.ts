import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { socket } from '../lib/socket'
import type { Update } from '../types/database'

export function useUpdates(initiativeId: string | undefined) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUpdates = useCallback(async () => {
    if (!initiativeId) return
    try {
      const data = await api.get<Update[]>(`/api/initiatives/${initiativeId}/updates`)
      setUpdates(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load updates')
    } finally {
      setLoading(false)
    }
  }, [initiativeId])

  useEffect(() => {
    if (!initiativeId) return
    setLoading(true)
    fetchUpdates()

    const handleChange = (payload: { initiativeId: string }) => {
      if (payload.initiativeId === initiativeId) fetchUpdates()
    }
    socket.on('updates:changed', handleChange)
    return () => {
      socket.off('updates:changed', handleChange)
    }
  }, [initiativeId, fetchUpdates])

  return { updates, loading, error, refetch: fetchUpdates }
}
