const KEY = 'notifications';

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// "to" = un email, ou "role:guide" pour tous les guides
export function addNotification(to, message) {
  const list = getAll();
  list.unshift({
    id: Date.now() + Math.random(),
    to,
    message,
    date: new Date().toLocaleString('fr-FR'),
    read: false,
  });
  saveAll(list);
}

function isForUser(n, user) {
  return n.to === user.email || n.to === `role:${user.role}`;
}

export function getMyNotifications(user) {
  return getAll().filter((n) => isForUser(n, user));
}

export function countUnread(user) {
  return getMyNotifications(user).filter((n) => !n.read).length;
}

export function markAllRead(user) {
  saveAll(getAll().map((n) => (isForUser(n, user) ? { ...n, read: true } : n)));
}