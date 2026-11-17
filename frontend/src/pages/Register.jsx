import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'tourist',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.name.trim().length < 3) {
      setError('Le nom doit contenir au moins 3 caractères.');
      return;
    }
    if (!form.email) {
      setError("L'email est obligatoire.");
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/register', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
          err.response?.data?.message ||
          "Inscription impossible. Réessayez."
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
          <h1>Inscription</h1>
          <p className="muted">Rejoignez Rihla Morocco en quelques secondes.</p>

          {error && <p className="error">{error}</p>}

          <label>
            Nom complet
            <input placeholder="Votre nom" value={form.name} onChange={set('name')} />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={set('email')}
            />
          </label>

          <label>
            Je suis
            <select value={form.role} onChange={set('role')}>
              <option value="tourist">Touriste</option>
              <option value="guide">Guide</option>
            </select>
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              placeholder="6 caractères minimum"
              value={form.password}
              onChange={set('password')}
            />
          </label>

          <label>
            Confirmer le mot de passe
            <input
              type="password"
              placeholder="Répétez le mot de passe"
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>

          <p className="auth-switch">
            Déjà inscrit ? <Link to="/login">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}