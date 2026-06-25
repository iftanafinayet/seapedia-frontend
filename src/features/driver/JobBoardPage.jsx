import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, MapPin, Clock, TrendingUp, Navigation, Package, Star, ChevronRight, CheckCircle } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { getAvailableJobs, getDriverEarnings, getDriverMyJobs } from '../../api/driver';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

const filterChips = ['All Jobs', 'Express', 'Groceries', 'Fragile'];

export default function JobBoardPage() {
  const [activeFilter, setActiveFilter] = useState('All Jobs');

  const { data: jobs, isLoading: loadingJobs, isError: jobsError } = useQuery({
    queryKey: ['driver', 'jobs'],
    queryFn: getAvailableJobs,
    select: (res) => res.data.data || [],
  });

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ['driver', 'earnings'],
    queryFn: getDriverEarnings,
    select: (res) => res.data.data,
  });

  const { data: myJobs } = useQuery({
    queryKey: ['driver', 'myJobs'],
    queryFn: getDriverMyJobs,
    select: (res) => res.data.data || [],
  });

  const safeJobs = jobs || [];
  const activeJobs = (myJobs || []).filter(j => j.status === 'Taken');

  return (
    <div className="max-w-content mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] lg:text-[32px] font-semibold text-on-surface">Job Board</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">Available delivery jobs near you</p>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="bg-surface-container-lowest border border-primary/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-[16px] font-semibold text-on-surface">Active Delivery</h3>
            <span className="text-[13px] text-on-surface-variant ml-auto">{activeJobs.length} job{activeJobs.length > 1 ? 's' : ''}</span>
          </div>
          {activeJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface">Order #{job.orderId || job.id}</p>
                  <p className="text-[12px] text-on-surface-variant">
                    {job.order?.store?.name || 'Store'} → {job.order?.address?.city || 'Destination'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <p className="text-[14px] font-bold text-primary">{formatCurrency(job.order?.deliveryFee || 0)}</p>
                <Link to={`/driver/jobs/${job.id}`}>
                  <Button size="sm">Detail</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop: sidebar + main grid */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
        {/* Left: Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Card — mobile only (desktop has it in sidebar) */}
          {!loadingEarnings && earnings && (
            <div className="lg:hidden relative overflow-hidden rounded-xl bg-primary text-on-primary p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <p className="text-[12px] font-medium opacity-80 mb-1">Today's Earnings</p>
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-[28px] font-bold">{formatCurrency(earnings?.totalEarnings || 0)}</h2>
                    <p className="text-[12px] text-on-primary/70 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +12% from yesterday
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2">Gold Partner</div>
                    <div className="flex gap-3">
                      <div className="text-center"><p className="text-[11px] opacity-70">Jobs</p><p className="font-bold text-[14px]">{earnings?.totalJobs || 0}</p></div>
                      <div className="text-center border-l border-white/20 pl-3"><p className="text-[11px] opacity-70">Rating</p><p className="font-bold text-[14px]">4.9</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterChips.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-full text-[13px] lg:text-[14px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-95',
                  activeFilter === f
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          <div>
            <h3 className="text-[18px] lg:text-[20px] font-semibold text-on-surface mb-4">Available Near You</h3>

            {loadingJobs ? (
              <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
            ) : jobsError || safeJobs.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-outline/40" />
                </div>
                <p className="text-[16px] font-semibold text-on-surface-variant">No jobs available</p>
                <p className="text-[14px] text-on-surface-variant mt-1">Check back later for new deliveries</p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 shadow-card hover:shadow-card-hover transition-all group"
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[14px] font-bold text-primary">#{job.order?.id || job.id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                          <span className="text-[12px] text-on-surface-variant">{job.order?.deliveryMethod || 'Instant Delivery'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[20px] lg:text-[24px] font-bold text-on-surface">{formatCurrency(job.order?.deliveryFee || 0)}</p>
                        <p className="text-[12px] text-outline">{job.order?.distance || '2.4'} km total</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="space-y-3 mb-4 relative ml-1">
                      <div className="absolute left-[7px] top-3 bottom-3 w-0.5 border-l-2 border-dotted border-outline-variant/50" />
                      <div className="flex gap-3 items-start relative z-10">
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-outline uppercase tracking-[0.05em]">Pickup</p>
                          <p className="text-[14px] font-semibold text-on-surface">{job.order?.store?.name || 'Store'}</p>
                          <p className="text-[11px] text-on-surface-variant">Pickup location</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start relative z-10">
                        <div className="w-4 h-4 rounded-full border-2 border-error flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-error" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-outline uppercase tracking-[0.05em]">Destination</p>
                          <p className="text-[14px] font-semibold text-on-surface">
                            {job.order?.address?.city || job.order?.address?.addressLine || 'Destination'}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">{job.order?.address?.recipient || ''}</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to={`/driver/jobs/${job.id}`}>
                      <Button className="w-full">
                        Ambil Pekerjaan
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar (1/3) — Desktop only */}
        <div className="hidden lg:block space-y-6 lg:sticky lg:top-20">
          {/* Earnings Card */}
          {!loadingEarnings && earnings && (
            <div className="relative overflow-hidden rounded-xl bg-primary text-on-primary p-6 shadow-lg">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -ml-12 -mb-12" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-medium opacity-80">Today's Earnings</p>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-[11px] font-semibold">Gold Partner</div>
                </div>
                <h2 className="text-[32px] font-bold tracking-tight mt-1">{formatCurrency(earnings?.totalEarnings || 0)}</h2>
                <p className="text-[13px] text-on-primary/70 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +12% from yesterday
                </p>
                <div className="flex gap-4 mt-5 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-[11px] opacity-70">Completed Jobs</p>
                    <p className="font-bold text-[18px]">{earnings?.totalJobs || 0}</p>
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

          {/* Mini Map Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5">
            <h4 className="text-[14px] font-semibold text-on-surface mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Active Coverage
            </h4>
            <div className="relative h-36 rounded-lg bg-surface-container-low overflow-hidden mb-3">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-outline/20" />
              </div>
              <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-primary rounded-full border-2 border-white animate-pulse" />
              <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-primary rounded-full border-2 border-white animate-pulse" style={{ animationDelay: '0.7s' }} />
              <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-error rounded-full border-2 border-white animate-pulse" style={{ animationDelay: '1.4s' }} />
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-on-surface-variant">Active Drivers</span>
              <span className="font-bold text-on-surface">24</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full w-3/4 rounded-full" />
            </div>
          </div>

          {/* Quick Link */}
          <Link to="/driver/history" className="block bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 hover:border-primary transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-on-surface">Delivery History</p>
                  <p className="text-[12px] text-on-surface-variant">View past deliveries</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
