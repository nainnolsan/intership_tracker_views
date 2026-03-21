import { stageClassName, stageLabels } from '../constants/stageMeta';
import type { ApplicationDTO, ApplicationStage } from '../../../types/internships';

interface PipelineColumnProps {
  column: {
    stage: string;
    total: number;
    applications: ApplicationDTO[];
  };
  label?: string;
}

export default function PipelineColumn({ column, label }: PipelineColumnProps) {
  const stageKey = column.stage as ApplicationStage;
  const stageLabel = label ?? stageLabels[stageKey] ?? column.stage;
  const stageChipClass = stageClassName[stageKey] ?? 'chip';

  return (
    <section className="pipeline-column">
      <header>
        <h3>{stageLabel}</h3>
        <span className={stageChipClass}>{column.total}</span>
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
