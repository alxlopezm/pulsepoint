import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { initiatives as initiativesApi, updates as updatesApi } from '../services/api';
import type { Initiative, Update } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Navbar from '../components/Navbar';

interface DashboardStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [allInitiatives, setAllInitiatives] = useState<Initiative[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<Array<Update & { initiativeName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { initiatives } = await initiativesApi.list();
      setAllInitiatives(initiatives);

      // Fetch recent updates for last 5 initiatives
      const last5 = initiatives.slice(0, 5);
      const updatesPromises = last5.map((initiative) =>
        updatesApi
          .list(initiative.id)
          .then(({ updates }) =>
            updates.slice(0, 2).map((u) => ({
              ...u,
              initiativeName: initiative.name,
            }))
          )
          .catch(() => [])
      );

      const allUpdates = await Promise.all(updatesPromises);
      const flatUpdates = allUpdates
        .flat()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6);

      setRecentUpdates(flatUpdates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const stats: DashboardStats = {
    total: allInitiatives.length,
    byStatus: allInitiatives.reduce(
      (acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byPriority: allInitiatives.reduce(
      (acc, i) => {
        acc[i.priority] = (acc[i.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  const recentInitiatives = allInitiatives.slice(0, 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statuses = [
    'Requested',
    'In Design',
    'In Assessment',
    'Approved',
    'In Development',
  ] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Navbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-primary text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-light">Total Initiatives</p>
                <p className="text-3xl font-bold text-secondary dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-primary" />
              </div>
            </div>
            <button
              onClick={() => navigate('/initiatives/new')}
              className="mt-4 flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              New Initiative
            </button>
          </div>

          {/* By Priority */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-secondary dark:text-white">By Priority</p>
            </div>
            <div className="space-y-2">
              {['High', 'Medium', 'Low'].map((priority) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className="text-xs text-secondary-light">{priority}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 w-24 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          priority === 'High'
                            ? 'bg-primary'
                            : priority === 'Medium'
                            ? 'bg-yellow-400'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: stats.total > 0
                            ? `${((stats.byPriority[priority] || 0) / stats.total) * 100}%`
                            : '0%',
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-secondary dark:text-white w-4 text-right">
                      {stats.byPriority[priority] || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-secondary dark:text-white">By Status</p>
            </div>
            <div className="space-y-2">
              {statuses.map((status) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-xs text-secondary-light truncate mr-2">{status}</span>
                  <span className="text-xs font-semibold text-secondary dark:text-white flex-shrink-0">
                    {stats.byStatus[status] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Initiatives */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-secondary dark:text-white">
                Recent Initiatives
              </h2>
              <button
                onClick={() => navigate('/initiatives')}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentInitiatives.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <FolderKanban className="w-8 h-8 text-secondary-light mx-auto mb-2" />
                  <p className="text-sm text-secondary-light">No initiatives yet</p>
                  <button
                    onClick={() => navigate('/initiatives/new')}
                    className="mt-3 text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Create your first initiative
                  </button>
                </div>
              ) : (
                recentInitiatives.map((initiative) => (
                  <div
                    key={initiative.id}
                    onClick={() => navigate(`/initiatives/${initiative.id}`)}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary-lighter/50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-sm font-medium text-secondary dark:text-white truncate">
                        {initiative.name}
                      </p>
                      <p className="text-xs text-secondary-light truncate mt-0.5">
                        {initiative.owner}
                        {initiative.business_unit_name && ` · ${initiative.business_unit_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={initiative.priority} size="sm" />
                      <StatusBadge status={initiative.status} size="sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-secondary dark:text-white">
                Recent Updates
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentUpdates.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <AlertTriangle className="w-8 h-8 text-secondary-light mx-auto mb-2" />
                  <p className="text-sm text-secondary-light">No updates yet</p>
                </div>
              ) : (
                recentUpdates.map((update) => (
                  <div key={update.id} className="px-5 py-3.5">
                    <p className="text-xs font-medium text-primary mb-1 truncate">
                      {update.initiativeName}
                    </p>
                    <p className="text-sm text-secondary dark:text-secondary-lighter line-clamp-2">
                      {update.content}
                    </p>
                    <p className="text-xs text-secondary-light mt-1">
                      {new Date(update.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
