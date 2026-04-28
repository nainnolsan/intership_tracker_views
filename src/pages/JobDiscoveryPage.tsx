import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_SCRAPED_JOBS, GET_SWIPE_HISTORY } from '../graphql/discoveryQueries';
import { SWIPE_JOB, UPDATE_SCRAPING_PREFERENCES } from '../graphql/discoveryMutations';

interface ScrapedJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  platform: string;
  description?: string;
  postedDate?: string;
}

interface JobInteraction {
  job_id: string;
  status: string;
}

export const JobDiscoveryPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [activeLocation, setActiveLocation] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);

  const { data: jobsData, loading: jobsLoading, refetch: refetchJobs } = useQuery<{ scrapedJobs: ScrapedJob[] }>(GET_SCRAPED_JOBS, {
    variables: { keyword: activeKeyword || undefined, location: activeLocation || undefined },
    fetchPolicy: 'network-only',
  });

  const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useQuery<{ swipeHistory: JobInteraction[] }>(GET_SWIPE_HISTORY, {
    fetchPolicy: 'network-only',
  });

  const [swipeJob] = useMutation(SWIPE_JOB);
  const [updatePreferences, { loading: updatingPrefs }] = useMutation(UPDATE_SCRAPING_PREFERENCES);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveKeyword(keyword);
    setActiveLocation(location);
    refetchJobs();
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferences({
        variables: {
          preferences: [{ keyword: activeKeyword, location: activeLocation || null }]
        }
      });
      alert('¡Preferencias de scraping diario guardadas!');
    } catch (err) {
      console.error(err);
      alert('Error guardando preferencias');
    }
  };

  const handleSwipe = async (job: ScrapedJob, status: 'liked' | 'dismissed') => {
    try {
      await swipeJob({
        variables: {
          jobId: job._id,
          status,
          companyName: job.company,
          roleTitle: job.title,
          location: job.location,
          url: job.link,
        }
      });
      // Refresh history to filter it out from UI
      refetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter out jobs that we already swiped on
  const availableJobs = useMemo(() => {
    if (!jobsData?.scrapedJobs) return [];
    const history = (historyData?.swipeHistory || []) as JobInteraction[];
    const historyIds = new Set(history.map(h => h.job_id));
    
    return jobsData.scrapedJobs.filter((job: ScrapedJob) => !historyIds.has(job._id));
  }, [jobsData, historyData]);

  const isLoading = jobsLoading || historyLoading;

  return (
    <div className="discovery-container animate-fade-in">
      <header className="discovery-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Descubrir Empleos
          </h1>
          <p className="text-gray-500 mt-2">Encuentra y guarda automáticamente oportunidades en tu pipeline.</p>
        </div>
        <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
          ⚙️ Configuración Automática
        </button>
      </header>

      {showSettings && (
        <div className="discovery-settings-panel">
          <h3>Robot Scraper Diario</h3>
          <p>El bot buscará estas palabras clave automáticamente todas las noches a las 3:00 AM.</p>
          <div className="settings-actions">
            <button 
              className="save-prefs-btn" 
              onClick={handleSavePreferences}
              disabled={updatingPrefs || !activeKeyword}
            >
              {updatingPrefs ? 'Guardando...' : 'Guardar Preferencias Actuales'}
            </button>
          </div>
        </div>
      )}

      <form className="discovery-search-bar" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Puesto (ej. Frontend Engineer)" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="search-input-wrapper">
          <span className="search-icon">📍</span>
          <input 
            type="text" 
            placeholder="Locación (ej. Remote, Utah)" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button type="submit" className="search-btn">Buscar</button>
      </form>

      {isLoading ? (
        <div className="discovery-loading">
          <div className="spinner"></div>
          <p>Cargando oportunidades...</p>
        </div>
      ) : (
        <div className="discovery-grid">
          {availableJobs.length === 0 ? (
            <div className="discovery-empty">
              <p>No se encontraron nuevos trabajos con esos filtros.</p>
            </div>
          ) : (
            availableJobs.map((job: ScrapedJob) => (
              <div key={job._id} className="discovery-card">
                <div className="discovery-card-header">
                  <span className="platform-badge">{job.platform}</span>
                  <span className="date-badge">{job.postedDate || 'Reciente'}</span>
                </div>
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta">
                  <span className="meta-item">🏢 {job.company}</span>
                  <span className="meta-item">📍 {job.location}</span>
                </div>
                <div className="discovery-card-actions">
                  <button 
                    className="action-btn dismiss-btn" 
                    onClick={() => handleSwipe(job, 'dismissed')}
                    title="Descartar"
                  >
                    ❌ Descartar
                  </button>
                  <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-btn link-btn"
                  >
                    Ver original
                  </a>
                  <button 
                    className="action-btn accept-btn" 
                    onClick={() => handleSwipe(job, 'liked')}
                    title="Añadir al Pipeline"
                  >
                    ✅ Guardar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
