import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getDashboardStats } from '../services/properties';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import type { DashboardStats } from '../models/types';
import { formatPrice } from '../utils/format';

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="stat-card animate-fade-up">
      <span className="stat-label">{label}</span>
      <span className={`stat-value${highlight ? ' highlight' : ''}`}>
        {value}
      </span>
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
        <div>
          <span className="section-kicker">Espace gestion</span>
          <h1>Tableau de bord</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Bonjour {user?.firstName || user?.email} 👋
          </p>
        </div>
      </div>

      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}
      {error && (
        <EmptyState
          title="Impossible de charger les statistiques"
          message="Réessayez dans un instant."
          onRetry={() => window.location.reload()}
        />
      )}

      {!loading && !error && stats && (
        <div className="stats-grid stagger">
          <StatCard label="Biens" value={stats.properties} />
          <StatCard
            label="Biens disponibles"
            value={stats.availableProperties}
            highlight
          />
          <StatCard label="Locataires" value={stats.tenants} />
          <StatCard label="Propriétaires" value={stats.owners} />
          <StatCard label="Contrats" value={stats.contracts} />
          <StatCard label="Contrats actifs" value={stats.activeContracts} />
          <StatCard
            label="Encaissé"
            value={formatPrice(stats.revenue.collected)}
            highlight
          />
          <StatCard label="Loyers en attente" value={stats.pendingRents} />
        </div>
      )}

      {!loading && !error && stats && (
        <div className="section">
          <div className="section-head">
            <div>
              <span className="section-kicker">Activité</span>
              <h2>Derniers paiements</h2>
            </div>
          </div>
          {stats.recentPayments.length === 0 ? (
            <EmptyState
              title="Aucun paiement"
              message="Les paiements apparaîtront ici."
            />
          ) : (
            <ul className="list stagger">
              {stats.recentPayments.map((p) => (
                <li key={p.id as string} className="list-item animate-fade-up">
                  <span>
                    <strong>{formatPrice(p.amount as number)}</strong>
                  </span>
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
      )}
    </div>
  );
}