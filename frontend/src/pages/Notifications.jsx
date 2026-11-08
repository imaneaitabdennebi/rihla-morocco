import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyNotifications, markAllRead } from '../utils/notifications';

export default function Notifications() {
  const { user } = useAuth();
  const [list] = useState(() => getMyNotifications(user));

  useEffect(() => {
    markAllRead(user);
  }, [user]);

  return (
    <div className="container">
      <h1>Notifications</h1>
      {list.length === 0 && <p>Aucune notification.</p>}
      <ul className="notif-list">
        {list.map((n) => (
          <li key={n.id} className={n.read ? '' : 'unread'}>
            <span>{n.message}</span>
            <small>{n.date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}