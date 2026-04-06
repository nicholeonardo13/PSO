import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, RefreshCw, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSalaries, getSalaryDetail, generateSalary } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { formatRupiah, formatDate, formatDuration, monthName } from '../../utils/format';

function TeacherCard({ teacher, index }) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  const sessions = teacher.sessions || [];
  const totalAmount = parseFloat(teacher.total_amount || 0);
  const totalHours = parseFloat(teacher.total_hours || 0);
  const count = teacher.session_count || 0;

  return (
    <div style={{ border: '1px solid var(--bd)', borderRadius: '0.625rem', overflow: 'hidden', marginBottom: '0.625rem' }}>
      {/* Header row — clickable */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: open ? 'var(--bg-head)' : 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textAlign: 'left',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}
      >
        {/* Expand icon */}
        <div style={{ color: open ? '#F76C45' : 'var(--tx-3)', flexShrink: 0 }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        {/* Number badge */}
        <div style={{
          width: '1.75rem', height: '1.75rem', borderRadius: '50%',
          backgroundColor: 'rgba(247,108,69,0.12)', color: '#F76C45',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>

        {/* Teacher name */}
        <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--tx-1)' }}>
          {teacher.teacher_name}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sessionCount')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tx-2)' }}>{count}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalHours')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tx-2)' }}>{formatDuration(totalHours)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalSalary')}</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 900, color: '#16A34A' }}>{formatRupiah(totalAmount)}</div>
          </div>
        </div>
      </button>

      {/* Session detail — expanded */}
      {open && (
        <div style={{ borderTop: '1px solid var(--bd)' }}>
          {sessions.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--tx-3)', fontSize: '0.875rem', fontStyle: 'italic' }}>{t('noSessionsMonth')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(247,108,69,0.05)' }}>
                    <th style={thStyle}>{t('date')}</th>
                    <th style={thStyle}>{t('student')}</th>
                    <th style={thStyle}>{t('parent')}</th>
                    <th style={thStyle}>{t('subject')}</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>{t('duration')}</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>{t('salary')}</th>
                    <th style={thStyle}>{t('notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr
                      key={s.id || i}
                      style={{ borderTop: '1px solid var(--bd-sub)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={tdStyle}>{formatDate(s.session_start_timestamp)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--tx-1)' }}>{s.student_name || '—'}</td>
                      <td style={{ ...tdStyle, color: 'var(--tx-3)' }}>{s.parent_name || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: 'rgba(247,108,69,0.1)',
                          color: '#F76C45',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                        }}>
                          {s.course_name || '—'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--tx-2)' }}>{formatDuration(s.duration_hour)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>{formatRupiah(s.teacher_amount)}</td>
                      <td style={{ ...tdStyle, color: 'var(--tx-3)', fontStyle: s.description ? 'normal' : 'italic' }}>
                        {s.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--bg-head)', fontWeight: 700, borderTop: '2px solid var(--bd)' }}>
                    <td colSpan={4} style={{ padding: '0.625rem 1rem', color: 'var(--tx-2)', fontSize: '0.8125rem' }}>
                      {t('total')} — {count} {t('sessions')}
                    </td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'center', color: 'var(--tx-2)' }}>{formatDuration(totalHours)}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: '#16A34A', fontSize: '0.9375rem' }}>{formatRupiah(totalAmount)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '0.5rem 1rem',
  textAlign: 'left',
  fontWeight: 600,
  color: 'var(--tx-2)',
  fontSize: '0.75rem',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '0.625rem 1rem',
  color: 'var(--tx-2)',
  whiteSpace: 'nowrap',
};

