import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">RIHLA MOROCCO</div>
          <div className="footer-tagline">Voyagez · Explorez · Découvrez</div>
        </div>

        <div>
          <h4>Explorer</h4>
          <Link to="/">Accueil</Link>
          <Link to="/circuits">Circuits</Link>
        </div>

        <div>
          <h4>Mon compte</h4>
          {user ? (
            <>
              <Link to="/dashboard">Tableau de bord</Link>
              <Link to="/notifications">Notifications</Link>
            </>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register">Inscription</Link>
            </>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Rihla Morocco. Tous droits réservés.
      </div>
    </footer>
  );
}