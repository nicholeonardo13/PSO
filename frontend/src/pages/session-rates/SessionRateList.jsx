import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSessionRates, createSessionRate, updateSessionRate, deleteSessionRate, getTeachers, getCourses, getParents, getStudents } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { formatRupiah } from '../../utils/format';

function RateForm({ initial, onSave, onCancel, loading, t }) {
  const [form, setForm] = useState(initial || { student_id: '', teacher_id: '', course_id: '', teacher_amount_per_hour: '', parent_amount_per_hour: '' });
  const [selectedParent, setSelectedParent] = useState(initial?.parent_id || '');
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: () => getTeachers().then(r => r.data) });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => getCourses().then(r => r.data) });
  const { data: parents = [] } = useQuery({ queryKey: ['parents'], queryFn: () => getParents().then(r => r.data) });
  const { data: students = [] } = useQuery({ queryKey: ['students', selectedParent], queryFn: () => getStudents({ parentId: selectedParent }).then(r => r.data), enabled: !!selectedParent });
  const isEdit = !!initial?.id;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!isEdit && (
        <>
          <div><label className="label">{t('allParents')} *</label>
            <select className="input" value={selectedParent} onChange={(e) => { setSelectedParent(e.target.value); setForm({ ...form, student_id: '' }); }} required>
              <option value="">{t('selectParent')}</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="label">{t('student')} *</label>
            <select className="input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required disabled={!selectedParent}>
              <option value="">{t('selectStudent')}</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">{t('teacher')} *</label>
            <select className="input" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} required>
              <option value="">{t('selectTeacher')}</option>
              {teachers.map(t_ => <option key={t_.id} value={t_.id}>{t_.name}</option>)}
            </select>
          </div>
          <div><label className="label">{t('subject')} *</label>
            <select className="input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} required>
              <option value="">{t('selectSubject')}</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </>
      )}
      <div><label className="label">{t('rateTeacherPerHour')} *</label><input className="input" type="number" value={form.teacher_amount_per_hour} onChange={(e) => setForm({ ...form, teacher_amount_per_hour: e.target.value })} required placeholder="0" /></div>
      <div><label className="label">{t('rateParentPerHour')} *</label><input className="input" type="number" value={form.parent_amount_per_hour} onChange={(e) => setForm({ ...form, parent_amount_per_hour: e.target.value })} required placeholder="0" /></div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('cancel')}</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('saving') : t('save')}</button>
      </div>
    </form>
  );
}

export default function SessionRatesPage() {
  const qc = useQueryClient();
  const { t } = useLang();
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: rates = [], isLoading } = useQuery({ queryKey: ['session-rates'], queryFn: () => getSessionRates().then(r => r.data) });
  const createMut = useMutation({ mutationFn: createSessionRate, onSuccess: () => { qc.invalidateQueries({ queryKey: ['session-rates'] }); toast.success('Tarif ditambahkan'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updateSessionRate(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['session-rates'] }); toast.success('Diperbarui'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const deleteMut = useMutation({ mutationFn: deleteSessionRate, onSuccess: () => { qc.invalidateQueries({ queryKey: ['session-rates'] }); toast.success('Dihapus'); setDeleteTarget(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });

  const TH = ({ children, right }) => (
    <th style={{ padding: '0.75rem 1rem', textAlign: right ? 'right' : 'left', fontWeight: 600, color: 'var(--tx-2)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{children}</th>
  );

  return (
    <div>
      <PageHeader title={t('ratesTitle')} subtitle={t('ratesSubtitle')} actions={<button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={() => setModal({ type: 'create' })}><Plus size={16} />{t('addRate')}</button>} />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? <p style={{ padding: '1.5rem', color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>
          : !rates.length ? <EmptyState icon={DollarSign} message={t('noRates')} />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead><tr style={{ backgroundColor: 'var(--bg-head)' }}>
                  <TH>{t('student')}</TH>
                  <TH>{t('teacher')}</TH>
                  <TH>{t('subject')}</TH>
                  <TH right>{t('teacherRatePerHour')}</TH>
                  <TH right>{t('parentRatePerHour')}</TH>
                  <TH right>{t('actions')}</TH>
                </tr></thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--bd-sub)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--tx-1)' }}>{r.student_name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--tx-2)' }}>{r.teacher_name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--tx-2)' }}>{r.course_name}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--tx-1)' }}>{formatRupiah(r.teacher_amount_per_hour)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--tx-1)' }}>{formatRupiah(r.parent_amount_per_hour)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button style={{ fontSize: '0.8125rem', color: '#F76C45', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, marginRight: '0.75rem' }} onClick={() => setModal({ type: 'edit', data: r })}>{t('edit')}</button>
                        <button style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setDeleteTarget(r)}>{t('delete')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'edit' ? t('editRate') : t('addRate')} size="lg">
        {modal && <RateForm initial={modal.data} loading={createMut.isPending || updateMut.isPending} onCancel={() => setModal(null)} t={t}
          onSave={(form) => modal.type === 'edit' ? updateMut.mutate({ id: modal.data.id, data: { teacher_amount_per_hour: form.teacher_amount_per_hour, parent_amount_per_hour: form.parent_amount_per_hour } }) : createMut.mutate(form)} />}
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending} title={t('delete')} message={t('deleteRateConfirm')} />
    </div>
  );
}
