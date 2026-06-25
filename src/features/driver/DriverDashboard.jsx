import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, TrendingUp, Navigation, CheckCircle, Package, MapPin, Clock, Star, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getAvailableJobs, getDriverMyJobs, getDriverEarnings, completeJob } from '../../api/driver';
import { formatCurrency, formatDateShort } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export default function DriverDashboard() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['driver', 'jobs'],
    queryFn: getAvailableJobs,
    select: (res) => res.data.data || [],
  });

  const { data: myJobs, isLoading: loadingMyJobs } = useQuery({
    queryKey: ['driver', 'myJobs'],
    queryFn: getDriverMyJobs,
    select: (res) => res.data.data || [],
  });

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ['driver', 'earnings'],
    queryFn: getDriverEarnings,
    select: (res) => res.data.data,
  });

  const safeJobs = jobs || [];
  const activeJobs = (myJobs || []).filter(j => j.status === 'Taken');
  const historyJobs = (myJobs || []).filter(j => j.status !== 'Taken');

  const completeMutation = useMutation({
    mutationFn: (id) => completeJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver'] });
      addNotification('Pesanan selesai dikirim!', 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  return (
    <div className="max-w-content mx-auto space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-[24px] lg:text-[32px] font-semibold text-on-surface">Driver Dashboard</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Manage your deliveries and earnings</p>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings — mobile only */}
          {!loadingEarnings && earnings && (
            <div className="lg:hidden relative overflow-hidden rounded-xl bg-primary text-on-primary p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <p className="text-[12px] font-medium opacity-80 mb-1">Total Earnings</p>
                  <h2 className="text-[28px] font-bold">{formatCurrency(earnings.totalEarnings || 0)}</h2>
                  <p className="text-[12px] text-on-primary/70 mt-1">{earnings.totalJobs || 0} jobs completed</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 px-2.5 py-1 rounded-full text-[11px] font-semibold">Gold Partner</div>
                </div>
              </div>
            </div>
          )}

          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <div>
              <h3 className="text-[18px] font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Active Delivery
                <span className="text-[13px] font-medium text-on-surface-variant ml-1">({activeJobs.length})</span>
              </h3>
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <div key={job.id} className="bg-surface-container-lowest rounded-xl border border-primary/20 p-4 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[14px] font-bold text-primary">#{job.orderId || job.id}</p>
                      <p className="text-[16px] font-bold text-on-surface">{formatCurrency(job.order?.deliveryFee || 0)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-on-surface-variant mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{job.order?.store?.name || 'Pickup'} → {job.order?.address?.city || 'Destination'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/driver/jobs/${job.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">Detail</Button>
                      </Link>
                      <Button variant="accent" size="sm" className="flex-1" onClick={() => completeMutation.mutate(job.id)} disabled={completeMutation.isPending}>
                        <CheckCircle className="w-4 h-4" />
                        {completeMutation.isPending ? '...' : 'Selesai'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Jobs */}
          <div>
            <h3 className="text-[18px] font-semibold text-on-surface mb-3">Available Jobs</h3>
            {loadingJobs ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
            ) : safeJobs.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-8 text-center">
                <Truck className="w-10 h-10 text-outline/40 mx-auto mb-2" />
                <p className="text-[14px] text-on-surface-variant">No jobs available right now</p>
              </div>
            ) : (
              <div className="space-y-3">
                {safeJobs.map((job) => (
                  <div key={job.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 shadow-card hover:shadow-card-hover transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[14px] font-bold text-primary">#{job.orderId || job.id}</p>
                        <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {job.order?.deliveryMethod || 'Delivery'}
                        </p>
                      </div>
                      <p className="text-[18px] font-bold text-on-surface">{formatCurrency(job.order?.deliveryFee || 0)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-on-surface-variant mb-3">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{job.order?.store?.name || 'Store'} → {job.order?.address?.city || 'Destination'}</span>
                    </div>
                    <Link to={`/driver/jobs/${job.id}`}>
                      <Button className="w-full" size="sm">
                        Ambil Pekerjaan
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div>
            <h3 className="text-[18px] font-semibold text-on-surface mb-3">Delivery History</h3>
            {loadingMyJobs ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : historyJobs.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-6 text-center">
                <Package className="w-8 h-8 text-outline/40 mx-auto mb-2" />
                <p className="text-[13px] text-on-surface-variant">No delivery history yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {historyJobs.map((job) => (
                  <Link key={job.id} to={`/driver/jobs/${job.id}`} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', job.status === 'Delivered' ? 'bg-emerald-50' : 'bg-surface-container')}>
                        {job.status === 'Delivered' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Package className="w-4 h-4 text-on-surface-variant" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-on-surface">#{job.orderId || job.id}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          {job.order?.store?.name || 'Store'} → {job.order?.address?.city || 'Destination'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[14px] font-bold text-on-surface">{formatCurrency(job.order?.deliveryFee || 0)}</p>
                      <p className="text-[11px] text-on-surface-variant">{formatDateShort(job.completedAt || job.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block space-y-6 lg:sticky lg:top-20">
          {!loadingEarnings && earnings && (
            <div className="relative overflow-hidden rounded-xl bg-primary text-on-primary p-6 shadow-lg">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
              <div className="relative z-10">
                <p className="text-[13px] font-medium opacity-80 mb-1">Total Earnings</p>
                <h2 className="text-[32px] font-bold tracking-tight">{formatCurrency(earnings.totalEarnings || 0)}</h2>
                <div className="flex gap-4 mt-5 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-[11px] opacity-70">Jobs Done</p>
                    <p className="font-bold text-[18px]">{earnings.totalJobs || 0}</p>
                  </div>
                  <div className="border-l border-white/20 pl-4">
                    <p className="text-[11px] opacity-70">Rating</p>
                    <p className="font-bold text-[18px] flex items-center gap-1">
                      <Star className="w-4 h-4 fill-white" /> 4.9
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5">
            <h4 className="text-[14px] font-semibold text-on-surface mb-3">Quick Summary</h4>
            <div className="space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Active</span>
                <span className="font-semibold text-primary">{activeJobs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Available</span>
                <span className="font-semibold">{safeJobs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Completed</span>
                <span className="font-semibold">{historyJobs.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
