import { Outlet } from 'react-router-dom';
import TopBar from '../components/shared/TopBar';
import BottomNav from '../components/shared/BottomNav';
import Footer from '../components/shared/Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar />
      <main className="flex-1 pt-[64px] lg:pt-16 pb-4 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
