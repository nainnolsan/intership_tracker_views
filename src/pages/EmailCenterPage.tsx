import EmailConnectorCard from '../features/internships/components/EmailConnectorCard';
import PageHeader from '../features/internships/components/PageHeader';
import { useEmailCenter } from '../features/internships/hooks/useInternshipsData';
import { internshipsApi } from '../features/internships/api/internshipsApi';

export default function EmailCenterPage() {
  const emailCenterQuery = useEmailCenter();
  const data = emailCenterQuery.data;

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      const result = await internshipsApi.connectEmailProvider(provider);
      window.open(result.redirectUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // The API contract allows either redirectUrl or provider authUrl from status.
      const fallback = data?.connectors.find((item) => item.provider === provider)?.authUrl;
      if (fallback) {
        window.open(fallback, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <section className="view">
      <PageHeader
        title="Email Center"
        subtitle="Manage Gmail/Outlook connectors and map inbound recruiter threads to pipeline stages."
      />

      <div className="email-connectors">
        {(data?.connectors ?? []).map((connector) => (
          <EmailConnectorCard key={connector.provider} connector={connector} onConnect={handleConnect} />
        ))}
      </div>

      <article className="panel">
        <h2>Inbox Threads</h2>
        <div className="thread-list">
          {(data?.threads ?? []).map((thread) => (
            <div key={thread.id} className="thread-item">
              <div>
                <h3>{thread.subject}</h3>
                <p>{thread.company}</p>
              </div>
              <small>{new Date(thread.receivedAt).toLocaleString()}</small>
              <p>{thread.snippet}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
