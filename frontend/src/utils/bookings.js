import { addNotification } from './notifications';

const KEY = 'bookings';

export function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookings(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addBooking({ circuit, date, userEmail }) {
  const list = getBookings();
  list.push({
    id: Date.now(),
    circuitId: circuit.id,
    circuitTitle: circuit.title,
    price: circuit.price,
    date,
    userEmail,
    status: 'en attente',
  });
  saveBookings(list);

  addNotification(
    'role:guide',
    `Nouvelle réservation de ${userEmail} pour "${circuit.title}" le ${date}.`
  );
}

export function updateStatus(id, status) {
  const list = getBookings();
  const booking = list.find((b) => b.id === id);
  saveBookings(list.map((b) => (b.id === id ? { ...b, status } : b)));

  if (booking) {
    addNotification(
      booking.userEmail,
      `Votre réservation "${booking.circuitTitle}" du ${booking.date} est ${status}.`
    );
  }
}

export function cancelBooking(id) {
  const list = getBookings();
  const booking = list.find((b) => b.id === id);
  saveBookings(list.map((b) => (b.id === id ? { ...b, status: 'annulée' } : b)));

  if (booking) {
    addNotification(
      'role:guide',
      `${booking.userEmail} a annulé la réservation "${booking.circuitTitle}" du ${booking.date}.`
    );
  }
}