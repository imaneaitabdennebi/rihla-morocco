import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLES = { tourist: 'Touriste', guide: 'Guide', admin: 'Admin' };

const errMsg = (err) => err.response?.data?.message || "L'action a échoué.";

function Pagination({ page, lastPage, setPage }) {
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button>
      <span>Page {page} / {lastPage}</span>
      <button disabled={page === lastPage} onClick={() => setPage(page + 1)}>Suivant</button>
    </div>
  );
}

function UsersTab({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/admin/users', { params: { search, role, page } })
        .then(({ data }) => {
          if (cancelled) return;
          setUsers(data.data);
          setLastPage(data.last_page);
        })
        .catch(() => !cancelled && setError('Impossible de charger les utilisateurs.'))
        .finally(() => !cancelled && setLoading(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, role, page, reload]);

  const act = async (request, okMessage) => {
    setMessage('');
    setError('');
    try {
      await request();
      setMessage(okMessage);
      setReload((r) => r + 1);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const toggle = (u) =>
    act(
      () => api.patch(`/admin/users/${u.id}/toggle`),
      u.is_active ? `${u.name} est désactivé.` : `${u.name} est activé.`
    );

  const remove = (u) => {
    if (!window.confirm(`Supprimer définitivement ${u.name} ?`)) return;
    act(() => api.delete(`/admin/users/${u.id}`), `${u.name} supprimé.`);
  };

  return (
    <div>
      <div className="filters">
        <input
          placeholder="Rechercher (nom ou email)..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">Tous les rôles</option>
          <option value="tourist">Touristes</option>
          <option value="guide">Guides</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{ROLES[u.role]}</td>
              <td>{u.is_active ? 'Actif' : 'Désactivé'}</td>
              <td>
                {u.id !== currentUser.id && (
                  <>
                    <button onClick={() => toggle(u)}>{u.is_active ? 'Désactiver' : 'Activer'}</button>{' '}
                    <button onClick={() => remove(u)}>Supprimer</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && users.length === 0 && <p>Aucun utilisateur trouvé.</p>}
      <Pagination page={page} lastPage={lastPage} setPage={setPage} />
    </div>
  );
}

function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/reviews', { params: { page } })
      .then(({ data }) => {
        setReviews(data.data);
        setLastPage(data.last_page);
      })
      .catch(() => setError('Impossible de charger les avis.'))
      .finally(() => setLoading(false));
  }, [page, reload]);

  const remove = async (r) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    setMessage('');
    setError('');
    try {
      await api.delete(`/admin/reviews/${r.id}`);
      setMessage('Avis supprimé.');
      if (reviews.length === 1 && page > 1) setPage(page - 1);
      else setReload((x) => x + 1);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}
      {!loading && reviews.length === 0 && <p>Aucun avis pour le moment.</p>}

      {reviews.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Auteur</th>
              <th>Circuit</th>
              <th>Note</th>
              <th>Commentaire</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.created_at.slice(0, 10)}</td>
                <td>{r.user?.name}</td>
                <td>{r.circuit?.title}</td>
                <td>{'⭐'.repeat(r.rating)}</td>
                <td>{r.comment || '-'}</td>
                <td><button onClick={() => remove(r)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination page={page} lastPage={lastPage} setPage={setPage} />
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('users');

  if (user?.role !== 'admin') {
    return (
      <div className="container">
        <h1>Administration</h1>
        <p className="error">Cette page est réservée à l'administrateur.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Administration</h1>
      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Utilisateurs
        </button>
        <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
          Avis
        </button>
      </div>
      {tab === 'users' ? <UsersTab currentUser={user} /> : <ReviewsTab />}
    </div>
  );
}