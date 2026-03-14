import { stageClassName, stageLabels } from '../constants/stageMeta';
import type { ApplicationDTO } from '../../../types/internships';

interface ApplicationsTableProps {
  rows: ApplicationDTO[];
  onEdit: (application: ApplicationDTO) => void;
}

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
              <td>{row.appliedAt}</td>
              <td>
                <button type="button" className="btn btn-ghost" onClick={() => onEdit(row)}>
                  Edit
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
