import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getDashboardStats } from '../services/properties';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';
import type { DashboardStats } from '../models/types';
import { formatPrice } from '../utils/format';

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export function Dashboard() {
  const { isGuest, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) return;
    getDashboardStats()
      .then((data) => setStats(data as DashboardStats))
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, [isGuest]);

  if (isGuest) {
    return <Navigate to="/properties" replace />;
  }

  return (
    <div className="page">
      <div className="section-head">
        <h1>Tableau de bord</h1>
        <p className="muted">
          Bonjour {user?.firstName || user?.email} 👋
        </p>
      </div>

      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && stats && (
        <>
          <div className="stats-grid">
            <StatCard label="Biens" value={stats.properties} />
            <StatCard
              label="Biens disponibles"
              value={stats.availableProperties}
            />
            <StatCard label="Locataires" value={stats.tenants} />
            <StatCard label="Propriétaires" value={stats.owners} />
            <StatCard label="Contrats" value={stats.contracts} />
            <StatCard
              label="Contrats actifs"
              value={stats.activeContracts}
            />
            <StatCard
              label="Encaissé"
              value={formatPrice(stats.revenue.collected)}
            />
            <StatCard
              label="Loyers en attente"
              value={stats.pendingRents}
            />
          </div>

          <div className="section">
            <h2>Derniers paiements</h2>
            {stats.recentPayments.length === 0 ? (
              <p className="muted">Aucun paiement pour le moment.</p>
            ) : (
              <ul className="list">
                {stats.recentPayments.map((p) => (
                  <li key={p.id as string} className="list-item">
                    <span>{p.amount as number} FCFA</span>
                    <span className="muted">
                      {new Date(p.createdAt as string).toLocaleDateString(
                        'fr-FR',
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}