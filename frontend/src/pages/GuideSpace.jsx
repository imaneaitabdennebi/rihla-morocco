import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyCircuit = { title: '', description: '', price: '', duration: '', city: '' };
const emptyProfile = { city: '', languages: '', rate: '', bio: '' };

const errMsg = (err) =>
  Object.values(err.response?.data?.errors || {})[0]?.[0] ||
  err.response?.data?.message ||
  'Une erreur est survenue.';

export default function GuideSpace() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [hasProfile, setHasProfile] = useState(false);
  const [circuits, setCircuits] = useState([]);
  const [form, setForm] = useState(emptyCircuit);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isGuide = user?.role === 'guide';

  useEffect(() => {
    if (!isGuide) return;
    Promise.all([api.get('/guide/profile'), api.get('/guide/circuits')])
      .then(([p, c]) => {
        if (p.data) {
          setProfile({
            city: p.data.city || '',
            languages: p.data.languages || '',
            rate: p.data.rate ?? '',
            bio: p.data.bio || '',
          });
          setHasProfile(true);
        }
        setCircuits(c.data);
      })
      .catch(() => setError("Impossible de charger votre espace."))
      .finally(() => setLoading(false));
  }, [isGuide, reload]);

  if (!isGuide) {
    return (
      <div className="container">
        <h1>Mon espace</h1>
        <p className="error">Cette page est réservée aux guides.</p>
      </div>
    );
  }

  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/guide/profile', { ...profile, rate: Number(profile.rate) });
      setHasProfile(true);
      setMessage('Profil enregistré.');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const saveCircuit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const payload = { ...form, price: Number(form.price) };
    try {
      if (editingId) {
        await api.put(`/guide/circuits/${editingId}`, payload);
        setMessage('Circuit modifié.');
      } else {
        await api.post('/guide/circuits', payload);
        setMessage('Circuit ajouté.');
      }
      setForm(emptyCircuit);
      setEditingId(null);
      setReload((r) => r + 1);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      description: c.description || '',
      price: c.price,
      duration: c.duration,
      city: c.city,
    });
    setMessage('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyCircuit);
  };

  const removeCircuit = async (c) => {
    if (!window.confirm(`Supprimer "${c.title}" ?`)) return;
    setMessage('');
    setError('');
    try {
      await api.delete(`/guide/circuits/${c.id}`);
      setMessage('Circuit supprimé.');
      setReload((r) => r + 1);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const setP = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="container">
      <h1>Mon espace guide</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}

      <h2>Mon profil</h2>
      {!hasProfile && !loading && (
        <p><em>Complétez votre profil pour apparaître dans la liste des guides et ajouter des circuits.</em></p>
      )}
      <form className="form-grid" onSubmit={saveProfile}>
        <input placeholder="Ville (ex: Marrakech)" value={profile.city} onChange={setP('city')} />
        <input placeholder="Langues (ex: Arabe, Français)" value={profile.languages} onChange={setP('languages')} />
        <input type="number" min="0" placeholder="Tarif par jour (MAD)" value={profile.rate} onChange={setP('rate')} />
        <textarea placeholder="Présentation (bio)" value={profile.bio} onChange={setP('bio')} />
        <button type="submit">Enregistrer le profil</button>
      </form>

      {hasProfile && (
        <>
          <h2>{editingId ? 'Modifier le circuit' : 'Ajouter un circuit'}</h2>
          <form className="form-grid" onSubmit={saveCircuit}>
            <input placeholder="Titre" value={form.title} onChange={setF('title')} />
            <input placeholder="Ville" value={form.city} onChange={setF('city')} />
            <input placeholder="Durée (ex: 3 heures)" value={form.duration} onChange={setF('duration')} />
            <input type="number" min="0" placeholder="Prix (MAD)" value={form.price} onChange={setF('price')} />
            <textarea placeholder="Description" value={form.description} onChange={setF('description')} />
            <div>
              <button type="submit">{editingId ? 'Enregistrer' : 'Ajouter'}</button>{' '}
              {editingId && <button type="button" onClick={cancelEdit}>Annuler</button>}
            </div>
          </form>

          <h2>Mes circuits</h2>
          {circuits.length === 0 && !loading && <p>Aucun circuit pour le moment.</p>}
          {circuits.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Ville</th>
                  <th>Durée</th>
                  <th>Prix</th>
                  <th>Note</th>
                  <th>Réservations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {circuits.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{c.city}</td>
                    <td>{c.duration}</td>
                    <td>{Number(c.price)} MAD</td>
                    <td>{c.reviews_avg_rating ? `${Number(c.reviews_avg_rating).toFixed(1)} ⭐` : '-'}</td>
                    <td>{c.reservations_count}</td>
                    <td>
                      <button onClick={() => startEdit(c)}>Modifier</button>{' '}
                      <button onClick={() => removeCircuit(c)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}