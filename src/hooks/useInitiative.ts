import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Initiative } from '../types/database'

export function useInitiative(id: string | undefined) {
  const [initiative, setInitiative] = useState<Initiative | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInitiative = useCallback(async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('initiatives')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setInitiative(data)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchInitiative()

    const channel = supabase
      .channel(`initiative-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'initiatives', filter: `id=eq.${id}` },
        () => fetchInitiative(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, fetchInitiative])

  return { initiative, loading, error, refetch: fetchInitiative }
}