export default function SalaryPage() {
  const qc = useQueryClient();
  const { t } = useLang();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [allOpen, setAllOpen] = useState(false);

  const { data: detail = [], isLoading: detailLoading } = useQuery({
    queryKey: ['salary-detail', year, month],
    queryFn: () => getSalaryDetail(year, month).then(r => r.data),
  });

  const { data: salaries = [], isLoading: salariesLoading } = useQuery({
    queryKey: ['salaries', year, month],
    queryFn: () => getSalaries({ year, month }).then(r => r.data),
  });

  const generateMut = useMutation({
    mutationFn: () => generateSalary(year, month),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salaries'] });
      toast.success(`Gaji ${monthName(month)} ${year} berhasil digenerate`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal generate gaji'),
  });

  const alreadyGenerated = salaries.length > 0;

  // Totals from detail
  const grandTotalAmount = detail.reduce((s, t) => s + parseFloat(t.total_amount || 0), 0);
  const grandTotalHours = detail.reduce((s, t) => s + parseFloat(t.total_hours || 0), 0);
  const grandTotalSessions = detail.reduce((s, t) => s + (t.session_count || 0), 0);

  return (
    <div>
      <PageHeader title={t('salaryTitle')} subtitle={t('salarySubtitle')} />

      {/* Period Selector */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="label">{t('month')}</label>
            <select className="input" style={{ width: '10rem' }} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{monthName(m)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('year')}</label>
            <select className="input" style={{ width: '7rem' }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            onClick={() => generateMut.mutate()}
            disabled={generateMut.isPending}
          >
            {generateMut.isPending
              ? t('generating')
              : alreadyGenerated
                ? <><RefreshCw size={15} /> {t('regenerateSalary')}</>
                : <><CheckCircle2 size={15} /> {t('generateSalary')}</>
            }
          </button>
        </div>
        {alreadyGenerated && (
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#D97706', marginTop: '0.75rem', marginBottom: 0 }}>
            <AlertTriangle size={13} />
            {t('salaryTitle')} {monthName(month)} {year} {t('salaryAlreadyGen')}
          </p>
        )}
      </div>

      {/* Detail per teacher */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div>
            <h2 style={{ fontWeight: 700, color: 'var(--tx-1)', fontSize: '0.9375rem', margin: 0 }}>
              {t('salaryPreview')} — {monthName(month)} {year}
            </h2>
            {detail.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--tx-3)', margin: '0.2rem 0 0' }}>{t('salaryDetailSub')}</p>
            )}
          </div>
          {detail.length > 1 && (
            <button
              className="btn-secondary"
              style={{ fontSize: '0.8125rem' }}
              onClick={() => setAllOpen(v => !v)}
            >
              {allOpen ? t('collapseAll') : t('expandAll')}
            </button>
          )}
        </div>

        {detailLoading ? (
          <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
        ) : !detail.length ? (
          <div className="card" style={{ padding: 0 }}>
            <EmptyState icon={Briefcase} message={t('noSessionsMonth')} />
          </div>
        ) : (
          <>
            {detail.map((teacher, i) => (
              <TeacherCardControlled
                key={teacher.teacher_id}
                teacher={teacher}
                index={i}
                forceOpen={allOpen}
              />
            ))}

            {/* Grand total bar */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(247,108,69,0.06)',
              border: '1px solid rgba(247,108,69,0.2)',
              borderRadius: '0.625rem',
              padding: '0.875rem 1.25rem',
              marginTop: '0.5rem',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--tx-1)', marginRight: 'auto' }}>
                {t('total')} — {detail.length} {t('teacher').toLowerCase()}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--tx-2)' }}>
                {grandTotalSessions} {t('sessions')}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--tx-2)' }}>
                {formatDuration(grandTotalHours)}
              </span>
              <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#16A34A' }}>
                {formatRupiah(grandTotalAmount)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Stored salary */}
      {alreadyGenerated && (
        <div className="card">
          <h2 style={{ fontWeight: 700, color: 'var(--tx-1)', marginBottom: '0.75rem', fontSize: '0.9375rem', marginTop: 0 }}>
            {t('salaryStored')} — {monthName(month)} {year}
          </h2>
          {salariesLoading ? (
            <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-head)' }}>
                    <th style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem' }}>{t('teacher')}</th>
                    <th style={{ padding: '0.625rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem' }}>{t('salary')}</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((s) => (
                    <tr key={s.id} style={{ borderTop: '1px solid var(--bd-sub)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '0.625rem 1rem', fontWeight: 600, color: 'var(--tx-1)' }}>{s.teacher_name}</td>
                      <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>{formatRupiah(s.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--bg-head)', borderTop: '2px solid var(--bd)' }}>
                    <td style={{ padding: '0.625rem 1rem', fontWeight: 700, color: 'var(--tx-1)' }}>{t('total')}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontWeight: 900, color: '#16A34A', fontSize: '1rem' }}>
                      {formatRupiah(salaries.reduce((s, r) => s + parseFloat(r.amount || 0), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Controlled version that responds to forceOpen
function TeacherCardControlled({ teacher, index, forceOpen }) {
  const [localOpen, setLocalOpen] = useState(false);
  const { t } = useLang();

  const open = forceOpen || localOpen;
  const sessions = teacher.sessions || [];
  const totalAmount = parseFloat(teacher.total_amount || 0);
  const totalHours = parseFloat(teacher.total_hours || 0);
  const count = teacher.session_count || 0;

  return (
    <div style={{ border: '1px solid var(--bd)', borderRadius: '0.625rem', overflow: 'hidden', marginBottom: '0.5rem' }}>
      <button
        onClick={() => setLocalOpen(!localOpen)}
        style={{
          width: '100%',
          background: open ? 'var(--bg-head)' : 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}
      >
        <div style={{ color: open ? '#F76C45' : 'var(--tx-3)', flexShrink: 0 }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <div style={{
          width: '1.75rem', height: '1.75rem', borderRadius: '50%',
          backgroundColor: 'rgba(247,108,69,0.12)', color: '#F76C45',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--tx-1)' }}>
          {teacher.teacher_name}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sessionCount')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tx-2)' }}>{count}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalHours')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tx-2)' }}>{formatDuration(totalHours)}</div>
          </div>
          <div style={{ textAlign: 'right', minWidth: '7rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--tx-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalSalary')}</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 900, color: '#16A34A' }}>{formatRupiah(totalAmount)}</div>
          </div>
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--bd)' }}>
          {sessions.length === 0 ? (
            <p style={{ padding: '1rem', color: 'var(--tx-3)', fontSize: '0.875rem', fontStyle: 'italic' }}>{t('noSessionsMonth')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(247,108,69,0.04)' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>{t('date')}</th>
                    <th style={thStyle}>{t('student')}</th>
                    <th style={thStyle}>{t('parent')}</th>
                    <th style={thStyle}>{t('subject')}</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>{t('duration')}</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>{t('salary')}</th>
                    <th style={thStyle}>{t('notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr
                      key={s.id || i}
                      style={{ borderTop: '1px solid var(--bd-sub)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ ...tdStyle, color: 'var(--tx-3)', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(s.session_start_timestamp)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--tx-1)' }}>{s.student_name || '—'}</td>
                      <td style={{ ...tdStyle, color: 'var(--tx-3)' }}>{s.parent_name || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: 'rgba(247,108,69,0.1)',
                          color: '#F76C45',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          whiteSpace: 'nowrap',
                        }}>
                          {s.course_name || '—'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--tx-2)' }}>{formatDuration(s.duration_hour)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>{formatRupiah(s.teacher_amount)}</td>
                      <td style={{ ...tdStyle, color: 'var(--tx-3)', fontStyle: s.description ? 'normal' : 'italic', maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--bg-head)', borderTop: '2px solid var(--bd)', fontWeight: 700 }}>
                    <td colSpan={5} style={{ padding: '0.625rem 1rem', color: 'var(--tx-2)', fontSize: '0.8125rem' }}>
                      {t('total')} — {count} {t('sessions')}
                    </td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'center', color: 'var(--tx-2)' }}>{formatDuration(totalHours)}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: '#16A34A', fontSize: '0.9375rem' }}>{formatRupiah(totalAmount)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
