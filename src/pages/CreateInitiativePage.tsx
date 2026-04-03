import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { initiatives as initiativesApi, businessUnits as businessUnitsApi } from '../services/api';
import type { BusinessUnit, InitiativePriority, InitiativeStatus, InitiativeType } from '../types';
import Navbar from '../components/Navbar';

const PRIORITIES: InitiativePriority[] = ['High', 'Medium', 'Low'];
const STATUSES: InitiativeStatus[] = [
  'Requested',
  'In Design',
  'In Assessment',
  'Approved',
  'In Development',
];
const TYPES: InitiativeType[] = [
  'Technology Request',
  'Enterprise Architecture Governance',
  'Enterprise Architecture Growth',
];

interface FormData {
  name: string;
  description: string;
  owner: string;
  business_unit_id: string;
  priority: InitiativePriority;
  status: InitiativeStatus;
  type: InitiativeType;
}

export default function CreateInitiativePage() {
  const navigate = useNavigate();
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    owner: '',
    business_unit_id: '',
    priority: 'Medium',
    status: 'Requested',
    type: 'Technology Request',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    businessUnitsApi
      .list()
      .then(({ businessUnits: units }) => setBusinessUnits(units))
      .catch(console.error);
  }, []);

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.owner.trim()) newErrors.owner = 'Owner is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.type) newErrors.type = 'Type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError('');

    try {
      const { initiative } = await initiativesApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        owner: formData.owner.trim(),
        business_unit_id: formData.business_unit_id || undefined,
        priority: formData.priority,
        status: formData.status,
        type: formData.type,
      });
      navigate(`/initiatives/${initiative.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create initiative');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-secondary dark:text-white placeholder-secondary-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm';
  const labelClass = 'block text-sm font-medium text-secondary dark:text-secondary-lighter mb-1.5';

  return (
    <div>
      <Navbar title="New Initiative" />
      <div className="p-6 max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/initiatives')}
          className="flex items-center gap-2 text-sm text-secondary-light hover:text-secondary dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Initiatives
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-secondary dark:text-white mb-6">
            Create New Initiative
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className={labelClass}>
                Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Initiative name"
                className={inputClass}
              />
              {errors.name && <p className="mt-1 text-xs text-primary">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the initiative..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Owner */}
            <div>
              <label className={labelClass}>
                Owner <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Initiative owner name"
                className={inputClass}
              />
              {errors.owner && <p className="mt-1 text-xs text-primary">{errors.owner}</p>}
            </div>

            {/* Business Unit */}
            <div>
              <label className={labelClass}>Business Unit</label>
              <select
                value={formData.business_unit_id}
                onChange={(e) => setFormData({ ...formData, business_unit_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Select business unit (optional)</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id} value={bu.id}>
                    {bu.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Priority <span className="text-primary">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as InitiativePriority })
                  }
                  className={inputClass}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-xs text-primary">{errors.priority}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as InitiativeStatus })
                  }
                  className={inputClass}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className={labelClass}>
                Type <span className="text-primary">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as InitiativeType })
                }
                className={inputClass}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-xs text-primary">{errors.type}</p>}
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-primary text-sm px-4 py-3 rounded-lg">
                {submitError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/initiatives')}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-secondary dark:text-secondary-lighter text-sm font-medium hover:bg-secondary-lighter dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Initiative'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
