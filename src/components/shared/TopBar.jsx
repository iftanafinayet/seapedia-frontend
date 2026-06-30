import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Home, Grid3X3, MessageSquare, Ticket, Clock, ArrowLeftRight } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useCartStore from '../../stores/cartStore';
import NotificationDropdown from './NotificationDropdown';
import ConfirmDialog from '../ui/ConfirmDialog';
import { cn } from '../../lib/utils';

const guestNav = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/products', icon: Grid3X3, label: 'Katalog' },
  { to: '/buyer/orders', icon: MessageSquare, label: 'Orders' },
];

const buyerNav = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/products', icon: Grid3X3, label: 'Katalog' },
  { to: '/buyer/orders', icon: MessageSquare, label: 'Orders' },
];
const sellerNav = guestNav;
const driverNav = [
  { to: '/driver', icon: Home, label: 'Home' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/admin/vouchers', icon: Ticket, label: 'Vouchers' },
  { to: '/admin/overdue', icon: Clock, label: 'Overdue' },
];

const roleNav = {
  Guest: guestNav,
  Buyer: buyerNav,
  Seller: guestNav,
  Driver: driverNav,
  Admin: adminNav,
};

export default function TopBar({ onMenuClick }) {
  const { isAuthenticated, user, activeRole, roles, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const hasMultipleRoles = roles.length > 1;

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const getDashboardLink = () => {
    if (activeRole === 'Buyer') return '/';
    if (activeRole === 'Seller') return '/seller/dashboard';
    if (activeRole === 'Driver') return '/driver/dashboard';
    if (activeRole === 'Admin') return '/admin/dashboard';
    return '/';
  };

  const role = isAuthenticated && activeRole ? activeRole : 'Guest';
  const navLinks = roleNav[role] || guestNav;
  const homeLink = isAuthenticated ? getDashboardLink() : '/';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[rgba(248,251,255,0.8)] backdrop-blur-[12px] z-50 border-b border-[#e8f0fe]/60">
        {/* Mobile */}
        <div className="flex lg:hidden items-center justify-between h-[64px] px-5">
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button className="p-2 -ml-2 rounded-btn hover:bg-surface-container transition-colors" onClick={onMenuClick} aria-label="Menu">
                <Menu className="w-5 h-5 text-on-surface-variant" />
              </button>
            )}
            <Link to={homeLink}>
              <img src="/seapediaweblogo.svg" alt="SEAPEDIA" className="h-9" />
            </Link>
          </div>
          <div className="flex items-center gap-1">
            {(!isAuthenticated || activeRole !== 'Driver') && (
              <Link to="/buyer/cart" className="relative p-2">
                <ShoppingCart className="w-5 h-5 text-on-surface-variant" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-tertiary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-clay-sm">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="p-2">
                  <div className="relative w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shadow-clay-sm">
                    <User className="w-4 h-4 text-primary" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface-container-lowest flex items-center justify-center text-[7px] font-bold text-white">
                      {activeRole?.[0]}
                    </span>
                  </div>
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="p-2 rounded-btn hover:bg-surface-container transition-colors">
                  <LogOut className="w-4 h-4 text-outline" />
                </button>
              </>
            ) : (
              <Link to="/login" className="p-2">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shadow-clay-sm">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center justify-between relative h-16 max-w-content mx-auto px-8">
          {/* Logo */}
          <Link to={homeLink}>
            <img src="/seapediaweblogo.svg" alt="SEAPEDIA" className="h-10" />
          </Link>

          {/* Nav Links - clay chip style */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-surface-container rounded-[16px] p-1 shadow-clay-sm">
            {navLinks.map((link) => {
              const isActive = link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-4 py-2 text-[14px] font-medium rounded-[12px] transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-clay-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Profile + Logout */}
          <div className="flex items-center gap-2">
            {(!isAuthenticated || activeRole !== 'Driver') && (
              <Link to="/buyer/cart" className="relative p-2 rounded-btn hover:bg-surface-container transition-colors">
                <ShoppingCart className="w-5 h-5 text-on-surface-variant" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-tertiary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-clay-sm">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Link>
            )}

                <NotificationDropdown />
                {hasMultipleRoles && (
                  <Link to="/choose-role" className="p-2 rounded-btn hover:bg-surface-container transition-colors text-outline hover:text-primary" aria-label="Switch Role">
                    <ArrowLeftRight className="w-4 h-4" />
                  </Link>
                )}
                {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2 pl-2">
                <Link to="/profile" className="flex items-center gap-2 p-1.5 rounded-btn bg-surface-container shadow-clay-sm hover:shadow-clay-inset transition-all duration-200">
                  <div className="relative w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface-container-lowest flex items-center justify-center text-[7px] font-bold text-white">
                      {activeRole?.[0]}
                    </span>
                  </div>
                  <div className="hidden xl:block text-left pr-1.5">
                    <span className="text-[13px] font-medium text-on-surface block leading-tight">{user?.username || 'User'}</span>
                    <span className="text-[11px] text-primary font-semibold">{activeRole}</span>
                  </div>
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="p-2 rounded-btn hover:bg-surface-container transition-colors text-outline hover:text-error" aria-label="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2 pl-2">
                <Link to="/login"><button className="btn-ghost btn-sm">Login</button></Link>
                <Link to="/register"><button className="btn-primary btn-sm">Register</button></Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to log out? You will need to login again to access your account."
        confirmLabel="Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
