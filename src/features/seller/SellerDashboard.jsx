import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, TrendingUp, Package, Check, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getMyStore, getSellerOrders, getSellerProducts, processOrder } from '../../api/seller';
import { formatCurrency, formatDateShort } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import useAuthStore from '../../stores/authStore';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function computeChartData(orders) {
  const completed = orders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const today = new Date();
  const days = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  const revenueByDay = {};
  const countByDay = {};
  days.forEach(d => { revenueByDay[d] = 0; countByDay[d] = 0; });
  completed.forEach(o => {
    const d = new Date(o.createdAt).toISOString().split('T')[0];
    if (revenueByDay[d] !== undefined) {
      revenueByDay[d] += (o.finalTotal || o.totalAmount || 0);
      countByDay[d] += 1;
    }
  });
  const values = days.map(d => revenueByDay[d]);
  const counts = days.map(d => countByDay[d]);
  const maxRev = Math.max(...values, 1);
  const maxCnt = Math.max(...counts, 1);
  return {
    labels: days.map(d => DAYS[new Date(d + 'T00:00:00').getDay()]),
    revenuePct: values.map(v => Math.max((v / maxRev) * 100, 4)),
    ordersPct: counts.map(c => Math.max((c / maxCnt) * 100, 4)),
    totalRevenue: values.reduce((s, v) => s + v, 0),
  };
}

