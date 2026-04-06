import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sun, Moon, Globe, Eye, EyeOff, BookOpen, BarChart2, Users, FileText } from 'lucide-react';
import { login } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      signIn(res.data.token, { username: res.data.username });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BarChart2, text: lang === 'id' ? 'Dashboard tagihan & pembayaran realtime' : 'Real-time billing & payment dashboard' },
    { icon: Users,     text: lang === 'id' ? 'Manajemen guru, murid & orang tua'       : 'Teacher, student & parent management' },
    { icon: FileText,  text: lang === 'id' ? 'Generate invoice & laporan bulanan'       : 'Generate invoices & monthly reports' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg)' }}>

      {/* Left — orange brand panel */}
      <div style={{ display: 'none', width: '45%', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem', backgroundColor: '#F76C45', position: 'relative', overflow: 'hidden' }}
        className="md:flex">
        <div style={{ position: 'absolute', top: '-7rem', right: '-7rem', width: '24rem', height: '24rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-4rem', left: '-4rem', width: '18rem', height: '18rem', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '3rem', height: '3rem', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color="#FFFFFF" />
            </div>
            <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>PSO</span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
            PSO Custom<br />Backoffice
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '18rem', margin: 0 }}>
            {t('loginTagline')}
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {features.map(({ icon: FeatIcon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <div style={{ width: '2rem', height: '2rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FeatIcon size={15} color="#FFFFFF" />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', margin: 0 }}>{t('loginSubtitle')} © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: 'var(--bg)' }}>
        {/* Controls */}
        <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
          <button onClick={toggleLang} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--tx-2)', backgroundColor: 'var(--bg-head)', border: '1px solid var(--bd)', cursor: 'pointer' }}>
            <Globe size={13} />{lang === 'id' ? 'EN' : 'ID'}
          </button>
          <button onClick={toggleTheme} style={{ padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--tx-2)', backgroundColor: 'var(--bg-head)', border: '1px solid var(--bd)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Form content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: '22rem' }}>
            {/* Mobile logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }} className="md:hidden">
              <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#F76C45', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <BookOpen size={26} color="#FFFFFF" />
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--tx-1)', margin: 0, letterSpacing: '-0.02em' }}>PSO Custom Backoffice</h1>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--tx-1)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>{t('loginTitle')}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--tx-2)', margin: 0 }}>{t('loginSubtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label">{t('loginUsername')}</label>
                <input className="input" type="text" placeholder="admin" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required autoFocus />
              </div>
              <div>
                <label className="label">{t('loginPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--tx-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', justifyContent: 'center' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ animation: 'spin 1s linear infinite', height: '1rem', width: '1rem' }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                    </svg>
                    {t('loginLoading')}
                  </span>
                ) : t('loginButton')}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--tx-3)', marginTop: '1.5rem', marginBottom: 0 }}>{t('loginDefault')}</p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
