import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS = {
  pending: 'En attente',
  confirmed: 'Confirmées',
  refused: 'Refusées',
  cancelled: 'Annulées',
};

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function Bars({ data }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <div>
      {Object.entries(data).map(([key, count]) => (
        <div className="bar-row" key={key}>
          <span className="bar-label">{STATUS[key] || key}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Stats() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const allowed = user?.role === 'guide' || user?.role === 'admin';

  useEffect(() => {
    if (!allowed) return;
    api
      .get('/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Impossible de charger les statistiques.'));
  }, [allowed]);

  if (!allowed) {
    return (
      <div className="container">
        <h1>Statistiques</h1>
        <p className="error">Page réservée aux guides et à l'administrateur.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{user.role === 'admin' ? 'Statistiques globales' : 'Mes statistiques'}</h1>
      {error && <p className="error">{error}</p>}
      {!stats && !error && <p>Chargement...</p>}

      {stats && (
        <>
          <div className="stats-grid">
            {stats.role === 'admin' && (
              <>
                <StatCard label="Utilisateurs" value={stats.users} />
                <StatCard label="Touristes" value={stats.tourists} />
                <StatCard label="Guides" value={stats.guides} />
              </>
            )}
            <StatCard label="Circuits" value={stats.circuits} />
            <StatCard label="Réservations" value={stats.reservations} />
            <StatCard label="Avis" value={stats.reviews} />
            <StatCard
              label="Note moyenne"
              value={stats.average_rating ? `${stats.average_rating} ⭐` : '-'}
            />
            <StatCard label="Revenus confirmés" value={`${Number(stats.revenue)} MAD`} />
          </div>

          <h2>Réservations par statut</h2>
          <Bars data={stats.reservations_by_status} />

          <h2>Circuits les plus réservés</h2>
          {stats.top_circuits.length === 0 ? (
            <p>Aucune donnée.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Circuit</th>
                  <th>Ville</th>
                  <th>Réservations</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_circuits.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{c.city}</td>
                    <td>{c.reservations_count}</td>
                    <td>{c.rating ? `${c.rating} ⭐` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {stats.role === 'admin' && (
            <>
              <h2>Guides les mieux notés</h2>
              {stats.top_guides.length === 0 ? (
                <p>Aucun avis pour le moment.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Guide</th>
                      <th>Ville</th>
                      <th>Note</th>
                      <th>Avis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_guides.map((g) => (
                      <tr key={g.id}>
                        <td>{g.name}</td>
                        <td>{g.city}</td>
                        <td>{g.rating} ⭐</td>
                        <td>{g.reviews_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}