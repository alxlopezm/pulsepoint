import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Update } from '../types/database'

export function useUpdates(initiativeId: string | undefined) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUpdates = useCallback(async () => {
    if (!initiativeId) return
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .eq('initiative_id', initiativeId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setUpdates(data ?? [])
    }
    setLoading(false)
  }, [initiativeId])

  useEffect(() => {
    if (!initiativeId) return
    setLoading(true)
    fetchUpdates()

    const channel = supabase
      .channel(`updates-${initiativeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'updates', filter: `initiative_id=eq.${initiativeId}` },
        () => fetchUpdates(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initiativeId, fetchUpdates])

  return { updates, loading, error, refetch: fetchUpdates }
}
