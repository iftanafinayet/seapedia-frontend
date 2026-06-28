import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, TrendingUp, Navigation, CheckCircle, Package, MapPin } from 'lucide-react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getAvailableJobs, getDriverMyJobs, getDriverEarnings, completeJob } from '../../api/driver';
import { formatCurrency, formatDateShort } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';

export default function DriverDashboard() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['driver', 'jobs'], queryFn: getAvailableJobs, select: (res) => res.data.data || [],
  });
  const { data: myJobs, isLoading: loadingMyJobs } = useQuery({
    queryKey: ['driver', 'myJobs'], queryFn: getDriverMyJobs, select: (res) => res.data.data || [],
  });
  const { data: earnings } = useQuery({
    queryKey: ['driver', 'earnings'], queryFn: getDriverEarnings, select: (res) => res.data.data,
  });

  const safeJobs = jobs || [];
  const activeJobs = (myJobs || []).filter(j => j.status === 'Taken');
  const completedJobs = (myJobs || []).filter(j => j.status !== 'Taken');
  const totalEarnings = earnings?.totalEarnings || 0;
  const totalCompleted = earnings?.totalJobs || completedJobs.length;

  const completeMutation = useMutation({
    mutationFn: (id) => completeJob(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['driver'] }); addNotification('Pesanan selesai dikirim!', 'success'); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">Dashboard</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">{activeJobs.length} pengiriman aktif</p>
        </div>
        <Link to="/driver/history" className="text-[12px] text-primary font-semibold hover:underline">Riwayat →</Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3">
          <TrendingUp className="w-4 h-4 text-primary mb-1" />
          <p className="text-[18px] font-bold text-on-surface">{formatCurrency(totalEarnings)}</p>
          <p className="text-[10px] text-on-surface-variant">Pendapatan</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3">
          <CheckCircle className="w-4 h-4 text-emerald-600 mb-1" />
          <p className="text-[18px] font-bold text-on-surface">{totalCompleted}</p>
          <p className="text-[10px] text-on-surface-variant">Selesai</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3">
          <Package className="w-4 h-4 text-amber-600 mb-1" />
          <p className="text-[18px] font-bold text-on-surface">{activeJobs.length}</p>
          <p className="text-[10px] text-on-surface-variant">Aktif</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3">
          <Navigation className="w-4 h-4 text-blue-600 mb-1" />
          <p className="text-[18px] font-bold text-on-surface">{safeJobs.length}</p>
          <p className="text-[10px] text-on-surface-variant">Tersedia</p>
        </div>
      </div>

      {activeJobs.length > 0 && (
        <div className="bg-surface-container-lowest border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em]">Pengiriman Aktif</p>
          </div>
          <div className="space-y-2">
            {activeJobs.map((job) => (
              <div key={job.id} className="bg-surface-container rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[14px] font-bold text-primary">#{job.orderId || job.id}</p>
                  <p className="text-[15px] font-bold text-on-surface">{formatCurrency(job.order?.deliveryFee || 0)}</p>
                </div>
                <p className="text-[12px] text-on-surface-variant mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.order?.store?.name || 'Store'} → {job.order?.address?.city || 'Destination'}
                </p>
                <div className="flex gap-2">
                  <Link to={`/driver/jobs/${job.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Detail</Button>
                  </Link>
                  <Button variant="accent" size="sm" className="flex-1" onClick={() => completeMutation.mutate(job.id)} disabled={completeMutation.isPending}>
                    <CheckCircle className="w-3.5 h-3.5" /> Selesai
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em]">Pekerjaan Tersedia</p>
          {safeJobs.length > 3 && <Link to="/driver/jobs" className="text-[11px] text-primary font-semibold">Lihat Semua →</Link>}
        </div>
        {loadingJobs ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : safeJobs.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="w-8 h-8 text-outline/20 mx-auto mb-2" />
            <p className="text-[13px] text-on-surface-variant">Tidak ada pekerjaan tersedia</p>
          </div>
        ) : (
          <div className="space-y-1">
            {safeJobs.slice(0, 3).map((job) => (
              <Link key={job.id} to={`/driver/jobs/${job.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-on-surface">#{job.orderId || job.id}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{job.order?.store?.name || 'Store'} → {job.order?.address?.city || 'Destination'}</p>
                </div>
                <p className="text-[15px] font-bold text-on-surface shrink-0">{formatCurrency(job.order?.deliveryFee || 0)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em]">Riwayat Pengiriman</p>
          {completedJobs.length > 0 && <Link to="/driver/history" className="text-[11px] text-primary font-semibold">Lihat Semua →</Link>}
        </div>
        {loadingMyJobs ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : completedJobs.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-outline/20 mx-auto mb-2" />
            <p className="text-[13px] text-on-surface-variant">Belum ada riwayat</p>
          </div>
        ) : (
          <div className="space-y-1">
            {completedJobs.slice(0, 3).map((job) => (
              <Link key={job.id} to={`/driver/jobs/${job.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-on-surface">#{job.orderId || job.id}</p>
                  <p className="text-[10px] text-on-surface-variant">{formatDateShort(job.completedAt || job.createdAt)}</p>
                </div>
                <p className="text-[14px] font-bold text-on-surface">{formatCurrency(job.order?.deliveryFee || 0)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
