import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS = {
  pending: 'en attente',
  confirmed: 'confirmée',
  refused: 'refusée',
  cancelled: 'annulée',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/reservations')
      .then(({ data }) => setReservations(data.data))
      .catch(() => setError('Impossible de charger les réservations.'))
      .finally(() => setLoading(false));
  }, [reload]);

  const act = async (request) => {
    setError('');
    try {
      await request();
      setReload((r) => r + 1);
    } catch (err) {
      setError(err.response?.data?.message || "L'action a échoué.");
    }
  };

  const cancel = (id) => act(() => api.patch(`/reservations/${id}/cancel`));
  const setStatus = (id, status) => act(() => api.patch(`/reservations/${id}/status`, { status }));

  return (
    <div className="container">
      <h1>Tableau de bord</h1>
      <p>Bienvenue {user.name} !</p>
      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}

      {user.role === 'tourist' && (
        <div>
          <h2>Mes réservations</h2>
          {!loading && reservations.length === 0 && <p>Aucune réservation pour le moment.</p>}
          {reservations.length > 0 && (
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
                    <td>{STATUS[r.status]}</td>
                    <td>
                      {(r.status === 'pending' || r.status === 'confirmed') && (
                        <button onClick={() => cancel(r.id)}>Annuler</button>
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
                    <td>{STATUS[r.status]}</td>
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