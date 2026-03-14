import EmailConnectorCard from '../features/internships/components/EmailConnectorCard';
import PageHeader from '../features/internships/components/PageHeader';
import { useEmailCenter, useConnectEmailProvider } from '../features/internships/hooks/useInternshipsData';

export default function EmailCenterPage() {
  const emailCenterQuery = useEmailCenter();
  const connectProvider = useConnectEmailProvider();
  const data = emailCenterQuery.data;

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      const result = await connectProvider.mutateAsync(provider);
      const redirectUrl = result?.data?.connectInternshipEmailProvider?.redirectUrl;
      if (redirectUrl) {
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    } catch {
      // fall through to authUrl fallback
    }
    const fallback = data?.connectors.find((item) => item.provider === provider)?.authUrl;
    if (fallback) {
      window.open(fallback, '_blank', 'noopener,noreferrer');
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
