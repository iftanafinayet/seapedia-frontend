import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, TrendingUp, Package, Check, Eye, BarChart3, ChevronRight, Sparkles, ClipboardList } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getMyStore, getSellerOrders, getSellerProducts, processOrder } from '../../api/seller';
import { getSellerReport } from '../../api/seller';
import { formatCurrency, formatDateShort } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getOrderRevenue(order) {
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  }
  return (order.totalAmount || 0) - (order.discountAmount || 0);
}

function computeChartData(orders) {
  const completed = orders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  const revMap = {}, cntMap = {};
  days.forEach(d => { revMap[d] = 0; cntMap[d] = 0; });
  completed.forEach(o => {
    const d = new Date(o.createdAt).toISOString().split('T')[0];
    if (revMap[d] !== undefined) { revMap[d] += getOrderRevenue(o); cntMap[d] += 1; }
  });
  const values = days.map(d => revMap[d]);
  const counts = days.map(d => cntMap[d]);
  const maxRev = Math.max(...values, 1);
  return {
    labels: days.map(d => DAYS[new Date(d + 'T00:00:00').getDay()]),
    revenueValues: values, orderCounts: counts,
    revenuePct: values.map(v => Math.max((v / maxRev) * 100, v > 0 ? 6 : 0)),
    totalRevenue: values.reduce((s, v) => s + v, 0),
    totalOrders: counts.reduce((s, c) => s + c, 0),
  };
}

