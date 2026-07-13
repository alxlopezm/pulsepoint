import { Modal } from './Modal'
import { secondaryButtonClass } from '../../utils/formStyles'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  confirming?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  confirming = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-secondary-light">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          {confirming ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
