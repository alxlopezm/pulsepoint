import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { NextStep } from '../types/database'

export function useNextSteps(initiativeId: string | undefined) {
  const [nextSteps, setNextSteps] = useState<NextStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNextSteps = useCallback(async () => {
    if (!initiativeId) return
    const { data, error } = await supabase
      .from('next_steps')
      .select('*')
      .eq('initiative_id', initiativeId)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setNextSteps(data ?? [])
    }
    setLoading(false)
  }, [initiativeId])

  useEffect(() => {
    if (!initiativeId) return
    setLoading(true)
    fetchNextSteps()

    const channel = supabase
      .channel(`next-steps-${initiativeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'next_steps',
          filter: `initiative_id=eq.${initiativeId}`,
        },
        () => fetchNextSteps(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initiativeId, fetchNextSteps])

  return { nextSteps, loading, error, refetch: fetchNextSteps }
}
