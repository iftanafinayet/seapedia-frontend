import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, Receipt, DollarSign } from 'lucide-react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import { getBuyerReport } from '../../api/buyer';
import { formatCurrency, formatDateShort, getStatusBadge } from '../../lib/utils';

export default function BuyerReportPage() {
  const [filter, setFilter] = useState('all');

  const { data: report, isLoading } = useQuery({
    queryKey: ['buyer', 'report', filter],
    queryFn: () => getBuyerReport(filter === 'all' ? {} : { dateFrom: getDateFilter(filter) }),
    select: (res) => res.data.data,
  });

  const orders = report?.orders || [];
  const totalSpent = report?.totalSpent || 0;
  const totalDiscount = report?.totalDiscount || 0;
  const totalOrders = report?.totalOrders || 0;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-content mx-auto px-4 lg:px-8 pt-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 lg:px-8 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-on-surface">Spending Report</h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5">{totalOrders} orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span className="text-[12px] text-on-surface-variant">Total Orders</span>
          </div>
          <p className="text-[24px] font-bold text-on-surface">{totalOrders}</p>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="text-[12px] text-on-surface-variant">Total Spent</span>
          </div>
          <p className="text-[24px] font-bold text-emerald-600">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="!p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-[12px] text-on-surface-variant">Total Discount</span>
          </div>
          <p className="text-[24px] font-bold text-amber-600">{formatCurrency(totalDiscount)}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {[
          { key: 'all', label: 'All Time' },
          { key: '30d', label: '30 Days' },
          { key: '7d', label: '7 Days' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
              filter === f.key ? 'bg-primary-container text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="space-y-2">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-outline/30 mx-auto mb-3" />
            <p className="text-[14px] text-outline">No orders yet</p>
          </div>
        ) : (
          orders.map((o) => {
            const badge = getStatusBadge(o.status);
            return (
              <Card key={o.id} className="!p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[14px] font-semibold text-on-surface">Order #{o.id}</p>
                    <p className="text-[12px] text-outline">{formatDateShort(o.createdAt)}</p>
                  </div>
                  <Badge variant={
                    o.status === 'Dikembalikan' ? 'error' :
                    o.status === 'PesananSelesai' ? 'success' :
                    o.status === 'SedangDikirim' ? 'info' : 'warning'
                  }>
                    {badge.label}
                  </Badge>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-on-surface-variant">
                    {(o.items || []).slice(0, 2).map(i => i.product?.name || `#${i.productId}`).join(', ')}
                  </span>
                  <span className="font-semibold text-on-surface">{formatCurrency(o.finalTotal || o.totalAmount)}</span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function getDateFilter(filter) {
  const now = new Date();
  if (filter === '7d') return new Date(now.getTime() - 7 * 86400000).toISOString();
  if (filter === '30d') return new Date(now.getTime() - 30 * 86400000).toISOString();
  return null;
}
