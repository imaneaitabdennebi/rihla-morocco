import { useState } from 'react';
import { guides } from '../data/guides';
import GuideCard from '../components/GuideCard';

const PER_PAGE = 4;

export default function Home() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  const cities = [...new Set(guides.map((g) => g.city))];

  const filtered = guides.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) &&
      (city === '' || g.city === city)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="container">
      <h1>Nos guides</h1>

      <div className="filters">
        <input
          placeholder="Rechercher un guide..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
          <option value="">Toutes les villes</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid">
        {visible.map((g) => <GuideCard key={g.id} guide={g} />)}
      </div>
      {visible.length === 0 && <p>Aucun guide trouvé.</p>}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>
    </div>
  );
}