import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../modals/Modal'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { useBusinessUnits } from '../../hooks/useBusinessUnits'
import type { Initiative, InitiativeStatus, InitiativeType, Priority } from '../../types/database'

const priorities: Priority[] = ['High', 'Medium', 'Low']
const statuses: InitiativeStatus[] = [
  'Requested',
  'In Design',
  'In Assessment',
  'Approved',
  'In Development',
]
const types: InitiativeType[] = [
  'Technology Request',
  'Enterprise Architecture Governance',
  'Enterprise Architecture Growth',
]

const inputClass =
  'w-full rounded-md border border-secondary-light/30 bg-white px-3 py-2 text-sm text-secondary outline-none transition-colors focus:border-primary dark:border-secondary-light/20 dark:bg-secondary dark:text-secondary-lighter'
const labelClass = 'text-xs font-medium text-secondary-light'

interface FormState {
  name: string
  description: string
  owner: string
  business_unit_id: string
  priority: Priority
  status: InitiativeStatus
  type: InitiativeType
  start_date: string
  end_date: string
}

const emptyForm: FormState = {
  name: '',
  description: '',
  owner: '',
  business_unit_id: '',
  priority: 'Medium',
  status: 'Requested',
  type: 'Technology Request',
  start_date: '',
  end_date: '',
}

interface InitiativeFormModalProps {
  isOpen: boolean
  onClose: () => void
  initiative?: Initiative | null
}

export function InitiativeFormModal({ isOpen, onClose, initiative }: InitiativeFormModalProps) {
  const { user } = useAuth()
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
        start_date: initiative.start_date ?? '',
        end_date: initiative.end_date ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [isOpen, initiative])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user || !form.business_unit_id) return

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
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    }

    const { error } =
      isEdit && initiative
        ? await supabase.from('initiatives').update(payload).eq('id', initiative.id)
        : await supabase.from('initiatives').insert({ ...payload, user_id: user.id })

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }
    onClose()
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
                  {p}
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
                  {s}
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
                {t}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Start date</span>
            <input
              type="date"
              className={inputClass}
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className={labelClass}>End date</span>
            <input
              type="date"
              className={inputClass}
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            />
          </label>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-secondary-lighter dark:text-secondary-lighter dark:hover:bg-secondary-light/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create initiative'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
