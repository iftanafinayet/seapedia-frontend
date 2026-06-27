import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Package, Store, ClipboardList, Truck, History, LayoutDashboard, Ticket, Clock, Sparkles } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { cn } from '../../lib/utils';

const buyerLinks = [
  { to: '/buyer/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/buyer/cart', icon: ShoppingCart, label: 'Cart' },
  { to: '/buyer/orders', icon: Package, label: 'Orders' },
];

const sellerLinks = [
  { to: '/seller/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/seller/store', icon: Store, label: 'My Store' },
  { to: '/seller/products', icon: Package, label: 'Products' },
  { to: '/seller/orders', icon: ClipboardList, label: 'Orders' },
];

const driverLinks = [
  { to: '/driver/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/driver/jobs', icon: Truck, label: 'Jobs' },
  { to: '/driver/history', icon: History, label: 'History' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/deals', icon: Sparkles, label: 'Deals' },
  { to: '/admin/vouchers', icon: Ticket, label: 'Vouchers' },
  { to: '/admin/overdue', icon: Clock, label: 'Overdue' },
];

const roleLinks = {
  Buyer: buyerLinks,
  Seller: sellerLinks,
  Driver: driverLinks,
  Admin: adminLinks,
};

export default function Sidebar() {
  const activeRole = useAuthStore((s) => s.activeRole);
  const links = roleLinks[activeRole] || [];

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-surface-container-lowest border-r border-outline-variant/20 h-full p-4 gap-1 fixed left-0 top-[64px] bottom-0">
      <div className="mb-4">
        <p className="text-[11px] font-semibold text-outline uppercase tracking-[0.05em] mb-3 px-2">
          {activeRole}
        </p>
      </div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors relative',
              isActive
                ? 'bg-primary-fixed/40 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-full" />
              )}
              <link.icon className="w-5 h-5" />
              {link.label}
            </>
          )}
        </NavLink>
      ))}
    </aside>
  );
}
