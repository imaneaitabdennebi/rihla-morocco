import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const errMsg = (err) =>
  Object.values(err.response?.data?.errors || {})[0]?.[0] ||
  err.response?.data?.message ||
  'Une erreur est survenue.';

export default function Account() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (name.trim().length < 3) {
      setError('Le nom doit contenir au moins 3 caractères.');
      return;
    }
    if (password && password.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password && password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const payload = { name, email };
    if (password) {
      payload.current_password = currentPassword;
      payload.password = password;
      payload.password_confirmation = confirmation;
    }

    setLoading(true);
    try {
      const { data } = await api.put('/account', payload);
      login(data.user, localStorage.getItem('token'));
      setCurrentPassword('');
      setPassword('');
      setConfirmation('');
      setMessage('Votre compte a été mis à jour.');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Mon compte</h1>
      <p className="muted">Modifiez vos informations personnelles.</p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Nom complet
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <h3>Changer le mot de passe (facultatif)</h3>

        <label>
          Mot de passe actuel
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>

        <label>
          Nouveau mot de passe
          <input
            type="password"
            placeholder="6 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label>
          Confirmer le nouveau mot de passe
          <input
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </label>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}