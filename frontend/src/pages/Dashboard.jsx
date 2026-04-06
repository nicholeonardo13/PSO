import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, ClipboardList, CreditCard, Briefcase } from 'lucide-react';
import { getDashboard } from '../services/api';
import { useLang } from '../contexts/LanguageContext';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import { formatRupiah, monthName } from '../utils/format';

export default function DashboardPage() {
  const { t } = useLang();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
    refetchInterval: 60000,
  });
  const now = new Date();

  if (isLoading) return <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>;

  return (
    <div>
      <PageHeader title={t('dashboardTitle')} subtitle={`${monthName(now.getMonth() + 1)} ${now.getFullYear()}`} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }} className="lg:grid-cols-4">
        <StatCard label={t('dashTotalParents')}  value={data?.total_parents ?? 0}       icon={Users}         color="orange" />
        <StatCard label={t('dashTotalStudents')} value={data?.total_students ?? 0}      icon={GraduationCap} color="dark" />
        <StatCard label={t('dashTotalTeachers')} value={data?.total_teachers ?? 0}      icon={GraduationCap} color="orange" />
        <StatCard label={t('dashSessionsMonth')} value={data?.sessions_this_month ?? 0} icon={ClipboardList} color="dark" />
      </div>

      {/* Outstanding */}
      <div className="card" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--bd)' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--tx-1)', margin: 0 }}>{t('dashOutstanding')}</h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#FFF4F0', color: '#F76C45', padding: '0.25rem 0.625rem', borderRadius: '9999px' }}>
            {data?.outstanding_bills?.length ?? 0} {t('dashParentsCount')}
          </span>
        </div>
        {!data?.outstanding_bills?.length ? (
          <p style={{ textAlign: 'center', color: 'var(--tx-3)', fontSize: '0.875rem', padding: '2.5rem 1rem' }}>{t('dashAllPaid')}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-head)' }}>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem' }}>{t('dashParent')}</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem' }}>{t('dashBill')}</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.outstanding_bills.map((bill) => (
                  <tr key={bill.parent_id} style={{ borderTop: '1px solid var(--bd-sub)' }}>
                    <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--tx-1)' }}>{bill.parent_name}</td>
                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#EF4444' }}>{formatRupiah(Math.abs(bill.current_balance_amount))}</td>
                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                      <Link to={`/invoices/${bill.parent_id}/${bill.year}/${bill.month}`} style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F76C45', textDecoration: 'none' }}>
                        {t('dashViewInvoice')} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{t('quickActions')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }} className="md:grid-cols-4">
        {[
          { to: '/sessions/new', icon: ClipboardList, label: t('dashInputSession'),  bg: '#FFF4F0', ic: '#F76C45' },
          { to: '/payments/new', icon: CreditCard,    label: t('dashRecordPayment'), bg: '#F0FDF4', ic: '#16A34A' },
          { to: '/parents',      icon: Users,         label: t('dashParentData'),    bg: '#EFF6FF', ic: '#2563EB' },
          { to: '/salary',       icon: Briefcase,     label: t('dashTeacherSalary'), bg: '#FAF5FF', ic: '#7C3AED' },
        ].map(({ to, icon: Icon, label, bg, ic }) => (
          <Link key={to} to={to} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', backgroundColor: bg }}>
              <Icon size={22} color={ic} />
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--tx-1)' }}>{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
