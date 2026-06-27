import { Outlet } from 'react-router-dom';
import TopBar from '../components/shared/TopBar';
import BottomNav from '../components/shared/BottomNav';

export default function DashboardLayout() {
  return (
    <div className="min-h-dvh bg-surface">
      <TopBar />
      <main className="pt-[64px] pb-[80px] lg:pt-16 lg:pb-12">
        <div className="px-4 py-4 lg:px-8 lg:py-8 max-w-content mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
