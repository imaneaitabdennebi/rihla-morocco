import { useState } from 'react';
import { circuits } from '../data/circuits';
import { useAuth } from '../context/AuthContext';
import { addBooking } from '../utils/bookings';

const today = new Date().toISOString().split('T')[0];

export default function Circuits() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  const handleBook = (circuit) => {
    if (!date) {
      setMessage('Choisissez une date.');
      return;
    }
    addBooking({ circuit, date, userEmail: user.email });
    setMessage(`Réservation envoyée pour "${circuit.title}" le ${date}.`);
    setSelectedId(null);
    setDate('');
  };

  return (
    <div className="container">
      <h1>Nos circuits</h1>
      {message && <p className="success">{message}</p>}

      <div className="grid">
        {circuits.map((c) => (
          <div className="card" key={c.id}>
            <h3>{c.title}</h3>
            <p>📍 {c.city}</p>
            <p>⏱️ {c.duration}</p>
            <p>💰 {c.price} MAD</p>
            <p>{c.description}</p>

            {user?.role === 'tourist' && selectedId !== c.id && (
              <button onClick={() => { setSelectedId(c.id); setMessage(''); }}>
                Réserver
              </button>
            )}

            {user?.role === 'tourist' && selectedId === c.id && (
              <div className="booking-box">
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <button onClick={() => handleBook(c)}>Confirmer</button>
                <button onClick={() => setSelectedId(null)}>Annuler</button>
              </div>
            )}

            {!user && <p><em>Connectez-vous pour réserver.</em></p>}
          </div>
        ))}
      </div>
    </div>
  );
}