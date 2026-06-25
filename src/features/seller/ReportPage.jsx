import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { getSellerReport } from '../../api/seller';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function ReportPage() {
  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['sellerReport'],
    queryFn: () => getSellerReport(),
    select: (res) => res.data.data,
  });

  const safeReport = report || {};
  const completedOrders = safeReport.completedOrders || safeReport.orders || [];
  const totalIncome = safeReport.totalIncome || completedOrders.reduce((sum, o) => sum + (o.finalTotal || o.totalAmount || 0), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-headline-lg text-on-surface">Laporan</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <>
          <Card className="!p-6 bg-success/5 border border-success/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <p className="text-label-md text-success">Total Pendapatan</p>
            </div>
            <p className="text-headline-lg text-success">{formatCurrency(totalIncome)}</p>
            <p className="text-body-sm text-success/70 mt-1">{completedOrders.length} pesanan selesai</p>
          </Card>

          <h2 className="text-headline-md text-on-surface mt-4">Pesanan Selesai</h2>
          {isError || completedOrders.length === 0 ? (
            <p className="text-body-base text-on-surface-variant text-center py-8">Belum ada pesanan selesai</p>
          ) : (
          <div className="space-y-2">
            {completedOrders.map((o) => (
              <Card key={o.id} className="flex justify-between items-center">
                <div>
                  <p className="text-label-md text-on-surface">Order #{o.id}</p>
                  <p className="text-body-sm text-on-surface-variant">{formatDate(o.createdAt)}</p>
                  {o.deliveryMethod && <p className="text-body-sm text-on-surface-variant">{o.deliveryMethod}</p>}
                </div>
                <p className="text-label-md text-on-surface">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
              </Card>
            ))}
          </div>
          )}
        </>
      )}
    </div>
  );
}
