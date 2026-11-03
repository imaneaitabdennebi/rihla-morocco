import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings, cancelBooking } from '../utils/bookings';

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(getBookings());

  const myBookings = bookings.filter((b) => b.userEmail === user.email);

  const handleCancel = (id) => {
    cancelBooking(id);
    setBookings(getBookings());
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
                      {b.status === 'en attente' && (
                        <button onClick={() => handleCancel(b.id)}>Annuler</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {user.role === 'guide' && (
        <div>
          <h2>Espace guide</h2>
          <ul>
            <li>Mon profil</li>
            <li>Mes circuits</li>
            <li>Réservations reçues</li>
            <li>Mes statistiques</li>
          </ul>
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