import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userData = JSON.parse(localStorage.getItem('local407_user') || '{}');
  const unreadCount = 3; // TODO: Obtener del contexto de notificaciones

  const handleLogout = () => {
    localStorage.removeItem('local407_token');
    localStorage.removeItem('local407_user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 h-14 bg-card-bg border-b border-border">
      <div className="h-full px-4 flex items-center justify-between">

        {/* Logo - Izquierda */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xl font-semibold text-text-primary hover:text-accent transition-colors"
          >
            Local407
          </button>
        </div>

        {/* Título - Centro */}
        <h1 className="hidden md:block text-base font-medium text-text-secondary">
          {title}
        </h1>

        {/* Acciones - Derecha */}
        <div className="flex items-center gap-2">

          {/* Botón de notificaciones */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg hover:bg-hover transition-colors"
            aria-label="Notificaciones"
          >
            <svg
              className="w-5 h-5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-white text-xs font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Avatar con dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-hover transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-medium text-sm">
                {userData.nombre?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                {/* Overlay para cerrar */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-card-bg border border-border rounded-lg shadow-notion-lg z-50 fade-in">
                  <div className="p-3 border-b border-border">
                    <p className="font-medium text-sm text-text-primary">
                      {userData.nombre} {userData.apellido}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {userData.email}
                    </p>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/perfil');
                      }}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-hover text-sm text-text-primary transition-colors"
                    >
                      Ver perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-hover text-sm text-error transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;