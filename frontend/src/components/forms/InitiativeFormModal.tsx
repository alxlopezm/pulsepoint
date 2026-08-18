import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../modals/Modal'
import { api } from '../../lib/apiClient'
import { useBusinessUnits } from '../../hooks/useBusinessUnits'
import { initiativeStatusLabels, initiativeTypeLabels, priorityLabels } from '../../utils/enumLabels'
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../../utils/formStyles'
import type { Initiative, InitiativeStatus, InitiativeType, Priority } from '../../types/database'

const priorities: Priority[] = ['high', 'medium', 'low']
const statuses: InitiativeStatus[] = [
  'requested',
  'in_design',
  'in_assessment',
  'approved',
  'in_development',
]
const types: InitiativeType[] = ['technology_request', 'ea_governance', 'ea_growth']

interface FormState {
  name: string
  description: string
  owner: string
  business_unit_id: string
  priority: Priority
  status: InitiativeStatus
  type: InitiativeType
}

const emptyForm: FormState = {
  name: '',
  description: '',
  owner: '',
  business_unit_id: '',
  priority: 'medium',
  status: 'requested',
  type: 'technology_request',
}

interface InitiativeFormModalProps {
  isOpen: boolean
  onClose: () => void
  initiative?: Initiative | null
}

export function InitiativeFormModal({ isOpen, onClose, initiative }: InitiativeFormModalProps) {
  const { businessUnits } = useBusinessUnits()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(initiative)

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    if (initiative) {
      setForm({
        name: initiative.name,
        description: initiative.description ?? '',
        owner: initiative.owner ?? '',
        business_unit_id: initiative.business_unit_id,
        priority: initiative.priority,
        status: initiative.status,
        type: initiative.type,
      })
    } else {
      setForm(emptyForm)
    }
  }, [isOpen, initiative])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.business_unit_id) return

    setSubmitting(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      owner: form.owner.trim() || null,
      business_unit_id: form.business_unit_id,
      priority: form.priority,
      status: form.status,
      type: form.type,
    }

    try {
      if (isEdit && initiative) {
        await api.patch(`/api/initiatives/${initiative.id}`, payload)
      } else {
        await api.post('/api/initiatives', payload)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save initiative')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Initiative' : 'New Initiative'}>
      <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Name</span>
          <input
            required
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Description</span>
          <textarea
            rows={3}
            className={inputClass}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Owner</span>
          <input
            className={inputClass}
            value={form.owner}
            onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Business unit</span>
          <select
            required
            className={inputClass}
            value={form.business_unit_id}
            onChange={(e) => setForm((f) => ({ ...f, business_unit_id: e.target.value }))}
          >
            <option value="" disabled>
              Select a business unit
            </option>
            {businessUnits.map((bu) => (
              <option key={bu.id} value={bu.id}>
                {bu.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Priority</span>
            <select
              className={inputClass}
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelClass}>Status</span>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as InitiativeStatus }))
              }
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {initiativeStatusLabels[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Type</span>
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as InitiativeType }))}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {initiativeTypeLabels[t]}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create initiative'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
