import { useState } from 'react';
import { useNavigate, Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Ticket, Clock, CalendarClock, Sparkles, ArrowLeftRight, LogOut } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import BottomNav from '../components/shared/BottomNav';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { cn } from '../lib/utils';

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/deals', icon: Sparkles, label: 'Deals' },
  { to: '/admin/vouchers', icon: Ticket, label: 'Vouchers' },
  { to: '/admin/overdue', icon: Clock, label: 'Overdue' },
  { to: '/admin/simulate', icon: CalendarClock, label: 'Simulate' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLogoutOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[240px] bg-surface-container-low border-r border-outline-variant h-screen fixed left-0 top-0 bottom-0 z-50">
        {/* Branding */}
        <Link to="/" className="px-6 py-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-error flex items-center justify-center text-white text-[18px] font-bold">S</div>
          <div>
            <h1 className="text-[20px] font-bold text-primary tracking-tight">SEAPEDIA</h1>
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-[0.05em]">Admin Portal</p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex-1 mt-4 space-y-1 px-3">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-error/10 border-l-[3px] border-error text-error'
                    : 'text-on-surface-variant hover:bg-surface-container-high border-l-[3px] border-transparent'
                )
              }
            >
              <link.icon className="w-5 h-5" strokeWidth={2} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 mt-auto border-t border-outline-variant space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-error-container flex items-center justify-center text-error font-bold text-[14px] shrink-0">
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-on-surface truncate">{user?.username || 'Admin'}</p>
              <p className="text-[11px] text-on-surface-variant">Admin</p>
            </div>
            <button
              onClick={() => setLogoutOpen(true)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-outline hover:text-error"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-0 pb-[80px] lg:pt-0 lg:pb-0 lg:ml-[240px]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 h-[56px] bg-surface-container-low border-b border-outline-variant/20">
          <Link to="/" className="text-[18px] font-bold text-primary tracking-tight">
            SEAPEDIA
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-error bg-error-container/40 px-2 py-0.5 rounded-full">
              Admin
            </span>
            <button
              onClick={() => setLogoutOpen(true)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-outline hover:text-error"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-content mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />

      <ConfirmDialog
        open={logoutOpen}
        title="Keluar"
        message="Yakin ingin keluar dari akun admin?"
        confirmLabel="Keluar"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}
