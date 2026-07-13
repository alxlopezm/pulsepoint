import { useState, type FormEvent } from 'react'
import { Modal } from '../modals/Modal'
import { supabase } from '../../lib/supabaseClient'
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../../utils/formStyles'

interface AddUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  initiativeId: string
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function AddUpdateModal({ isOpen, onClose, initiativeId }: AddUpdateModalProps) {
  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setDate(today())
    setDescription('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from('updates').insert({
      initiative_id: initiativeId,
      date,
      description: description.trim(),
    })

    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Update">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Date</span>
          <input
            type="date"
            required
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Description</span>
          <textarea
            required
            rows={4}
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={handleClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? 'Saving…' : 'Add update'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
