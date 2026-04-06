import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getParents, getParentOutstanding, createPayment } from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';
import { formatRupiah } from '../../utils/format';

export default function RecordPaymentPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const defaultParentId = searchParams.get('parentId') || '';

  const [form, setForm] = useState({
    parent_id: defaultParentId,
    amount: '',
    source: 'Transfer Bank',
    payment_timestamp: new Date().toISOString().slice(0, 16),
    description: '',
  });

  const { data: parents = [] } = useQuery({ queryKey: ['parents'], queryFn: () => getParents().then(r => r.data) });

  const { data: outstanding } = useQuery({
    queryKey: ['outstanding', form.parent_id],
    queryFn: () => getParentOutstanding(form.parent_id).then(r => r.data),
    enabled: !!form.parent_id,
  });

  const mutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success('Pembayaran berhasil dicatat');
      navigate('/payments');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal menyimpan'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      amount: parseFloat(form.amount),
      payment_timestamp: new Date(form.payment_timestamp).toISOString(),
    });
  };

  return (
    <div className="max-w-xl">
      <PageHeader
        title={t('recordPaymentTitle')}
        actions={
          <Link to="/payments" className="btn-secondary text-sm flex items-center gap-1.5">
            <ArrowLeft size={15} /> {t('back')}
          </Link>
        }
      />
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Parent */}
          <div>
            <label className="label">{t('allParents')} *</label>
            <select className="input" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} required>
              <option value="">{t('selectParent')}</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Outstanding info */}
          {outstanding && (
            <div style={{ borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.875rem', backgroundColor: outstanding.outstanding > 0 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${outstanding.outstanding > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(22,163,74,0.3)'}` }}>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: outstanding.outstanding > 0 ? '#B91C1C' : '#15803D' }}>
                {outstanding.outstanding > 0
                  ? <><AlertTriangle size={14} /> {t('outstandingBill')}</>
                  : <><CheckCircle2 size={14} /> {t('noOutstanding')}</>
                }
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--tx-2)' }}>
                <div>{t('totalSessions')}: {formatRupiah(outstanding.total_sessions)}</div>
                <div>{t('totalPaid')}: {formatRupiah(outstanding.total_paid)}</div>
                <div style={{ fontWeight: 600 }}>{t('outstanding')}: {formatRupiah(outstanding.outstanding)}</div>
              </div>
              {outstanding.outstanding > 0 && (
                <button type="button" className="mt-2 text-xs text-[#F76C45] underline font-medium"
                  onClick={() => setForm({ ...form, amount: outstanding.outstanding.toString() })}>
                  {t('autoFill')}: {formatRupiah(outstanding.outstanding)}
                </button>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="label">{t('paymentAmount')} *</label>
            <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="1000000" />
          </div>

          {/* Source */}
          <div>
            <label className="label">{t('paymentMethod')} *</label>
            <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              <option>Transfer Bank</option>
              <option>Tunai</option>
              <option>QRIS</option>
              <option>GoPay</option>
              <option>OVO</option>
              <option>Dana</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label">{t('paymentDate')} *</label>
            <input className="input" type="datetime-local" value={form.payment_timestamp} onChange={(e) => setForm({ ...form, payment_timestamp: e.target.value })} required />
          </div>

          {/* Description */}
          <div>
            <label className="label">{t('description')}</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('optional')} />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Link to="/payments" className="btn-secondary">{t('cancel')}</Link>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? t('saving') : t('savePayment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
