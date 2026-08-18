import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-secondary">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary dark:text-secondary-lighter">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-secondary-light transition-colors hover:bg-secondary-lighter hover:text-secondary dark:hover:bg-secondary-light/10 dark:hover:text-secondary-lighter"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