function computeGrowth(orders) {
  const now = new Date();
  const thisM = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const completed = orders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const t = completed.filter(o => new Date(o.createdAt) >= thisM).reduce((s, o) => s + getOrderRevenue(o), 0);
  const l = completed.filter(o => new Date(o.createdAt) >= lastM && new Date(o.createdAt) < thisM).reduce((s, o) => s + getOrderRevenue(o), 0);
  if (l === 0) return t > 0 ? 100 : 0;
  return Math.round(((t - l) / l) * 100);
}

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);
  const user = useAuthStore((s) => s.user);
  const [hoveredBar, setHoveredBar] = useState(null);

  const { data: store, isLoading: loadingStore } = useQuery({
    queryKey: ['myStore'], queryFn: getMyStore, select: (res) => res.data.data,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', 'seller'], queryFn: getSellerOrders, select: (res) => res.data.data || [],
  });

  const { data: products } = useQuery({
    queryKey: ['sellerProducts'], queryFn: getSellerProducts,
    select: (res) => res.data.data || [], enabled: !!store,
  });

  const { data: reportData } = useQuery({
    queryKey: ['sellerReport', '30d'],
    queryFn: () => getSellerReport({ dateFrom: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0] }),
    select: (res) => res.data.data, enabled: !!store,
  });

  const safeOrders = orders || [];
  const safeProducts = products || [];
  const packingOrders = safeOrders.filter(o => o.status === 'SedangDikemas' || o.status === 'Sedang_Dikemas');
  const completedOrders = safeOrders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const totalIncome = completedOrders.reduce((sum, o) => sum + getOrderRevenue(o), 0);
  const chartData = useMemo(() => computeChartData(safeOrders), [safeOrders]);
  const growthPct = useMemo(() => computeGrowth(safeOrders), [safeOrders]);

  const topProducts = useMemo(() => {
    const sales = reportData?.productSales || [];
    if (sales.length > 0) return sales.slice(0, 3);
    return safeProducts.slice(0, 3).map(p => ({ productId: p.id, name: p.name, totalSold: 0, totalRevenue: 0 }));
  }, [reportData, safeProducts]);

  const processMutation = useMutation({
    mutationFn: processOrder,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders', 'seller'] }); addNotification('Pesanan berhasil diproses', 'success'); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  if (loadingStore) {
    return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  }

  if (!store) {
    return (
      <div className="text-center py-16">
        <Store className="w-16 h-16 text-outline mx-auto mb-4" />
        <h1 className="text-[22px] font-semibold text-on-surface">Belum Ada Toko</h1>
        <p className="text-[14px] text-on-surface-variant mt-2">Buat toko kamu untuk mulai berjualan</p>
        <Link to="/seller/store" className="inline-block mt-6"><Button>Buat Toko</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] lg:text-[28px] font-bold text-on-surface">{store.name}</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">Selamat datang, {user?.username}</p>
        </div>
        <Link to="/seller/reports" className="text-[12px] text-primary font-semibold hover:underline">Laporan →</Link>
      </div>

      {/* KPI Summary Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
        <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-[0.05em] mb-4">Ringkasan</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/5 rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[18px] lg:text-[20px] font-bold text-on-surface">{formatCurrency(totalIncome)}</p>
            <p className="text-[10px] text-on-surface-variant">Pendapatan</p>
            <p className="text-[10px] text-success mt-0.5">{growthPct >= 0 ? '+' : ''}{growthPct}%</p>
          </div>
          <div className="bg-amber-50/50 rounded-xl p-3 text-center">
            <Package className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <p className="text-[18px] lg:text-[20px] font-bold text-on-surface">{safeOrders.length}</p>
            <p className="text-[10px] text-on-surface-variant">Pesanan</p>
            <p className="text-[10px] text-amber-600 mt-0.5">{packingOrders.length} masuk</p>
          </div>
          <div className="bg-emerald-50/50 rounded-xl p-3 text-center">
            <Store className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-[18px] lg:text-[20px] font-bold text-on-surface">{safeProducts.length}</p>
            <p className="text-[10px] text-on-surface-variant">Produk</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">aktif</p>
          </div>
        </div>
      </div>

      {/* Income Chart */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em]">Pendapatan 7 Hari</p>
          <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-primary" /> Revenue</span>
            <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-outline-variant" /> Orders</span>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div>
            <p className="text-[20px] font-bold text-on-surface">{formatCurrency(chartData.totalRevenue)}</p>
            <p className="text-[10px] text-on-surface-variant">Total Revenue</p>
          </div>
          <div>
            <p className="text-[20px] font-bold text-on-surface">{chartData.totalOrders}</p>
            <p className="text-[10px] text-on-surface-variant">Total Orders</p>
          </div>
        </div>

        {safeOrders.length === 0 ? (
          <div className="h-40 flex items-center justify-center border-l border-b border-outline-variant/30 rounded-bl-lg rounded-br-lg">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-outline/20 mx-auto mb-1" />
              <p className="text-[12px] text-on-surface-variant">Belum ada data pesanan</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="h-36 lg:h-44 flex items-end gap-1 lg:gap-2 px-2 border-l border-b border-outline-variant/30">
              {chartData.revenuePct.map((h, i) => (
                <div key={i} className="flex-1 flex items-end gap-0.5 h-full relative group" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                  <div className="w-full h-full rounded-t-sm flex items-end">
                    <div className={`w-full rounded-t-sm transition-all duration-500 ${hoveredBar === i ? 'bg-primary' : 'bg-primary/60'}`} style={{ height: `${h}%` }} />
                  </div>
                  {hoveredBar === i && chartData.revenueValues[i] > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap z-10">
                      {formatCurrency(chartData.revenueValues[i])}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2 px-2 text-[10px] text-on-surface-variant">
              {chartData.labels.map((l, i) => <span key={i} className="flex-1 text-center">{l}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Top Products + Incoming Orders Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em]">Top Produk</p>
            <Link to="/seller/reports" className="text-[11px] text-primary font-semibold">Lihat →</Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-[13px] text-on-surface-variant text-center py-6">Belum ada penjualan</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-600'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-on-surface truncate">{p.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{p.totalSold}x terjual</p>
                  </div>
                  <p className="text-[13px] font-bold text-primary">{formatCurrency(p.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Packing Orders — card-based for mobile */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em]">Pesanan Masuk</p>
            <Badge variant="warning">{packingOrders.length}</Badge>
          </div>
          {loadingOrders ? (
            <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : packingOrders.length === 0 ? (
            <div className="text-center py-6">
              <ClipboardList className="w-8 h-8 text-outline/20 mx-auto mb-1" />
              <p className="text-[12px] text-on-surface-variant">Tidak ada pesanan masuk</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {packingOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold text-primary">#{o.id}</p>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">Pending</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{o.address?.recipient || 'Customer'} · {formatDateShort(o.createdAt)}</p>
                    <p className="text-[12px] font-semibold text-on-surface mt-0.5">{formatCurrency(getOrderRevenue(o))}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => processMutation.mutate(o.id)} disabled={processMutation.isPending}
                      className="px-2.5 py-1.5 bg-primary text-white text-[11px] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                      Proses
                    </button>
                    <Link to={`/seller/orders/${o.id}`} className="px-2 py-1.5 text-outline hover:text-on-surface transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {packingOrders.length > 5 && (
                <Link to="/seller/orders" className="block text-center text-[12px] text-primary font-semibold py-1">
                  +{packingOrders.length - 5} lainnya →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
