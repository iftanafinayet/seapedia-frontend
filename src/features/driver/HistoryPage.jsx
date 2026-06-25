import { useQuery } from '@tanstack/react-query';
import { Truck, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { getDriverMyJobs, getDriverEarnings } from '../../api/driver';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function HistoryPage() {
  const { data: history, isLoading: loadingHistory, isError: historyError } = useQuery({
    queryKey: ['driver', 'my-jobs'],
    queryFn: getDriverMyJobs,
    select: (res) => res.data.data || [],
  });

  const safeHistory = history || [];

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ['driver', 'earnings'],
    queryFn: getDriverEarnings,
    select: (res) => res.data.data || [],
  });

  const completedJobs = safeHistory.filter(j => j.status === 'delivered' || j.status === 'completed' || j.status === 'PesananSelesai' || j.status === 'Pesanan_Selesai');

  return (
    <div className="space-y-4">
      <h1 className="text-[24px] font-semibold text-on-surface">Riwayat Pengiriman</h1>

      {loadingEarnings ? (
        <Skeleton className="h-24 rounded-[12px]" />
      ) : (
        <Card className="bg-primary text-on-primary !rounded-[12px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-on-primary" />
            </div>
            <p className="text-[14px] font-medium text-on-primary/80">Total Penghasilan</p>
          </div>
          <p className="text-[28px] font-bold text-on-primary">{formatCurrency(earnings?.totalEarnings || 0)}</p>
          <p className="text-[12px] text-on-primary/70 mt-1">{completedJobs.length} pengiriman selesai</p>
        </Card>
      )}

      {loadingHistory ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : historyError || safeHistory.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-outline mx-auto mb-3" />
              <p className="text-[14px] text-outline">Belum ada riwayat pengiriman</p>
            </div>
          ) : (
        <div className="space-y-2">
          {safeHistory.map((job) => (
            <Card key={job.id} className="flex justify-between items-center !rounded-[12px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Truck className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-on-surface">Order #{job.orderId || job.id}</p>
                  <p className="text-[12px] text-outline">{formatDate(job.completedAt || job.createdAt)}</p>
                </div>
              </div>
              <p className="text-[15px] font-bold text-primary">{formatCurrency(job.amount || job.earning || 0)}</p>
            </Card>
          ))}
            </div>
          )}
    </div>
  );
}
