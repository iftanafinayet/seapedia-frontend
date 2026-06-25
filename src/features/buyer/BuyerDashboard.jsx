import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Package, ArrowRight, TrendingUp, Receipt, HeadphonesIcon, Shield, ShoppingBag, MapPin } from 'lucide-react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import useAuthStore from '../../stores/authStore';
import { getWallet, getBuyerOrders } from '../../api/buyer';
import { getProducts } from '../../api/guest';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const STATUS_STYLE = {
  SedangDikemas: 'bg-warning/10 text-warning',
  MenungguPengirim: 'bg-info/10 text-info',
  SedangDikirim: 'bg-secondary-container text-on-secondary-container',
  PesananSelesai: 'bg-green-100 text-green-800',
  Dikembalikan: 'bg-error-container text-error',
};

export default function BuyerDashboard() {
  const user = useAuthStore((s) => s.user);
  const [favorites, setFavorites] = useState({});

  const { data: walletData, isLoading: loadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
    select: (res) => res.data.data,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', 'buyer'],
    queryFn: getBuyerOrders,
    select: (res) => (res.data.data || []).slice(0, 4),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    select: (res) => (res.data.data || []).slice(0, 4),
  });

  const safeOrders = orders || [];
  const recommendedProducts = productsData || [];

  // ─── Mobile Layout ───
  const MobileDashboard = () => (
    <div className="space-y-8 lg:hidden">
      {loadingWallet ? (
        <Skeleton className="h-[180px] rounded-xl" />
      ) : (
        <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-on-primary shadow-lg group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[14px] font-medium opacity-80">Total Balance</p>
              <Wallet className="w-5 h-5 fill-current" />
            </div>
            <h2 className="text-[32px] font-bold tracking-tight">{formatCurrency(walletData?.balance || 0)}</h2>
            <div className="flex items-center gap-2 text-on-primary/70 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[12px]">+2.4% from last month</span>
            </div>
            <div className="mt-6 flex gap-3">
              <Link to="/buyer/wallet" className="flex-1">
                <button className="w-full bg-white text-primary text-[14px] font-semibold py-3 rounded-lg active:scale-95 transition-transform">Add Funds</button>
              </Link>
              <Link to="/buyer/wallet" className="flex-1">
                <button className="w-full bg-white/20 backdrop-blur-sm text-white text-[14px] font-semibold py-3 rounded-lg active:scale-95 transition-transform">Withdraw</button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-headline-md text-on-surface">Recent Orders</h3>
          <Link to="/buyer/orders" className="text-primary text-[14px] font-semibold hover:underline">View all</Link>
        </div>
        {loadingOrders ? (
          <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-[72px] rounded-xl" />)}</div>
        ) : safeOrders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/30 p-8 text-center">
            <Package className="w-12 h-12 text-outline mx-auto mb-3" />
            <p className="text-[14px] text-on-surface-variant">No orders yet</p>
            <Link to="/products" className="text-[14px] text-primary font-semibold mt-2 inline-block hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {safeOrders.map((o) => {
              const badge = getStatusBadge(o.status);
              const s = STATUS_STYLE[o.status] || STATUS_STYLE.MenungguPengirim;
              const itemNames = (o.items || []).map(i => i.product?.name || i.name).filter(Boolean).join(', ');
              const itemCount = (o.items || []).reduce((sum, i) => sum + i.quantity, 0) || 1;
              return (
                <Link key={o.id} to={`/buyer/orders/${o.id}`}>
                  <div className="bg-surface-container-lowest p-4 rounded-xl shadow-card border border-outline-variant/30 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
                        <Package className="w-6 h-6 text-on-surface-variant" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-on-surface line-clamp-1">{itemNames || `Order #${o.id}`}</p>
                        <p className="text-[12px] text-on-surface-variant">{itemCount} item{itemCount !== 1 ? 's' : ''} &middot; {formatDate(o.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold mb-1', s.bg, s.text)}>{badge.label}</span>
                      <p className="text-[14px] font-semibold text-on-surface">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {recommendedProducts.length > 0 && (
        <section>
          <h3 className="text-headline-md text-on-surface mb-4">Recommended for You</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {recommendedProducts.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="min-w-[200px] w-[200px] bg-surface-container-lowest rounded-xl overflow-hidden shadow-card border border-outline-variant/20 group shrink-0">
                <div className="h-40 overflow-hidden relative bg-surface-container">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-outline" />
                    </div>
                  )}
                  <button onClick={(e) => { e.preventDefault(); setFavorites(f => ({ ...f, [p.id]: !f[p.id] })); }} className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="w-[18px] h-[18px]" fill={favorites[p.id] ? '#ba1a1a' : '#777587'}><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" /></svg>
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-[14px] font-semibold text-on-surface truncate">{p.name}</p>
                  <p className="text-[12px] text-primary font-semibold mt-1">{formatCurrency(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-headline-md text-on-surface mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/buyer/orders" className="bg-surface-container p-4 rounded-xl aspect-square flex flex-col justify-between hover:bg-surface-container-high transition-colors cursor-pointer group">
            <HeadphonesIcon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <p className="text-[14px] font-semibold text-on-surface">24/7 Support</p>
          </Link>
          <Link to="/buyer/orders" className="bg-secondary-container p-4 rounded-xl aspect-square flex flex-col justify-between hover:opacity-90 transition-opacity cursor-pointer group">
            <Receipt className="w-8 h-8 text-on-secondary-container group-hover:scale-110 transition-transform" />
            <p className="text-[14px] font-semibold text-on-secondary-container">Tax Invoices</p>
          </Link>
        </div>
      </section>
    </div>
  );

  // ─── Desktop Layout ───
  const DesktopDashboard = () => (
    <div className="hidden lg:flex flex-col min-h-[calc(100vh-120px)]">
      {/* Welcome & Balance Section (Asymmetric 12-col) */}
      <section className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-8">
          {loadingWallet ? (
            <Skeleton className="h-[280px] rounded-xl" />
          ) : (
            <div className="relative overflow-hidden bg-primary-container rounded-xl p-8 text-on-primary-container h-full flex flex-col justify-between shadow-lg">
              <div className="relative z-10">
                <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-0.01em] mb-2">
                  Welcome back, {user?.username || 'User'}
                </h1>
                <p className="text-[18px] leading-[28px] opacity-80 max-w-md">
                  Your investment in maritime tech is yielding strong returns this quarter. View your updated wallet details below.
                </p>
              </div>
              <div className="relative z-10 flex items-end justify-between mt-12">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.05em] opacity-70 mb-1">Total Available Balance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[48px] font-bold leading-[56px] tracking-[-0.02em]">
                      {formatCurrency(walletData?.balance || 0)}
                    </span>
                    <span className="text-[14px] font-semibold bg-white/20 px-2 py-0.5 rounded text-white flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +12.5%
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to="/buyer/wallet">
                    <button className="bg-white text-primary px-6 py-3 rounded-lg text-[14px] font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="w-4 h-4" fill="currentColor"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                      Add Funds
                    </button>
                  </Link>
                  <Link to="/buyer/wallet">
                    <button className="bg-primary/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-lg text-[14px] font-semibold hover:bg-primary/30 transition-all">
                      Withdraw
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Bento */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
          <Link to="/buyer/orders" className="col-span-2 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl hover:border-primary transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary-container rounded-lg text-primary">
                <Receipt className="w-5 h-5" />
              </div>
              <ArrowRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[24px] font-semibold text-on-surface mb-1">Tax Report</p>
            <p className="text-[14px] text-on-surface-variant">FY 2023 statement ready for download.</p>
          </Link>
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl hover:shadow-sm transition-all text-center cursor-pointer">
            <HeadphonesIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-[14px] font-semibold">Support</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl hover:shadow-sm transition-all text-center cursor-pointer">
            <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-[14px] font-semibold">Security</p>
          </div>
        </div>
      </section>

      {/* Recent Orders (4-col Grid) */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-[24px] font-semibold text-on-surface">Recent Orders</h2>
            <p className="text-[14px] text-on-surface-variant">Track your latest maritime equipment acquisitions.</p>
          </div>
          <Link to="/buyer/orders" className="text-primary text-[14px] font-semibold hover:underline flex items-center gap-1">
            View All Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingOrders ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[280px] rounded-xl" />)}
          </div>
        ) : safeOrders.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-outline mx-auto mb-4" />
            <p className="text-[18px] font-semibold text-on-surface mb-2">No orders yet</p>
            <p className="text-[14px] text-on-surface-variant mb-6">Start exploring maritime equipment.</p>
            <Link to="/products"><Button variant="outline">Browse Products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safeOrders.map((o) => {
              const badge = getStatusBadge(o.status);
              const s = STATUS_STYLE[o.status] || STATUS_STYLE.MenungguPengirim;
              const itemNames = (o.items || []).map(i => i.product?.name).filter(Boolean).join(', ');
              const itemCount = (o.items || []).reduce((sum, i) => sum + i.quantity, 0);
              return (
                <Link key={o.id} to={`/buyer/orders/${o.id}`} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="h-40 w-full bg-surface-container relative flex items-center justify-center">
                    <Package className="w-12 h-12 text-outline/40" />
                    <div className={cn('absolute top-3 right-3 px-2 py-1 rounded-md text-[12px] font-medium', s.bg, s.text)}>
                      {badge.label}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-[12px] font-medium text-on-surface-variant">#{o.id} &middot; {itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                    <h3 className="text-[14px] font-semibold text-on-surface line-clamp-2 leading-snug">{itemNames || `Order #${o.id}`}</h3>
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-[24px] font-semibold text-primary">{formatCurrency(o.finalTotal || o.totalAmount)}</p>
                      <ArrowRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended & Live Tracking */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Recommended For You */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-[24px] font-semibold text-on-surface">Recommended For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendedProducts.slice(0, 2).map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="flex gap-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary transition-all group">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container shrink-0 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-outline" />
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h4 className="text-[14px] font-semibold text-on-surface mb-1 truncate">{p.name}</h4>
                  <p className="text-[14px] text-on-surface-variant mb-2">{p.description?.slice(0, 40) || 'Premium equipment'}{p.description?.length > 40 ? '...' : ''}</p>
                  <p className="text-[14px] font-semibold text-primary">{formatCurrency(p.price)}</p>
                </div>
              </Link>
            ))}
            {recommendedProducts.length === 0 && (
              <>
                <div className="flex gap-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                  <div className="w-24 h-24 rounded-lg bg-surface-container shrink-0" />
                  <div className="flex flex-col justify-center">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                  <div className="w-24 h-24 rounded-lg bg-surface-container shrink-0" />
                  <div className="flex flex-col justify-center">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-outline-variant py-6 bg-surface-container-lowest -mx-8 px-8">
        <div className="max-w-content mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="text-[14px] font-bold text-on-surface">SEAPEDIA Global</span>
            <span className="text-[14px] text-secondary">2024 SEAPEDIA Global. All rights reserved.</span>
          </div>
          <div className="flex gap-8">
            <Link to="#" className="text-[14px] text-secondary hover:text-primary transition-all hover:underline">Sitemap</Link>
            <Link to="#" className="text-[14px] text-secondary hover:text-primary transition-all hover:underline">Privacy Policy</Link>
            <Link to="#" className="text-[14px] text-secondary hover:text-primary transition-all hover:underline">Terms of Service</Link>
            <Link to="#" className="text-[14px] text-secondary hover:text-primary transition-all hover:underline">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <>
      <MobileDashboard />
      <DesktopDashboard />
    </>
  );
}
