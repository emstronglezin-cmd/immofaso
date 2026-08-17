import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProperty } from '../services/properties';
import type { Property } from '../models/types';
import { SkeletonDetail } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import {
  formatPrice,
  statusLabel,
  typeLabel,
  typeIcon,
} from '../utils/format';

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProperty(id)
      .then((p) => setProperty(p))
      .catch(() => setError('Bien introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page detail">
        <SkeletonDetail />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="page">
        <EmptyState
          title="Bien introuvable"
          message={error || 'Ce bien n\'existe pas ou a été supprimé.'}
          action={{ label: 'Voir tous les biens', onClick: () => (window.location.href = '/properties') }}
        />
      </div>
    );
  }

  const firstImage = Array.isArray(property.images)
    ? (property.images.find((i) => typeof i === 'string' && i) as
        | string
        | undefined)
    : undefined;

  return (
    <div className="page detail animate-fade-up">
      <Link to="/properties" className="back-link">
        ← Retour aux biens
      </Link>

      <div className="detail-cover">
        {firstImage ? (
          <img src={firstImage} alt={property.name} />
        ) : (
          <div className="detail-cover-fallback" role="img" aria-label="Bien">
            {typeIcon(property.type)}
          </div>
        )}
      </div>

      <div className="detail-head">
        <div>
          <h1>{property.name}</h1>
          <p className="muted">
            {typeLabel(property.type)} · {property.city || 'Ville non précisée'}
            {property.country ? `, ${property.country}` : ''}
          </p>
        </div>
        <span
          className={`badge badge-${property.status.toLowerCase()} badge-lg`}
        >
          {statusLabel(property.status)}
        </span>
      </div>

      <div className="detail-price">{formatPrice(property.price)}</div>

      <div className="detail-meta">
        {property.rooms != null && <span>🛏 {property.rooms} chambres</span>}
        {property.bathrooms != null && (
          <span>🚿 {property.bathrooms} salles de bain</span>
        )}
        {property.area != null && <span>📐 {property.area} m²</span>}
      </div>

      {property.description && (
        <div className="detail-description">
          <h2 style={{ fontSize: 20, margin: '24px 0 8px' }}>Description</h2>
          <p>{property.description}</p>
        </div>
      )}

      {property.address && (
        <p className="muted" style={{ marginTop: 16 }}>
          📍 Adresse : {property.address}
        </p>
      )}
    </div>
  );
}