import { useState, type FormEvent } from 'react'
import { Modal } from '../modals/Modal'
import { api } from '../../lib/apiClient'
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../../utils/formStyles'

interface AddUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  initiativeId: string
}

export function AddUpdateModal({ isOpen, onClose, initiativeId }: AddUpdateModalProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setContent('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await api.post(`/api/initiatives/${initiativeId}/updates`, { content: content.trim() })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add update')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Update">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Description</span>
          <textarea
            required
            rows={4}
            className={inputClass}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
