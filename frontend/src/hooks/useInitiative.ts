import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { socket } from '../lib/socket'
import type { Initiative } from '../types/database'

export function useInitiative(id: string | undefined) {
  const [initiative, setInitiative] = useState<Initiative | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInitiative = useCallback(async () => {
    if (!id) return
    try {
      const data = await api.get<Initiative>(`/api/initiatives/${id}`)
      setInitiative(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load initiative')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchInitiative()

    const handleChange = (payload: { id: string }) => {
      if (payload.id === id) fetchInitiative()
    }
    socket.on('initiative:changed', handleChange)
    return () => {
      socket.off('initiative:changed', handleChange)
    }
  }, [id, fetchInitiative])

  return { initiative, loading, error, refetch: fetchInitiative }
}
