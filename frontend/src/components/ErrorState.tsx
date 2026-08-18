import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-accent/30 bg-accent-light/10 px-6 py-10 text-center dark:border-accent/20 dark:bg-accent-dark/10">
      <AlertTriangle className="text-accent" size={28} />
      <p className="text-sm text-secondary dark:text-secondary-lighter">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary"
        >
          Retry
        </button>
      )}
    </div>
  )
}
