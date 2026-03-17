import { useMemo, useState } from 'react';
import { applicationStages, roleTypes } from '../../../types/internships';
import type { AddStageEventDTO, ApplicationDTO, CreateApplicationDTO, PipelineEventDTO } from '../../../types/internships';

interface ApplicationFormModalProps {
  initialData?: ApplicationDTO;
  timeline?: PipelineEventDTO[];
  timelineLoading?: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (payload: CreateApplicationDTO) => Promise<void>;
  onStageChange?: (payload: AddStageEventDTO) => Promise<void>;
}

const toDateInput = (value?: string): string => {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
};

export default function ApplicationFormModal({
  initialData,
  timeline = [],
  timelineLoading = false,
  title,
  onClose,
  onSubmit,
  onStageChange,
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
  const [nextStage, setNextStage] = useState<CreateApplicationDTO['stage']>(initialData?.stage ?? 'Applied');
  const [stageDate, setStageDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stageNotes, setStageNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const orderedTimeline = useMemo(
    () => [...timeline].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
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
      if (initialData && onStageChange && nextStage !== initialData.stage) {
        await onStageChange({
          toStage: nextStage,
          eventDate: stageDate,
          notes: stageNotes || undefined,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

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
            <select
              value={initialData ? nextStage : form.stage}
              onChange={(e) => {
                const value = e.target.value as CreateApplicationDTO['stage'];
                if (initialData) {
                  setNextStage(value);
                } else {
                  setForm({ ...form, stage: value });
                }
              }}
            >
              {applicationStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          {initialData && (
            <>
              <label>
                Stage Change Date
                <input type="date" value={stageDate} onChange={(e) => setStageDate(e.target.value)} />
              </label>
              <label className="full-row">
                Stage Change Notes
                <input
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="Optional context for this transition"
                />
              </label>
            </>
          )}
          <label>
            Applied Date
            <input
              type="date"
              value={toDateInput(form.appliedAt)}
              onChange={(e) => setForm({ ...form, appliedAt: e.target.value })}
              required
              disabled={Boolean(initialData)}
            />
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

          {initialData && (
            <div className="full-row timeline-box" aria-live="polite">
              <h3>Stage Timeline</h3>
              {timelineLoading ? (
                <p>Loading timeline...</p>
              ) : orderedTimeline.length === 0 ? (
                <p>No stage events yet.</p>
              ) : (
                <ul className="timeline-list">
                  {orderedTimeline.map((event) => (
                    <li key={event.id}>
                      <strong>{event.toStage}</strong>
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      {event.notes && <p>{event.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="modal-actions full-row">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={!isValid || loading}>
              {loading ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
