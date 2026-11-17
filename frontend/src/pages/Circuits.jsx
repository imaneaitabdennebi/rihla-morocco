import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const today = new Date().toISOString().split('T')[0];

const slug = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const photo = (city) => ({
  backgroundImage: `url(/images/${slug(city)}.jpg), linear-gradient(135deg, #c4552d, #14654d)`,
});

export default function Circuits() {
  const { user } = useAuth();
  const [params] = useSearchParams();

  const [circuits, setCircuits] = useState([]);
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState(params.get('city') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('max_price') || '');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState(null);
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [openReviewsId, setOpenReviewsId] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/cities').then(({ data }) => setCities(data)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/circuits', {
          params: { search, city, max_price: maxPrice, min_rating: minRating, page },
        })
        .then(({ data }) => {
          if (cancelled) return;
          setCircuits(data.data);
          setLastPage(data.last_page);
        })
        .catch(() => {
          if (!cancelled) setError('Impossible de charger les circuits.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, city, maxPrice, minRating, page]);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleBook = async (circuit) => {
    setMessage('');
    setError('');
    if (!date) {
      setError('Choisissez une date.');
      return;
    }
    try {
      await api.post('/reservations', { circuit_id: circuit.id, date });
      setMessage(`Réservation envoyée pour "${circuit.title}" le ${date}.`);
      setSelectedId(null);
      setDate('');
    } catch (err) {
      setError(
        err.response?.data?.errors?.date?.[0] ||
          err.response?.data?.message ||
          'Erreur lors de la réservation.'
      );
    }
  };

  const toggleReviews = async (circuitId) => {
    if (openReviewsId === circuitId) {
      setOpenReviewsId(null);
      return;
    }
    try {
      const { data } = await api.get(`/circuits/${circuitId}/reviews`);
      setReviews(data);
      setOpenReviewsId(circuitId);
    } catch {
      setError('Impossible de charger les avis.');
    }
  };

  return (
    <div className="container">
      <h1>Nos circuits</h1>
      <p className="muted">Explorez nos circuits organisés pour tous les goûts.</p>

      <div className="filters">
        <input
          placeholder="Rechercher un circuit..."
          value={search}
          onChange={onFilter(setSearch)}
        />
        <select value={city} onChange={onFilter(setCity)}>
          <option value="">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={maxPrice} onChange={onFilter(setMaxPrice)}>
          <option value="">Tous les prix</option>
          <option value="200">Jusqu'à 200 MAD</option>
          <option value="250">Jusqu'à 250 MAD</option>
          <option value="300">Jusqu'à 300 MAD</option>
        </select>
        <select value={minRating} onChange={onFilter(setMinRating)}>
          <option value="">Toutes les notes</option>
          <option value="3">3 étoiles et +</option>
          <option value="4">4 étoiles et +</option>
        </select>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}

      <div className="grid">
        {circuits.map((c) => (
          <div className="circuit-card" key={c.id}>
            <div className="circuit-img" style={photo(c.city)}>
              {c.reviews_avg_rating && (
                <span className="rating-pill">★ {Number(c.reviews_avg_rating).toFixed(1)}</span>
              )}
            </div>

            <div className="circuit-body">
              <h3>{c.title}</h3>
              <p className="meta">
                📍 {c.city} · ⏱️ {c.duration}
              </p>
              <p>{c.description}</p>
              <p>
                <strong>à partir de {Number(c.price)} MAD</strong>
              </p>
              <p className="meta">
                ⭐{' '}
                {c.reviews_avg_rating
                  ? `${Number(c.reviews_avg_rating).toFixed(1)} / 5 (${c.reviews_count} avis)`
                  : "Pas encore d'avis"}
              </p>

              <div className="guide-line">
                <span className="avatar-sm">{c.guide?.user?.name?.charAt(0)}</span>
                <span>Par {c.guide?.user?.name}</span>
              </div>

              {c.reviews_count > 0 && (
                <p>
                  <button className="btn-outline" onClick={() => toggleReviews(c.id)}>
                    {openReviewsId === c.id ? 'Masquer les avis' : 'Voir les avis'}
                  </button>
                </p>
              )}

              {openReviewsId === c.id && (
                <div className="reviews">
                  {reviews.map((rv) => (
                    <p key={rv.id}>
                      <strong>{rv.user?.name}</strong> : {'⭐'.repeat(rv.rating)}
                      {rv.comment && (
                        <>
                          <br />
                          {rv.comment}
                        </>
                      )}
                    </p>
                  ))}
                </div>
              )}

              {user?.role === 'tourist' && selectedId !== c.id && (
                <p>
                  <button
                    onClick={() => {
                      setSelectedId(c.id);
                      setMessage('');
                      setError('');
                    }}
                  >
                    Réserver
                  </button>
                </p>
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
                  <button className="btn-outline" onClick={() => setSelectedId(null)}>
                    Annuler
                  </button>
                </div>
              )}

              {!user && (
                <p className="muted">
                  <em>Connectez-vous pour réserver.</em>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && circuits.length === 0 && <p>Aucun circuit trouvé.</p>}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button>
        <span>Page {page} / {lastPage}</span>
        <button disabled={page === lastPage} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>
    </div>
  );
}