import { Trash2 } from 'lucide-react';
import Modal from './Modal';
import { useLang } from '../contexts/LanguageContext';
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  const { t } = useLang();
  return (
    <Modal open={open} onClose={onClose} title={title || t('confirm')} size="sm">
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Trash2 size={18} color="#EF4444" />
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--tx-2)', lineHeight: 1.6, marginTop: '0.5rem', marginBottom: 0 }}>{message}</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onClose} disabled={loading}>{t('cancel')}</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>{loading ? t('deleting') : t('delete')}</button>
      </div>
    </Modal>
  );
}
