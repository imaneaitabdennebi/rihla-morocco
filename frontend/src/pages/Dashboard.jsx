import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ExportButtons from '../components/ExportButtons';
import { useAuth } from '../context/AuthContext';

const STATUS = {
  pending: 'en attente',
  confirmed: 'confirmée',
  refused: 'refusée',
  cancelled: 'annulée',
};

// Calculé une seule fois (évite l'appel impur dans le composant)
const TODAY = new Date().toISOString().slice(0, 10);

function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{STATUS[status]}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const canExport = user.role === 'guide' || user.role === 'admin';

  useEffect(() => {
    const requests = [api.get('/reservations')];
    if (user.role === 'tourist') requests.push(api.get('/reviews/mine'));

    Promise.all(requests)
      .then(([res, mine]) => {
        setReservations(res.data.data);
        if (mine) setReviewedIds(mine.data);
      })
      .catch(() => setError('Impossible de charger les réservations.'))
      .finally(() => setLoading(false));
  }, [reload, user.role]);

  const act = async (request) => {
    setError('');
    setMessage('');
    try {
      await request();
      setReload((r) => r + 1);
    } catch (err) {
      setError(err.response?.data?.message || "L'action a échoué.");
    }
  };

  const cancel = (id) => act(() => api.patch(`/reservations/${id}/cancel`));
  const setStatus = (id, status) => act(() => api.patch(`/reservations/${id}/status`, { status }));

  const openReview = (id) => {
    setReviewingId(id);
    setRating(5);
    setComment('');
    setError('');
    setMessage('');
  };

  const submitReview = async (reservationId) => {
    setError('');
    try {
      await api.post('/reviews', { reservation_id: reservationId, rating: Number(rating), comment });
      setReviewingId(null);
      setMessage('Merci ! Votre avis a été enregistré.');
      setReload((r) => r + 1);
    } catch (err) {
      setError(
        err.response?.data?.errors?.rating?.[0] ||
          err.response?.data?.message ||
          "Impossible d'enregistrer l'avis."
      );
    }
  };

  // --- Données calculées ---
  const countBy = (...statuses) => reservations.filter((r) => statuses.includes(r.status)).length;
  const nextTrip = reservations
    .filter((r) => r.status === 'confirmed' && r.date.slice(0, 10) >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="container">
      <h1>Tableau de bord</h1>
      <p>Bienvenue {user.name} !</p>

      {canExport && (
        <ExportButtons
          title={user.role === 'admin' ? 'Toutes les réservations' : 'Réservations reçues'}
        />
      )}

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}

      {user.role === 'tourist' && !loading && (
        <div>
          <div className="dash-stats">
            <div className="dash-stat"><strong>{reservations.length}</strong><span>Réservations</span></div>
            <div className="dash-stat"><strong>{countBy('pending')}</strong><span>En attente</span></div>
            <div className="dash-stat"><strong>{countBy('confirmed')}</strong><span>Confirmées</span></div>
            <div className="dash-stat"><strong>{countBy('refused', 'cancelled')}</strong><span>Refusées / annulées</span></div>
          </div>

          {nextTrip && (
            <div className="dash-next">
              <p className="dash-next-label">Mon prochain voyage</p>
              <h3>{nextTrip.circuit?.title}</h3>
              <p>
                {nextTrip.date.slice(0, 10)} · {Number(nextTrip.circuit?.price)} MAD
              </p>
            </div>
          )}

          <h2>Mes réservations</h2>
          {reservations.length === 0 ? (
            <div className="dash-empty">
              <p>Vous n&apos;avez pas encore de réservation.</p>
              <Link to="/circuits" className="dash-link">Découvrir les circuits</Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Circuit</th>
                  <th>Date</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.circuit?.title}</td>
                    <td>{r.date.slice(0, 10)}</td>
                    <td>{Number(r.circuit?.price)} MAD</td>
                    <td><StatusPill status={r.status} /></td>
                    <td>
                      {(r.status === 'pending' || r.status === 'confirmed') && (
                        <button onClick={() => cancel(r.id)}>Annuler</button>
                      )}{' '}
                      {r.status === 'confirmed' && reviewedIds.includes(r.id) && <span>⭐ Avis donné</span>}
                      {r.status === 'confirmed' && !reviewedIds.includes(r.id) && reviewingId !== r.id && (
                        <button onClick={() => openReview(r.id)}>Donner un avis</button>
                      )}
                      {reviewingId === r.id && (
                        <div className="booking-box">
                          <select value={rating} onChange={(e) => setRating(e.target.value)}>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Très bien</option>
                            <option value="3">3 - Bien</option>
                            <option value="2">2 - Moyen</option>
                            <option value="1">1 - Mauvais</option>
                          </select>
                          <textarea
                            placeholder="Votre commentaire (optionnel)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <button onClick={() => submitReview(r.id)}>Envoyer</button>{' '}
                          <button onClick={() => setReviewingId(null)}>Annuler</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {(user.role === 'guide' || user.role === 'admin') && (
        <div>
          <h2>{user.role === 'admin' ? 'Toutes les réservations' : 'Réservations reçues'}</h2>
          {!loading && reservations.length === 0 && <p>Aucune réservation reçue.</p>}
          {reservations.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Circuit</th>
                  <th>Touriste</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.circuit?.title}</td>
                    <td>{r.user?.email}</td>
                    <td>{r.date.slice(0, 10)}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td>
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => setStatus(r.id, 'confirmed')}>Accepter</button>{' '}
                          <button onClick={() => setStatus(r.id, 'refused')}>Refuser</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}