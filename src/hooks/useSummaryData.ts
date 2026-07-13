import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { deriveNextStepStatus } from '../utils/nextStepStatus'
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
    const { data: initiatives, error: initiativesError } = await supabase
      .from('initiatives')
      .select('*')
      .order('created_at', { ascending: false })

    if (initiativesError) {
      setError(initiativesError.message)
      setLoading(false)
      return
    }

    const ids = (initiatives ?? []).map((i) => i.id)

    if (ids.length === 0) {
      setSummaries([])
      setError(null)
      setLoading(false)
      return
    }

    const [updatesResult, nextStepsResult] = await Promise.all([
      supabase.from('updates').select('*').in('initiative_id', ids).order('date', { ascending: false }),
      supabase.from('next_steps').select('*').in('initiative_id', ids),
    ])

    if (updatesResult.error || nextStepsResult.error) {
      setError(updatesResult.error?.message ?? nextStepsResult.error?.message ?? 'Unknown error')
      setLoading(false)
      return
    }

    const updates = updatesResult.data ?? []
    const nextSteps = nextStepsResult.data ?? []

    const nextSummaries = (initiatives ?? []).map((initiative) => ({
      initiative,
      recentUpdates: updates.filter((u) => u.initiative_id === initiative.id).slice(0, 2),
      pendingNextSteps: nextSteps.filter(
        (ns) => ns.initiative_id === initiative.id && deriveNextStepStatus(ns) !== 'completed',
      ),
    }))

    setSummaries(nextSummaries)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSummary()

    const channel = supabase
      .channel('summary-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'initiatives' }, () => fetchSummary())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'updates' }, () => fetchSummary())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'next_steps' }, () => fetchSummary())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSummary])

  return { summaries, loading, error, refetch: fetchSummary }
}
