import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { cityPhoto } from '../utils/photo';

export default function Home() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    api.get('/cities').then(({ data }) => setCities(data)).catch(() => {});
    api
      .get('/circuits')
      .then(({ data }) => {
        const sorted = [...data.data].sort(
          (a, b) => Number(b.reviews_avg_rating || 0) - Number(a.reviews_avg_rating || 0)
        );
        setFeatured(sorted.slice(0, 3));
      })
      .catch(() => {});
    api.get('/reviews/latest').then(({ data }) => setReviews(data)).catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (budget) params.set('max_price', budget);
    navigate(`/circuits?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(25,12,5,0.7), rgba(25,12,5,0.15)), url(/images/hero.avif), linear-gradient(135deg, #a4431f, #0c4535)`,
        }}
      >
        <div className="hero-content">
          <h1>Explorez le Maroc autrement</h1>
          <p>
            Découvrez des circuits uniques, rencontrez des guides passionnés et vivez une
            expérience inoubliable.
          </p>
          <Link to="/circuits" className="btn">Découvrir les circuits →</Link>
        </div>
      </section>

      {/* Barre de recherche */}
      <form className="search-bar" onSubmit={search}>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Destination (toutes)</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="">Budget maximum</option>
          <option value="200">Jusqu'à 200 MAD</option>
          <option value="250">Jusqu'à 250 MAD</option>
          <option value="300">Jusqu'à 300 MAD</option>
        </select>
        <button type="submit">Rechercher</button>
      </form>

      {/* Destinations populaires */}
      <section className="home-section">
        <h2 className="section-title">Destinations populaires</h2>
        <div className="dest-grid">
          {cities.map((c) => (
            <Link
              key={c}
              to={`/circuits?city=${encodeURIComponent(c)}`}
              className="dest-tile"
              style={cityPhoto(c)}
            >
              <span>📍 {c}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Circuits à la une */}
      {featured.length > 0 && (
        <section className="home-section">
          <h2 className="section-title">Circuits à la une</h2>
          <div className="feat-grid">
            {featured.map((c) => (
              <Link
                key={c.id}
                to={`/circuits?city=${encodeURIComponent(c.city)}`}
                className="circuit-card"
              >
                <div className="circuit-img" style={cityPhoto(c.city, c.id)}>
                  {c.reviews_avg_rating && (
                    <span className="rating-pill">★ {Number(c.reviews_avg_rating).toFixed(1)}</span>
                  )}
                </div>
                <div className="circuit-body">
                  <h3>{c.title}</h3>
                  <p className="meta">
                    ⏱️ {c.duration} · 💰 à partir de {Number(c.price)} MAD
                  </p>
                  <div className="guide-line">
                    <span className="avatar-sm">{c.guide?.user?.name?.charAt(0)}</span>
                    <span>Par {c.guide?.user?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Avis des voyageurs */}
      {reviews.length > 0 && (
        <section className="home-section">
          <h2 className="section-title">Avis des voyageurs</h2>
          <div className="review-grid">
            {reviews.map((r) => (
              <div className="review-card" key={r.id}>
                <div className="stars">
                  {'★'.repeat(r.rating)}
                  {'☆'.repeat(5 - r.rating)}
                </div>
                <p>« {r.comment} »</p>
                <strong>{r.author}</strong>
                <small>{r.circuit}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bandeau */}
      <section className="cta-band">
        <div>
          <h2>Découvrez le Maroc avec des guides locaux passionnés</h2>
          <Link to="/circuits" className="btn">Explorer maintenant →</Link>
        </div>
      </section>
    </div>
  );
}