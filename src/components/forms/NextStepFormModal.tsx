import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../modals/Modal'
import { supabase } from '../../lib/supabaseClient'
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../../utils/formStyles'
import type { NextStep } from '../../types/database'

interface FormState {
  description: string
  responsible: string
  start_date: string
  due_date: string
  completion_date: string
}

const emptyForm: FormState = {
  description: '',
  responsible: '',
  start_date: '',
  due_date: '',
  completion_date: '',
}

interface NextStepFormModalProps {
  isOpen: boolean
  onClose: () => void
  initiativeId: string
  nextStep?: NextStep | null
}

export function NextStepFormModal({
  isOpen,
  onClose,
  initiativeId,
  nextStep,
}: NextStepFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(nextStep)

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    if (nextStep) {
      setForm({
        description: nextStep.description,
        responsible: nextStep.responsible ?? '',
        start_date: nextStep.start_date ?? '',
        due_date: nextStep.due_date ?? '',
        completion_date: nextStep.completion_date ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [isOpen, nextStep])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      description: form.description.trim(),
      responsible: form.responsible.trim() || null,
      start_date: form.start_date || null,
      due_date: form.due_date || null,
      completion_date: form.completion_date || null,
    }

    const { error } =
      isEdit && nextStep
        ? await supabase.from('next_steps').update(payload).eq('id', nextStep.id)
        : await supabase.from('next_steps').insert({ ...payload, initiative_id: initiativeId })

    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Next Step' : 'Add Next Step'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Description</span>
          <textarea
            required
            rows={3}
            className={inputClass}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Responsible</span>
          <input
            className={inputClass}
            value={form.responsible}
            onChange={(e) => setForm((f) => ({ ...f, responsible: e.target.value }))}
          />
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
            <span className={labelClass}>Due date</span>
            <input
              type="date"
              className={inputClass}
              value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Completion date</span>
          <input
            type="date"
            className={inputClass}
            value={form.completion_date}
            onChange={(e) => setForm((f) => ({ ...f, completion_date: e.target.value }))}
          />
        </label>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add next step'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
