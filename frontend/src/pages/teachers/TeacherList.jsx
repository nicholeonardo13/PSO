import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';

function TeacherForm({ initial, onSave, onCancel, loading, t }) {
  const [form, setForm] = useState(initial || { name: '', phone_number: '', email_address: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div><label className="label">{t('name')} *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
      <div><label className="label">{t('phone')}</label><input className="input" value={form.phone_number || ''} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></div>
      <div><label className="label">{t('email')}</label><input className="input" type="email" value={form.email_address || ''} onChange={(e) => setForm({ ...form, email_address: e.target.value })} /></div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('cancel')}</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('saving') : t('save')}</button>
      </div>
    </form>
  );
}

export default function TeachersPage() {
  const qc = useQueryClient();
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: teachers = [], isLoading } = useQuery({ queryKey: ['teachers', search], queryFn: () => getTeachers({ name: search || undefined }).then((r) => r.data) });
  const createMut = useMutation({ mutationFn: createTeacher, onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Guru ditambahkan'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updateTeacher(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Diperbarui'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const deleteMut = useMutation({ mutationFn: deleteTeacher, onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Guru dihapus'); setDeleteTarget(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });

  const TH = ({ children, right }) => (
    <th style={{ padding: '0.75rem 1.5rem', textAlign: right ? 'right' : 'left', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{children}</th>
  );

  return (
    <div>
      <PageHeader title={t('teachersTitle')} actions={<button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={() => setModal({ type: 'create' })}><Plus size={16} />{t('addTeacher')}</button>} />
      <div style={{ marginBottom: '1rem' }}><input className="input" style={{ maxWidth: '18rem' }} placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <p style={{ padding: '1.5rem', color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
          : !teachers.length ? <EmptyState icon={GraduationCap} message={t('noTeachers')} />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead><tr style={{ backgroundColor: 'var(--bg-head)' }}>
                  <TH>{t('name')}</TH><TH>{t('phone')}</TH><TH>{t('email')}</TH><TH right>{t('actions')}</TH>
                </tr></thead>
                <tbody>
                  {teachers.map((t_) => (
                    <tr key={t_.id} style={{ borderTop: '1px solid var(--bd-sub)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--tx-1)' }}>{t_.name}</td>
                      <td style={{ padding: '0.75rem 1.5rem', color: 'var(--tx-2)' }}>{t_.phone_number || '-'}</td>
                      <td style={{ padding: '0.75rem 1.5rem', color: 'var(--tx-2)' }}>{t_.email_address || '-'}</td>
                      <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                        <button style={{ fontSize: '0.8125rem', color: '#F76C45', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, marginRight: '0.75rem' }} onClick={() => setModal({ type: 'edit', data: t_ })}>{t('edit')}</button>
                        <button style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setDeleteTarget(t_)}>{t('delete')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'edit' ? t('editTeacher') : t('addTeacher')}>
        {modal && <TeacherForm initial={modal.data} loading={createMut.isPending || updateMut.isPending} onCancel={() => setModal(null)} t={t}
          onSave={(form) => modal.type === 'edit' ? updateMut.mutate({ id: modal.data.id, data: form }) : createMut.mutate(form)} />}
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending} title={t('deleteTeacher')} message={`Yakin hapus guru ${deleteTarget?.name}?`} />
    </div>
  );
}
