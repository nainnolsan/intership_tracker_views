import { stageClassName, stageLabels } from '../constants/stageMeta';
import type { PipelineColumnDTO } from '../../../types/internships';

interface PipelineColumnProps {
  column: PipelineColumnDTO;
}

export default function PipelineColumn({ column }: PipelineColumnProps) {
  return (
    <section className="pipeline-column">
      <header>
        <h3>{stageLabels[column.stage]}</h3>
        <span className={stageClassName[column.stage]}>{column.total}</span>
      </header>
      <div className="pipeline-list">
        {column.applications.map((application) => (
          <article key={application.id} className="pipeline-card">
            <p className="company">{application.company}</p>
            <p className="role">{application.roleTitle}</p>
            <small>{application.appliedAt}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
