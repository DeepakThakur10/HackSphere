import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

import Spotlight from '../components/ui/Spotlight';
import useScrollToTop from '../hooks/useScrollToTop';

export default function RootLayout() {
  useScrollToTop();

  return (
    <div className="min-h-screen">
      <Spotlight />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
