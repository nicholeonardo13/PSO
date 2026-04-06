import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';

export default function CoursesPage() {
  const qc = useQueryClient();
  const { t } = useLang();
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formName, setFormName] = useState('');

  const { data: courses = [], isLoading } = useQuery({ queryKey: ['courses'], queryFn: () => getCourses().then((r) => r.data) });
  const createMut = useMutation({ mutationFn: createCourse, onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Ditambahkan'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updateCourse(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Diperbarui'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const deleteMut = useMutation({ mutationFn: deleteCourse, onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Dihapus'); setDeleteTarget(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });

  const openCreate = () => { setFormName(''); setModal({ type: 'create' }); };
  const openEdit = (c) => { setFormName(c.name); setModal({ type: 'edit', data: c }); };

  const TH = ({ children, right }) => (
    <th style={{ padding: '0.75rem 1.5rem', textAlign: right ? 'right' : 'left', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{children}</th>
  );

  return (
    <div>
      <PageHeader title={t('coursesTitle')} actions={<button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={openCreate}><Plus size={16} />{t('addCourse')}</button>} />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <p style={{ padding: '1.5rem', color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
          : !courses.length ? <EmptyState icon={BookOpen} message={t('noCourses')} />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead><tr style={{ backgroundColor: 'var(--bg-head)' }}>
                  <TH>{t('courseName')}</TH><TH right>{t('actions')}</TH>
                </tr></thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} style={{ borderTop: '1px solid var(--bd-sub)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--tx-1)' }}>{c.name}</td>
                      <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                        <button style={{ fontSize: '0.8125rem', color: '#F76C45', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, marginRight: '0.75rem' }} onClick={() => openEdit(c)}>{t('edit')}</button>
                        <button style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setDeleteTarget(c)}>{t('delete')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'edit' ? t('editCourseModal') : t('addCourseModal')} size="sm">
        <form onSubmit={(e) => { e.preventDefault(); modal.type === 'edit' ? updateMut.mutate({ id: modal.data.id, data: { name: formName } }) : createMut.mutate({ name: formName }); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label className="label">{t('courseName')} *</label><input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder={t('courseNamePlaceholder')} autoFocus /></div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>{t('cancel')}</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>{t('save')}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending} title="Hapus Mata Pelajaran" message={`Yakin hapus ${deleteTarget?.name}?`} />
    </div>
  );
}
