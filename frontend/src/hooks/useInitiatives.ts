import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { socket } from '../lib/socket'
import type { Initiative } from '../types/database'

export function useInitiatives() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInitiatives = useCallback(async () => {
    try {
      const data = await api.get<Initiative[]>('/api/initiatives')
      setInitiatives(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load initiatives')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitiatives()

    socket.on('initiatives:changed', fetchInitiatives)
    return () => {
      socket.off('initiatives:changed', fetchInitiatives)
    }
  }, [fetchInitiatives])

  return { initiatives, loading, error, refetch: fetchInitiatives }
}
