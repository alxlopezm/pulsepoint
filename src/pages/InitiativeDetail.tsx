import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useInitiative } from '../hooks/useInitiative'
import { useBusinessUnits } from '../hooks/useBusinessUnits'
import { useUpdates } from '../hooks/useUpdates'
import { useNextSteps } from '../hooks/useNextSteps'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorState } from '../components/ErrorState'
import { UpdatesTable } from '../components/tables/UpdatesTable'
import { NextStepsTable } from '../components/tables/NextStepsTable'
import { AddUpdateModal } from '../components/forms/AddUpdateModal'
import { NextStepFormModal } from '../components/forms/NextStepFormModal'
import { ConfirmDialog } from '../components/modals/ConfirmDialog'
import { supabase } from '../lib/supabaseClient'
import { priorityDotColor, statusMeta } from '../utils/initiativeDisplay'
import { formatDate } from '../utils/formatDate'
import type { NextStep } from '../types/database'

export function InitiativeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { initiative, loading, error, refetch } = useInitiative(id)
  const { businessUnits } = useBusinessUnits()
  const {
    updates,
    loading: updatesLoading,
    error: updatesError,
    refetch: refetchUpdates,
  } = useUpdates(id)
  const {
    nextSteps,
    loading: nextStepsLoading,
    error: nextStepsError,
    refetch: refetchNextSteps,
  } = useNextSteps(id)
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false)
  const [editingNextStep, setEditingNextStep] = useState<NextStep | null>(null)
  const [isAddNextStepOpen, setIsAddNextStepOpen] = useState(false)
  const [deletingNextStep, setDeletingNextStep] = useState<NextStep | null>(null)
  const [deletingNextStepBusy, setDeletingNextStepBusy] = useState(false)
  const [isDeleteInitiativeOpen, setIsDeleteInitiativeOpen] = useState(false)
  const [deletingInitiativeBusy, setDeletingInitiativeBusy] = useState(false)

  const handleDeleteNextStep = async () => {
    if (!deletingNextStep) return
    setDeletingNextStepBusy(true)
    const { error } = await supabase.from('next_steps').delete().eq('id', deletingNextStep.id)
    setDeletingNextStepBusy(false)
    if (!error) {
      setDeletingNextStep(null)
    }
  }

  const handleDeleteInitiative = async () => {
    if (!initiative) return
    setDeletingInitiativeBusy(true)
    const { error } = await supabase.from('initiatives').delete().eq('id', initiative.id)
    setDeletingInitiativeBusy(false)
    if (!error) {
      navigate('/')
    }
  }

  const businessUnitName = businessUnits.find(
    (bu) => bu.id === initiative?.business_unit_id,
  )?.name

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-secondary-light transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        {!loading && !error && initiative && (
          <button
            type="button"
            onClick={() => setIsDeleteInitiativeOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent-light/20 dark:hover:bg-accent-dark/20"
          >
            <Trash2 size={14} />
            Delete Initiative
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <ErrorState message={`Couldn't load this initiative: ${error}`} onRetry={refetch} />
      )}

      {!loading && !error && !initiative && (
        <p className="py-16 text-center text-sm text-secondary-light">
          This initiative doesn't exist or you don't have access to it.
        </p>
      )}

      {!loading && !error && initiative && (
        <div className="flex flex-col gap-4 rounded-lg border border-secondary-light/20 bg-white p-6 dark:border-secondary-light/10 dark:bg-secondary-light/5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold text-secondary dark:text-secondary-lighter">
              {initiative.name}
            </h1>
            <span
              title={`${initiative.priority} priority`}
              className={`mt-2 h-3 w-3 shrink-0 rounded-full ${priorityDotColor[initiative.priority]}`}
            />
          </div>

          {initiative.description && (
            <p className="text-sm text-secondary-light">{initiative.description}</p>
          )}

          {(() => {
            const status = statusMeta[initiative.status]
            const StatusIcon = status.icon
            return (
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
              >
                <StatusIcon size={13} />
                {status.label}
              </span>
            )
          })()}

          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-secondary-light/20 pt-4 text-sm dark:border-secondary-light/10 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-secondary-light">Owner</dt>
              <dd className="mt-0.5 text-secondary dark:text-secondary-lighter">
                {initiative.owner || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-light">Business unit</dt>
              <dd className="mt-0.5 text-secondary dark:text-secondary-lighter">
                {businessUnitName ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-light">Type</dt>
              <dd className="mt-0.5 text-secondary dark:text-secondary-lighter">
                {initiative.type}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-light">Timeline</dt>
              <dd className="mt-0.5 text-secondary dark:text-secondary-lighter">
                {formatDate(initiative.start_date)} – {formatDate(initiative.end_date)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {!loading && !error && initiative && (
        <div className="mt-6 rounded-lg border border-secondary-light/20 bg-white p-6 dark:border-secondary-light/10 dark:bg-secondary-light/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary dark:text-secondary-lighter">
              Updates
            </h2>
            <button
              type="button"
              onClick={() => setIsAddUpdateOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary"
            >
              <Plus size={14} />
              Add Update
            </button>
          </div>

          {updatesLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {!updatesLoading && updatesError && (
            <ErrorState
              message={`Couldn't load updates: ${updatesError}`}
              onRetry={refetchUpdates}
            />
          )}

          {!updatesLoading && !updatesError && <UpdatesTable updates={updates} />}

          <AddUpdateModal
            isOpen={isAddUpdateOpen}
            onClose={() => setIsAddUpdateOpen(false)}
            initiativeId={initiative.id}
          />
        </div>
      )}

      {!loading && !error && initiative && (
        <div className="mt-6 rounded-lg border border-secondary-light/20 bg-white p-6 dark:border-secondary-light/10 dark:bg-secondary-light/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary dark:text-secondary-lighter">
              Next Steps
            </h2>
            <button
              type="button"
              onClick={() => setIsAddNextStepOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary"
            >
              <Plus size={14} />
              Add Next Step
            </button>
          </div>

          {nextStepsLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {!nextStepsLoading && nextStepsError && (
            <ErrorState
              message={`Couldn't load next steps: ${nextStepsError}`}
              onRetry={refetchNextSteps}
            />
          )}

          {!nextStepsLoading && !nextStepsError && (
            <NextStepsTable
              nextSteps={nextSteps}
              onEdit={(step) => setEditingNextStep(step)}
              onDelete={(step) => setDeletingNextStep(step)}
            />
          )}

          <NextStepFormModal
            isOpen={isAddNextStepOpen}
            onClose={() => setIsAddNextStepOpen(false)}
            initiativeId={initiative.id}
          />

          <NextStepFormModal
            isOpen={Boolean(editingNextStep)}
            onClose={() => setEditingNextStep(null)}
            initiativeId={initiative.id}
            nextStep={editingNextStep}
          />

          <ConfirmDialog
            isOpen={Boolean(deletingNextStep)}
            onClose={() => setDeletingNextStep(null)}
            onConfirm={handleDeleteNextStep}
            title="Delete next step"
            message={`Are you sure you want to delete "${deletingNextStep?.description}"? This cannot be undone.`}
            confirming={deletingNextStepBusy}
          />
        </div>
      )}

      {initiative && (
        <ConfirmDialog
          isOpen={isDeleteInitiativeOpen}
          onClose={() => setIsDeleteInitiativeOpen(false)}
          onConfirm={handleDeleteInitiative}
          title="Delete initiative"
          message={`Are you sure you want to delete "${initiative.name}"? This will also delete all of its updates and next steps. This cannot be undone.`}
          confirming={deletingInitiativeBusy}
        />
      )}
    </div>
  )
}
