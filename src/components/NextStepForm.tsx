import { useState } from 'react';
import type { NextStep } from '../types';
import type { NextStepData } from '../services/api';

interface NextStepFormProps {
  initialData?: Partial<NextStep>;
  onSubmit: (data: NextStepData) => Promise<void>;
  onCancel: () => void;
}

export default function NextStepForm({ initialData, onSubmit, onCancel }: NextStepFormProps) {
  const [formData, setFormData] = useState<NextStepData>({
    title: initialData?.title ?? '',
    responsible: initialData?.responsible ?? '',
    due_date: initialData?.due_date
      ? initialData.due_date.split('T')[0]
      : '',
    start_date: initialData?.start_date
      ? initialData.start_date.split('T')[0]
      : '',
    status: initialData?.status ?? 'pending',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NextStepData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors: Partial<Record<keyof NextStepData, string>> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit({
        ...formData,
        responsible: formData.responsible || undefined,
        due_date: formData.due_date || undefined,
        start_date: formData.start_date || undefined,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save next step');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-secondary dark:text-white placeholder-secondary-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm';

  const labelClass = 'block text-sm font-medium text-secondary dark:text-secondary-lighter mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className={labelClass}>
          Title <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Next step title"
          className={inputClass}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-primary">{errors.title}</p>
        )}
      </div>

      {/* Responsible */}
      <div>
        <label className={labelClass}>Responsible</label>
        <input
          type="text"
          value={formData.responsible ?? ''}
          onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
          placeholder="Person responsible"
          className={inputClass}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            value={formData.start_date ?? ''}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Due Date</label>
          <input
            type="date"
            value={formData.due_date ?? ''}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as 'pending' | 'started' | 'completed',
            })
          }
          className={inputClass}
        >
          <option value="pending">Pending</option>
          <option value="started">Started</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {submitError && (
        <p className="text-sm text-primary bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {submitError}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-secondary dark:text-secondary-lighter text-sm font-medium hover:bg-secondary-lighter dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update' : 'Add Next Step'}
        </button>
      </div>
    </form>
  );
}
