import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getParents, getStudents, getTeachers, getCourses,
  lookupSessionRate, createSession,
} from '../../services/api';
import { useLang } from '../../contexts/LanguageContext';
import PageHeader from '../../components/PageHeader';

export default function RecordSessionPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const defaultParentId = searchParams.get('parentId') || '';

  const [form, setForm] = useState({
    parent_id: defaultParentId,
    student_id: '',
    teacher_id: '',
    course_id: '',
    session_start_timestamp: new Date().toISOString().slice(0, 16),
    duration_hour: '',
    parent_amount: '',
    teacher_amount: '',
    description: '',
    is_non_session: false,
  });

  const { data: parents = [] } = useQuery({ queryKey: ['parents'], queryFn: () => getParents().then(r => r.data) });
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: () => getTeachers().then(r => r.data) });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => getCourses().then(r => r.data) });
  const { data: students = [] } = useQuery({
    queryKey: ['students', form.parent_id],
    queryFn: () => getStudents({ parentId: form.parent_id }).then(r => r.data),
    enabled: !!form.parent_id,
  });

  // Auto-fill rate on teacher/student/course change
  const { data: rate } = useQuery({
    queryKey: ['rate-lookup', form.teacher_id, form.student_id, form.course_id],
    queryFn: () => lookupSessionRate({ teacherId: form.teacher_id, studentId: form.student_id, courseId: form.course_id }).then(r => r.data),
    enabled: !!form.teacher_id && !!form.student_id && !!form.course_id && !form.is_non_session,
  });

  // Auto-calculate amounts when rate or duration changes
  useEffect(() => {
    if (rate && form.duration_hour && !form.is_non_session) {
      const dur = parseFloat(form.duration_hour);
      if (!isNaN(dur)) {
        setForm(f => ({
          ...f,
          parent_amount: (parseFloat(rate.parent_amount_per_hour) * dur).toString(),
          teacher_amount: (parseFloat(rate.teacher_amount_per_hour) * dur).toString(),
        }));
      }
    }
  }, [rate, form.duration_hour, form.is_non_session]);

  const mutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      toast.success('Sesi berhasil disimpan');
      navigate('/sessions');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal menyimpan'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      student_id: form.student_id,
      teacher_id: form.is_non_session ? teachers.find(t_ => t_.name.toLowerCase() === 'company')?.id || form.teacher_id : form.teacher_id,
      course_id: form.course_id,
      session_start_timestamp: new Date(form.session_start_timestamp).toISOString(),
      duration_hour: parseFloat(form.duration_hour) || 0,
      parent_amount: parseFloat(form.parent_amount) || 0,
      teacher_amount: parseFloat(form.teacher_amount) || 0,
      description: form.description || null,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={t('inputSession')}
        actions={
          <Link to="/sessions" className="btn-secondary text-sm flex items-center gap-1.5">
            <ArrowLeft size={15} /> {t('back')}
          </Link>
        }
      />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Non-session toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#F76C45]"
              checked={form.is_non_session}
              onChange={(e) => setForm({ ...form, is_non_session: e.target.checked, teacher_amount: '0' })}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--tx-2)' }}>{t('nonSession')}</span>
          </label>

          {/* Parent */}
          <div>
            <label className="label">{t('allParents')} *</label>
            <select className="input" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value, student_id: '' })} required>
              <option value="">{t('selectParent')}</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Student */}
          <div>
            <label className="label">{t('student')} *</label>
            <select className="input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required disabled={!form.parent_id}>
              <option value="">{t('selectStudent')}</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Teacher */}
          <div>
            <label className="label">{form.is_non_session ? t('companyTeacher') : `${t('teacher')} *`}</label>
            <select className="input" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} required>
              <option value="">{t('selectTeacher')}</option>
              {teachers.map(t_ => <option key={t_.id} value={t_.id}>{t_.name}</option>)}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="label">{t('subject')} *</label>
            <select className="input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} required>
              <option value="">{t('selectSubject')}</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('dateTime')} *</label>
              <input className="input" type="datetime-local" value={form.session_start_timestamp} onChange={(e) => setForm({ ...form, session_start_timestamp: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('durationHours')} *</label>
              <input className="input" type="number" step="0.25" min="0.25" value={form.duration_hour} onChange={(e) => setForm({ ...form, duration_hour: e.target.value })} required placeholder={t('durationPlaceholder')} />
            </div>
          </div>

          {/* Rate found badge */}
          {rate && !form.is_non_session && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFF4F0', border: '1px solid rgba(247,108,69,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--tx-1)' }}>
              <CheckCircle2 size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
              {t('rateFound')}: <strong>Rp{Number(rate.parent_amount_per_hour).toLocaleString('id-ID')}{t('perHour')}</strong> ({t('parentLabel')}) · <strong>Rp{Number(rate.teacher_amount_per_hour).toLocaleString('id-ID')}{t('perHour')}</strong> ({t('guruLabel')})
            </div>
          )}

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('parentCost')} *</label>
              <input className="input" type="number" value={form.parent_amount} onChange={(e) => setForm({ ...form, parent_amount: e.target.value })} required placeholder={t('autoFromRate')} />
            </div>
            <div>
              <label className="label">{t('teacherCost')}</label>
              <input className="input" type="number" value={form.teacher_amount} onChange={(e) => setForm({ ...form, teacher_amount: e.target.value })} placeholder={t('autoFromRate')} disabled={form.is_non_session} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">{t('notes')}</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('optional')} />
          </div>

          {/* Warning */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', backgroundColor: '#FFFBEB', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#92400E' }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <span>{t('sessionWarning')}</span>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Link to="/sessions" className="btn-secondary">{t('cancel')}</Link>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? t('savingSession') : t('saveSession')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
