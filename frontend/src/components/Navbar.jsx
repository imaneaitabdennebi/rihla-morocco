import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = () =>
      api
        .get('/notifications/unread-count')
        .then(({ data }) => active && setUnread(data.count))
        .catch(() => {});
    load();
    const timer = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUnread(0);
    navigate('/login');
  };

  const isGuide = user?.role === 'guide';
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar">
      <Link to="/" className="logo">🧭 Guides Maroc</Link>
      <div className="nav-links">
        <NavLink to="/">Accueil</NavLink>
        <NavLink to="/circuits">Circuits</NavLink>
        {user ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            {isGuide && <NavLink to="/guide">Mon espace</NavLink>}
            {isAdmin && <NavLink to="/admin">Administration</NavLink>}
            {(isGuide || isAdmin) && <NavLink to="/stats">Statistiques</NavLink>}
            <NavLink to="/notifications">
              🔔{unread > 0 && <span className="badge">{unread}</span>}
            </NavLink>
            <button onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Connexion</NavLink>
            <NavLink to="/register">Inscription</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}