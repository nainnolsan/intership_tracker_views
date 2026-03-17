import { stageClassName, stageLabels } from '../constants/stageMeta';
import type { ApplicationDTO } from '../../../types/internships';

interface ApplicationsTableProps {
  rows: ApplicationDTO[];
  onEdit: (application: ApplicationDTO) => void;
}

const formatDisplayDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export default function ApplicationsTable({ rows, onEdit }: ApplicationsTableProps) {
  return (
    <div className="panel">
      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Type</th>
            <th>Status</th>
            <th>Applied</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.company}</td>
              <td>{row.roleTitle}</td>
              <td>{row.roleType}</td>
              <td>
                <span className={stageClassName[row.stage]}>{stageLabels[row.stage]}</span>
              </td>
              <td>{formatDisplayDate(row.appliedAt)}</td>
              <td>
                <button type="button" className="btn btn-ghost icon-btn" onClick={() => onEdit(row)} aria-label="Open application actions">
                  &#8942;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="empty-state">No applications found with the current filters.</p>}
    </div>
  );
}