function computeGrowth(orders) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const completed = orders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const thisMonth = completed.filter(o => new Date(o.createdAt) >= thisMonthStart);
  const lastMonth = completed.filter(o => new Date(o.createdAt) >= lastMonthStart && new Date(o.createdAt) < thisMonthStart);
  const thisTotal = thisMonth.reduce((s, o) => s + (o.finalTotal || o.totalAmount || 0), 0);
  const lastTotal = lastMonth.reduce((s, o) => s + (o.finalTotal || o.totalAmount || 0), 0);
  if (lastTotal === 0) return thisTotal > 0 ? 100 : 0;
  return Math.round(((thisTotal - lastTotal) / lastTotal) * 100);
}

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);
  const user = useAuthStore((s) => s.user);

  const { data: store, isLoading: loadingStore } = useQuery({
    queryKey: ['myStore'],
    queryFn: getMyStore,
    select: (res) => res.data.data,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', 'seller'],
    queryFn: getSellerOrders,
    select: (res) => res.data.data || [],
  });

  const { data: products } = useQuery({
    queryKey: ['sellerProducts'],
    queryFn: getSellerProducts,
    select: (res) => res.data.data || [],
    enabled: !!store,
  });

  const safeOrders = orders || [];
  const safeProducts = products || [];
  const packingOrders = safeOrders.filter(o => o.status === 'SedangDikemas' || o.status === 'Sedang_Dikemas');
  const completedOrders = safeOrders.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const totalIncome = completedOrders.reduce((sum, o) => sum + (o.finalTotal || o.totalAmount || 0), 0);

  const chartData = useMemo(() => computeChartData(safeOrders), [safeOrders]);
  const growthPct = useMemo(() => computeGrowth(safeOrders), [safeOrders]);

  const processMutation = useMutation({
    mutationFn: processOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'seller'] });
      addNotification('Pesanan berhasil diproses', 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  if (loadingStore) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-16">
        <Store className="w-16 h-16 text-outline mx-auto mb-4" />
        <h1 className="text-[22px] font-semibold text-on-surface">Belum Ada Toko</h1>
        <p className="text-[14px] text-on-surface-variant mt-2">Buat toko kamu untuk mulai berjualan</p>
        <Link to="/seller/store" className="inline-block mt-6">
          <Button>Buat Toko</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-[28px] lg:text-[32px] font-semibold text-on-surface tracking-[-0.01em]">Performance Dashboard</h2>
          <p className="text-[14px] lg:text-[16px] text-on-surface-variant mt-1">
            Welcome back, {user?.username || 'Seller'}. Here's what's happening with {store.name} today.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-outline-variant rounded-lg text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">
            Last 30 Days
          </button>
          <Link to="/seller/reports">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold hover:opacity-90 transition-colors flex items-center gap-2">
              Export Report
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Sales */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl hover:shadow-card-hover transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Total Sales</span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[24px] font-bold text-on-surface">{formatCurrency(totalIncome)}</h3>
            <div className="flex items-center gap-1 mt-1 text-success text-[12px] font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{growthPct >= 0 ? '+' : ''}{growthPct}% from last month</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl hover:shadow-card-hover transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Orders</span>
            <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center">
              <Package className="w-5 h-5 text-on-secondary-container" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[24px] font-bold text-on-surface">{safeOrders.length.toLocaleString()}</h3>
            <div className="flex items-center gap-1 mt-1 text-success text-[12px] font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{packingOrders.length} pending processing</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl hover:shadow-card-hover transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Products</span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-[24px] font-bold text-on-surface">{safeProducts.length}</h3>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-[12px] font-medium">
              <span>active listings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart + Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Income Chart — 2/3 width */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-semibold text-on-surface">Income Overview</h3>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[12px] text-on-surface-variant">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-outline-variant" />
                <span className="text-[12px] text-on-surface-variant">Orders</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-48 flex items-end gap-3 px-2 border-l border-b border-outline-variant/30">
            {chartData.revenuePct.map((revH, i) => {
              const ordH = chartData.ordersPct[i];
              return (
                <div key={i} className="flex-1 flex items-end gap-1 h-full">
                  <div className="w-full bg-primary/10 rounded-t-sm flex items-end">
                    <div className="w-full bg-primary rounded-t-sm transition-all duration-500" style={{ height: `${revH}%` }} />
                  </div>
                  <div className="w-full bg-surface-container-high rounded-t-sm flex items-end">
                    <div className="w-full bg-outline-variant rounded-t-sm" style={{ height: `${ordH}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between pt-3 px-2 text-[12px] text-on-surface-variant">
            {chartData.labels.map((label, i) => (
              <span key={i} className="flex-1 text-center">{label}</span>
            ))}
          </div>
        </div>

        {/* Top Products — 1/3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col">
          <h3 className="text-[20px] font-semibold text-on-surface mb-5">Top Products</h3>
          <div className="space-y-4 flex-1">
            {safeProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-on-surface-variant" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface truncate">{product.name}</p>
                  <p className="text-[12px] text-on-surface-variant">Stock: {product.stock}</p>
                </div>
                <p className="text-[14px] font-semibold text-primary">{formatCurrency(product.price)}</p>
              </div>
            ))}
            {safeProducts.length === 0 && (
              <p className="text-[14px] text-on-surface-variant text-center py-8">No products yet</p>
            )}
          </div>
          <Link to="/seller/products" className="mt-5 w-full py-2.5 border border-outline-variant rounded-lg text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors text-center block">
            View Inventory
          </Link>
        </div>
      </div>

      {/* Incoming Orders Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center bg-surface-container-low border-b border-outline-variant">
          <h3 className="text-[20px] font-semibold text-on-surface">Recent Incoming Orders</h3>
        </div>

        {loadingOrders ? (
          <div className="p-6 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : packingOrders.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-12 h-12 text-outline/30 mx-auto mb-3" />
            <p className="text-[14px] text-on-surface-variant">No incoming orders to process</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-lowest text-[12px] text-on-surface-variant border-b border-outline-variant">
                  <th className="px-6 py-3 font-semibold uppercase tracking-[0.05em]">Order ID</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-[0.05em]">Customer</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-[0.05em]">Date</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-[0.05em]">Amount</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-[0.05em]">Status</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-[0.05em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {packingOrders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-3.5 text-[14px] font-bold text-primary">#{o.id}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-on-surface">{o.address?.recipient || 'Customer'}</span>
                        <span className="text-[11px] text-on-surface-variant">{o.address?.city || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[14px] text-on-surface-variant">{formatDateShort(o.createdAt)}</td>
                    <td className="px-6 py-3.5 text-[14px] font-semibold text-on-surface">{formatCurrency(o.finalTotal || o.totalAmount)}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => processMutation.mutate(o.id)}
                          disabled={processMutation.isPending}
                          className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="Process"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <Link to={`/seller/orders/${o.id}`} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {packingOrders.length > 0 && (
          <div className="px-6 py-4 flex justify-center border-t border-outline-variant bg-surface-container-lowest">
            <Link to="/seller/orders" className="text-[14px] font-semibold text-primary hover:underline">
              View All Orders History
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
