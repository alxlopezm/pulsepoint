export function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
