import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();

  // Determinar el título de la página según la ruta
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/calendario')) return 'Calendario';
    if (path.startsWith('/items')) return 'Equipamiento';
    if (path.startsWith('/perfil')) return 'Perfil';
    if (path.startsWith('/nueva-reserva')) return 'Nueva Reserva';
    if (path.startsWith('/notifications')) return 'Notificaciones';
    return 'Local407';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-secondary">
      {/* Sidebar - Solo desktop (≥768px) */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* TopBar */}
        <TopBar title={getPageTitle()} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="pb-20 md:pb-0">
            {children}
          </div>
        </main>

        {/* BottomNav - Solo mobile (<768px) */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;