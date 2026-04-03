import { Search } from 'lucide-react';
import type { BusinessUnit, InitiativeStatus } from '../types';

export interface FilterState {
  search: string;
  status: InitiativeStatus | '';
  business_unit_id: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  businessUnits: BusinessUnit[];
}

const STATUS_OPTIONS: Array<{ value: InitiativeStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'Requested', label: 'Requested' },
  { value: 'In Design', label: 'In Design' },
  { value: 'In Assessment', label: 'In Assessment' },
  { value: 'Approved', label: 'Approved' },
  { value: 'In Development', label: 'In Development' },
];

export default function FilterBar({ filters, onChange, businessUnits }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-light" />
        <input
          type="text"
          placeholder="Search initiatives..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-secondary dark:text-white placeholder-secondary-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
        />
      </div>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as InitiativeStatus | '' })
        }
        className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Business Unit Filter */}
      <select
        value={filters.business_unit_id}
        onChange={(e) => onChange({ ...filters, business_unit_id: e.target.value })}
        className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer"
      >
        <option value="">All Business Units</option>
        {businessUnits.map((bu) => (
          <option key={bu.id} value={bu.id}>
            {bu.name}
          </option>
        ))}
      </select>
    </div>
  );
}
