import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'tourist',
  });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const err = {};
    if (form.name.trim().length < 3) err.name = 'Le nom doit contenir au moins 3 caractères.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "L'email n'est pas valide.";
    if (form.password.length < 6) err.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    if (form.password !== form.confirm) err.confirm = 'Les mots de passe ne sont pas identiques.';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    try {
      const { data } = await api.post('/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirm,
        role: form.role,
      });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          mapped[field] = messages[0];
        });
        setErrors(mapped);
      } else {
        setErrors({ general: 'Erreur de connexion au serveur.' });
      }
    }
  };

  return (
    <div className="container">
      <h1>Inscription</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nom" value={form.name} onChange={handleChange} />
        {errors.name && <p className="error">{errors.name}</p>}

        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
        {errors.email && <p className="error">{errors.email}</p>}

        <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} />
        {errors.password && <p className="error">{errors.password}</p>}

        <input name="confirm" type="password" placeholder="Confirmer le mot de passe" value={form.confirm} onChange={handleChange} />
        {errors.confirm && <p className="error">{errors.confirm}</p>}

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="tourist">Touriste</option>
          <option value="guide">Guide</option>
        </select>

        {errors.general && <p className="error">{errors.general}</p>}
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}