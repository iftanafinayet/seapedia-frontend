import { useNavigate, Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, History, LogOut } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import BottomNav from '../components/shared/BottomNav';
import { cn } from '../lib/utils';

const driverLinks = [
  { to: '/driver/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/driver/jobs', icon: Package, label: 'Jobs' },
  { to: '/driver/history', icon: History, label: 'History' },
];

export default function DriverLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-surface flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] bg-surface-container-low border-r border-outline-variant h-screen fixed left-0 top-0 bottom-0 z-50">
        <Link to="/" className="px-6 py-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white text-[18px] font-bold">S</div>
          <div>
            <h1 className="text-[20px] font-bold text-primary tracking-tight">SEAPEDIA</h1>
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-[0.05em]">Driver Portal</p>
          </div>
        </Link>

        <nav className="flex-1 mt-4 space-y-1 px-3">
          {driverLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-semibold transition-all duration-200',
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

        <div className="p-4 mt-auto border-t border-outline-variant space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[14px] shrink-0">
              {user?.username?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-on-surface truncate">{user?.username || 'Driver'}</p>
              <p className="text-[11px] text-on-surface-variant">Driver</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-outline hover:text-error"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 pt-0 pb-[80px] lg:pt-0 lg:pb-0 lg:ml-[240px]">
        <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-content mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
