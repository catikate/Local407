import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <h1>Bienvenido a Local407</h1>
      {user && (
        <div className="welcome-message">
          <h2>Hola, {user.nombre}!</h2>
          <p>Gestiona tus locales, reservas e invitaciones desde aquí.</p>
        </div>
      )}
      <div className="features">
        <div className="feature-card">
          <h3>Locales</h3>
          <p>Administra tus espacios disponibles</p>
        </div>
        <div className="feature-card">
          <h3>Reservas</h3>
          <p>Gestiona las reservas de tus locales</p>
        </div>
        <div className="feature-card">
          <h3>Invitaciones</h3>
          <p>Envía y recibe invitaciones</p>
        </div>
      </div>
    </div>
  );
}

export default Home;