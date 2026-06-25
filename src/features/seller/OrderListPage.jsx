import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Truck, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { getSellerOrders, processOrder } from '../../api/seller';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export default function SellerOrderListPage() {
  const [filter, setFilter] = useState('packing');
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: orders, isLoading, isError } = useQuery({
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
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal memproses', 'error'),
  });

  const filteredOrders = filter === 'packing'
    ? safeOrders.filter(o => o.status === 'SedangDikemas' || o.status === 'Sedang_Dikemas')
    : safeOrders;

  return (
    <div className="space-y-4">
      <h1 className="text-headline-lg text-on-surface">Pesanan Masuk</h1>

      <div className="flex gap-2">
        {[
          { key: 'packing', label: 'Perlu Dikemas' },
          { key: 'all', label: 'Semua' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-[10px] text-[13px] font-medium transition-colors',
              filter === tab.key ? 'bg-primary-container text-white' : 'bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : isError || filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-outline mx-auto mb-3" />
          <p className="text-body-base text-on-surface-variant">Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => {
            const badge = getStatusBadge(o.status);
            const isPacking = o.status === 'SedangDikemas' || o.status === 'Sedang_Dikemas';
            return (
              <Card key={o.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-label-md text-on-surface">Order #{o.id}</p>
                      <Link to={`/seller/orders/${o.id}`} className="text-primary hover:text-primary/70 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">{formatDate(o.createdAt)}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={cn('inline-flex items-center text-[12px] font-medium px-2 py-0.5 rounded-full', badge.className)}>
                        {badge.label}
                      </span>
                      {o.deliveryMethod && <span className="text-body-sm text-on-surface-variant">{o.deliveryMethod}</span>}
                    </div>
                    {o.address && (
                      <p className="text-body-sm text-on-surface-variant mt-1">{o.address.recipient} - {o.address.city}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-label-md text-on-surface">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
                  </div>
                </div>
                {isPacking && (
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => processMutation.mutate(o.id)}
                    disabled={processMutation.isPending}
                  >
                    <Truck className="w-4 h-4" />
                    {processMutation.isPending ? 'Memproses...' : 'Proses Pesanan'}
                  </Button>
                )}
              </Card>
            );
          })}
            </div>
          )}
    </div>
  );
}
