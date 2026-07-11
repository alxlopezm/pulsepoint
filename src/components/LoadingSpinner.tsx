export function LoadingSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="h-8 w-8 animate-spin rounded-full border-2 border-secondary-light/30 border-t-primary"
    />
  )
}
