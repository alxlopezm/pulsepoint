import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Initiative } from '../types/database'

export function useInitiatives() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInitiatives = useCallback(async () => {
    const { data, error } = await supabase
      .from('initiatives')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setInitiatives(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchInitiatives()

    const channel = supabase
      .channel('initiatives-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'initiatives' }, () => {
        fetchInitiatives()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchInitiatives])

  return { initiatives, loading, error, refetch: fetchInitiatives }
}
