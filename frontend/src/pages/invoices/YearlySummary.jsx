import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import { getYearlySummary } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import { formatRupiah, formatDate, monthName } from '../../utils/format';

export default function YearlySummaryPage() {
  const { parentId, year } = useParams();
  const { t } = useLang();
  const y = parseInt(year);

  const { data, isLoading } = useQuery({
    queryKey: ['yearly-summary', parentId, year],
    queryFn: () => getYearlySummary(parentId, year).then(r => r.data),
  });

  if (isLoading) return <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem', padding: '1.5rem' }}>{t('loading')}</p>;
  if (!data) return <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem', padding: '1.5rem' }}>{t('noData')}</p>;

  const { parent, monthly_data, payments, opening_balance, total_sessions, locked } = data;
  const totalPayments = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const closingBalance = opening_balance + totalPayments - total_sessions;

  return (
    <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }} className="no-print">
        <Link to={`/parents/${parentId}`} className="btn-secondary" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ArrowLeft size={15} /> {t('back')}
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/invoices/${parentId}/${y - 1}`} className="btn-secondary" style={{ fontSize: '0.875rem' }}>{y - 1}</Link>
          <Link to={`/invoices/${parentId}/${y + 1}`} className="btn-secondary" style={{ fontSize: '0.875rem' }}>{y + 1}</Link>
          <button className="btn-primary" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={() => window.print()}>
            <Printer size={15} /> {t('print')}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid var(--bd)', overflow: 'hidden' }}>

        {/* Header — orange stripe */}
        <div style={{ padding: '1.25rem 1.5rem', color: '#FFFFFF', backgroundColor: '#F76C45' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontWeight: 600 }}>{t('yearlySummaryTitle')}</div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>{t('year')} {y}</h1>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.25rem', fontWeight: 500 }}>{parent.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>{t('printedOn')}</div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>{new Date().toLocaleDateString('id-ID')}</div>
              {locked && (
                <span style={{ display: 'inline-block', marginTop: '0.5rem', backgroundColor: 'rgba(17,11,10,0.4)', color: '#FFFFFF', fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontWeight: 600 }}>
                  {t('locked')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--bd)', backgroundColor: 'var(--bg-head)' }}>
          <div style={{ padding: '1rem 1.25rem', borderRight: '1px solid var(--bd)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginBottom: '0.25rem', fontWeight: 500 }}>{t('openingBalanceYear')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: opening_balance >= 0 ? '#16A34A' : '#EF4444' }}>
              {formatRupiah(opening_balance)}
            </div>
          </div>
          <div style={{ padding: '1rem 1.25rem', borderRight: '1px solid var(--bd)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginBottom: '0.25rem', fontWeight: 500 }}>{t('totalSessionsYear')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#EF4444' }}>{formatRupiah(total_sessions)}</div>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginBottom: '0.25rem', fontWeight: 500 }}>{t('billLabel')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: closingBalance >= 0 ? '#16A34A' : '#EF4444' }}>
              {formatRupiah(Math.abs(closingBalance))}
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div style={{ padding: '1rem 1.5rem' }}>
          <h2 style={{ fontWeight: 900, color: 'var(--tx-1)', marginBottom: '0.75rem', fontSize: '0.875rem', marginTop: 0 }}>{t('monthlySummary')}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#FFFFFF', fontSize: '0.75rem', backgroundColor: '#F76C45' }}>
                  <th style={{ padding: '0.625rem 0.75rem', textAlign: 'left', fontWeight: 600, borderRadius: '0.375rem 0 0 0' }}>{t('month')}</th>
                  <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>{t('totalSessionsYear')}</th>
                  <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontWeight: 600, borderRadius: '0 0.375rem 0 0' }}>{t('payments')}</th>
                </tr>
              </thead>
              <tbody>
                {monthly_data.map((md) => {
                  const hasData = md.total_sessions > 0 || md.total_payments > 0;
                  return (
                    <tr key={md.month} style={{ borderBottom: '1px solid var(--bd-sub)', color: hasData ? 'var(--tx-2)' : 'var(--tx-3)' }}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        {hasData ? (
                          <Link to={`/invoices/${parentId}/${y}/${md.month}`} style={{ color: '#F76C45', textDecoration: 'none', fontWeight: 600 }}>
                            {monthName(md.month)}
                          </Link>
                        ) : (
                          monthName(md.month)
                        )}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                        {md.total_sessions > 0 ? formatRupiah(md.total_sessions) : '-'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                        {md.total_payments > 0
                          ? <span style={{ color: '#16A34A', fontWeight: 600 }}>{formatRupiah(md.total_payments)}</span>
                          : '-'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'var(--bg-head)', fontWeight: 700 }}>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'var(--tx-1)' }}>{t('total')}</td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#EF4444' }}>{formatRupiah(total_sessions)}</td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#16A34A' }}>{formatRupiah(totalPayments)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payments */}
        {payments.length > 0 && (
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <h2 style={{ fontWeight: 900, color: 'var(--tx-1)', marginBottom: '0.75rem', fontSize: '0.875rem', borderTop: '1px solid var(--bd)', paddingTop: '1rem', marginTop: 0 }}>{t('payments')}</h2>
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#FFFFFF', fontSize: '0.75rem', backgroundColor: '#F76C45' }}>
                  <th style={{ padding: '0.625rem 0.75rem', textAlign: 'left', fontWeight: 600, borderRadius: '0.375rem 0 0 0' }}>{t('date')}</th>
                  <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontWeight: 600, borderRadius: '0 0.375rem 0 0' }}>{t('payments')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--bd-sub)', color: 'var(--tx-2)' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{formatDate(p.payment_timestamp)}</td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#16A34A' }}>{formatRupiah(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'var(--bg-head)', fontWeight: 700 }}>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'var(--tx-1)' }}>{t('total')}</td>
                  <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#16A34A' }}>{formatRupiah(totalPayments)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ backgroundColor: 'var(--bg-head)', padding: '0.75rem 1.5rem', fontSize: '0.75rem', color: 'var(--tx-3)', borderTop: '1px solid var(--bd)' }}>
          {t('printedOn')} {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
