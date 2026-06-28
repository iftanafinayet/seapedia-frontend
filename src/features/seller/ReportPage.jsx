import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, DollarSign, Star, Download, Calendar } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { getSellerReport } from '../../api/seller';
import { formatCurrency, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getDateRange(period) {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from;
  switch (period) {
    case '7d':
      from = new Date(now); from.setDate(from.getDate() - 6); from = from.toISOString().split('T')[0]; break;
    case '30d':
      from = new Date(now); from.setDate(from.getDate() - 29); from = from.toISOString().split('T')[0]; break;
    case 'month':
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]; break;
    default:
      from = undefined;
  }
  return { from, to };
}

function computeDailyRevenue(orders) {
  const completed = orders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const revenueMap = {};
  const orderMap = {};
  completed.forEach(o => {
    const d = new Date(o.createdAt).toISOString().split('T')[0];
    revenueMap[d] = (revenueMap[d] || 0) + (o.finalTotal || o.totalAmount || 0);
    orderMap[d] = (orderMap[d] || 0) + 1;
  });
  const days = Object.keys(revenueMap).sort();
  const values = days.map(d => ({ date: d, revenue: revenueMap[d], orders: orderMap[d] }));
  return { days, values, maxRevenue: Math.max(...Object.values(revenueMap), 1) };
}

export default function ReportPage() {
  const [period, setPeriod] = useState('7d');
  const [hoverBar, setHoverBar] = useState(null);
  const { from, to } = getDateRange(period);

  const { data: report, isLoading, isError, error } = useQuery({
    queryKey: ['sellerReport', period],
    queryFn: () => getSellerReport({ dateFrom: from, dateTo: to }),
    select: (res) => res.data.data,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <p className="text-[14px] text-error font-semibold">Gagal memuat laporan</p>
        <p className="text-[12px] text-on-surface-variant mt-1">{error?.response?.data?.message || error?.message || 'Terjadi kesalahan'}</p>
      </div>
    );
  }

  const safeReport = report || {};
  const allOrders = safeReport.orders || [];
  const completedOrders = allOrders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const totalIncome = safeReport.totalIncome || 0;
  const avgOrderValue = safeReport.avgOrderValue || 0;
  const productSales = safeReport.productSales || [];

  const chartData = computeDailyRevenue(allOrders);

  const exportCSV = () => {
    const header = 'ID,Status,Total,PPN,Ongkir,Diskon,Final,Tanggal\n';
    const rows = allOrders.map(o =>
      `${o.id},${o.status},${o.totalAmount},${o.taxAmount},${o.deliveryFee},${o.discountAmount},${o.finalTotal},${formatDate(o.createdAt)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `laporan-penjualan-${period}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-on-surface">Laporan Penjualan</h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5">Analisis performa toko kamu</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-surface-container rounded-lg p-0.5">
            {[
              { key: '7d', label: '7 Hari' },
              { key: '30d', label: '30 Hari' },
              { key: 'month', label: 'Bulan Ini' },
            ].map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={cn('px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors',
                  period === p.key ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                )}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="px-3 py-1.5 border border-outline-variant rounded-lg text-[12px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pendapatan', value: formatCurrency(totalIncome), icon: DollarSign, color: 'bg-primary/10 text-primary' },
          { label: 'Pesanan Selesai', value: completedOrders.length, icon: Package, color: 'bg-success/10 text-success' },
          { label: 'Rata-rata Pesanan', value: formatCurrency(avgOrderValue), icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
          { label: 'Produk Terjual', value: productSales.reduce((s, p) => s + p.totalSold, 0), icon: Star, color: 'bg-purple-50 text-purple-600' },
        ].map((card, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', card.color)}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-[12px] text-on-surface-variant font-medium">{card.label}</p>
            <p className="text-[18px] lg:text-[20px] font-bold text-on-surface mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <h2 className="text-[18px] font-semibold text-on-surface mb-2">Tren Pendapatan</h2>
        <p className="text-[12px] text-on-surface-variant mb-4">
          {chartData.values.length > 0 ? `${chartData.days.length} hari data` : 'Belum ada data'}
        </p>

        {chartData.values.length === 0 ? (
          <div className="h-48 flex items-center justify-center border-l border-b border-outline-variant/30">
            <p className="text-[13px] text-on-surface-variant">Belum ada data pendapatan</p>
          </div>
        ) : (
          <div className="relative">
            <div className="h-48 flex items-end gap-1 lg:gap-2 px-2 border-l border-b border-outline-variant/30">
              {chartData.values.map((d, i) => {
                const pct = Math.max((d.revenue / chartData.maxRevenue) * 100, d.revenue > 0 ? 4 : 0);
                return (
                  <div key={i} className="flex-1 flex items-end relative group"
                    onMouseEnter={() => setHoverBar(i)} onMouseLeave={() => setHoverBar(null)}>
                    <div className={cn('w-full rounded-t-sm transition-all duration-300 cursor-pointer',
                      hoverBar === i ? 'bg-primary' : 'bg-primary/60'
                    )} style={{ height: `${pct}%` }} />
                    {hoverBar === i && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[11px] rounded-lg px-2 py-1.5 shadow-lg z-10 whitespace-nowrap">
                        <p className="font-semibold">{formatCurrency(d.revenue)}</p>
                        <p className="text-white/70">{d.orders} order</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between pt-3 px-2 text-[11px] text-on-surface-variant">
              {chartData.days.map((d, i) => {
                const date = new Date(d + 'T00:00:00');
                return <span key={i} className="flex-1 text-center">{chartData.days.length > 7 ? `${date.getDate()}/${date.getMonth()+1}` : DAYS[date.getDay()]}</span>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Product Sales Table + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Product Performance */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20">
            <h2 className="text-[16px] font-semibold text-on-surface">Performa Produk</h2>
          </div>
          {productSales.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-10 h-10 text-outline/30 mx-auto mb-2" />
              <p className="text-[13px] text-on-surface-variant">Belum ada produk terjual</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {productSales.map((p) => (
                <div key={p.productId} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[12px] shrink-0">
                    {p.totalSold}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-on-surface truncate">{p.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{p.totalSold}x terjual</p>
                  </div>
                  <p className="text-[13px] font-semibold text-success">{formatCurrency(p.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completed Orders */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20">
            <h2 className="text-[16px] font-semibold text-on-surface">Pesanan Selesai Terbaru</h2>
          </div>
          {completedOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-outline/30 mx-auto mb-2" />
              <p className="text-[13px] text-on-surface-variant">Belum ada pesanan selesai</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10 max-h-[300px] overflow-y-auto">
              {completedOrders.slice(0, 10).map((o) => (
                <div key={o.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-on-surface">#{o.id}</p>
                    <p className="text-[11px] text-on-surface-variant">{formatDate(o.createdAt)}</p>
                  </div>
                  <p className="text-[13px] font-semibold text-success">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
