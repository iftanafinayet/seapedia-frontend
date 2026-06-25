import { Outlet } from 'react-router-dom';
import TopBar from '../components/shared/TopBar';
import BottomNav from '../components/shared/BottomNav';

export default function PublicLayout() {
  return (
    <div className="min-h-dvh bg-surface">
      <TopBar />
      <main className="pt-[56px] pb-[80px] lg:pt-16 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
