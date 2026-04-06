import { TrendingUp } from 'lucide-react';

const iconMap = {
  orange: { bg: '#FFF4F0',                 color: '#F76C45' },
  dark:   { bg: 'rgba(255,255,255,0.08)',  color: 'var(--tx-2)' },
  red:    { bg: '#FEF2F2',                 color: '#EF4444' },
  green:  { bg: '#F0FDF4',                 color: '#16A34A' },
};

export default function StatCard({ label, value, icon: Icon, color = 'orange' }) {
  const ic = iconMap[color] || iconMap.orange;
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--bd)', borderRadius: '0.75rem', padding: '1.25rem', transition: 'box-shadow 0.2s', cursor: 'default' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: ic.bg, color: ic.color, flexShrink: 0 }}>
          {Icon && <Icon size={20} />}
        </div>
        <TrendingUp size={14} color="#F76C45" style={{ opacity: 0.6 }} />
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--tx-1)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--tx-2)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}
