import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Truck, Navigation, CheckCircle } from 'lucide-react';
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
    queryKey: ['job', id],
    queryFn: () => getJobDetail(id),
    select: (res) => res.data.data,
  });

  const takeMutation = useMutation({
    mutationFn: (jobId) => takeJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['driver'] });
      addNotification('Pekerjaan berhasil diambil! Klik "Selesai Kirim" setelah sampai.', 'success');
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <Truck className="w-12 h-12 text-outline/30 mx-auto mb-3" />
        <p className="text-[14px] text-on-surface-variant">Pekerjaan tidak ditemukan</p>
      </div>
    );
  }

  const isAvailable = job.status === 'Available';
  const isTaken = job.status === 'Taken';
  const isDelivered = job.status === 'Delivered';

  return (
    <div className="max-w-content mx-auto space-y-6">
      <h1 className="text-[24px] font-semibold text-on-surface">Detail Pekerjaan</h1>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-semibold text-on-surface">Order #{job.orderId || job.id}</p>
          <Badge variant={isAvailable ? 'success' : isTaken ? 'info' : isDelivered ? 'success' : 'info'}>
            {isAvailable ? 'Tersedia' : isTaken ? 'Dalam Pengiriman' : isDelivered ? 'Selesai' : '-'}
          </Badge>
        </div>

        {job.order?.deliveryMethod && (
          <p className="text-[13px] text-on-surface-variant mb-4">Metode: {job.order.deliveryMethod}</p>
        )}

        <div className="space-y-4">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-outline uppercase tracking-[0.05em]">Penjemputan</p>
              <p className="text-[14px] font-medium text-on-surface">{job.order?.store?.name || 'Store'}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Navigation className="w-5 h-5 text-outline rotate-90" />
          </div>

          {/* Destination */}
          {job.order?.address && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-error" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-outline uppercase tracking-[0.05em]">Tujuan</p>
                <p className="text-[14px] font-medium text-on-surface">{job.order.address.recipient || 'Penerima'}</p>
                <p className="text-[12px] text-on-surface-variant">{job.order.address.addressLine}, {job.order.address.city} {job.order.address.postalCode}</p>
              </div>
            </div>
          )}
        </div>

        {/* Earning estimate */}
        <div className="mt-5 pt-4 border-t border-outline-variant/20">
          <p className="text-[20px] font-bold text-primary">{formatCurrency(job.order?.deliveryFee || 0)}</p>
          <p className="text-[12px] text-on-surface-variant">Estimasi penghasilan</p>
        </div>
      </div>

      {isAvailable && (
        <Button className="w-full" size="lg" onClick={() => takeMutation.mutate(job.id)} disabled={takeMutation.isPending}>
          <Truck className="w-5 h-5" />
          {takeMutation.isPending ? 'Mengambil...' : 'Ambil Pekerjaan'}
        </Button>
      )}

      {isTaken && (
        <Button className="w-full" size="lg" onClick={() => completeMutation.mutate(job.id)} disabled={completeMutation.isPending}>
          <CheckCircle className="w-5 h-5" />
          {completeMutation.isPending ? 'Menyelesaikan...' : 'Selesai Kirim'}
        </Button>
      )}
    </div>
  );
}
