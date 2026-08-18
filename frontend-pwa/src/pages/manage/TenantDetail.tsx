import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTenant } from '../../services/tenants';
import { listPayments } from '../../services/payments';
import { MgmtLayout } from '../../components/MgmtNav';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Payment, Tenant } from '../../models/types';
import { formatPrice } from '../../utils/format';

export function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getTenant(id), listPayments({ tenantId: id })])
      .then(([t, p]) => {
        setTenant(t);
        setPayments(p.items);
      })
      .catch(() => setTenant(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MgmtLayout title="Locataire" kicker="Détail">
        <div className="center">
          <Spinner />
        </div>
      </MgmtLayout>
    );
  }

  if (!tenant) {
    return (
      <MgmtLayout title="Locataire" kicker="Détail">
        <EmptyState title="Locataire introuvable" message="Contrat supprimé ?" />
      </MgmtLayout>
    );
  }

  const contracts = tenant.contracts || [];

  return (
    <MgmtLayout
      title={tenant.name}
      kicker="Locataire"
      actions={
        <Link to="/manage/tenants" className="btn btn-ghost">
          ← Retour
        </Link>
      }
    >
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="muted" style={{ margin: 0 }}>
          📞 {tenant.phone || 'Pas de téléphone'}
          {tenant.email ? ` — ✉️ ${tenant.email}` : ''}
        </p>
      </div>

      <div className="section-head">
        <div>
          <span className="section-kicker">Contrats</span>
          <h2>Contrats et loyers</h2>
        </div>
        <Link to="/manage/contracts" className="btn btn-outline">
          + Nouveau contrat
        </Link>
      </div>

      {contracts.length === 0 ? (
        <EmptyState
          title="Aucun contrat"
          message="Créez un contrat pour ce locataire."
        />
      ) : (
        <div className="grid stagger">
          {contracts.map((c) => {
            const paid = (c.rents || []).reduce(
              (s, r) => s + r.paidAmount,
              0,
            );
            const due = (c.rents || []).reduce((s, r) => s + r.amount, 0);
            const balance = due - paid;
            return (
              <div key={c.id} className="card animate-fade-up">
                <div className="property-title-row">
                  <h3 style={{ margin: 0 }}>{c.property?.name || 'Bien'}</h3>
                  <span className={`badge badge-${c.status.toLowerCase()}`}>
                    {c.status === 'ACTIVE'
                      ? 'Actif'
                      : c.status === 'EXPIRED'
                        ? 'Expiré'
                        : c.status === 'TERMINATED'
                          ? 'Résilié'
                          : 'En attente'}
                  </span>
                </div>
                <p className="property-price">{formatPrice(c.rentAmount)}/mois</p>
                <div className="property-meta" style={{ marginBottom: 12 }}>
                  <span>
                    Payé :{' '}
                    <strong style={{ color: 'var(--success)' }}>
                      {formatPrice(paid)}
                    </strong>
                  </span>
                  <span>
                    Reste :{' '}
                    <strong style={{ color: balance > 0 ? 'var(--danger)' : 'var(--muted)' }}>
                      {formatPrice(balance)}
                    </strong>
                  </span>
                </div>
                <Link
                  to={`/manage/contracts/${c.id}`}
                  className="btn btn-outline"
                  style={{ padding: '8px 14px', fontSize: 13 }}
                >
                  Voir le contrat
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="section">
        <div className="section-head">
          <div>
            <span className="section-kicker">Historique</span>
            <h2>Paiements</h2>
          </div>
        </div>
        {payments.length === 0 ? (
          <EmptyState title="Aucun paiement" message="Aucun paiement enregistré." />
        ) : (
          <ul className="list stagger">
            {payments.map((p) => (
              <li key={p.id} className="list-item animate-fade-up">
                <span>
                  <strong>{formatPrice(p.amount)}</strong>
                  <span className="muted" style={{ marginLeft: 8 }}>
                    {p.method}
                  </span>
                </span>
                <span className="muted">
                  {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MgmtLayout>
  );
}