import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, ArrowRight } from 'lucide-react';
import { getParents } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import { monthName } from '../../utils/format';

export default function GenerateInvoicePage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const now = new Date();

  const [form, setForm] = useState({
    parentId: '',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const { data: parents = [], isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: () => getParents().then(r => r.data),
  });

  const handleOpen = () => {
    if (!form.parentId) return;
    navigate(`/invoices/${form.parentId}/${form.year}/${form.month}`);
  };

  return (
    <div style={{ maxWidth: '34rem' }}>
      <PageHeader
        title={t('generateInvoiceTitle')}
        subtitle={t('generateInvoiceSubtitle')}
      />

      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Parent selector */}
          <div>
            <label className="label">{t('parent')} *</label>
            <select
              className="input"
              value={form.parentId}
              onChange={e => setForm({ ...form, parentId: e.target.value })}
            >
              <option value="">{isLoading ? t('loading') : t('selectParent')}</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Month + Year */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">{t('month')} *</label>
              <select
                className="input"
                value={form.month}
                onChange={e => setForm({ ...form, month: parseInt(e.target.value) })}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{monthName(m)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('year')} *</label>
              <select
                className="input"
                value={form.year}
                onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
              >
                {[2023, 2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected info */}
          {form.parentId && (
            <div style={{
              backgroundColor: 'rgba(247,108,69,0.08)',
              border: '1px solid rgba(247,108,69,0.2)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              color: 'var(--tx-2)',
            }}>
              <FileText size={14} style={{ display: 'inline', marginRight: '0.5rem', color: '#F76C45', verticalAlign: 'middle' }} />
              Invoice{' '}
              <strong style={{ color: 'var(--tx-1)' }}>
                {parents.find(p => p.id === form.parentId)?.name}
              </strong>
              {' — '}{monthName(form.month)} {form.year}
            </div>
          )}

          <button
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: !form.parentId ? 0.5 : 1,
              cursor: !form.parentId ? 'not-allowed' : 'pointer',
            }}
            disabled={!form.parentId}
            onClick={handleOpen}
          >
            <FileText size={16} />
            {t('openInvoice')}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
