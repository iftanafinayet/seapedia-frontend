import { Outlet } from 'react-router-dom';
import TopBar from '../components/shared/TopBar';
import BottomNav from '../components/shared/BottomNav';
import Footer from '../components/shared/Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-dvh bg-surface pb-[80px] lg:pb-0">
      <TopBar />
      <main className="pt-[64px] lg:pt-16">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
