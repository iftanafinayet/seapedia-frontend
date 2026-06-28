import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Truck, Navigation, MapPin, TrendingUp, Package, Star, ChevronRight } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { getAvailableJobs, getDriverMyJobs, getDriverEarnings } from '../../api/driver';
import { formatCurrency } from '../../lib/utils';

export default function JobBoardPage() {
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['driver', 'jobs'], queryFn: getAvailableJobs, select: (res) => res.data.data || [],
  });
  const { data: earnings } = useQuery({
    queryKey: ['driver', 'earnings'], queryFn: getDriverEarnings, select: (res) => res.data.data,
  });
  const { data: myJobs } = useQuery({
    queryKey: ['driver', 'myJobs'], queryFn: getDriverMyJobs, select: (res) => res.data.data || [],
  });

  const safeJobs = jobs || [];
  const activeJobs = (myJobs || []).filter(j => j.status === 'Taken');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">Pekerjaan</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">{safeJobs.length} tersedia</p>
        </div>
        <Link to="/driver/history" className="text-[12px] text-primary font-semibold hover:underline">Riwayat →</Link>
      </div>

      {earnings && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-primary text-on-primary rounded-xl p-3">
            <TrendingUp className="w-4 h-4 opacity-80 mb-1" />
            <p className="text-[18px] font-bold">{formatCurrency(earnings.totalEarnings || 0)}</p>
            <p className="text-[9px] opacity-80">Pendapatan</p>
          </div>
          <div className="bg-primary text-on-primary rounded-xl p-3">
            <Package className="w-4 h-4 opacity-80 mb-1" />
            <p className="text-[18px] font-bold">{earnings.totalJobs || 0}</p>
            <p className="text-[9px] opacity-80">Selesai</p>
          </div>
          <div className="bg-primary text-on-primary rounded-xl p-3">
            <Star className="w-4 h-4 opacity-80 mb-1 fill-white" />
            <p className="text-[18px] font-bold">4.9</p>
            <p className="text-[9px] opacity-80">Rating</p>
          </div>
        </div>
      )}

      {activeJobs.length > 0 && (
        <div className="bg-surface-container-lowest border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em]">Pengiriman Aktif</p>
          </div>
          {activeJobs.map((job) => (
            <Link key={job.id} to={`/driver/jobs/${job.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container mb-2 last:mb-0">
              <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-on-surface">Order #{job.orderId || job.id}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{job.order?.store?.name || 'Store'} → {job.order?.address?.city || 'Destination'}</p>
              </div>
              <p className="text-[14px] font-bold text-primary shrink-0">{formatCurrency(job.order?.deliveryFee || 0)}</p>
              <ChevronRight className="w-4 h-4 text-outline shrink-0" />
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em] px-1">Tersedia</p>
        {loadingJobs ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : safeJobs.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center">
            <Truck className="w-8 h-8 text-outline/20 mx-auto mb-2" />
            <p className="text-[13px] text-on-surface-variant">Belum ada pekerjaan tersedia</p>
            <p className="text-[11px] text-outline mt-1">Cek kembali nanti</p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeJobs.map((job) => (
              <div key={job.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-bold text-primary">#{job.orderId || job.id}</p>
                  <p className="text-[20px] font-bold text-on-surface">{formatCurrency(job.order?.deliveryFee || 0)}</p>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-0.5 h-6 border-l border-dotted border-outline-variant" />
                    <div className="w-2 h-2 rounded-full bg-error" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-on-surface">{job.order?.store?.name || 'Store'}</p>
                    <p className="text-[11px] text-on-surface-variant">{job.order?.address?.city || 'Destination'}</p>
                    <p className="text-[10px] text-outline mt-0.5">{job.order?.deliveryMethod || 'Delivery'} {job.order?.distance && `· ${job.order.distance} km`}</p>
                  </div>
                </div>
                <Link to={`/driver/jobs/${job.id}`}>
                  <Button className="w-full" size="sm">Ambil Pekerjaan <Navigation className="w-3.5 h-3.5" /></Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
