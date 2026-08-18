import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBuilding } from '../../services/buildings';
import { listProperties } from '../../services/properties';
import { MgmtLayout } from '../../components/MgmtNav';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Building, Property } from '../../models/types';
import { formatPrice, typeLabel, statusLabel } from '../../utils/format';

export function BuildingDetail() {
  const { id } = useParams<{ id: string }>();
  const [building, setBuilding] = useState<Building | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getBuilding(id), listProperties({ buildingId: id })])
      .then(([b, props]) => {
        setBuilding(b);
        setProperties(props.items);
      })
      .catch(() => {
        setBuilding(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MgmtLayout title="Immeuble" kicker="Détail">
        <div className="center">
          <Spinner />
        </div>
      </MgmtLayout>
    );
  }

  if (!building) {
    return (
      <MgmtLayout title="Immeuble" kicker="Détail">
        <EmptyState
          title="Immeuble introuvable"
          message="Il a peut-être été supprimé."
        />
      </MgmtLayout>
    );
  }

  const s = building.stats;

  return (
    <MgmtLayout
      title={building.name}
      kicker="Immeuble"
      actions={
        <Link to="/manage/buildings" className="btn btn-ghost">
          ← Retour
        </Link>
      }
    >
      <div className="stats-grid stagger" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <span className="stat-label">Logements</span>
          <span className="stat-value">{s?.propertyCount ?? 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Taux d'occupation</span>
          <span className="stat-value highlight">{s?.occupancyRate ?? 0}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Revenus</span>
          <span className="stat-value highlight">
            {formatPrice(s?.revenue ?? 0)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Impayés</span>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>
            {formatPrice(s?.unpaid ?? 0)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Contrats actifs</span>
          <span className="stat-value">{s?.activeContracts ?? 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Dépenses</span>
          <span className="stat-value">{formatPrice(s?.expenses ?? 0)}</span>
        </div>
      </div>

      {building.address || building.city ? (
        <p className="muted" style={{ marginBottom: 18 }}>
          📍 {[building.address, building.city].filter(Boolean).join(', ')}
          {building.floors != null ? ` — ${building.floors} étages` : ''}
        </p>
      ) : null}

      <div className="section-head">
        <div>
          <span className="section-kicker">Logements</span>
          <h2>Biens de l'immeuble</h2>
        </div>
        <Link to="/manage/properties" className="btn btn-outline">
          + Ajouter un bien
        </Link>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          title="Aucun bien dans cet immeuble"
          message="Ajoutez des biens et associez-les à cet immeuble."
        />
      ) : (
        <div className="grid stagger">
          {properties.map((p) => (
            <div key={p.id} className="card animate-fade-up">
              <div className="property-title-row">
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <span className={`badge badge-${p.status.toLowerCase()}`}>
                  {statusLabel(p.status)}
                </span>
              </div>
              <p className="property-city">{typeLabel(p.type)}</p>
              <p className="property-price">{formatPrice(p.price)}</p>
              <div className="actions" style={{ justifyContent: 'flex-start' }}>
                <Link
                  to={`/properties/${p.id}`}
                  className="icon-btn"
                  title="Voir"
                >
                  👁️
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </MgmtLayout>
  );
}