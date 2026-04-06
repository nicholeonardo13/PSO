import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Users, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getParents, createParent, updateParent, deleteParent,
  getAllStudents, createStudent, updateStudent, deleteStudent,
} from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { formatRupiah } from '../../utils/format';

/* ── Parent Form ── */
function ParentForm({ initial, onSave, onCancel, loading, t }) {
  const [form, setForm] = useState(initial || { name: '', phone_number: '', email_address: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div><label className="label">{t('parentName')} *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder={t('parentName')} /></div>
      <div><label className="label">{t('phone')} *</label><input className="input" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required placeholder="08xxxxxxxxxx" /></div>
      <div><label className="label">{t('email')}</label><input className="input" type="email" value={form.email_address || ''} onChange={(e) => setForm({ ...form, email_address: e.target.value })} placeholder="email@example.com" /></div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('cancel')}</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('saving') : t('save')}</button>
      </div>
    </form>
  );
}

/* ── Student Form ── */
function StudentForm({ initial, parents, onSave, onCancel, loading, t }) {
  const [form, setForm] = useState(initial || { name: '', phone_number: '', email_address: '', parent_id: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label className="label">{t('studentName')} *</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder={t('studentName')} />
      </div>
      <div>
        <label className="label">{t('phone')}</label>
        <input className="input" value={form.phone_number || ''} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="08xxxxxxxxxx" />
      </div>
      <div>
        <label className="label">{t('email')}</label>
        <input className="input" type="email" value={form.email_address || ''} onChange={(e) => setForm({ ...form, email_address: e.target.value })} placeholder="email@example.com" />
      </div>
      <div>
        <label className="label">{t('allParents')} <span style={{ color: 'var(--tx-3)', fontWeight: 400 }}>({t('optional')})</span></label>
        <select className="input" value={form.parent_id || ''} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
          <option value="">— {t('noParent')} —</option>
          {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('cancel')}</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('saving') : t('save')}</button>
      </div>
    </form>
  );
}

