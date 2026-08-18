import type { Update } from '../../types/database'
import { formatDate } from '../../utils/formatDate'

interface UpdatesTableProps {
  updates: Update[]
}

export function UpdatesTable({ updates }: UpdatesTableProps) {
  if (updates.length === 0) {
    return <p className="py-8 text-center text-sm text-secondary-light">No updates yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-secondary-light/20 text-xs text-secondary-light dark:border-secondary-light/10">
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {updates.map((update) => (
            <tr
              key={update.id}
              className="border-b border-secondary-light/10 last:border-0 dark:border-secondary-light/5"
            >
              <td className="whitespace-nowrap py-3 pr-4 align-top text-secondary-light">
                {formatDate(update.created_at)}
              </td>
              <td className="py-3 text-secondary dark:text-secondary-lighter">
                {update.content}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
