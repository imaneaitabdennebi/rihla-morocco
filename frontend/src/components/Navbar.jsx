import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLE_LABEL = { tourist: 'Touriste', guide: 'Guide', admin: 'Administrateur' };

function ArchIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M5 28V14C5 8.5 10 4 16 4s11 4.5 11 10v14"
        fill="none"
        stroke="#c4552d"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M11 28V15c0-3 2.2-5 5-5s5 2 5 5v13"
        fill="none"
        stroke="#c4552d"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Les notifications concernent uniquement le touriste et le guide (BF13)
  const canNotify = !!user && user.role !== 'admin';

  useEffect(() => {
    if (!canNotify) return;
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
  }, [canNotify, location.pathname]);

  const close = () => {
    setMenuOpen(false);
    setUserOpen(false);
  };

  const handleLogout = async () => {
    close();
    await logout();
    setUnread(0);
    navigate('/login');
  };

  const isGuide = user?.role === 'guide';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <ArchIcon />
          <span>
            RIHLA
            <br />
            MOROCCO
          </span>
        </Link>

        <button className="burger" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Accueil</NavLink>
          <NavLink to="/guides" onClick={close}>Guides</NavLink>
          <NavLink to="/circuits" onClick={close}>Circuits</NavLink>
          {!user && (
            <>
              <Link to="/login" className="btn btn-outline" onClick={close}>Connexion</Link>
              <Link to="/register" className="btn" onClick={close}>S'inscrire</Link>
            </>
          )}
        </nav>

        {user && (
          <div className="nav-user">
            {canNotify && (
              <Link to="/notifications" className="bell" aria-label="Notifications" onClick={close}>
                🔔{unread > 0 && <span className="badge">{unread}</span>}
              </Link>
            )}
            <button className="avatar" aria-label="Mon compte" onClick={() => setUserOpen((o) => !o)}>
              {user.name.charAt(0).toUpperCase()}
            </button>

            {userOpen && (
              <div className="user-menu">
                <div className="who">
                  <strong>{user.name}</strong>
                  <small>{ROLE_LABEL[user.role]}</small>
                </div>
                <Link to="/dashboard" onClick={close}>Tableau de bord</Link>
                <Link to="/account" onClick={close}>Mon compte</Link>
                {isGuide && <Link to="/guide" onClick={close}>Mon espace guide</Link>}
                {isAdmin && <Link to="/admin" onClick={close}>Administration</Link>}
                {(isGuide || isAdmin) && <Link to="/stats" onClick={close}>Statistiques</Link>}
                {canNotify && <Link to="/notifications" onClick={close}>Notifications</Link>}
                <button onClick={handleLogout}>Déconnexion</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}