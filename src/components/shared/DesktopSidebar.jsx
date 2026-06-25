import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, Store, ClipboardList, Truck, History, LayoutDashboard, Ticket, Clock, Grid3X3, User, LogOut, Settings, HelpCircle, ArrowLeftRight, MessageSquare } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { cn } from '../../lib/utils';

const guestLinks = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/products', icon: Grid3X3, label: 'Products' },
  { to: '/reviews', icon: MessageSquare, label: 'Reviews' },
];

const buyerLinks = [
  { to: '/buyer/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/', icon: Grid3X3, label: 'Katalog', exact: true },
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
  { to: '/admin/vouchers', icon: Ticket, label: 'Vouchers' },
  { to: '/admin/overdue', icon: Clock, label: 'Overdue' },
];

const roleLinks = {
  Guest: guestLinks,
  Buyer: buyerLinks,
  Seller: sellerLinks,
  Driver: driverLinks,
  Admin: adminLinks,
};

export default function DesktopSidebar() {
  const { isAuthenticated, activeRole, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const role = isAuthenticated && activeRole ? activeRole : 'Guest';
  const links = roleLinks[role] || guestLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex flex-col w-[240px] bg-surface-container-low border-r border-outline-variant h-full fixed left-0 top-0 bottom-0 z-50">
      {/* Branding */}
      <Link to="/" className="px-6 py-8 block">
        <h1 className="text-[24px] font-bold text-primary tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-[18px] font-bold">S</span>
          SEAPEDIA
        </h1>
        <p className="text-[12px] font-medium text-on-surface-variant mt-1 uppercase tracking-[0.05em]">
          {isAuthenticated ? `${role} Portal` : 'Marketplace'}
        </p>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-semibold transition-all duration-200 relative',
                isActive
                  ? 'bg-primary/5 border-l-[3px] border-primary text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high border-l-[3px] border-transparent'
              )
            }
          >
            <link.icon className="w-5 h-5" strokeWidth={2} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-2 py-4 border-t border-outline-variant space-y-1">
        {isAuthenticated && (
          <Link
            to="/choose-role"
            className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5" />
            Switch Role
          </Link>
        )}

        {isAuthenticated ? (
          <>
            <NavLink
              to="/buyer/wallet"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-medium transition-colors',
                  isActive ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-surface-container-high'
                )
              }
            >
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
            <NavLink
              to="/reviews"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-medium transition-colors',
                  isActive ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-surface-container-high'
                )
              }
            >
              <HelpCircle className="w-5 h-5" />
              Help
            </NavLink>

            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3 mt-2">
              <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[14px] shrink-0">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-on-surface truncate">{user?.username || 'User'}</p>
                <p className="text-[11px] text-on-surface-variant">{role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-outline hover:text-error"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <User className="w-5 h-5" />
              Login / Register
            </Link>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Help
            </a>
          </>
        )}
      </div>
    </aside>
  );
}
