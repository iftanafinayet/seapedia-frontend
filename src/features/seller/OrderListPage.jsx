import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Truck, Eye, ChevronRight } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getSellerOrders, processOrder } from '../../api/seller';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export default function SellerOrderListPage() {
  const [filter, setFilter] = useState('packing');
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'seller'],
    queryFn: getSellerOrders,
    select: (res) => res.data.data || [],
  });

  const safeOrders = orders || [];

  const processMutation = useMutation({
    mutationFn: processOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'seller'] });
      addNotification('Pesanan berhasil diproses', 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal', 'error'),
  });

  const packingOrders = safeOrders.filter(o => o.status === 'SedangDikemas' || o.status === 'Sedang_Dikemas');
  const filteredOrders = filter === 'packing' ? packingOrders : safeOrders;
  const displayed = showAll ? filteredOrders : filteredOrders.slice(0, 10);
  const hasMore = filteredOrders.length > 10;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">Pesanan</h1>
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            {packingOrders.length} perlu diproses · {safeOrders.length} total
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-0.5 w-fit">
        {[
          { key: 'packing', label: 'Perlu Dikemas', count: packingOrders.length },
          { key: 'all', label: 'Semua', count: safeOrders.length },
        ].map((tab) => (
          <button key={tab.key} onClick={() => { setFilter(tab.key); setShowAll(false); }}
            className={cn(
              'px-4 py-1.5 rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-1.5',
              filter === tab.key ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            )}>
            {tab.label}
            <span className={cn('text-[10px] px-1 rounded', filter === tab.key ? 'bg-white/20' : 'bg-surface-container-high')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Order List */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-10 h-10 text-outline/30 mx-auto mb-2" />
          <p className="text-[13px] text-on-surface-variant">Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayed.map((o) => {
            const badge = getStatusBadge(o.status);
            const isPacking = o.status === 'SedangDikemas' || o.status === 'Sedang_Dikemas';
            return (
              <div key={o.id} className={`p-3 lg:p-4 rounded-xl border transition-colors ${isPacking ? 'bg-amber-50/30 border-amber-200' : 'bg-surface-container-lowest border-outline-variant'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] lg:text-[14px] font-bold text-primary">#{o.id}</p>
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold', badge.className)}>{badge.label}</span>
                      {o.deliveryMethod && <span className="text-[11px] text-outline">{o.deliveryMethod}</span>}
                    </div>
                    <p className="text-[12px] text-on-surface-variant">{o.address?.recipient || 'Customer'} · {o.address?.city} · {formatDate(o.createdAt)}</p>
                    <p className="text-[14px] font-bold text-on-surface mt-1">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/seller/orders/${o.id}`} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-outline hover:text-on-surface">
                      <Eye className="w-4 h-4" />
                    </Link>
                    {isPacking && (
                      <button onClick={() => processMutation.mutate(o.id)} disabled={processMutation.isPending}
                        className="px-3 py-1.5 bg-primary text-white text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> Proses
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {hasMore && !showAll && (
            <button onClick={() => setShowAll(true)}
              className="w-full py-2.5 text-center text-[13px] text-primary font-semibold hover:bg-surface-container-low rounded-xl transition-colors">
              Lihat Semua ({filteredOrders.length}) →
            </button>
          )}
          {showAll && hasMore && (
            <button onClick={() => setShowAll(false)}
              className="w-full py-2 text-center text-[12px] text-outline hover:text-on-surface-variant transition-colors">
              Tampilkan Lebih Sedikit ↑
            </button>
          )}
        </div>
      )}
    </div>
  );
}
