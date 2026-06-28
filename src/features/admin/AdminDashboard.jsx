import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Store, Package, Clock, AlertTriangle, Calendar, TrendingUp, Shield, Ticket, ShoppingCart, Truck, ChevronRight, ArrowRight, Sparkles, Layout } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getAdminDashboard, simulateNextDay } from '../../api/admin';
import { getDealsOfTheDay } from '../../api/guest';
import { formatCurrency } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    select: (res) => res.data.data,
    staleTime: 0,
    refetchOnMount: true,
  });

  const overdueOrders = dashboard?.overdueOrders || [];
  const overdueCount = dashboard?.overdueCount || 0;
  const systemDate = dashboard?.systemDate || null;

  const { data: deals } = useQuery({
    queryKey: ['deals'],
    queryFn: getDealsOfTheDay,
    select: (res) => res.data.data || [],
  });
  const dealsCount = deals?.length || 0;

  const simulateMutation = useMutation({
    mutationFn: simulateNextDay,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      const newDate = res?.data?.data?.systemDate;
      const msg = newDate
        ? `Sistem dimajukan ke ${new Date(newDate).toLocaleDateString('id-ID')}.`
        : 'Sistem berhasil dimajukan 1 hari.';
      addNotification(msg, 'success');
    },
    onError: (err) => addNotification(err.response?.data?.message || 'Simulasi gagal', 'error'),
  });

  const roleCounts = dashboard?.roleCounts || {};
  const totalUsers = dashboard?.userCount || 0;
  const maxRole = Math.max(roleCounts.buyer || 0, roleCounts.seller || 0, roleCounts.driver || 0, roleCounts.admin || 0, 1);

  const userRoleBars = [
    { label: 'Pembeli', count: roleCounts.buyer || 0, icon: ShoppingCart, color: 'bg-primary', barColor: 'bg-primary' },
    { label: 'Penjual', count: roleCounts.seller || 0, icon: Store, color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Kurir', count: roleCounts.driver || 0, icon: Truck, color: 'bg-amber-500', barColor: 'bg-amber-500' },
    { label: 'Admin', count: roleCounts.admin || 0, icon: Shield, color: 'bg-error', barColor: 'bg-error' },
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-on-surface">Dashboard Admin</h1>
          <p className="text-[12px] lg:text-[13px] text-on-surface-variant mt-0.5">
            <Calendar className="w-3 h-3 inline mr-1" />
            {systemDate
              ? new Date(systemDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
        <Button size="sm" onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending}>
          <Calendar className="w-4 h-4" /> Simulasi +1 Hari
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Summary Card — 4 key metrics in a single prominent card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
            <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em] mb-4">Ringkasan Sistem</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 rounded-xl p-3">
                <Users className="w-4 h-4 text-primary mb-1.5" />
                <p className="text-[20px] font-bold text-on-surface">{totalUsers.toLocaleString()}</p>
                <p className="text-[11px] text-on-surface-variant">Total User</p>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-3">
                <Store className="w-4 h-4 text-emerald-600 mb-1.5" />
                <p className="text-[20px] font-bold text-on-surface">{dashboard?.storeCount || 0}</p>
                <p className="text-[11px] text-on-surface-variant">Toko Aktif</p>
              </div>
              <div className="bg-amber-50/50 rounded-xl p-3">
                <Package className="w-4 h-4 text-amber-600 mb-1.5" />
                <p className="text-[20px] font-bold text-on-surface">{dashboard?.orderCount || 0}</p>
                <p className="text-[11px] text-on-surface-variant">Total Pesanan</p>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-3">
                <Clock className="w-4 h-4 text-blue-600 mb-1.5" />
                <p className="text-[20px] font-bold text-on-surface">{dashboard?.totalOnDelivery || 0}</p>
                <p className="text-[11px] text-on-surface-variant">Sedang Dikirim</p>
              </div>
            </div>
          </div>

          {/* User Distribution — visual bars */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
            <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em] mb-4">Distribusi User</p>
            <div className="space-y-3">
              {userRoleBars.map((role) => (
                <div key={role.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${role.color} text-white`}>
                    <role.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[12px] font-medium text-on-surface">{role.label}</span>
                      <span className="text-[12px] font-bold text-on-surface">{role.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${role.barColor}`}
                        style={{ width: `${Math.max((role.count / maxRole) * 100, 4)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deals of the Day Preview */}
          <Link to="/admin/deals" className="block bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em]">Deals of the Day</p>
              <ChevronRight className="w-4 h-4 text-outline" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[20px] font-bold text-on-surface">{dealsCount}</p>
                <p className="text-[12px] text-on-surface-variant">{dealsCount > 0 ? 'produk sedang promo' : 'belum ada deal aktif'}</p>
              </div>
            </div>
            {deals.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                {deals.slice(0, 3).map((p) => (
                  <div key={p.id} className="shrink-0 bg-surface-container rounded-lg px-3 py-1.5 text-[11px] text-on-surface-variant font-medium">
                    {p.name?.slice(0, 20)}...
                  </div>
                ))}
              </div>
            )}
          </Link>

          {/* Overdue Alert */}
          <div className={`rounded-2xl p-5 ${overdueCount > 0 ? 'bg-error/5 border border-error/20' : 'bg-surface-container-lowest border border-outline-variant'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${overdueCount > 0 ? 'bg-error/10' : 'bg-surface-container'}`}>
                  <AlertTriangle className={`w-5 h-5 ${overdueCount > 0 ? 'text-error' : 'text-outline'}`} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-on-surface">Pesanan Terlambat</p>
                  <p className={`text-[28px] font-bold mt-0.5 ${overdueCount > 0 ? 'text-error' : 'text-on-surface-variant'}`}>{overdueCount}</p>
                  <p className="text-[12px] text-on-surface-variant">{dashboard?.refundedOrders?.length || 0} sudah direfund</p>
                </div>
              </div>
              <Link to="/admin/overdue" className="shrink-0">
                <Button variant="outline" size="sm">Lihat</Button>
              </Link>
            </div>

            {/* Overdue list preview */}
            {overdueOrders.length > 0 && (
              <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-2">
                {overdueOrders.slice(0, 3).map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-on-surface">Order #{o.id}</p>
                        <p className="text-[11px] text-outline truncate">{o.hoursSinceUpdate}h terlambat · {o.store?.name}</p>
                      </div>
                    </div>
                    <Badge variant="overdue" className="shrink-0 ml-2 text-[10px]">LEWAT</Badge>
                  </div>
                ))}
                {overdueOrders.length > 3 && (
                  <Link to="/admin/overdue" className="block text-center text-[12px] text-primary font-semibold py-1">
                    +{overdueOrders.length - 3} lainnya →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
            <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-[0.05em] mb-4">Aksi Cepat</p>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/vouchers" className="bg-surface-container rounded-xl p-4 hover:bg-surface-container-high transition-colors group">
                <Ticket className="w-5 h-5 text-primary mb-2" />
                <p className="text-[13px] font-semibold text-on-surface">Voucher</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Buat & kelola</p>
              </Link>
              <Link to="/admin/deals" className="bg-surface-container rounded-xl p-4 hover:bg-surface-container-high transition-colors group">
                <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-[13px] font-semibold text-on-surface">Deals</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Produk unggulan</p>
              </Link>
              <Link to="/admin/hero" className="bg-surface-container rounded-xl p-4 hover:bg-surface-container-high transition-colors group">
                <Layout className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-[13px] font-semibold text-on-surface">Hero</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Tampilan depan</p>
              </Link>
              <Link to="/admin/simulate" className="bg-surface-container rounded-xl p-4 hover:bg-surface-container-high transition-colors group">
                <Calendar className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-[13px] font-semibold text-on-surface">Simulasi</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Maju 1 hari</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
