import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Save,
  X,
  Plus,
  Building2,
  User,
  Calendar,
  Tag,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import {
  initiatives as initiativesApi,
  updates as updatesApi,
  nextSteps as nextStepsApi,
  businessUnits as businessUnitsApi,
} from '../services/api';
import type { Initiative, Update, NextStep, BusinessUnit, InitiativePriority, InitiativeStatus, InitiativeType } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import UpdateForm from '../components/UpdateForm';
import NextStepItem from '../components/NextStepItem';
import NextStepForm from '../components/NextStepForm';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';
import type { NextStepData } from '../services/api';

type Tab = 'details' | 'updates' | 'next-steps';

const PRIORITIES: InitiativePriority[] = ['High', 'Medium', 'Low'];
const STATUSES: InitiativeStatus[] = [
  'Requested', 'In Design', 'In Assessment', 'Approved', 'In Development',
];
const TYPES: InitiativeType[] = [
  'Technology Request',
  'Enterprise Architecture Governance',
  'Enterprise Architecture Growth',
];

export default function InitiativeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [nextSteps, setNextSteps] = useState<NextStep[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Initiative>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Next step modal
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [editingNextStep, setEditingNextStep] = useState<NextStep | null>(null);

  useEffect(() => {
    if (id) loadAll(id);
  }, [id]);

  const loadAll = async (initiativeId: string) => {
    setIsLoading(true);
    setError('');
    try {
      const [initiativeRes, updatesRes, nextStepsRes, businessUnitsRes] = await Promise.all([
        initiativesApi.get(initiativeId),
        updatesApi.list(initiativeId),
        nextStepsApi.list(initiativeId),
        businessUnitsApi.list(),
      ]);
      setInitiative(initiativeRes.initiative);
      setUpdates(updatesRes.updates);
      setNextSteps(nextStepsRes.nextSteps);
      setBusinessUnits(businessUnitsRes.businessUnits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load initiative');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    if (!initiative) return;
    setEditData({ ...initiative });
    setIsEditing(true);
    setSaveError('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
    setSaveError('');
  };

  const saveEdits = async () => {
    if (!initiative || !id) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const { initiative: updated } = await initiativesApi.update(id, {
        name: editData.name,
        description: editData.description,
        owner: editData.owner,
        business_unit_id: editData.business_unit_id,
        priority: editData.priority,
        status: editData.status,
        type: editData.type,
      });
      setInitiative(updated);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await initiativesApi.delete(id);
      navigate('/initiatives');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete initiative');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddUpdate = async (content: string) => {
    if (!id) return;
    const { update } = await updatesApi.create(id, content);
    setUpdates((prev) => [update, ...prev]);
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!id) return;
    await updatesApi.delete(id, updateId);
    setUpdates((prev) => prev.filter((u) => u.id !== updateId));
  };

  const handleAddNextStep = async (data: NextStepData) => {
    if (!id) return;
    const { nextStep } = await nextStepsApi.create(id, data);
    setNextSteps((prev) => [...prev, nextStep]);
    setShowNextStepModal(false);
  };

  const handleUpdateNextStep = async (data: NextStepData) => {
    if (!id || !editingNextStep) return;
    const { nextStep } = await nextStepsApi.update(id, editingNextStep.id, data);
    setNextSteps((prev) => prev.map((s) => (s.id === nextStep.id ? nextStep : s)));
    setEditingNextStep(null);
    setShowNextStepModal(false);
  };

  const handleDeleteNextStep = async (nextStepId: string) => {
    if (!id) return;
    await nextStepsApi.delete(id, nextStepId);
    setNextSteps((prev) => prev.filter((s) => s.id !== nextStepId));
  };

  const openEditNextStep = (nextStep: NextStep) => {
    setEditingNextStep(nextStep);
    setShowNextStepModal(true);
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-secondary dark:text-white placeholder-secondary-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm';
  const labelClass = 'block text-sm font-medium text-secondary dark:text-secondary-lighter mb-1.5';

  if (isLoading) {
    return (
      <div>
        <Navbar title="Initiative" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div>
        <Navbar title="Initiative" />
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-primary text-sm px-4 py-3 rounded-lg">
            {error || 'Initiative not found'}
          </div>
          <button
            onClick={() => navigate('/initiatives')}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Back to Initiatives
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof MessageSquare; count?: number }[] = [
    { id: 'details', label: 'Details', icon: Tag },
    { id: 'updates', label: 'Updates', icon: MessageSquare, count: updates.length },
    { id: 'next-steps', label: 'Next Steps', icon: CheckSquare, count: nextSteps.length },
  ];

  return (
    <div>
      <Navbar title={initiative.name} />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/initiatives')}
          className="flex items-center gap-2 text-sm text-secondary-light hover:text-secondary dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Initiatives
        </button>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {isEditing ? (
            /* Edit Mode Header */
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Priority *</label>
                  <select
                    value={editData.priority || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value as InitiativePriority })
                    }
                    className={inputClass}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={editData.status || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value as InitiativeStatus })
                    }
                    className={inputClass}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Type *</label>
                <select
                  value={editData.type || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, type: e.target.value as InitiativeType })
                  }
                  className={inputClass}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Owner *</label>
                  <input
                    type="text"
                    value={editData.owner || ''}
                    onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Business Unit</label>
                  <select
                    value={editData.business_unit_id || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, business_unit_id: e.target.value || undefined })
                    }
                    className={inputClass}
                  >
                    <option value="">None</option>
                    {businessUnits.map((bu) => (
                      <option key={bu.id} value={bu.id}>{bu.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {saveError && (
                <p className="text-sm text-primary bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                  {saveError}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-secondary dark:text-secondary-lighter text-sm font-medium hover:bg-secondary-lighter dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={saveEdits}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-medium transition-colors"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* View Mode Header */
            <>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-secondary dark:text-white mb-2">
                    {initiative.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={initiative.status} />
                    <PriorityBadge priority={initiative.priority} />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-secondary dark:text-secondary-lighter text-sm hover:bg-secondary-lighter dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-primary text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4">
                <div className="flex items-center gap-2 text-secondary-light">
                  <Tag className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{initiative.type}</span>
                </div>
                <div className="flex items-center gap-2 text-secondary-light">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{initiative.owner}</span>
                </div>
                {initiative.business_unit_name && (
                  <div className="flex items-center gap-2 text-secondary-light">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{initiative.business_unit_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-secondary-light">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {new Date(initiative.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tab Nav */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tabId
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary-light hover:text-secondary dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {count !== undefined && count > 0 && (
                  <span className="bg-secondary-lighter dark:bg-gray-700 text-secondary dark:text-white text-xs px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-secondary dark:text-white mb-2">
                    Description
                  </h3>
                  {initiative.description ? (
                    <p className="text-sm text-secondary-light dark:text-gray-300 whitespace-pre-wrap">
                      {initiative.description}
                    </p>
                  ) : (
                    <p className="text-sm text-secondary-light italic">No description provided</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-secondary-light mb-1">Created</p>
                    <p className="text-sm text-secondary dark:text-white">
                      {new Date(initiative.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-light mb-1">Last Updated</p>
                    <p className="text-sm text-secondary dark:text-white">
                      {new Date(initiative.updated_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Updates Tab */}
            {activeTab === 'updates' && (
              <div className="space-y-5">
                <UpdateForm onSubmit={handleAddUpdate} />

                <div className="space-y-3">
                  {updates.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-secondary-light mx-auto mb-2" />
                      <p className="text-sm text-secondary-light">
                        No updates yet. Post the first update above.
                      </p>
                    </div>
                  ) : (
                    updates.map((update) => (
                      <div
                        key={update.id}
                        className="bg-secondary-lighter/50 dark:bg-gray-700/50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-secondary dark:text-white whitespace-pre-wrap flex-1">
                            {update.content}
                          </p>
                          <button
                            onClick={() => handleDeleteUpdate(update.id)}
                            className="text-secondary-light hover:text-primary transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-secondary-light mt-2">
                          {new Date(update.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Next Steps Tab */}
            {activeTab === 'next-steps' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingNextStep(null);
                      setShowNextStepModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Next Step
                  </button>
                </div>

                {nextSteps.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="w-8 h-8 text-secondary-light mx-auto mb-2" />
                    <p className="text-sm text-secondary-light">
                      No next steps yet. Add one to track progress.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Overdue warning summary */}
                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const overdueCount = nextSteps.filter(
                        (s) =>
                          s.due_date &&
                          new Date(s.due_date) < today &&
                          s.status !== 'completed'
                      ).length;
                      return overdueCount > 0 ? (
                        <div className="flex items-center gap-2 text-xs text-primary bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                          <AlertTriangle className="w-4 h-4" />
                          {overdueCount} overdue next step{overdueCount !== 1 ? 's' : ''}
                        </div>
                      ) : null;
                    })()}

                    {nextSteps.map((step) => (
                      <NextStepItem
                        key={step.id}
                        nextStep={step}
                        onEdit={openEditNextStep}
                        onDelete={handleDeleteNextStep}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Initiative"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary dark:text-secondary-lighter">
            Are you sure you want to delete{' '}
            <strong className="text-secondary dark:text-white">"{initiative.name}"</strong>?
            This will also delete all updates and next steps. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-secondary dark:text-secondary-lighter text-sm font-medium hover:bg-secondary-lighter dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center justify-center"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Next Step Modal */}
      <Modal
        isOpen={showNextStepModal}
        onClose={() => {
          setShowNextStepModal(false);
          setEditingNextStep(null);
        }}
        title={editingNextStep ? 'Edit Next Step' : 'Add Next Step'}
        maxWidth="md"
      >
        <NextStepForm
          initialData={editingNextStep || undefined}
          onSubmit={editingNextStep ? handleUpdateNextStep : handleAddNextStep}
          onCancel={() => {
            setShowNextStepModal(false);
            setEditingNextStep(null);
          }}
        />
      </Modal>
    </div>
  );
}
