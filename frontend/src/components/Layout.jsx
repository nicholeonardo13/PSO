import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, DollarSign,
  ClipboardList, CreditCard, Briefcase, FileText, Sun, Moon, Globe, Menu, X, LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';

const getNavGroups = (t) => [
  {
    label: 'MENU',
    items: [
      { to: '/',              label: t('navDashboard'),  Icon: LayoutDashboard, end: true },
      { to: '/parents',       label: t('navParents'),    Icon: Users },
      { to: '/teachers',      label: t('navTeachers'),   Icon: GraduationCap },
      { to: '/courses',       label: t('navCourses'),    Icon: BookOpen },
      { to: '/session-rates', label: t('navRates'),      Icon: DollarSign },
    ],
  },
  {
    label: 'TRANSAKSI',
    items: [
      { to: '/sessions',         label: t('navSessions'),  Icon: ClipboardList },
      { to: '/payments',         label: t('navPayments'),  Icon: CreditCard },
      { to: '/invoices/generate',label: t('navInvoice'),   Icon: FileText },
      { to: '/salary',           label: t('navSalary'),    Icon: Briefcase },
    ],
  },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = () => { signOut(); navigate('/login'); };
  const navGroups = getNavGroups(t);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg)' }}>

      {/* ── Sidebar — always orange ── */}
      <aside
        style={{
          backgroundColor: '#F76C45',
          width: '256px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
        className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200`}
      >
        {/* Logo */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '-0.02em' }}>PSO</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('appName')}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('appSubtitle')}</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem' }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem', marginBottom: '0.375rem' }}>
                {group.label}
              </p>
              {group.items.map(({ to, label, Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#F76C45' : 'rgba(255,255,255,0.82)',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    textDecoration: 'none',
                    marginBottom: '0.125rem',
                    transition: 'background-color 0.15s, color 0.15s',
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.style.backgroundColor.includes('255, 255, 255')) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.style.backgroundColor.includes('rgb(255, 255, 255)')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.82)';
                    }
                  }}
                >
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0.5rem', marginBottom: '0.375rem' }}>
            <div style={{ width: '2rem', height: '2rem', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF', flexShrink: 0 }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>{t('administrator')}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.15s, color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <LogOut size={15} />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="mobile-only" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--bd)', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }} className="no-print">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="mobile-only" style={{ color: 'var(--tx-2)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', alignItems: 'center' }}>
              <Menu size={20} />
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={toggleLang}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--tx-2)', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--bd)', cursor: 'pointer' }}
          >
            <Globe size={14} />
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
          <button
            onClick={toggleTheme}
            style={{ padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--tx-2)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
