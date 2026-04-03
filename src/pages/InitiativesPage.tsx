import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban } from 'lucide-react';
import { initiatives as initiativesApi, businessUnits as businessUnitsApi } from '../services/api';
import type { Initiative, BusinessUnit } from '../types';
import FilterBar from '../components/FilterBar';
import type { FilterState } from '../components/FilterBar';
import InitiativeCard from '../components/InitiativeCard';
import Navbar from '../components/Navbar';

export default function InitiativesPage() {
  const navigate = useNavigate();
  const [allInitiatives, setAllInitiatives] = useState<Initiative[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    business_unit_id: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [initiativesRes, businessUnitsRes] = await Promise.all([
        initiativesApi.list(),
        businessUnitsApi.list(),
      ]);
      setAllInitiatives(initiativesRes.initiatives);
      setBusinessUnits(businessUnitsRes.businessUnits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load initiatives');
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering for instant response
  const filteredInitiatives = allInitiatives.filter((initiative) => {
    if (filters.status && initiative.status !== filters.status) return false;
    if (filters.business_unit_id && initiative.business_unit_id !== filters.business_unit_id)
      return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !initiative.name.toLowerCase().includes(q) &&
        !(initiative.description || '').toLowerCase().includes(q) &&
        !initiative.owner.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div>
      <Navbar title="Initiatives" />
      <div className="p-6 space-y-5">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex-1">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              businessUnits={businessUnits}
            />
          </div>
          <button
            onClick={() => navigate('/initiatives/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Initiative
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-primary text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredInitiatives.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-secondary-lighter dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8 text-secondary-light" />
            </div>
            <h3 className="text-lg font-semibold text-secondary dark:text-white mb-2">
              {allInitiatives.length === 0 ? 'No initiatives yet' : 'No results found'}
            </h3>
            <p className="text-secondary-light text-sm max-w-sm mb-6">
              {allInitiatives.length === 0
                ? 'Create your first initiative to start tracking enterprise projects.'
                : 'Try adjusting your filters or search term.'}
            </p>
            {allInitiatives.length === 0 && (
              <button
                onClick={() => navigate('/initiatives/new')}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Initiative
              </button>
            )}
          </div>
        ) : (
          /* Grid */
          <>
            <p className="text-xs text-secondary-light">
              {filteredInitiatives.length} initiative{filteredInitiatives.length !== 1 ? 's' : ''}
              {filters.search || filters.status || filters.business_unit_id
                ? ' matching filters'
                : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredInitiatives.map((initiative) => (
                <InitiativeCard key={initiative.id} initiative={initiative} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
