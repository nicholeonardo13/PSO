export function formatRupiah(amount) {
  if (amount == null) return 'Rp0';
  const num = parseFloat(amount);
  const prefix = num < 0 ? '-Rp' : 'Rp';
  return prefix + Math.abs(num).toLocaleString('id-ID');
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function monthName(month) {
  return MONTH_NAMES[month - 1] || '-';
}

export function formatDuration(hours) {
  const h = parseFloat(hours);
  if (h === Math.floor(h)) return `${h} jam`;
  const mins = Math.round((h % 1) * 60);
  const wholeHours = Math.floor(h);
  if (wholeHours === 0) return `${mins} menit`;
  return `${wholeHours} jam ${mins} menit`;
}
