import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Store, Package, Clock, AlertTriangle, Calendar, TrendingUp, Shield, Ticket } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getAdminDashboard, simulateNextDay } from '../../api/admin';
import { formatCurrency } from '../../lib/utils';
import useUiStore from '../../stores/uiStore';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const addNotification = useUiStore((s) => s.addNotification);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    select: (res) => res.data.data,
  });

  const overdueOrders = dashboard?.overdueOrders || [];
  const overdueCount = dashboard?.overdueCount || 0;
  const systemDate = dashboard?.systemDate || null;

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

  const stats = [
    { label: 'Total Users', value: dashboard?.userCount || 0, icon: Users, color: 'bg-primary-fixed text-primary' },
    { label: 'Active Stores', value: dashboard?.storeCount || 0, icon: Store, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Orders', value: dashboard?.orderCount || 0, icon: Package, color: 'bg-amber-50 text-amber-600' },
    { label: 'On Delivery', value: dashboard?.totalOnDelivery || 0, icon: Clock, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-on-surface">Admin Dashboard</h1>
          <p className="text-[13px] text-on-surface-variant flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {systemDate
              ? new Date(systemDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => simulateMutation.mutate()}
          disabled={simulateMutation.isPending}
        >
          {simulateMutation.isPending ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
          {simulateMutation.isPending ? 'Simulating...' : 'Simulate Next Day'}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((c) => (
            <Card key={c.label} className="!p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500 ml-auto" />
              </div>
              <p className="text-[12px] text-on-surface-variant font-medium">{c.label}</p>
              <p className="text-[24px] font-bold text-on-surface mt-0.5">{c.value.toLocaleString()}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="!p-5 border-error/20 bg-error-container/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-error">Order Overdue</p>
              <p className="text-[32px] font-bold text-error mt-0.5">{overdueCount}</p>
              <p className="text-[12px] text-error/60">Action Required</p>
            </div>
          </div>
          <Link to="/admin/overdue">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
      </Card>

      {overdueOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold text-on-surface">Overdue Orders</h2>
            <Link to="/admin/overdue" className="text-[13px] text-primary font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {overdueOrders.slice(0, 5).map((o) => (
              <Card key={o.id} className="!p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-error shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface">Order #{o.id}</p>
                    <p className="text-[12px] text-outline">
                      {o.deliveryMethod} · {o.hoursSinceUpdate}h overdue
                      {o.store?.name && ` · ${o.store.name}`}
                    </p>
                  </div>
                </div>
                <Badge variant="overdue" className="shrink-0 ml-2">LEWAT BATAS</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="!p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-[16px] font-semibold text-on-surface">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Link to="/admin/vouchers">
            <Card hover className="!p-4 text-center">
              <Ticket className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-[14px] font-semibold text-on-surface">Manage Vouchers</p>
              <p className="text-[12px] text-outline mt-1">Buat & kelola voucher</p>
            </Card>
          </Link>
          <Link to="/admin/overdue">
            <Card hover className="!p-4 text-center">
              <Clock className="w-6 h-6 text-error mx-auto mb-2" />
              <p className="text-[14px] font-semibold text-on-surface">Overdue Orders</p>
              <p className="text-[12px] text-outline mt-1">{overdueCount} menunggu aksi</p>
            </Card>
          </Link>
          <Link to="/admin/simulate">
            <Card hover className="!p-4 text-center">
              <Calendar className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-[14px] font-semibold text-on-surface">Simulate Time</p>
              <p className="text-[12px] text-outline mt-1">Maju 1 hari</p>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  );
}
