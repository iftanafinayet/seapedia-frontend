import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Truck, Navigation, CheckCircle, Store, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getJobDetail, takeJob, completeJob } from '../../api/driver';
import { formatCurrency } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id], queryFn: () => getJobDetail(id), select: (res) => res.data.data,
  });

  const takeMutation = useMutation({
    mutationFn: (jobId) => takeJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['driver'] });
      addNotification('Pekerjaan berhasil diambil!', 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const completeMutation = useMutation({
    mutationFn: (jobId) => completeJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver'] });
      addNotification('Pengiriman selesai!', 'success');
      navigate('/driver/dashboard');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  if (isLoading) {
    return <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <Truck className="w-10 h-10 text-outline/30 mx-auto mb-2" />
        <p className="text-[14px] text-on-surface-variant">Pekerjaan tidak ditemukan</p>
      </div>
    );
  }

  const isAvailable = job.status === 'Available';
  const isTaken = job.status === 'Taken';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">Detail Pekerjaan</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">#{job.orderId || job.id}</p>
        </div>
        <Badge variant={isAvailable ? 'success' : isTaken ? 'info' : 'success'}>
          {isAvailable ? 'Tersedia' : isTaken ? 'Dalam Pengiriman' : 'Selesai'}
        </Badge>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-outline uppercase tracking-[0.05em]">Penjemputan</p>
              <p className="text-[14px] font-semibold text-on-surface">{job.order?.store?.name || 'Store'}</p>
              {job.order?.store?.city && <p className="text-[12px] text-on-surface-variant">{job.order.store.city}</p>}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">
              <Navigation className="w-3 h-3 text-outline rotate-90" />
            </div>
          </div>

          {job.order?.address && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-error" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-outline uppercase tracking-[0.05em]">Tujuan</p>
                <p className="text-[14px] font-semibold text-on-surface">{job.order.address.recipient || 'Penerima'}</p>
                <p className="text-[12px] text-on-surface-variant">{job.order.address.addressLine}, {job.order.address.city} {job.order.address.postalCode || ''}</p>
                {job.order.address.phone && <p className="text-[12px] text-on-surface-variant mt-0.5">{job.order.address.phone}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
        <p className="text-[10px] font-semibold text-outline uppercase tracking-[0.05em] mb-2">Estimasi Pendapatan</p>
        <p className="text-[24px] font-bold text-primary">{formatCurrency(job.order?.deliveryFee || 0)}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{job.order?.deliveryMethod || 'Delivery'}</p>
      </div>

      {isAvailable && (
        <Button className="w-full" onClick={() => takeMutation.mutate(job.id)} disabled={takeMutation.isPending}>
          <Truck className="w-4 h-4" />
          {takeMutation.isPending ? 'Mengambil...' : 'Ambil Pekerjaan'}
        </Button>
      )}

      {isTaken && (
        <Button className="w-full" variant="accent" onClick={() => completeMutation.mutate(job.id)} disabled={completeMutation.isPending}>
          <CheckCircle className="w-4 h-4" />
          {completeMutation.isPending ? 'Menyelesaikan...' : 'Selesai Kirim'}
        </Button>
      )}
    </div>
  );
}
