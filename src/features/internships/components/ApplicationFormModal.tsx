import { useMemo, useState } from 'react';
import { applicationStages, roleTypes } from '../../../types/internships';
import type {
  AddStageEventDTO,
  ApplicationDTO,
  CreateApplicationDTO,
  PipelineEventDTO,
  UpdateStageEventDTO,
} from '../../../types/internships';

interface ApplicationFormModalProps {
  initialData?: ApplicationDTO;
  timeline?: PipelineEventDTO[];
  timelineLoading?: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (payload: CreateApplicationDTO) => Promise<void>;
  onStageChange?: (payload: AddStageEventDTO) => Promise<void>;
  onPipelineEventUpdate?: (eventId: string, payload: UpdateStageEventDTO) => Promise<void>;
  onPipelineEventDelete?: (eventId: string) => Promise<void>;
  onDeleteApplication?: () => Promise<void>;
}

type EditSection = 'stage-update' | 'application-info' | 'pipeline' | 'danger-zone';

const toDateInput = (value?: string): string => {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
};

const formatDisplayDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export default function ApplicationFormModal({
  initialData,
  timeline = [],
  timelineLoading = false,
  title,
  onClose,
  onSubmit,
  onStageChange,
  onPipelineEventUpdate,
  onPipelineEventDelete,
  onDeleteApplication,
}: ApplicationFormModalProps) {
  const [form, setForm] = useState<CreateApplicationDTO>({
    company: initialData?.company ?? '',
    roleTitle: initialData?.roleTitle ?? '',
    roleType: initialData?.roleType ?? 'Internship',
    stage: initialData?.stage ?? 'Applied',
    appliedAt: initialData?.appliedAt ?? new Date().toISOString().split('T')[0],
    location: initialData?.location ?? '',
    source: initialData?.source ?? '',
    salaryRange: initialData?.salaryRange ?? '',
    notes: initialData?.notes ?? '',
    contactEmail: initialData?.contactEmail ?? '',
  });
  const [activeSection, setActiveSection] = useState<EditSection>('stage-update');
  const [nextStage, setNextStage] = useState<CreateApplicationDTO['stage']>(initialData?.stage ?? 'Applied');
  const [stageDate, setStageDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stageNotes, setStageNotes] = useState<string>('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState<UpdateStageEventDTO>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const orderedTimeline = useMemo(
    () => [...timeline].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()),
    [timeline],
  );

  const isValid = useMemo(
    () => form.company.trim().length > 1 && form.roleTitle.trim().length > 1 && form.appliedAt.length > 0,
    [form],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async () => {
    if (!initialData || !onStageChange || nextStage === initialData.stage) return;
    setActionLoading(true);
    try {
      await onStageChange({
        toStage: nextStage,
        eventDate: stageDate,
        notes: stageNotes || undefined,
      });
      setStageNotes('');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditEvent = (event: PipelineEventDTO) => {
    setEditingEventId(event.id);
    setEventDraft({
      toStage: event.toStage,
      eventDate: toDateInput(event.eventDate),
      notes: event.notes ?? '',
    });
  };

  const handleUpdateEvent = async (eventId: string) => {
    if (!onPipelineEventUpdate) return;
    setActionLoading(true);
    try {
      await onPipelineEventUpdate(eventId, eventDraft);
      setEditingEventId(null);
      setEventDraft({});
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!onPipelineEventDelete) return;
    setActionLoading(true);
    try {
      await onPipelineEventDelete(eventId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!onDeleteApplication || deleteConfirmText !== 'DELETE') return;
    setActionLoading(true);
    try {
      await onDeleteApplication();
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const renderCreateForm = () => (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Company
        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
      </label>
      <label>
        Role
        <input value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} required />
      </label>
      <label>
        Role Type
        <select value={form.roleType} onChange={(e) => setForm({ ...form, roleType: e.target.value as CreateApplicationDTO['roleType'] })}>
          {roleTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        Stage
        <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as CreateApplicationDTO['stage'] })}>
          {applicationStages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </label>
      <label>
        Applied Date
        <input type="date" value={toDateInput(form.appliedAt)} onChange={(e) => setForm({ ...form, appliedAt: e.target.value })} required />
      </label>
      <label>
        Contact Email
        <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
      </label>
      <label>
        Location
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </label>
      <label>
        Source
        <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
      </label>
      <label>
        Salary Range
        <input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} />
      </label>
      <label className="full-row">
        Notes
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} />
      </label>

      <div className="modal-actions full-row">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={!isValid || loading}>
          {loading ? 'Saving...' : 'Save Application'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          {!initialData && <h2>{title}</h2>}
          <button type="button" className="btn btn-ghost modal-close-icon" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {!initialData ? (
          renderCreateForm()
        ) : (
          <div className="edit-shell">
            <aside className="edit-nav">
              <button
                type="button"
                className={`edit-nav-item ${activeSection === 'stage-update' ? 'active' : ''}`}
                onClick={() => setActiveSection('stage-update')}
              >
                Stage Update
              </button>
              <button
                type="button"
                className={`edit-nav-item ${activeSection === 'application-info' ? 'active' : ''}`}
                onClick={() => setActiveSection('application-info')}
              >
                Application Info
              </button>
              <button
                type="button"
                className={`edit-nav-item ${activeSection === 'pipeline' ? 'active' : ''}`}
                onClick={() => setActiveSection('pipeline')}
              >
                Pipeline
              </button>
              <button
                type="button"
                className={`edit-nav-item danger ${activeSection === 'danger-zone' ? 'active' : ''}`}
                onClick={() => setActiveSection('danger-zone')}
              >
                Delete Application
              </button>
            </aside>

            <section className="edit-panel">
              {activeSection === 'stage-update' && (
                <div className="edit-section-grid">
                  <label>
                    Current Stage
                    <input value={initialData.stage} disabled />
                  </label>
                  <label>
                    Change To
                    <select value={nextStage} onChange={(e) => setNextStage(e.target.value as CreateApplicationDTO['stage'])}>
                      {applicationStages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Stage Change Date
                    <input type="date" value={stageDate} onChange={(e) => setStageDate(e.target.value)} />
                  </label>
                  <label className="full-row">
                    Stage Change Notes
                    <textarea
                      value={stageNotes}
                      rows={3}
                      onChange={(e) => setStageNotes(e.target.value)}
                      placeholder="Optional context for this transition"
                    />
                  </label>
                  <div className="modal-actions full-row">
                    <button type="button" className="btn" onClick={handleStageUpdate} disabled={actionLoading || nextStage === initialData.stage}>
                      {actionLoading ? 'Updating...' : 'Apply Stage Change'}
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'application-info' && (
                <form className="edit-section-grid" onSubmit={handleSubmit}>
                  <label>
                    Company
                    <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
                  </label>
                  <label>
                    Role
                    <input value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} required />
                  </label>
                  <label>
                    Role Type
                    <select value={form.roleType} onChange={(e) => setForm({ ...form, roleType: e.target.value as CreateApplicationDTO['roleType'] })}>
                      {roleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Applied Date
                    <input type="date" value={toDateInput(form.appliedAt)} disabled />
                  </label>
                  <label>
                    Contact Email
                    <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                  </label>
                  <label>
                    Location
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </label>
                  <label>
                    Source
                    <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                  </label>
                  <label>
                    Salary Range
                    <input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} />
                  </label>
                  <label className="full-row">
                    Notes
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} />
                  </label>
                  <div className="modal-actions full-row">
                    <button type="submit" className="btn" disabled={!isValid || loading}>
                      {loading ? 'Saving...' : 'Save Application Info'}
                    </button>
                  </div>
                </form>
              )}

              {activeSection === 'pipeline' && (
                <div className="timeline-box" aria-live="polite">
                  <h3>Pipeline Timeline</h3>
                  {timelineLoading ? (
                    <p>Loading timeline...</p>
                  ) : orderedTimeline.length === 0 ? (
                    <p>No stage events yet.</p>
                  ) : (
                    <ul className="timeline-list">
                      {orderedTimeline.map((event) => (
                        <li key={event.id}>
                          {editingEventId === event.id ? (
                            <div className="pipeline-edit-row">
                              <select
                                value={eventDraft.toStage ?? event.toStage}
                                onChange={(e) => setEventDraft((prev) => ({ ...prev, toStage: e.target.value as UpdateStageEventDTO['toStage'] }))}
                              >
                                {applicationStages.map((stage) => (
                                  <option key={stage} value={stage}>
                                    {stage}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="date"
                                value={toDateInput(eventDraft.eventDate ?? event.eventDate)}
                                onChange={(e) => setEventDraft((prev) => ({ ...prev, eventDate: e.target.value }))}
                              />
                              <input
                                value={eventDraft.notes ?? ''}
                                placeholder="Notes"
                                onChange={(e) => setEventDraft((prev) => ({ ...prev, notes: e.target.value }))}
                              />
                              <div className="pipeline-row-actions">
                                <button type="button" className="btn" onClick={() => handleUpdateEvent(event.id)} disabled={actionLoading}>
                                  Save
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={() => setEditingEventId(null)}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <strong>{event.toStage}</strong>
                              <span>{formatDisplayDate(event.eventDate)}</span>
                              {event.notes && <p>{event.notes}</p>}
                              <div className="pipeline-row-actions full-row">
                                <button type="button" className="btn btn-ghost" onClick={() => startEditEvent(event)}>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  disabled={actionLoading}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeSection === 'danger-zone' && (
                <div className="danger-panel">
                  <h3>Delete This Application</h3>
                  <p>
                    This action is permanent. All pipeline events, linked emails, and related records for this application
                    will be removed.
                  </p>
                  <label>
                    Type DELETE to confirm
                    <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
                  </label>
                  <div className="modal-actions full-row">
                    <button
                      type="button"
                      className="btn"
                      onClick={handleDeleteApplication}
                      disabled={deleteConfirmText !== 'DELETE' || actionLoading}
                    >
                      {actionLoading ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
