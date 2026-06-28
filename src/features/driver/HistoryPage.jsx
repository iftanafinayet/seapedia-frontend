import { useQuery } from '@tanstack/react-query';
import { Truck, TrendingUp, CheckCircle, Package } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { getDriverMyJobs, getDriverEarnings } from '../../api/driver';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function HistoryPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['driver', 'my-jobs'], queryFn: getDriverMyJobs, select: (res) => res.data.data || [],
  });
  const { data: earnings } = useQuery({
    queryKey: ['driver', 'earnings'], queryFn: getDriverEarnings, select: (res) => res.data.data || [],
  });

  const safeHistory = history || [];
  const completedJobs = safeHistory.filter(j =>
    j.status === 'Delivered' || j.status === 'Completed' || j.status === 'PesananSelesai' || j.status === 'Pesanan_Selesai'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">Riwayat Pengiriman</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">{completedJobs.length} pengiriman selesai</p>
        </div>
      </div>

      <div className="bg-primary text-on-primary rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 opacity-80" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] opacity-80">Total Penghasilan</p>
        </div>
        <p className="text-[28px] font-bold">{formatCurrency(earnings?.totalEarnings || 0)}</p>
        <p className="text-[12px] opacity-80 mt-0.5">{completedJobs.length} pengiriman selesai</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : safeHistory.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center">
          <Truck className="w-8 h-8 text-outline/20 mx-auto mb-2" />
          <p className="text-[13px] text-on-surface-variant">Belum ada riwayat pengiriman</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
          <div className="divide-y divide-outline-variant/10">
            {safeHistory.map((job) => {
              const isCompleted = job.status === 'Delivered' || job.status === 'Completed' || job.status === 'PesananSelesai' || job.status === 'Pesanan_Selesai';
              return (
                <div key={job.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-container/50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-50' : 'bg-surface-container'}`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Package className="w-4 h-4 text-outline" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-on-surface">Order #{job.orderId || job.id}</p>
                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                      <span>{formatDate(job.completedAt || job.createdAt)}</span>
                      {!isCompleted && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700">Proses</span>}
                    </div>
                  </div>
                  <p className="text-[14px] font-bold text-on-surface shrink-0">{formatCurrency(job.order?.deliveryFee || job.amount || job.earning || 0)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
