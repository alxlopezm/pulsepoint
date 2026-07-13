import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useInitiatives } from '../hooks/useInitiatives'
import { useBusinessUnits } from '../hooks/useBusinessUnits'
import { InitiativeCard } from '../components/initiatives/InitiativeCard'
import { InitiativeFormModal } from '../components/forms/InitiativeFormModal'
import { ConfirmDialog } from '../components/modals/ConfirmDialog'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorState } from '../components/ErrorState'
import { supabase } from '../lib/supabaseClient'
import type { Initiative } from '../types/database'

export function Dashboard() {
  const { initiatives, loading, error, refetch } = useInitiatives()
  const { businessUnits } = useBusinessUnits()
  const navigate = useNavigate()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null)
  const [deletingInitiative, setDeletingInitiative] = useState<Initiative | null>(null)
  const [deleting, setDeleting] = useState(false)

  const businessUnitNameById = useMemo(
    () => new Map(businessUnits.map((bu) => [bu.id, bu.name])),
    [businessUnits],
  )

  const handleDelete = async () => {
    if (!deletingInitiative) return
    setDeleting(true)
    const { error } = await supabase.from('initiatives').delete().eq('id', deletingInitiative.id)
    setDeleting(false)
    if (!error) {
      setDeletingInitiative(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary dark:text-secondary-lighter">
          Dashboard
        </h1>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={16} />
          New Initiative
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <ErrorState message={`Couldn't load initiatives: ${error}`} onRetry={refetch} />
      )}

      {!loading && !error && initiatives.length === 0 && (
        <p className="py-16 text-center text-sm text-secondary-light">No initiatives yet.</p>
      )}

      {!loading && !error && initiatives.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((initiative) => (
            <InitiativeCard
              key={initiative.id}
              initiative={initiative}
              businessUnitName={businessUnitNameById.get(initiative.business_unit_id) ?? 'Unknown'}
              onClick={() => navigate(`/initiatives/${initiative.id}`)}
              onEdit={() => setEditingInitiative(initiative)}
              onDelete={() => setDeletingInitiative(initiative)}
            />
          ))}
        </div>
      )}

      <InitiativeFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <InitiativeFormModal
        isOpen={Boolean(editingInitiative)}
        onClose={() => setEditingInitiative(null)}
        initiative={editingInitiative}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingInitiative)}
        onClose={() => setDeletingInitiative(null)}
        onConfirm={handleDelete}
        title="Delete initiative"
        message={`Are you sure you want to delete "${deletingInitiative?.name}"? This will also delete all of its updates and next steps. This cannot be undone.`}
        confirming={deleting}
      />
    </div>
  )
}
