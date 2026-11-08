import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { countUnread } from '../utils/notifications';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useLocation(); // pour recalculer le compteur à chaque changement de page

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unread = user ? countUnread(user) : 0;

  return (
    <nav className="navbar">
      <Link to="/">Accueil</Link>
      <Link to="/circuits">Circuits</Link>

      {!user && (
        <>
          <Link to="/login">Connexion</Link>
          <Link to="/register">Inscription</Link>
        </>
      )}

      {user && (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/notifications">
            🔔 {unread > 0 && <span className="badge">{unread}</span>}
          </Link>
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