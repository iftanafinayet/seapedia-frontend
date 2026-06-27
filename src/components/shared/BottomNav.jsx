import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Store, ClipboardList, Truck, History, LayoutDashboard, Ticket, Clock, Grid3X3, User, BarChart3, Sparkles } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { cn } from '../../lib/utils';

const guestTabs = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/products', icon: Grid3X3, label: 'Category' },
  { to: '/reviews', icon: ClipboardList, label: 'Reviews' },
  { to: '/login', icon: User, label: 'Profile' },
];

const buyerTabs = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/products', icon: Grid3X3, label: 'Katalog' },
  { to: '/buyer/orders', icon: Package, label: 'Orders' },
  { to: '/buyer/dashboard', icon: User, label: 'Profile' },
];

const sellerTabs = [
  { to: '/seller/dashboard', icon: Home, label: 'Home' },
  { to: '/seller/products', icon: Package, label: 'Products' },
  { to: '/seller/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/seller/reports', icon: BarChart3, label: 'Reports' },
  { to: '/seller/store', icon: Store, label: 'Store' },
];

const driverTabs = [
  { to: '/driver', icon: Home, label: 'Home' },
];

const adminTabs = [
  { to: '/admin/dashboard', icon: Home, label: 'Home' },
  { to: '/admin/deals', icon: Sparkles, label: 'Deals' },
  { to: '/admin/vouchers', icon: Ticket, label: 'Vouchers' },
  { to: '/admin/overdue', icon: Clock, label: 'Overdue' },
  { to: '/admin/simulate', icon: BarChart3, label: 'Simulate' },
];

const roleTabs = {
  Guest: guestTabs,
  Buyer: buyerTabs,
  Seller: sellerTabs,
  Driver: driverTabs,
  Admin: adminTabs,
};

const publicPaths = ['/', '/products', '/reviews', '/login'];

export default function BottomNav() {
  const activeRole = useAuthStore((s) => s.activeRole);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const isPublicPage = !isAuthenticated && (publicPaths.includes(location.pathname) || location.pathname.startsWith('/products/'));

  const tabs = isPublicPage ? guestTabs : (roleTabs[activeRole] || []);

  if (!activeRole && !isPublicPage) return null;
  if (tabs.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-low/90 backdrop-blur-[8px] border-t border-outline-variant/10 shadow-clay h-[72px] flex items-center justify-around z-40 pb-safe lg:hidden">
      {tabs.map((tab) => {
        const isActive = tab.exact ? location.pathname === tab.to : location.pathname.startsWith(tab.to);
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={cn(
              'flex flex-col items-center gap-0.5 min-w-[48px] py-1 px-3 rounded-[12px] transition-all duration-200',
              isActive ? 'text-primary bg-primary/10 shadow-clay-sm' : 'text-outline hover:text-on-surface-variant'
            )}
          >
            <tab.icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className={cn('text-[11px] font-semibold leading-[12px] tracking-[0.05em]', isActive && 'font-semibold')}>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
