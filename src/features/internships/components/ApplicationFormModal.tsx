import { useMemo, useState } from 'react';
import { applicationStages, roleTypes } from '../../../types/internships';
import type { ApplicationDTO, CreateApplicationDTO } from '../../../types/internships';

interface ApplicationFormModalProps {
  initialData?: ApplicationDTO;
  title: string;
  onClose: () => void;
  onSubmit: (payload: CreateApplicationDTO) => Promise<void>;
}

export default function ApplicationFormModal({ initialData, title, onClose, onSubmit }: ApplicationFormModalProps) {
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
  const [loading, setLoading] = useState(false);

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
            <input type="date" value={form.appliedAt} onChange={(e) => setForm({ ...form, appliedAt: e.target.value })} required />
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
      </div>
    </div>
  );
}
