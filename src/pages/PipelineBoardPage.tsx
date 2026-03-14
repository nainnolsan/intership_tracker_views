import PipelineColumn from '../features/internships/components/PipelineColumn';
import PageHeader from '../features/internships/components/PageHeader';
import { usePipelineBoard } from '../features/internships/hooks/useInternshipsData';

export default function PipelineBoardPage() {
  const pipelineQuery = usePipelineBoard();

  return (
    <section className="view">
      <PageHeader title="Pipeline Board" subtitle="Kanban-style stage tracking for every active application." />
      <div className="pipeline-board">
        {(pipelineQuery.data ?? []).map((column) => (
          <PipelineColumn key={column.stage} column={column} />
        ))}
      </div>
    </section>
  );
}
