import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ArrowRight, ChevronRight, Clock, CheckCircle2, Truck, PackageCheck, RotateCcw } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { getBuyerOrders } from '../../api/buyer';
import { formatCurrency, formatDateShort, getStatusBadge } from '../../lib/utils';
import useAuthStore from '../../stores/authStore';
import { cn } from '../../lib/utils';

const STATUS_BG = {
  SedangDikemas: 'bg-amber-50 text-amber-700 border-amber-200',
  MenungguPengirim: 'bg-blue-50 text-blue-700 border-blue-200',
  SedangDikirim: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  PesananSelesai: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Dikembalikan: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_DOT = {
  SedangDikemas: 'bg-amber-400',
  MenungguPengirim: 'bg-blue-400',
  SedangDikirim: 'bg-indigo-400',
  PesananSelesai: 'bg-emerald-400',
  Dikembalikan: 'bg-red-400',
};

export default function OrderListPage() {
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('Semua');

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', 'buyer'],
    queryFn: getBuyerOrders,
    select: (res) => res.data.data || [],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-content mx-auto px-4">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-outline/40" />
        </div>
        <h2 className="text-[20px] font-semibold text-on-surface mb-2">Login to View Orders</h2>
        <p className="text-[14px] text-on-surface-variant mb-6 max-w-sm">You need to login first to see your order history.</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  const safeOrders = orders || [];
  const filteredOrders = statusFilter === 'Semua' ? safeOrders : safeOrders.filter(o => o.status === statusFilter);

  const statusTabs = [
    { key: 'Semua', label: 'All', count: safeOrders.length },
    { key: 'SedangDikemas', label: 'Packing', count: safeOrders.filter(o => o.status === 'SedangDikemas').length },
    { key: 'MenungguPengirim', label: 'Awaiting Driver', count: safeOrders.filter(o => o.status === 'MenungguPengirim').length },
    { key: 'SedangDikirim', label: 'In Transit', count: safeOrders.filter(o => o.status === 'SedangDikirim').length },
    { key: 'PesananSelesai', label: 'Delivered', count: safeOrders.filter(o => o.status === 'PesananSelesai').length },
    { key: 'Dikembalikan', label: 'Refunded', count: safeOrders.filter(o => o.status === 'Dikembalikan').length },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-content mx-auto px-4 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3 lg:hidden">{[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-slate-100 rounded-[20px] p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-6 w-28 rounded-full bg-slate-100" />
              <Skeleton className="h-5 w-24 rounded bg-slate-100" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded bg-slate-100 mb-2" />
            <hr className="border-t border-slate-100 my-3" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 rounded bg-slate-100" />
              <Skeleton className="h-3 w-24 rounded bg-slate-100" />
            </div>
          </div>
        ))}</div>
        <div className="hidden lg:block space-y-2 mt-6">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      </div>
    );
  }

  if (isError || safeOrders.length === 0) {
    return (
    <div className="max-w-content mx-auto px-4 lg:px-8 pt-4">
        <h1 className="text-[24px] font-semibold text-on-surface mb-8">My Orders</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-outline" />
          </div>
          <h2 className="text-[18px] font-semibold text-on-surface mb-2">No orders yet</h2>
          <p className="text-[14px] text-on-surface-variant mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 lg:px-8 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-on-surface">My Orders</h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5">{safeOrders.length} order{safeOrders.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200',
              statusFilter === tab.key
                ? 'bg-primary-container text-white shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-outline mx-auto mb-3" />
          <p className="text-[14px] text-on-surface-variant">No {statusFilter === 'Semua' ? '' : statusFilter} orders</p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((o) => {
              const badge = getStatusBadge(o.status);
              const itemCount = (o.items || []).reduce((s, i) => s + i.quantity, 0);
              const names = (o.items || []).map(i => i.product?.name || `#${i.productId}`).join(', ');
              return (
                <Link key={o.id} to={`/buyer/orders/${o.id}`}>
                  <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-4 pb-3 active:scale-[0.98] transition-all duration-200">
                    {/* Header: Status + Price */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                        STATUS_BG[o.status] || 'bg-surface-container-low text-on-surface-variant border-outline-variant'
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[o.status] || 'bg-slate-400')} />
                        {badge.label}
                      </span>
                      <p className="text-[15px] font-bold text-primary-container">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
                    </div>

                    {/* Product Names */}
                    <p className="text-[14px] font-semibold text-slate-800 line-clamp-1 mb-1">
                      {names || `Order #${o.id}`}
                    </p>

                    {/* Store name if available */}
                    {o.store?.name && (
                      <p className="text-[12px] text-on-surface-variant mb-2">{o.store.name}</p>
                    )}

                    {/* Divider */}
                    <hr className="border-t border-slate-100 my-2.5" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-400">{formatDateShort(o.createdAt)}</span>
                      <div className="flex items-center gap-1 text-[12px] text-slate-400 font-medium">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} · #{o.id}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden lg:block bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Products</th>
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Store</th>
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Date</th>
                    <th className="text-left px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Status</th>
                    <th className="text-right px-6 py-4 text-[12px] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">Total</th>
                    <th className="w-10 px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => {
                    const badge = getStatusBadge(o.status);
                    const dNames = (o.items || []).map(i => i.product?.name || `Product #${i.productId}`).join(', ');
                    const itemCount = (o.items || []).reduce((s, i) => s + i.quantity, 0);
                    return (
                      <tr
                        key={o.id}
                        className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors group cursor-pointer"
                        onClick={() => window.location.href = `/buyer/orders/${o.id}`}
                      >
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-[14px] font-semibold text-on-surface truncate">{dNames || `Order #${o.id}`}</p>
                          <p className="text-[12px] text-on-surface-variant mt-0.5">
                            {itemCount} item{itemCount !== 1 ? 's' : ''} · #{o.id}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[14px] text-on-surface-variant">{o.store?.name || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[14px] text-on-surface-variant">{formatDateShort(o.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border', STATUS_BG[o.status] || 'bg-surface-container-low text-on-surface-variant border-outline-variant')}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[o.status] || 'bg-slate-400')} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-[14px] font-bold text-on-surface">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
