import { addNotification } from './notifications';

const KEY = 'reviews';

export function getReviews() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function hasReview(bookingId) {
  return getReviews().some((r) => r.bookingId === bookingId);
}

export function addReview({ booking, rating, comment }) {
  const list = getReviews();
  list.push({
    id: Date.now(),
    bookingId: booking.id,
    circuitId: booking.circuitId,
    circuitTitle: booking.circuitTitle,
    userEmail: booking.userEmail,
    rating: Number(rating),
    comment,
    date: new Date().toLocaleDateString('fr-FR'),
  });
  localStorage.setItem(KEY, JSON.stringify(list));

  addNotification(
    'role:guide',
    `Nouvel avis (${rating}/5) de ${booking.userEmail} sur "${booking.circuitTitle}".`
  );
}

export function getCircuitStats(circuitId) {
  const list = getReviews().filter((r) => r.circuitId === circuitId);
  if (list.length === 0) return { avg: 0, count: 0 };
  const sum = list.reduce((total, r) => total + r.rating, 0);
  return { avg: (sum / list.length).toFixed(1), count: list.length };
}