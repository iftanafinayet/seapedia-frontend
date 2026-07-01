import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Store, Truck, Shield, Wallet, TrendingUp, DollarSign, Mail, Calendar, Loader2, Package, Plus, ChevronDown, ChevronUp, ArrowRight, Receipt, ShoppingBag } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useAuthStore from '../../stores/authStore';
import useUiStore from '../../stores/uiStore';
import { getProfile } from '../../api/auth';
import { getWallet, getBuyerOrders } from '../../api/buyer';
import { getSellerOrders } from '../../api/seller';
import { getDriverEarnings, getAvailableJobs } from '../../api/driver';
import { getProducts } from '../../api/guest';
import api from '../../api/client';
import { formatCurrency, formatDate, formatDateShort, getStatusBadge } from '../../lib/utils';
import { cn } from '../../lib/utils';

const roleConfig = {
  Buyer: { icon: ShoppingCart, label: 'Pembeli' },
  Seller: { icon: Store, label: 'Penjual' },
  Driver: { icon: Truck, label: 'Kurir' },
  Admin: { icon: Shield, label: 'Admin' },
};

export default function ProfilePage() {
  const { user: authUser, activeRole, setActiveRole, roles, logout } = useAuthStore();
  const navigate = useNavigate();
  const addNotification = useUiStore((s) => s.addNotification);
  const queryClient = useQueryClient();
  const [switchingRole, setSwitchingRole] = useState(null);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupOpen, setTopupOpen] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'], queryFn: getProfile, select: (res) => res.data.data,
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet'], queryFn: getWallet, select: (res) => res.data.data,
    enabled: !!activeRole && activeRole === 'Buyer',
  });

  const { data: summary } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: () => api.get('/auth/financial-summary'),
    select: (res) => res.data.data, enabled: !!activeRole,
  });

  const { data: buyerOrders } = useQuery({
    queryKey: ['orders', 'buyer'], queryFn: getBuyerOrders,
    select: (res) => (res.data.data || []).slice(0, 4), enabled: activeRole === 'Buyer',
  });

  const { data: sellerOrders } = useQuery({
    queryKey: ['orders', 'seller'], queryFn: getSellerOrders,
    select: (res) => res.data.data || [], enabled: activeRole === 'Seller',
  });

  const { data: driverEarnings } = useQuery({
    queryKey: ['driver', 'earnings'], queryFn: getDriverEarnings,
    select: (res) => res.data.data, enabled: activeRole === 'Driver',
  });

  const { data: availJobs } = useQuery({
    queryKey: ['driver', 'jobs'], queryFn: getAvailableJobs,
    select: (res) => res.data.data || [], enabled: activeRole === 'Driver',
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'], queryFn: getProducts,
    select: (res) => (res.data.data || []).slice(0, 6), enabled: activeRole === 'Buyer',
  });

  const topupMutation = useMutation({
    mutationFn: (amount) => api.post('/buyer/wallet/topup', { amount }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['financialSummary'] }); queryClient.invalidateQueries({ queryKey: ['wallet'] }); addNotification('Top-up berhasil!', 'success'); setTopupOpen(false); setTopupAmount(''); },
    onError: (err) => addNotification(err.response?.data?.message || 'Gagal top-up', 'error'),
  });

  const handleSwitchRole = async (role) => {
    if (role === activeRole) return;
    try {
      setSwitchingRole(role);
      const { data } = await api.post('/auth/active-role', { activeRole: role });
      setActiveRole({ activeRole: role, token: data.data.token });
    } catch (err) { addNotification(err.response?.data?.message || 'Gagal', 'error'); }
    finally { setSwitchingRole(null); }
  };

  if (loadingProfile) {
    return <div className="space-y-4 max-w-content mx-auto">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  }

  const user = profile || authUser;
  const safeRoles = user?.roles || roles || [];
  const bo = buyerOrders || [];
  const so = sellerOrders || [];
  const packing = so.filter(o => o.status === 'SedangDikemas' || o.status === 'Sedang_Dikemas');
  const sDone = so.filter(o => o.status === 'PesananSelesai' || o.status === 'Pesanan_Selesai');
  const sIncome = sDone.reduce((s, o) => s + ((o.totalAmount || 0) - (o.discountAmount || 0)), 0);
  const walletBalance = walletData?.balance || summary?.buyerWallet?.balance || 0;
  const recommendedProducts = productsData || [];
  const isBuyer = activeRole === 'Buyer';

  const profileHeader = (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-[20px] font-bold shrink-0 shadow-clay-sm">
          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold text-on-surface">{user?.username || 'User'}</h1>
          <div className="flex items-center gap-1.5 mt-0.5 text-[13px] text-on-surface-variant">
            <Mail className="w-3.5 h-3.5" /> {user?.email || '-'}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-outline">
            <Calendar className="w-3 h-3" /> Bergabung {user?.createdAt ? formatDate(user.createdAt) : '-'}
          </div>
        </div>
      </div>
      {safeRoles.length > 1 && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant/20">
          {safeRoles.map((role) => {
            const config = roleConfig[role];
            if (!config) return null;
            const active = role === activeRole;
            const RC = config.icon;
            return (
              <button key={role} onClick={() => handleSwitchRole(role)} disabled={active || switchingRole === role}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${active ? 'bg-primary text-white shadow-clay-sm' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {switchingRole === role ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RC className="w-3.5 h-3.5" />}
                {config.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const buyerLockedFeatures = (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
      <h3 className="text-[14px] font-semibold text-on-surface mb-4">Fitur Pembeli</h3>
      <div className="space-y-3">
        {[{ icon: Receipt, label: 'Pesanan Saya' }, { icon: ShoppingCart, label: 'Keranjang' }, { icon: TrendingUp, label: 'Riwayat Transaksi' }].map((f, i) => (
          <div key={i} className="flex items-center gap-3 bg-surface-container rounded-xl p-3 opacity-50">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center">
              <f.icon className="w-4 h-4 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-on-surface">{f.label}</p>
              <p className="text-[11px] text-on-surface-variant">Hanya untuk Pembeli</p>
            </div>
            <Shield className="w-4 h-4 text-outline ml-auto" />
          </div>
        ))}
      </div>
      {safeRoles.includes('Buyer') && (
        <button onClick={() => handleSwitchRole('Buyer')} className="mt-4 w-full py-2.5 text-center bg-primary text-white text-[13px] font-semibold rounded-xl hover:opacity-90">
          Switch ke Pembeli
        </button>
      )}
    </div>
  );

  const buyerWalletCard = (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-hover p-4 text-on-primary shadow-lg group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <p className="text-[13px] font-medium opacity-80">Saldo Dompet</p>
          <Wallet className="w-5 h-5" />
        </div>
        <h2 className="text-[32px] font-bold tracking-tight leading-tight">{formatCurrency(walletBalance)}</h2>
        <div className="flex items-center gap-2 text-on-primary/70 mt-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[11px]">Kelola keuangan kamu disini</span>
        </div>
        <div className="mt-4 flex gap-2">
          {!topupOpen ? (
            <>
              <Link to="/buyer/wallet" className="flex-1">
                <button className="w-full bg-white text-primary text-[13px] font-semibold py-2.5 rounded-xl hover:bg-white/90 active:scale-95 transition-all">Add Funds</button>
              </Link>
              <button onClick={() => setTopupOpen(true)} className="flex-1 bg-white/20 backdrop-blur-sm text-white text-[13px] font-semibold py-2.5 rounded-xl hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Top Up Cepat
              </button>
            </>
          ) : (
            <div className="flex-1 flex gap-2">
              <input type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} autoFocus placeholder="Jumlah (Rp)" className="flex-1 bg-white/20 backdrop-blur text-white placeholder:text-white/60 rounded-xl px-3 py-2.5 text-[13px] outline-none border border-white/30" />
              <button onClick={() => { const a = parseFloat(topupAmount); if (a > 0) topupMutation.mutate(a); }} disabled={topupMutation.isPending} className="px-3 py-2.5 bg-white text-primary text-[13px] font-semibold rounded-xl hover:bg-white/90 disabled:opacity-50 whitespace-nowrap">{topupMutation.isPending ? '...' : 'OK'}</button>
              <button onClick={() => setTopupOpen(false)} className="px-2 py-2.5 text-white/60 text-[12px]">Batal</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const buyerQuickActions = (
    <div className="grid grid-cols-1 gap-3">
      <Link to="/buyer/orders" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-all group">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Receipt className="w-4 h-4 text-primary" /></div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-[14px] font-semibold text-on-surface mt-3">Pesanan Saya</p>
        <p className="text-[12px] text-on-surface-variant mt-1">Lihat semua pesanan</p>
      </Link>
      <Link to="/buyer/cart" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-all group">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-amber-600" /></div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-[14px] font-semibold text-on-surface mt-3">Keranjang</p>
        <p className="text-[12px] text-on-surface-variant mt-1">Lihat keranjang belanja</p>
      </Link>
      <Link to="/buyer/wallet" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-all group">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-[14px] font-semibold text-on-surface mt-3">Riwayat Transaksi</p>
        <p className="text-[12px] text-on-surface-variant mt-1">Lihat history top-up & pembelian</p>
      </Link>
    </div>
  );

  const buyerOrdersSection = (
    <section>
      <div className="flex justify-between items-end mb-3">
        <h3 className="text-[16px] font-semibold text-on-surface">Pesanan Terbaru</h3>
        <Link to="/buyer/orders" className="text-[13px] text-primary font-semibold hover:underline">Lihat semua</Link>
      </div>
      {bo.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 text-center">
          <Package className="w-10 h-10 text-outline/30 mx-auto mb-2" />
          <p className="text-[13px] text-on-surface-variant">Belum ada pesanan</p>
          <Link to="/products" className="text-[13px] text-primary font-semibold mt-2 inline-block hover:underline">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {bo.map((o) => {
            const badge = getStatusBadge(o.status);
            const itemNames = (o.items || []).map(i => i.product?.name || i.name).filter(Boolean).join(', ');
            const itemCount = (o.items || []).reduce((sum, i) => sum + i.quantity, 0) || 1;
            return (
              <Link key={o.id} to={`/buyer/orders/${o.id}`}>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 hover:bg-surface-container-low hover:border-primary/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-on-surface-variant" /></div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-on-surface line-clamp-1">{itemNames || `Order #${o.id}`}</p>
                      <p className="text-[11px] text-on-surface-variant">{itemCount} item · {formatDateShort(o.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold mb-1', badge.className)}>{badge.label}</span>
                    <p className="text-[13px] font-semibold text-on-surface">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );

  const recommendedSection = recommendedProducts.length > 0 && (
    <section>
      <h3 className="text-[16px] font-semibold text-on-surface mb-3">Rekomendasi untuk Kamu</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory scroll-smooth">
        {recommendedProducts.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`}
            className="min-w-[160px] w-[160px] bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 group shrink-0 hover:border-primary/30 hover:shadow-card-hover transition-all snap-start">
            <div className="h-32 bg-surface-container flex items-center justify-center overflow-hidden">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <ShoppingBag className="w-10 h-10 text-outline/30" />
              )}
            </div>
            <div className="p-3">
              <p className="text-[13px] font-semibold text-on-surface truncate">{p.name}</p>
              <p className="text-[12px] text-primary font-bold mt-1">{formatCurrency(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  const financialSummarySection = summary && (summary.buyerWallet !== undefined || summary.sellerIncome !== undefined || summary.driverEarnings !== undefined) && (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <button onClick={() => setShowFinance(!showFinance)} className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container/50 transition-colors">
        <span className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" /> Ringkasan Keuangan
        </span>
        {showFinance ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
      </button>
      {showFinance && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {summary.buyerWallet !== undefined && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Wallet className="w-4 h-4 text-primary" /></div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-semibold">Dompet</p>
                <p className="text-[14px] font-bold text-primary">{formatCurrency(summary.buyerWallet?.balance || 0)}</p>
              </div>
            </div>
          )}
          {summary.sellerIncome !== undefined && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-semibold">Penjual</p>
                <p className="text-[14px] font-bold text-emerald-600">{formatCurrency(summary.sellerIncome?.totalIncome || 0)}</p>
              </div>
            </div>
          )}
          {summary.driverEarnings !== undefined && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><Truck className="w-4 h-4 text-amber-600" /></div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-semibold">Kurir</p>
                <p className="text-[14px] font-bold text-amber-600">{formatCurrency(summary.driverEarnings?.totalEarnings || 0)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const logoutBtn = (
    <div className="text-center pb-6">
      <button onClick={() => setLogoutOpen(true)} className="text-[14px] text-outline hover:text-error font-medium transition-colors">
        Keluar dari Akun
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-content mx-auto pt-4">
        <section className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-7 space-y-6">
            {isBuyer ? (
              <>{buyerWalletCard}{buyerOrdersSection}{recommendedSection}</>
            ) : activeRole === 'Seller' ? (
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3"><p className="text-[13px] font-medium opacity-80">Total Pendapatan</p><TrendingUp className="w-5 h-5" /></div>
                  <h2 className="text-[36px] font-bold tracking-tight">{formatCurrency(sIncome)}</h2>
                  <p className="text-white/70 text-[13px] mt-1">{sDone.length} pesanan selesai</p>
                  <Link to="/seller/dashboard"><button className="mt-4 w-full bg-white/20 backdrop-blur text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-white/30">Buka Dashboard Penjual</button></Link>
                </div>
              </section>
            ) : activeRole === 'Driver' ? (
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3"><p className="text-[13px] font-medium opacity-80">Total Penghasilan</p><Truck className="w-5 h-5" /></div>
                  <h2 className="text-[36px] font-bold tracking-tight">{formatCurrency(driverEarnings?.totalEarnings || 0)}</h2>
                  <p className="text-white/70 text-[13px] mt-1">{driverEarnings?.completedJobs || 0} pengiriman selesai</p>
                  <Link to="/driver/dashboard"><button className="mt-4 w-full bg-white/20 backdrop-blur text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-white/30">Buka Dashboard Kurir</button></Link>
                </div>
              </section>
            ) : (
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-error to-red-700 p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3"><p className="text-[13px] font-medium opacity-80">Panel Admin</p><Shield className="w-5 h-5" /></div>
                  <Link to="/admin/dashboard"><button className="mt-3 w-full bg-white/20 backdrop-blur text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-white/30">Buka Dashboard Admin</button></Link>
                </div>
              </section>
            )}
          </div>
          <div className="col-span-5 space-y-6">
            {profileHeader}
            {isBuyer ? buyerQuickActions : buyerLockedFeatures}
          </div>
        </section>
        {financialSummarySection}
        {logoutBtn}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-5 px-4">
        {profileHeader}
        {isBuyer ? <>{buyerWalletCard}{buyerQuickActions}{buyerOrdersSection}{recommendedSection}</> : buyerLockedFeatures}
        {financialSummarySection}
        {logoutBtn}
      </div>

      <ConfirmDialog open={logoutOpen} title="Keluar" message="Yakin ingin keluar dari akun?" confirmLabel="Keluar"
        onConfirm={() => { logout(); navigate('/'); }} onCancel={() => setLogoutOpen(false)} />
    </>
  );
}
