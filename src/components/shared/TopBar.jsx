import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Home, Grid3X3, MessageSquare, Ticket, Clock } from 'lucide-react';
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

const buyerNav = guestNav;
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
  Buyer: guestNav,
  Seller: guestNav,
  Driver: driverNav,
  Admin: adminNav,
};

export default function TopBar({ onMenuClick }) {
  const { isAuthenticated, user, activeRole, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const getDashboardLink = () => {
    if (activeRole === 'Buyer') return '/buyer/dashboard';
    if (activeRole === 'Seller') return '/seller/dashboard';
    if (activeRole === 'Driver') return '/driver/dashboard';
    if (activeRole === 'Admin') return '/admin/dashboard';
    return '/';
  };

  const role = isAuthenticated && activeRole ? activeRole : 'Guest';
  const navLinks = roleNav[role] || guestNav;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-surface/95 backdrop-blur-[8px] z-50 border-b border-outline-variant/10">
        {/* Mobile */}
        <div className="flex lg:hidden items-center justify-between h-[56px] px-4">
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button className="p-2 -ml-2" onClick={onMenuClick} aria-label="Menu">
                <Menu className="w-5 h-5 text-on-surface-variant" />
              </button>
            )}
            <Link to="/" className="text-[18px] font-bold text-primary tracking-tight">
              SEAPEDIA
            </Link>
          </div>
          <div className="flex items-center gap-1">
            {(!isAuthenticated || activeRole !== 'Driver') && (
              <Link to="/buyer/cart" className="relative p-2">
                <ShoppingCart className="w-5 h-5 text-on-surface-variant" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="p-2">
                  <div className="relative w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface flex items-center justify-center text-[7px] font-bold text-white">
                      {activeRole?.[0]}
                    </span>
                  </div>
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="p-2">
                  <LogOut className="w-4 h-4 text-outline" />
                </button>
              </>
            ) : (
              <Link to="/login" className="p-2">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center justify-between relative h-16 max-w-content mx-auto px-8">
          {/* Logo */}
          <Link to="/" className="text-[20px] font-bold text-primary tracking-tight shrink-0 flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white text-[15px] font-bold">S</span>
            SEAPEDIA
          </Link>

          {/* Nav Links - left align, text only */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-start gap-1">
            {navLinks.map((link) => {
              const isActive = link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-4 py-3 text-[14px] font-medium transition-all duration-200 border-b-2',
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant'
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
              <Link to="/buyer/cart" className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors">
                <ShoppingCart className="w-5 h-5 text-on-surface-variant" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Link>
            )}

            <NotificationDropdown />
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-outline-variant/30">
                <Link to={getDashboardLink()} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                  <div className="relative w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface flex items-center justify-center text-[7px] font-bold text-white">
                      {activeRole?.[0]}
                    </span>
                  </div>
                  <div className="hidden xl:block text-left">
                    <span className="text-[13px] font-medium text-on-surface block leading-tight">{user?.username || 'User'}</span>
                    <span className="text-[11px] text-primary font-semibold">{activeRole}</span>
                  </div>
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)} className="p-2 rounded-lg hover:bg-surface-container-low transition-colors text-outline hover:text-error" aria-label="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-outline-variant/30">
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
