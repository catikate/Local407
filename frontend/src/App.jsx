import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Layout } from './components/layout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Calendario from './pages/Calendario';
import NuevaReserva from './pages/NuevaReserva';
import ApprovalRequests from './pages/ApprovalRequests';
import Items from './pages/Items';
import Locales from './pages/Locales';
import Usuarios from './pages/Usuarios';
import Bandas from './pages/Bandas';
import MisBandas from './pages/MisBandas';
import Prestamos from './pages/Prestamos';
import Reservas from './pages/Reservas';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import DashboardExample from './pages/DashboardExample';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas con layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendario"
            element={
              <ProtectedRoute>
                <Layout>
                  <Calendario />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nueva-reserva"
            element={
              <ProtectedRoute>
                <Layout>
                  <NuevaReserva />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/aprobaciones"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApprovalRequests />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <Layout>
                  <Items />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/locales"
            element={
              <ProtectedRoute>
                <Layout>
                  <Locales />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <Layout>
                  <Usuarios />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bandas"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bandas />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-bandas"
            element={
              <ProtectedRoute>
                <Layout>
                  <MisBandas />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/prestamos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Prestamos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservas"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reservas />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Página de ejemplo del nuevo diseño */}
          <Route
            path="/example"
            element={
              <ProtectedRoute>
                <DashboardExample />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
