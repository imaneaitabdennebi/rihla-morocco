import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/login', { email, password });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
          err.response?.data?.message ||
          'Connexion impossible. Réessayez.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image" />
      <div className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Connexion</h1>
          <p className="muted">Heureux de vous revoir !</p>

          {error && <p className="error">{error}</p>}

          <label>
            Email
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="auth-switch">
            Pas encore de compte ? <Link to="/register">S'inscrire</Link>
          </p>
        </form>
      </div>
    </div>
  );
}