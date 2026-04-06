import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const maxW = { sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem' }[size] || '28rem';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)' }} />
      <div style={{ position: 'relative', backgroundColor: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: '0.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: maxW, maxHeight: '90vh', overflowY: 'auto', color: 'var(--tx-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--bd)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tx-1)', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ color: 'var(--tx-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <X size={17} />
          </button>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}
