import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getAdminDashboard, processOverdue } from '../../api/admin';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';

const PAGE_SIZE = 8;

export default function OverduePage() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);
  const [page, setPage] = useState(0);
  const [refundPage, setRefundPage] = useState(0);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    select: (res) => res.data.data,
  });

  const orders = dashboard?.overdueOrders || [];
  const refundedOrders = dashboard?.refundedOrders || [];
  const totalPages = Math.ceil(orders.length / PAGE_SIZE) || 1;
  const refundTotalPages = Math.ceil(refundedOrders.length / PAGE_SIZE) || 1;
  const pagedOrders = orders.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pagedRefunds = refundedOrders.slice(refundPage * PAGE_SIZE, (refundPage + 1) * PAGE_SIZE);

  const processMutation = useMutation({
    mutationFn: processOverdue,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      const count = res?.data?.data?.filter((r) => r.status === 'refunded').length || 0;
      addNotification(count > 0 ? `${count} order telah diproses refund.` : 'Order overdue telah diproses.', 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal memproses', 'error'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-[24px] font-semibold text-on-surface">Order Overdue</h1>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-on-surface">Order Overdue</h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5">
            {orders.length} aktif · {refundedOrders.length} direfund
          </p>
        </div>
        {orders.length > 0 && (
          <Button size="sm" variant="danger" onClick={() => processMutation.mutate()} disabled={processMutation.isPending}>
            {processMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            {processMutation.isPending ? 'Processing...' : 'Process Overdue'}
          </Button>
        )}
      </div>

      {/* Active Overdue */}
      {orders.length === 0 && refundedOrders.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-outline/30 mx-auto mb-3" />
          <p className="text-[14px] text-outline">Tidak ada order overdue</p>
          <p className="text-[12px] text-on-surface-variant mt-1">Semua order dalam batas waktu pengiriman</p>
        </div>
      ) : (
        <>
          {orders.length > 0 && (
            <div>
              <h2 className="text-[14px] font-semibold text-error uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Aktif Overdue ({orders.length})
              </h2>
              <div className="space-y-2">
                {pagedOrders.map((o) => {
                  const badge = getStatusBadge(o.status);
                  return (
                    <Card key={o.id} className="!p-4 border-l-[3px] border-l-error">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[14px] font-semibold text-on-surface">Order #{o.id}</p>
                          <p className="text-[12px] text-outline">
                            {formatDate(o.createdAt)} · {o.store?.name || 'Store'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="overdue">LEWAT BATAS</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-on-surface-variant">
                          {o.deliveryMethod} · <span className={badge.className}>{badge.label}</span>
                          {' · '}{o.hoursSinceUpdate}h overdue
                        </span>
                        <span className="font-semibold text-on-surface">{formatCurrency(o.finalTotal)}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Button>
                  <span className="text-[13px] text-on-surface-variant px-2">{page + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}

          {/* Refunded */}
          {refundedOrders.length > 0 && (
            <div>
              <h2 className="text-[14px] font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Baru Direfund ({refundedOrders.length})
              </h2>
              <div className="space-y-2">
                {pagedRefunds.map((o) => (
                  <Card key={o.id} className="!p-4 border-l-[3px] border-l-emerald-500">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[14px] font-semibold text-on-surface">Order #{o.id}</p>
                        <p className="text-[12px] text-outline">
                          {formatDate(o.createdAt)} · {o.store?.name || 'Store'}
                        </p>
                      </div>
                      <Badge variant="success">DIREFUND</Badge>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-on-surface-variant">{o.deliveryMethod} · Dikembalikan</span>
                      <span className="font-semibold text-on-surface">{formatCurrency(o.finalTotal)}</span>
                    </div>
                  </Card>
                ))}
              </div>
              {refundTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" disabled={refundPage === 0} onClick={() => setRefundPage(p => p - 1)}>Prev</Button>
                  <span className="text-[13px] text-on-surface-variant px-2">{refundPage + 1} / {refundTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={refundPage >= refundTotalPages - 1} onClick={() => setRefundPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
