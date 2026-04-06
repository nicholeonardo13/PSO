import { Inbox } from 'lucide-react';
export default function EmptyState({ message = 'Tidak ada data', icon: Icon = Inbox }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#FFF4F0', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
        <Icon size={24} color="#F76C45" style={{ opacity: 0.6 }} />
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--tx-2)', fontWeight: 500, margin: 0 }}>{message}</p>
    </div>
  );
}
