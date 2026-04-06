import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import { getMonthlyInvoice } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import { formatRupiah, formatDate, formatDuration, monthName } from '../../utils/format';

export default function MonthlyInvoicePage() {
  const { parentId, year, month } = useParams();
  const { t } = useLang();

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', parentId, year, month],
    queryFn: () => getMonthlyInvoice(parentId, year, month).then(r => r.data),
  });

  if (isLoading) return <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem', padding: '1.5rem' }}>{t('loading')}</p>;
  if (!data) return <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem', padding: '1.5rem' }}>{t('noData')}</p>;

  const { parent, sessions, payments, summary, locked } = data;
  const y = parseInt(year);
  const m = parseInt(month);

  const byStudent = sessions.reduce((acc, s) => {
    if (!acc[s.student_id]) acc[s.student_id] = { name: s.student_name, courses: {} };
    if (!acc[s.student_id].courses[s.course_id])
      acc[s.student_id].courses[s.course_id] = { name: s.course_name, sessions: [] };
    acc[s.student_id].courses[s.course_id].sessions.push(s);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }} className="no-print">
        <Link to={`/parents/${parentId}`} className="btn-secondary" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ArrowLeft size={15} /> {t('back')}
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/invoices/${parentId}/${year}`} className="btn-secondary" style={{ fontSize: '0.875rem' }}>{t('yearlySummary')} {year}</Link>
          <button className="btn-primary" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={() => window.print()}>
            <Printer size={15} /> {t('print')}
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid var(--bd)', overflow: 'hidden' }} id="invoice-print">

        {/* Header — orange stripe */}
        <div style={{ padding: '1.25rem 1.5rem', color: '#FFFFFF', backgroundColor: '#F76C45' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontWeight: 600 }}>{t('invoice')}</div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>{monthName(m)} {y}</h1>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.25rem', fontWeight: 500 }}>{parent.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {locked && (
                <span style={{ backgroundColor: 'rgba(17,11,10,0.4)', color: '#FFFFFF', fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontWeight: 600 }}>
                  {t('locked')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--bd)' }}>
          <div style={{ padding: '1rem 1.5rem', borderRight: '1px solid var(--bd)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginBottom: '0.25rem', fontWeight: 500 }}>{t('openingBalance')}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, color: summary.opening_balance >= 0 ? '#16A34A' : '#EF4444' }}>
              {formatRupiah(summary.opening_balance)}
            </div>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginBottom: '0.25rem', fontWeight: 500 }}>{t('monthPayments')}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#16A34A' }}>{formatRupiah(summary.total_payments)}</div>
          </div>
          <div style={{ padding: '1rem 1.5rem', borderRight: '1px solid var(--bd)', borderTop: '1px solid var(--bd)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginBottom: '0.25rem', fontWeight: 500 }}>{t('monthSessions')}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#EF4444' }}>-{formatRupiah(summary.total_sessions)}</div>
          </div>
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--bd)', backgroundColor: 'var(--bg-head)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginBottom: '0.25rem', fontWeight: 500 }}>{t('closingBalance')}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, color: summary.closing_balance >= 0 ? '#16A34A' : '#EF4444' }}>
              {formatRupiah(Math.abs(summary.closing_balance))}
              <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.25rem', color: 'var(--tx-3)' }}>
                {summary.closing_balance >= 0 ? `(${t('paid')})` : `(${t('underpaid')})`}
              </span>
            </div>
          </div>
        </div>

        {/* Sessions by student */}
        <div style={{ padding: '1rem 1.5rem' }}>
          {Object.keys(byStudent).length === 0 ? (
            <p style={{ color: 'var(--tx-3)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>{t('noSessionsInvoice')}</p>
          ) : (
            Object.values(byStudent).map((student) => (
              <div key={student.name} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 900, color: 'var(--tx-1)', marginBottom: '0.75rem', fontSize: '0.875rem', borderBottom: '1px solid var(--bd)', paddingBottom: '0.5rem', marginTop: 0 }}>
                  {student.name}
                </h3>
                {Object.values(student.courses).map((course) => {
                  const courseTotal = course.sessions.reduce((s, ses) => s + parseFloat(ses.parent_amount), 0);
                  return (
                    <div key={course.name} style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#F76C45', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{course.name}</div>
                      <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ fontSize: '0.75rem', color: 'var(--tx-3)', borderBottom: '1px solid var(--bd)' }}>
                            <th style={{ textAlign: 'left', paddingBottom: '0.25rem', fontWeight: 600 }}>{t('teacher')}</th>
                            <th style={{ textAlign: 'left', paddingBottom: '0.25rem', fontWeight: 600 }}>{t('date')}</th>
                            <th style={{ textAlign: 'left', paddingBottom: '0.25rem', fontWeight: 600 }}>{t('duration')}</th>
                            <th style={{ textAlign: 'right', paddingBottom: '0.25rem', fontWeight: 600 }}>{t('cost')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.sessions.map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--bd-sub)', color: parseFloat(s.parent_amount) < 0 ? '#EF4444' : 'var(--tx-2)' }}>
                              <td style={{ padding: '0.375rem 0' }}>{s.teacher_name}</td>
                              <td style={{ padding: '0.375rem 0' }}>{formatDate(s.session_start_timestamp)}</td>
                              <td style={{ padding: '0.375rem 0' }}>{formatDuration(s.duration_hour)}</td>
                              <td style={{ padding: '0.375rem 0', textAlign: 'right', fontWeight: 500 }}>{formatRupiah(s.parent_amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} style={{ paddingTop: '0.25rem', fontSize: '0.75rem', color: 'var(--tx-3)', fontWeight: 600 }}>{t('subtotal')} {course.name}</td>
                            <td style={{ paddingTop: '0.25rem', textAlign: 'right', fontWeight: 900, color: 'var(--tx-1)' }}>{formatRupiah(courseTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Payments */}
        {payments.length > 0 && (
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <h3 style={{ fontWeight: 900, color: 'var(--tx-1)', marginBottom: '0.75rem', fontSize: '0.875rem', borderBottom: '1px solid var(--bd)', paddingBottom: '0.5rem', marginTop: 0 }}>
              {t('payments')}
            </h3>
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: '0.75rem', color: 'var(--tx-3)', borderBottom: '1px solid var(--bd)' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '0.25rem', fontWeight: 600 }}>{t('date')}</th>
                  <th style={{ textAlign: 'right', paddingBottom: '0.25rem', fontWeight: 600 }}>{t('payments')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--bd-sub)', color: 'var(--tx-2)' }}>
                    <td style={{ padding: '0.375rem 0' }}>{formatDate(p.payment_timestamp)}</td>
                    <td style={{ padding: '0.375rem 0', textAlign: 'right', fontWeight: 600, color: '#16A34A' }}>{formatRupiah(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ backgroundColor: 'var(--bg-head)', padding: '0.75rem 1.5rem', fontSize: '0.75rem', color: 'var(--tx-3)', borderTop: '1px solid var(--bd)' }}>
          {t('printedOn')} {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }} className="no-print">
        {m === 1
          ? <Link to={`/invoices/${parentId}/${y - 1}/12`} style={{ fontSize: '0.875rem', color: '#F76C45', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ArrowLeft size={14} /> {monthName(12)} {y - 1}</Link>
          : <Link to={`/invoices/${parentId}/${y}/${m - 1}`} style={{ fontSize: '0.875rem', color: '#F76C45', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ArrowLeft size={14} /> {monthName(m - 1)} {y}</Link>
        }
        {m === 12
          ? <Link to={`/invoices/${parentId}/${y + 1}/1`} style={{ fontSize: '0.875rem', color: '#F76C45', textDecoration: 'none' }}>{monthName(1)} {y + 1} →</Link>
          : <Link to={`/invoices/${parentId}/${y}/${m + 1}`} style={{ fontSize: '0.875rem', color: '#F76C45', textDecoration: 'none' }}>{monthName(m + 1)} {y} →</Link>
        }
      </div>
    </div>
  );
}
