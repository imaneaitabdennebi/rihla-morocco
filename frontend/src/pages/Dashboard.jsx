import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1>Tableau de bord</h1>
      <p>Bienvenue {user.name} !</p>

      {user.role === 'tourist' && (
        <div>
          <h2>Espace touriste</h2>
          <ul>
            <li>Mes réservations</li>
            <li>Mes avis</li>
            <li>Mes notifications</li>
          </ul>
        </div>
      )}

      {user.role === 'guide' && (
        <div>
          <h2>Espace guide</h2>
          <ul>
            <li>Mon profil</li>
            <li>Mes circuits</li>
            <li>Réservations reçues</li>
            <li>Mes statistiques</li>
          </ul>
        </div>
      )}

      {user.role === 'admin' && (
        <div>
          <h2>Espace administrateur</h2>
          <ul>
            <li>Gérer les utilisateurs</li>
            <li>Superviser les réservations</li>
            <li>Statistiques globales</li>
            <li>Exporter PDF / Excel</li>
          </ul>
        </div>
      )}
    </div>
  );
}