export default function ParentsPage() {
  const qc = useQueryClient();
  const { t } = useLang();
  const [tab, setTab] = useState('parents'); // 'parents' | 'students'
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Parents queries ──
  const { data: parents = [], isLoading: parentsLoading } = useQuery({
    queryKey: ['parents', search],
    queryFn: () => getParents({ name: search || undefined }).then(r => r.data),
  });

  // ── Students queries ──
  const { data: allStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => getAllStudents().then(r => r.data),
  });

  // ── Parent mutations ──
  const createParentMut = useMutation({ mutationFn: createParent, onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Orang tua ditambahkan'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const updateParentMut = useMutation({ mutationFn: ({ id, data }) => updateParent(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Data diperbarui'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const deleteParentMut = useMutation({ mutationFn: deleteParent, onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Dihapus'); setDeleteTarget(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });

  // ── Student mutations ──
  const createStudentMut = useMutation({ mutationFn: createStudent, onSuccess: () => { qc.invalidateQueries({ queryKey: ['students-all'] }); toast.success('Murid ditambahkan'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const updateStudentMut = useMutation({ mutationFn: ({ id, data }) => updateStudent(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['students-all'] }); toast.success('Data diperbarui'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const deleteStudentMut = useMutation({ mutationFn: deleteStudent, onSuccess: () => { qc.invalidateQueries({ queryKey: ['students-all'] }); toast.success('Dihapus'); setDeleteTarget(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });

  const TH = ({ children, right }) => (
    <th style={{ padding: '0.75rem 1.5rem', textAlign: right ? 'right' : 'left', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{children}</th>
  );

  const filteredStudents = allStudents.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.parent_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title={t('parentsTitle')}
        actions={
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            onClick={() => setModal({ type: tab === 'parents' ? 'create-parent' : 'create-student' })}>
            <Plus size={16} />
            {tab === 'parents' ? t('addParent') : t('addStudent')}
          </button>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--bd)' }}>
        {[
          { key: 'parents', label: `${t('parent')} (${parents.length})`, icon: Users },
          { key: 'students', label: `${t('students')} (${allStudents.length})`, icon: GraduationCap },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setTab(key); setSearch(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', background: 'none',
              color: tab === key ? '#F76C45' : 'var(--tx-2)',
              borderBottom: tab === key ? '2px solid #F76C45' : '2px solid transparent',
              marginBottom: '-2px', transition: 'color 0.15s',
            }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input className="input" style={{ maxWidth: '18rem' }} placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* ── Parents Tab ── */}
      {tab === 'parents' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {parentsLoading ? <p style={{ padding: '1.5rem', color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
            : !parents.length ? <EmptyState icon={Users} message={t('noParents')} />
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ backgroundColor: 'var(--bg-head)' }}>
                    <TH>{t('name')}</TH><TH>{t('phone')}</TH><TH>{t('email')}</TH><TH right>{t('balance')}</TH><TH right>{t('actions')}</TH>
                  </tr></thead>
                  <tbody>
                    {parents.map((p) => (
                      <tr key={p.id} style={{ borderTop: '1px solid var(--bd-sub)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <Link to={`/parents/${p.id}`} style={{ fontWeight: 600, color: 'var(--tx-1)', textDecoration: 'none' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#F76C45'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--tx-1)'}>{p.name}</Link>
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem', color: 'var(--tx-2)' }}>{p.phone_number}</td>
                        <td style={{ padding: '0.75rem 1.5rem', color: 'var(--tx-2)' }}>{p.email_address || '-'}</td>
                        <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600, color: parseFloat(p.balance_amount) < 0 ? '#EF4444' : '#16A34A' }}>{formatRupiah(p.balance_amount)}</td>
                        <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                          <button style={{ fontSize: '0.8125rem', color: '#F76C45', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, marginRight: '0.75rem' }} onClick={() => setModal({ type: 'edit-parent', data: p })}>{t('edit')}</button>
                          <button style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setDeleteTarget({ type: 'parent', data: p })}>{t('delete')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {/* ── Students Tab ── */}
      {tab === 'students' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {studentsLoading ? <p style={{ padding: '1.5rem', color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
            : !filteredStudents.length ? <EmptyState icon={GraduationCap} message={t('noStudents')} />
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ backgroundColor: 'var(--bg-head)' }}>
                    <TH>{t('studentName')}</TH><TH>{t('phone')}</TH><TH>{t('email')}</TH><TH>{t('parent')}</TH><TH right>{t('actions')}</TH>
                  </tr></thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.id} style={{ borderTop: '1px solid var(--bd-sub)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--tx-1)' }}>{s.name}</td>
                        <td style={{ padding: '0.75rem 1.5rem', color: 'var(--tx-2)' }}>{s.phone_number || '-'}</td>
                        <td style={{ padding: '0.75rem 1.5rem', color: 'var(--tx-2)' }}>{s.email_address || '-'}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          {s.parent_name
                            ? <Link to={`/parents/${s.parent_id}`} style={{ color: '#F76C45', textDecoration: 'none', fontWeight: 500 }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>{s.parent_name}</Link>
                            : <span style={{ color: 'var(--tx-3)', fontSize: '0.8125rem', fontStyle: 'italic' }}>— Tanpa Orang Tua —</span>
                          }
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                          <button style={{ fontSize: '0.8125rem', color: '#F76C45', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, marginRight: '0.75rem' }} onClick={() => setModal({ type: 'edit-student', data: { ...s, parent_id: s.parent_id || '' } })}>{t('edit')}</button>
                          <button style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setDeleteTarget({ type: 'student', data: s })}>{t('delete')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {/* Modals */}
      <Modal open={modal?.type === 'create-parent'} onClose={() => setModal(null)} title={t('addParent')}>
        <ParentForm loading={createParentMut.isPending} onCancel={() => setModal(null)} t={t} onSave={(form) => createParentMut.mutate(form)} />
      </Modal>
      <Modal open={modal?.type === 'edit-parent'} onClose={() => setModal(null)} title={t('editParent')}>
        {modal?.data && <ParentForm initial={modal.data} loading={updateParentMut.isPending} onCancel={() => setModal(null)} t={t} onSave={(form) => updateParentMut.mutate({ id: modal.data.id, data: form })} />}
      </Modal>
      <Modal open={modal?.type === 'create-student'} onClose={() => setModal(null)} title={t('addStudent')}>
        <StudentForm parents={parents} loading={createStudentMut.isPending} onCancel={() => setModal(null)} t={t}
          onSave={(form) => createStudentMut.mutate({ name: form.name, phone_number: form.phone_number || null, email_address: form.email_address || null, parent_id: form.parent_id || null })} />
      </Modal>
      <Modal open={modal?.type === 'edit-student'} onClose={() => setModal(null)} title={t('editStudent')}>
        {modal?.data && <StudentForm initial={modal.data} parents={parents} loading={updateStudentMut.isPending} onCancel={() => setModal(null)} t={t}
          onSave={(form) => updateStudentMut.mutate({ id: modal.data.id, data: { name: form.name, phone_number: form.phone_number || null, email_address: form.email_address || null, parent_id: form.parent_id || null } })} />}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget?.type === 'parent' ? deleteParentMut.mutate(deleteTarget.data.id) : deleteStudentMut.mutate(deleteTarget.data.id)}
        loading={deleteParentMut.isPending || deleteStudentMut.isPending}
        title={deleteTarget?.type === 'parent' ? t('deleteParent') : t('deleteStudent')}
        message={`Yakin ingin menghapus ${deleteTarget?.data?.name}?`} />
    </div>
  );
}
