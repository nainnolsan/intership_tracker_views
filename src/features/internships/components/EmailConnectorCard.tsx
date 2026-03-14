import type { EmailConnectorStatusDTO } from '../../../types/internships';

interface EmailConnectorCardProps {
  connector: EmailConnectorStatusDTO;
  onConnect: (provider: 'gmail' | 'outlook') => void;
}

export default function EmailConnectorCard({ connector, onConnect }: EmailConnectorCardProps) {
  return (
    <article className="email-connector-card">
      <div>
        <h3>{connector.provider === 'gmail' ? 'Gmail' : 'Outlook'}</h3>
        <p>{connector.connected ? `Connected (${connector.lastSyncAt ?? 'last sync pending'})` : 'Not connected yet'}</p>
      </div>
      <button type="button" className="btn" onClick={() => onConnect(connector.provider)}>
        {connector.connected ? 'Manage' : 'Connect'}
      </button>
    </article>
  );
}
