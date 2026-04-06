import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getSessions, getParents, getTeachers, getCourses,
  updateSession, deleteSession,
} from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { formatRupiah, formatDate, formatDuration, monthName } from '../../utils/format';

export default function SessionsPage() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const now = new Date();

  const [filters, setFilters] = useState({
    parentId: '',
    teacherId: '',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  // Edit modal state
  const [editModal, setEditModal] = useState({ open: false, session: null });
  const [editForm, setEditForm] = useState({});

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, label: '' });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => getSessions({
      parentId: filters.parentId || undefined,
      teacherId: filters.teacherId || undefined,
      year: filters.year,
      month: filters.month,
    }).then(r => r.data),
  });

  const { data: parents = [] } = useQuery({ queryKey: ['parents'], queryFn: () => getParents().then(r => r.data) });
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: () => getTeachers().then(r => r.data) });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => getCourses().then(r => r.data) });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Sesi berhasil diupdate');
      setEditModal({ open: false, session: null });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal update sesi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Sesi berhasil dihapus');
      setDeleteConfirm({ open: false, id: null, label: '' });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal hapus sesi'),
  });

  const openEdit = (s) => {
    setEditForm({
      teacher_id: s.teacher_id || '',
      course_id: s.course_id || '',
      session_start_timestamp: s.session_start_timestamp
        ? new Date(s.session_start_timestamp).toISOString().slice(0, 16)
        : '',
      duration_hour: s.duration_hour != null ? String(s.duration_hour) : '',
      parent_amount: s.parent_amount != null ? String(s.parent_amount) : '',
      teacher_amount: s.teacher_amount != null ? String(s.teacher_amount) : '',
      description: s.description || '',
    });
    setEditModal({ open: true, session: s });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: editModal.session.id,
      data: {
        teacher_id: editForm.teacher_id || null,
        course_id: editForm.course_id || null,
        session_start_timestamp: editForm.session_start_timestamp
          ? new Date(editForm.session_start_timestamp).toISOString()
          : undefined,
        duration_hour: editForm.duration_hour !== '' ? parseFloat(editForm.duration_hour) : undefined,
        parent_amount: editForm.parent_amount !== '' ? parseFloat(editForm.parent_amount) : undefined,
        teacher_amount: editForm.teacher_amount !== '' ? parseFloat(editForm.teacher_amount) : undefined,
        description: editForm.description || null,
      },
    });
  };

  const totalSessions = sessions.reduce((s, ses) => s + parseFloat(ses.parent_amount || 0), 0);

  const TH = ({ children, right }) => (
    <th style={{ padding: '0.75rem 1rem', textAlign: right ? 'right' : 'left', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{children}</th>
  );

  return (
    <div>
      <PageHeader
        title={t('sessionsTitle')}
        actions={
          <Link to="/sessions/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Plus size={16} /> {t('inputSession')}
          </Link>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <select className="input" style={{ width: '12rem' }} value={filters.parentId} onChange={(e) => setFilters({ ...filters, parentId: e.target.value })}>
          <option value="">{t('allParents')}</option>
          {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input" style={{ width: '12rem' }} value={filters.teacherId} onChange={(e) => setFilters({ ...filters, teacherId: e.target.value })}>
          <option value="">{t('allTeachers')}</option>
          {teachers.map(t_ => <option key={t_.id} value={t_.id}>{t_.name}</option>)}
        </select>
        <select className="input" style={{ width: '9rem' }} value={filters.month} onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{monthName(m)}</option>
          ))}
        </select>
        <select className="input" style={{ width: '7rem' }} value={filters.year} onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      {sessions.length > 0 && (
        <div style={{ backgroundColor: '#FFF4F0', border: '1px solid rgba(247,108,69,0.2)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--tx-1)' }}>
          <span><strong>{sessions.length}</strong> {t('sessions')}</span>
          <span>{t('total')}: <strong style={{ color: '#EF4444' }}>{formatRupiah(totalSessions)}</strong></span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <p style={{ padding: '1.5rem', color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
          : !sessions.length ? <EmptyState icon={ClipboardList} message={t('noSessionsFilter')} />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead><tr style={{ backgroundColor: 'var(--bg-head)' }}>
                  <TH>{t('date')}</TH>
                  <TH>{t('parentStudent')}</TH>
                  <TH>{t('teacher')}</TH>
                  <TH>{t('subject')}</TH>
                  <TH>{t('duration')}</TH>
                  <TH right>{t('cost')}</TH>
                  <TH right>{t('actions')}</TH>
                </tr></thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} style={{ borderTop: '1px solid var(--bd-sub)', backgroundColor: parseFloat(s.parent_amount) < 0 ? 'rgba(239,68,68,0.05)' : 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = parseFloat(s.parent_amount) < 0 ? 'rgba(239,68,68,0.05)' : 'transparent'}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--tx-2)', whiteSpace: 'nowrap' }}>{formatDate(s.session_start_timestamp)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--tx-1)' }}>{s.parent_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--tx-3)' }}>{s.student_name}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--tx-2)' }}>{s.teacher_name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--tx-2)' }}>{s.course_name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--tx-2)' }}>{formatDuration(s.duration_hour)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: parseFloat(s.parent_amount) < 0 ? '#EF4444' : 'var(--tx-1)' }}>
                        {formatRupiah(s.parent_amount)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => openEdit(s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--tx-3)', borderRadius: '0.25rem', marginRight: '0.25rem' }}
                          title={t('editSession')}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#F76C45'; e.currentTarget.style.backgroundColor = 'rgba(247,108,69,0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--tx-3)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ open: true, id: s.id, label: `${s.parent_name} — ${formatDate(s.session_start_timestamp)}` })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--tx-3)', borderRadius: '0.25rem' }}
                          title={t('deleteSessionTitle')}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--tx-3)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* ── Edit Modal ── */}
      {editModal.open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '36rem', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tx-1)', margin: 0 }}>{t('editSession')}</h2>
              <button onClick={() => setEditModal({ open: false, session: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx-3)', padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Student info (read-only) */}
            <div style={{ backgroundColor: 'var(--bg-head)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--tx-2)' }}>
              <strong style={{ color: 'var(--tx-1)' }}>{editModal.session.student_name}</strong>
              {' — '}{editModal.session.parent_name}
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Teacher */}
              <div>
                <label className="label">{t('teacher')}</label>
                <select className="input" value={editForm.teacher_id} onChange={e => setEditForm({ ...editForm, teacher_id: e.target.value })}>
                  <option value="">{t('selectTeacher')}</option>
                  {teachers.map(t_ => <option key={t_.id} value={t_.id}>{t_.name}</option>)}
                </select>
              </div>

              {/* Course */}
              <div>
                <label className="label">{t('subject')}</label>
                <select className="input" value={editForm.course_id} onChange={e => setEditForm({ ...editForm, course_id: e.target.value })}>
                  <option value="">{t('selectSubject')}</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Date & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="label">{t('dateTime')}</label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={editForm.session_start_timestamp}
                    onChange={e => setEditForm({ ...editForm, session_start_timestamp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t('durationHours')}</label>
                  <input
                    className="input"
                    type="number"
                    step="0.25"
                    min="0"
                    value={editForm.duration_hour}
                    onChange={e => setEditForm({ ...editForm, duration_hour: e.target.value })}
                    placeholder="1, 0.75, 1.5..."
                  />
                </div>
              </div>

              {/* Amounts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="label">{t('parentCost')} (Rp)</label>
                  <input
                    className="input"
                    type="number"
                    value={editForm.parent_amount}
                    onChange={e => setEditForm({ ...editForm, parent_amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t('teacherCost')} (Rp)</label>
                  <input
                    className="input"
                    type="number"
                    value={editForm.teacher_amount}
                    onChange={e => setEditForm({ ...editForm, teacher_amount: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">{t('notes')}</label>
                <input
                  className="input"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder={t('optional')}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditModal({ open: false, session: null })}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm.open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '24rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} style={{ color: '#EF4444' }} />
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tx-1)', margin: 0 }}>{t('deleteSessionTitle')}</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--tx-2)', marginBottom: '0.5rem' }}>{t('deleteSessionConfirm')}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--tx-3)', fontStyle: 'italic', marginBottom: '1.25rem' }}>{deleteConfirm.label}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm({ open: false, id: null, label: '' })}>
                {t('cancel')}
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', opacity: deleteMutation.isPending ? 0.6 : 1 }}
              >
                {deleteMutation.isPending ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
