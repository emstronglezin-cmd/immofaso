import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getDashboardOverview } from '../services/properties';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { MgmtLayout } from '../components/MgmtNav';
import type { DashboardOverview } from '../models/types';
import { formatPrice } from '../utils/format';
import { canAccessDashboard } from '../utils/roles';

function StatCard({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="stat-card animate-fade-up">
      <span className="stat-label">{label}</span>
      <span
        className={`stat-value${highlight ? ' highlight' : ''}${
          danger ? ' danger-value' : ''
        }`}
        style={danger ? { color: 'var(--danger)' } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function BarChart({
  data,
  label,
}: {
  data: Array<{ month: string; value: number }>;
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="chart-card">
      <span className="section-kicker">{label}</span>
      <div className="bar-chart">
        {data.map((d) => (
          <div className="bar-col" key={d.month}>
            <div
              className="bar"
              data-label={formatPrice(d.value)}
              style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
            />
            <span className="bar-label">{d.month.slice(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { isGuest, user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) return;
    getDashboardOverview()
      .then(setOverview)
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, [isGuest]);

  if (isGuest) {
    return <Navigate to="/properties" replace />;
  }

  if (!user || !canAccessDashboard(user)) {
    return <Navigate to="/properties" replace />;
  }

  return (
    <MgmtLayout
      title="Tableau de bord"
      kicker={`Espace gestion — ${user?.firstName || user?.email || ''}`}
    >
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

      {!loading && !error && overview && (
        <>
          <div className="section-head">
            <div>
              <span className="section-kicker">Aujourd'hui</span>
              <h2>Vue du jour</h2>
            </div>
          </div>
          <div className="overview-grid stagger">
            <StatCard
              label="Encaissé aujourd'hui"
              value={formatPrice(overview.today.collected)}
              highlight
            />
            <StatCard
              label="Loyers attendus"
              value={formatPrice(overview.today.expected)}
            />
            <StatCard
              label="Dépenses du jour"
              value={formatPrice(overview.today.expenses)}
              danger={overview.today.expenses > 0}
            />
            <StatCard
              label="Travaux en cours"
              value={overview.today.ticketsInProgress}
            />
          </div>

          <div className="section">
            <div className="section-head">
              <div>
                <span className="section-kicker">Ce mois</span>
                <h2>Performance mensuelle</h2>
              </div>
            </div>
            <div className="overview-grid stagger">
              <StatCard
                label="Revenus"
                value={formatPrice(overview.month.revenue)}
                highlight
              />
              <StatCard
                label="Dépenses"
                value={formatPrice(overview.month.expenses)}
                danger={overview.month.expenses > 0}
              />
              <StatCard
                label="Bénéfice"
                value={formatPrice(overview.month.profit)}
                highlight
              />
              <StatCard
                label="Impayés"
                value={formatPrice(overview.month.unpaid)}
                danger={overview.month.unpaid > 0}
              />
              <StatCard
                label="Paiements reçus"
                value={overview.month.paymentsCount}
              />
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <div>
                <span className="section-kicker">Cette année</span>
                <h2>Vue annuelle</h2>
              </div>
            </div>
            <div className="overview-grid stagger">
              <StatCard
                label="Revenus"
                value={formatPrice(overview.year.revenue)}
                highlight
              />
              <StatCard
                label="Dépenses"
                value={formatPrice(overview.year.expenses)}
                danger={overview.year.expenses > 0}
              />
              <StatCard
                label="Bénéfice"
                value={formatPrice(overview.year.profit)}
                highlight
              />
              <StatCard
                label="Taux d'occupation"
                value={`${overview.year.occupancyRate}%`}
                highlight
              />
              <StatCard
                label="Croissance vs n-1"
                value={`${overview.year.growth > 0 ? '+' : ''}${overview.year.growth}%`}
              />
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <div>
                <span className="section-kicker">Graphiques</span>
                <h2>Évolution sur 12 mois</h2>
              </div>
            </div>
            <div className="grid">
              <BarChart data={overview.revenueByMonth} label="Revenus" />
              <BarChart data={overview.expenseByMonth} label="Dépenses" />
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <div>
                <span className="section-kicker">Impayés</span>
                <h2>Loyers en retard</h2>
              </div>
            </div>
            {overview.unpaidByTenant.length === 0 ? (
              <EmptyState title="Aucun impayé" message="Tous les loyers sont à jour. 🎉" />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Locataire</th>
                      <th>Bien</th>
                      <th>Période</th>
                      <th>Reste</th>
                      <th>Échéance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.unpaidByTenant.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.tenantName || '—'}</strong>
                        </td>
                        <td>{u.propertyName || '—'}</td>
                        <td>{u.period}</td>
                        <td style={{ color: 'var(--danger)' }}>
                          <strong>{formatPrice(u.remaining)}</strong>
                        </td>
                        <td>{new Date(u.dueDate).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </MgmtLayout>
  );
}