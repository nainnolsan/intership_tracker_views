import { useMemo, useState } from 'react';
import ApplicationsTable from '../features/internships/components/ApplicationsTable';
import ApplicationFormModal from '../features/internships/components/ApplicationFormModal';
import PageHeader from '../features/internships/components/PageHeader';
import { useApplications, useCreateApplication, useUpdateApplication } from '../features/internships/hooks/useInternshipsData';
import { applicationStages, roleTypes } from '../types/internships';
import type { ApplicationDTO, ApplicationFiltersDTO, CreateApplicationDTO } from '../types/internships';

const initialFilters: ApplicationFiltersDTO = {
  stage: 'All',
  roleType: 'All',
  company: '',
  fromDate: '',
  toDate: '',
  q: '',
};

export default function ApplicationsPage() {
  const [filters, setFilters] = useState<ApplicationFiltersDTO>(initialFilters);
  const [modalState, setModalState] = useState<{ open: boolean; editing?: ApplicationDTO }>({ open: false });

  const applicationsQuery = useApplications(filters);
  const createApplication = useCreateApplication();
  const updateApplication = useUpdateApplication();

  const rows = useMemo(() => applicationsQuery.data ?? [], [applicationsQuery.data]);

  const saveApplication = async (payload: CreateApplicationDTO) => {
    if (modalState.editing) {
      await updateApplication.mutateAsync({ id: modalState.editing.id, payload });
      return;
    }

    await createApplication.mutateAsync(payload);
  };

  return (
    <section className="view">
      <PageHeader
        title="Applications"
        subtitle="Filter by status, company, date, and role type. Add and edit applications quickly."
        action={
          <button type="button" className="btn" onClick={() => setModalState({ open: true })}>
            New Application
          </button>
        }
      />

      <div className="panel filter-grid">
        <label>
          Search
          <input
            placeholder="Company, role, notes"
            value={filters.q}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
          />
        </label>
        <label>
          Stage
          <select value={filters.stage} onChange={(e) => setFilters((prev) => ({ ...prev, stage: e.target.value as ApplicationFiltersDTO['stage'] }))}>
            <option value="All">All</option>
            {applicationStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <label>
          Company
          <input value={filters.company} onChange={(e) => setFilters((prev) => ({ ...prev, company: e.target.value }))} />
        </label>
        <label>
          Role Type
          <select value={filters.roleType} onChange={(e) => setFilters((prev) => ({ ...prev, roleType: e.target.value as ApplicationFiltersDTO['roleType'] }))}>
            <option value="All">All</option>
            {roleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <input type="date" value={filters.fromDate} onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))} />
        </label>
        <label>
          To
          <input type="date" value={filters.toDate} onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))} />
        </label>
      </div>

      <ApplicationsTable rows={rows} onEdit={(application) => setModalState({ open: true, editing: application })} />

      {modalState.open && (
        <ApplicationFormModal
          title={modalState.editing ? 'Edit application' : 'New application'}
          initialData={modalState.editing}
          onClose={() => setModalState({ open: false })}
          onSubmit={saveApplication}
        />
      )}
    </section>
  );
}
