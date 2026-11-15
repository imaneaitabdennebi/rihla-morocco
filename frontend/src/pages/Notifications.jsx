import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => setError('Impossible de charger les notifications.'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((list) =>
        list.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      setError("L'action a échoué.");
    }
  };

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((list) => list.map((n) => ({ ...n, is_read: true })));
    } catch {
      setError("L'action a échoué.");
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="container">
      <h1>Notifications</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}
      {!loading && notifications.length === 0 && <p>Aucune notification.</p>}

      {hasUnread && <button onClick={markAll}>Tout marquer comme lu</button>}

      <div className="notif-list">
        {notifications.map((n) => (
          <div
            className="card"
            key={n.id}
            style={{ opacity: n.is_read ? 0.6 : 1, marginTop: 10 }}
          >
            <p>{n.message}</p>
            <small>{new Date(n.created_at).toLocaleString('fr-FR')}</small>{' '}
            {!n.is_read && <button onClick={() => markRead(n.id)}>Marquer comme lu</button>}
          </div>
        ))}
      </div>
    </div>
  );
}