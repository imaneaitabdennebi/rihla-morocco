import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings, cancelBooking, updateStatus } from '../utils/bookings';
import { addReview, hasReview } from '../utils/reviews';

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(getBookings());
  const [reviewing, setReviewing] = useState(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [, setTick] = useState(0);

  const refresh = () => setBookings(getBookings());

  const myBookings = bookings.filter((b) => b.userEmail === user.email);

  const handleCancel = (id) => {
    cancelBooking(id);
    refresh();
  };

  const handleStatus = (id, status) => {
    updateStatus(id, status);
    refresh();
  };

  const handleReview = (e) => {
    e.preventDefault();
    addReview({ booking: reviewing, rating, comment });
    setReviewing(null);
    setRating('5');
    setComment('');
    setTick((t) => t + 1);
  };

  return (
    <div className="container">
      <h1>Tableau de bord</h1>
      <p>Bienvenue {user.name} !</p>

      {user.role === 'tourist' && (
        <div>
          <h2>Mes réservations</h2>
          {myBookings.length === 0 && <p>Aucune réservation pour le moment.</p>}

          {myBookings.length > 0 && (
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
                {myBookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.circuitTitle}</td>
                    <td>{b.date}</td>
                    <td>{b.price} MAD</td>
                    <td>{b.status}</td>
                    <td>
                      {(b.status === 'en attente' || b.status === 'confirmée') && (
                        <button onClick={() => handleCancel(b.id)}>Annuler</button>
                      )}{' '}
                      {b.status === 'confirmée' && !hasReview(b.id) && (
                        <button onClick={() => setReviewing(b)}>Donner un avis</button>
                      )}
                      {b.status === 'confirmée' && hasReview(b.id) && <span>✔ Avis envoyé</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reviewing && (
            <form onSubmit={handleReview} className="review-form">
              <h3>Avis sur "{reviewing.circuitTitle}"</h3>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Très bien</option>
                <option value="3">3 - Bien</option>
                <option value="2">2 - Moyen</option>
                <option value="1">1 - Mauvais</option>
              </select>
              <textarea
                rows="3"
                placeholder="Votre commentaire"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit">Envoyer l'avis</button>
              <button type="button" onClick={() => setReviewing(null)}>Annuler</button>
            </form>
          )}
        </div>
      )}

      {user.role === 'guide' && (
        <div>
          <h2>Réservations reçues</h2>
          {bookings.length === 0 && <p>Aucune réservation reçue.</p>}

          {bookings.length > 0 && (
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
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.circuitTitle}</td>
                    <td>{b.userEmail}</td>
                    <td>{b.date}</td>
                    <td>{b.status}</td>
                    <td>
                      {b.status === 'en attente' && (
                        <>
                          <button onClick={() => handleStatus(b.id, 'confirmée')}>Accepter</button>{' '}
                          <button onClick={() => handleStatus(b.id, 'refusée')}>Refuser</button>
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

      {user.role === 'admin' && (
        <div>
          <h2>Espace administrateur</h2>
          <ul>
            <li>Gérer les utilisateurs</li>
            <li>Superviser les réservations</li>
            <li>Statistiques globales</li>
            <li>Exporter PDF / Excel</li>
          </ul>
        </div>
      )}
    </div>
  );
}