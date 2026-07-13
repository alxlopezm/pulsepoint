import { Search } from 'lucide-react'
import type { BusinessUnit, InitiativeStatus } from '../../types/database'

const statuses: InitiativeStatus[] = [
  'Requested',
  'In Design',
  'In Assessment',
  'Approved',
  'In Development',
]

const selectClass =
  'rounded-md border border-secondary-light/30 bg-white px-3 py-2 text-sm text-secondary outline-none transition-colors focus:border-primary dark:border-secondary-light/20 dark:bg-secondary dark:text-secondary-lighter'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  status: InitiativeStatus | 'All'
  onStatusChange: (value: InitiativeStatus | 'All') => void
  businessUnitId: string
  onBusinessUnitChange: (value: string) => void
  businessUnits: BusinessUnit[]
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  businessUnitId,
  onBusinessUnitChange,
  businessUnits,
}: FilterBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light"
          size={16}
        />
        <input
          type="text"
          placeholder="Search initiatives…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-secondary-light/30 bg-white py-2 pl-9 pr-3 text-sm text-secondary outline-none transition-colors focus:border-primary dark:border-secondary-light/20 dark:bg-secondary dark:text-secondary-lighter"
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as InitiativeStatus | 'All')}
        className={selectClass}
      >
        <option value="All">All statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={businessUnitId}
        onChange={(e) => onBusinessUnitChange(e.target.value)}
        className={selectClass}
      >
        <option value="All">All business units</option>
        {businessUnits.map((bu) => (
          <option key={bu.id} value={bu.id}>
            {bu.name}
          </option>
        ))}
      </select>
    </div>
  )
}
