import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getStatusBadge(status) {
  const map = {
    SedangDikemas: { label: 'Sedang Dikemas', className: 'badge-warning' },
    MenungguPengirim: { label: 'Menunggu Pengirim', className: 'badge-info' },
    SedangDikirim: { label: 'Sedang Dikirim', className: 'badge-info' },
    PesananSelesai: { label: 'Pesanan Selesai', className: 'badge-success' },
    Dikembalikan: { label: 'Dikembalikan', className: 'badge-error' },
    available: { label: 'Tersedia', className: 'badge-success' },
    taken: { label: 'Diambil', className: 'badge-info' },
    delivered: { label: 'Selesai', className: 'badge-success' },
    Sedang_Dikemas: { label: 'Sedang Dikemas', className: 'badge-warning' },
    Menunggu_Pengirim: { label: 'Menunggu Pengirim', className: 'badge-info' },
    Sedang_Dikirim: { label: 'Sedang Dikirim', className: 'badge-info' },
    Pesanan_Selesai: { label: 'Pesanan Selesai', className: 'badge-success' },
  };
  return map[status] || { label: status, className: 'badge-info' };
}

export function getStatusStep(status) {
  const steps = ['SedangDikemas', 'MenungguPengirim', 'SedangDikirim', 'PesananSelesai'];
  const currentIdx = steps.indexOf(status);
  return steps.map((s, i) => ({
    key: s,
    label: getStatusBadge(s).label,
    completed: i < currentIdx,
    active: i === currentIdx,
    upcoming: i > currentIdx,
  }));
}
