import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CreditCard, Plus } from 'lucide-react';
import { getPayments, getParents } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { formatRupiah, formatDate } from '../../utils/format';

export default function PaymentsPage() {
  const { t } = useLang();
  const [parentId, setParentId] = useState('');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', parentId],
    queryFn: () => getPayments({ parentId: parentId || undefined }).then(r => r.data),
  });

  const { data: parents = [] } = useQuery({ queryKey: ['parents'], queryFn: () => getParents().then(r => r.data) });

  const total = payments.reduce((s, p) => s + parseFloat(p.amount), 0);

  const TH = ({ children, right }) => (
    <th style={{ padding: '0.75rem 1rem', textAlign: right ? 'right' : 'left', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{children}</th>
  );

  return (
    <div>
      <PageHeader
        title={t('paymentsTitle')}
        actions={
          <Link to="/payments/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Plus size={16} /> {t('recordPaymentTitle')}
          </Link>
        }
      />
      <div style={{ marginBottom: '1rem' }}>
        <select className="input" style={{ width: '12rem' }} value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">{t('allParents')}</option>
          {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {payments.length > 0 && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--tx-1)' }}>
          {t('totalPayments')}: <strong style={{ color: '#16A34A' }}>{formatRupiah(total)}</strong> ({payments.length} {t('transactions')})
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <p style={{ padding: '1.5rem', color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
          : !payments.length ? <EmptyState icon={CreditCard} message={t('noPayments')} />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead><tr style={{ backgroundColor: 'var(--bg-head)' }}>
                  <TH>{t('date')}</TH>
                  <TH>{t('name')}</TH>
                  <TH>{t('paymentSource')}</TH>
                  <TH>{t('description')}</TH>
                  <TH right>{t('paymentAmount')}</TH>
                </tr></thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--bd-sub)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--tx-2)', whiteSpace: 'nowrap' }}>{formatDate(p.payment_timestamp)}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--tx-1)' }}>
                        <Link to={`/parents/${p.parent_id}`} style={{ color: 'var(--tx-1)', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#F76C45'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--tx-1)'}>{p.parent_name}</Link>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ backgroundColor: '#FFF4F0', color: '#F76C45', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>{p.source}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--tx-2)' }}>{p.description || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#16A34A' }}>{formatRupiah(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
