import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, Store, ClipboardList, Truck, History, LayoutDashboard, Ticket, Clock, Grid3X3, User, LogOut, UserCircle, HelpCircle, ArrowLeftRight, MessageSquare } from 'lucide-react';
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
  const { isAuthenticated, activeRole, user, roles, logout } = useAuthStore();
  const navigate = useNavigate();

  const role = isAuthenticated && activeRole ? activeRole : 'Guest';
  const links = roleLinks[role] || guestLinks;
  const hasMultipleRoles = roles.length > 1;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const homeLink = isAuthenticated
    ? role === 'Buyer' ? '/buyer/dashboard'
    : role === 'Seller' ? '/seller/dashboard'
    : role === 'Driver' ? '/driver/dashboard'
    : role === 'Admin' ? '/admin/dashboard'
    : '/' : '/';

  return (
    <aside className="hidden lg:flex flex-col w-[240px] bg-surface-container-low border-r border-outline-variant/20 h-full fixed left-0 top-0 bottom-0 z-50 shadow-clay">
      {/* Branding */}
      <Link to={homeLink} className="px-6 py-8 block">
        <img src="/seapediaweblogo.svg" alt="SEAPEDIA" className="h-12" />
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
                'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-semibold transition-all duration-200 relative',
                isActive
                  ? 'bg-primary/10 text-primary shadow-clay-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              )
            }
          >
            <link.icon className="w-5 h-5" strokeWidth={2} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-2 py-4 border-t border-outline-variant/20 space-y-1">
        {isAuthenticated ? (
          <>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
                  isActive ? 'text-primary bg-primary/10 shadow-clay-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                )
              }
            >
              <UserCircle className="w-5 h-5" />
              Profil
            </NavLink>
            <NavLink
              to="/reviews"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors',
                  isActive ? 'text-primary bg-primary/10 shadow-clay-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                )
              }
            >
              <HelpCircle className="w-5 h-5" />
              Help
            </NavLink>

            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3 mt-2">
              <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[14px] shrink-0 shadow-clay-sm">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-on-surface truncate">{user?.username || 'User'}</p>
                <p className="text-[11px] text-on-surface-variant">{role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-btn hover:bg-surface-container-high transition-colors text-outline hover:text-error"
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
              className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <User className="w-5 h-5" />
              Login / Register
            </Link>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
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
