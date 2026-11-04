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
}

export function updateStatus(id, status) {
  const list = getBookings().map((b) =>
    b.id === id ? { ...b, status } : b
  );
  saveBookings(list);
}

export function cancelBooking(id) {
  updateStatus(id, 'annulée');
}