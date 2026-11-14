import { useEffect, useState } from 'react';
import api from '../api/axios';
import GuideCard from '../components/GuideCard';

const LANGUAGES = ['Arabe', 'Français', 'Anglais', 'Espagnol'];

export default function Home() {
  const [guides, setGuides] = useState([]);
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/cities').then(({ data }) => setCities(data)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/guides', {
          params: { search, city, language, max_rate: maxRate, min_rating: minRating, page },
        })
        .then(({ data }) => {
          if (cancelled) return;
          setGuides(data.data);
          setLastPage(data.last_page);
          setError('');
        })
        .catch(() => {
          if (!cancelled) setError('Impossible de charger les guides.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, city, language, maxRate, minRating, page]);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="container">
      <h1>Nos guides</h1>

      <div className="filters">
        <input placeholder="Rechercher un guide..." value={search} onChange={onFilter(setSearch)} />
        <select value={city} onChange={onFilter(setCity)}>
          <option value="">Toutes les villes</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={language} onChange={onFilter(setLanguage)}>
          <option value="">Toutes les langues</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={maxRate} onChange={onFilter(setMaxRate)}>
          <option value="">Tous les tarifs</option>
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

      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}

      <div className="grid">
        {guides.map((g) => <GuideCard key={g.id} guide={g} />)}
      </div>
      {!loading && !error && guides.length === 0 && <p>Aucun guide trouvé.</p>}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button>
        <span>Page {page} / {lastPage}</span>
        <button disabled={page === lastPage} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>
    </div>
  );
}