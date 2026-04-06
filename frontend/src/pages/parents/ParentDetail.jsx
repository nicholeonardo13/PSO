import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, GraduationCap, FileText, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getParent, getInvoices, createStudent, updateStudent, deleteStudent } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { formatRupiah, monthName } from '../../utils/format';

function StudentForm({ initial, parentId, onSave, onCancel, loading, t }) {
  const [form, setForm] = useState(initial || { name: '', phone_number: '', parent_id: parentId });
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
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>{t('cancel')}</button>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? t('saving') : t('save')}</button>
      </div>
    </form>
  );
}

export default function ParentDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { t } = useLang();
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['parent', id], queryFn: () => getParent(id).then((r) => r.data) });
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices', id], queryFn: () => getInvoices({ parentId: id }).then((r) => r.data) });

  const createMut = useMutation({ mutationFn: createStudent, onSuccess: () => { qc.invalidateQueries({ queryKey: ['parent', id] }); toast.success('Murid ditambahkan'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const updateMut = useMutation({ mutationFn: ({ sid, data }) => updateStudent(sid, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['parent', id] }); toast.success('Diperbarui'); setModal(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });
  const deleteMut = useMutation({ mutationFn: deleteStudent, onSuccess: () => { qc.invalidateQueries({ queryKey: ['parent', id] }); toast.success('Dihapus'); setDeleteTarget(null); }, onError: (err) => toast.error(err.response?.data?.error || 'Gagal') });

  if (isLoading) return <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem' }}>{t('loading')}</p>;
  if (!data) return <p style={{ color: 'var(--tx-2)', fontSize: '0.875rem' }}>Data tidak ditemukan</p>;

  const students = data.students || [];
  const invoicesByYear = invoices.reduce((acc, inv) => {
    if (!acc[inv.year]) acc[inv.year] = [];
    acc[inv.year].push(inv);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title={data.name}
        subtitle={`${data.phone_number}${data.email_address ? ` · ${data.email_address}` : ''}`}
        actions={
          <Link to="/parents" className="btn-secondary" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <ArrowLeft size={15} /> {t('back')}
          </Link>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem', marginBottom: '1.5rem' }} className="md:grid-cols-2">
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--tx-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{t('accountBalance')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: parseFloat(data.balance_amount) >= 0 ? '#16A34A' : '#EF4444' }}>
            {formatRupiah(data.balance_amount)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginTop: '0.25rem', marginBottom: 0 }}>{t('balanceHint')}</p>
        </div>
        <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
          <Link to={`/sessions/new?parentId=${id}`} className="btn-primary" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Plus size={15} /> {t('recordSession')}
          </Link>
          <Link to={`/payments/new?parentId=${id}`} className="btn-secondary" style={{ fontSize: '0.875rem' }}>{t('recordPayment')}</Link>
        </div>
      </div>

      {/* Students */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--tx-1)', margin: 0, fontSize: '1rem' }}>{t('students')} ({students.length})</h2>
          <button className="btn-primary" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }} onClick={() => setModal({ type: 'create' })}>
            <Plus size={15} /> {t('addStudent')}
          </button>
        </div>
        {!students.length ? <EmptyState icon={GraduationCap} message={t('noStudents')} />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {students.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.5rem', border: '1px solid var(--bd-sub)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--tx-1)' }}>{s.name}</span>
                    {s.phone_number && <span style={{ fontSize: '0.75rem', color: 'var(--tx-3)', marginLeft: '0.5rem' }}>{s.phone_number}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ fontSize: '0.8125rem', color: '#F76C45', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setModal({ type: 'edit', data: s })}>{t('edit')}</button>
                    <button style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setDeleteTarget(s)}>{t('delete')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Invoice History */}
      <div className="card">
        <h2 style={{ fontWeight: 700, color: 'var(--tx-1)', marginBottom: '1rem', fontSize: '1rem', marginTop: 0 }}>{t('invoiceHistory')}</h2>
        {!invoices.length ? <EmptyState icon={FileText} message={t('noInvoices')} />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(invoicesByYear).sort((a, b) => b - a).map((year) => (
                <div key={year}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 600, color: 'var(--tx-2)', margin: 0 }}>{year}</h3>
                    <Link to={`/invoices/${id}/${year}`} style={{ fontSize: '0.75rem', color: '#F76C45', textDecoration: 'none', fontWeight: 500 }}>
                      {t('yearlySummary')} →
                    </Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }} className="md:grid-cols-6">
                    {invoicesByYear[year].sort((a, b) => a.month - b.month).map((inv) => (
                      <Link key={inv.id} to={`/invoices/${id}/${inv.year}/${inv.month}`}
                        style={{ textAlign: 'center', padding: '0.5rem 0.25rem', borderRadius: '0.5rem', border: '1px solid var(--bd)', textDecoration: 'none', display: 'block', transition: 'border-color 0.15s, background-color 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F76C45'; e.currentTarget.style.backgroundColor = '#FFF4F0'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--tx-1)' }}>{monthName(inv.month).slice(0, 3)}</div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.125rem' }}>
                          {parseFloat(inv.current_balance_amount) < 0
                            ? <XCircle size={12} style={{ margin: '0 auto', color: '#EF4444' }} />
                            : <CheckCircle2 size={12} style={{ margin: '0 auto', color: '#16A34A' }} />}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.type === 'edit' ? t('editStudent') : t('addStudent')}>
        {modal && <StudentForm initial={modal.data} parentId={id} loading={createMut.isPending || updateMut.isPending} onCancel={() => setModal(null)} t={t}
          onSave={(form) => modal.type === 'edit' ? updateMut.mutate({ sid: modal.data.id, data: form }) : createMut.mutate({ ...form, parent_id: id })} />}
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        loading={deleteMut.isPending} title={t('deleteStudent')} message={`Yakin hapus murid ${deleteTarget?.name}?`} />
    </div>
  );
}
