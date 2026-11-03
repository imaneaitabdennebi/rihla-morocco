import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/">Accueil</Link>

      {!user && (
        <>
          <Link to="/login">Connexion</Link>
          <Link to="/register">Inscription</Link>
        </>
      )}

      {user && (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <span className="navbar-user">
            {user.name} ({user.role})
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </>
      )}
    </nav>
  );
}