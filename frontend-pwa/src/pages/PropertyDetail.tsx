import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProperty } from '../services/properties';
import type { Property } from '../models/types';
import { Spinner } from '../components/Spinner';
import { formatPrice, statusLabel, typeLabel } from '../utils/format';

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProperty(id)
      .then((p) => setProperty(p))
      .catch(() => setError('Bien introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="center page">
        <Spinner />
      </div>
    );
  }

  if (error || !property) {
    return <p className="error-text page">{error || 'Bien introuvable.'}</p>;
  }

  return (
    <div className="page detail">
      <div className="detail-head">
        <div>
          <h1>{property.name}</h1>
          <p className="muted">
            {typeLabel(property.type)} ·{' '}
            {property.city || 'Ville non précisée'}
          </p>
        </div>
        <span className={`badge badge-${property.status.toLowerCase()}`}>
          {statusLabel(property.status)}
        </span>
      </div>

      <div className="detail-price">{formatPrice(property.price)}</div>

      <div className="detail-meta">
        {property.rooms != null && <span>🛏 {property.rooms} chambres</span>}
        {property.bathrooms != null && (
          <span>🚿 {property.bathrooms} sdb</span>
        )}
        {property.area != null && <span>📐 {property.area} m²</span>}
      </div>

      {property.description && <p>{property.description}</p>}
      {property.address && (
        <p className="muted">Adresse : {property.address}</p>
      )}
    </div>
  );
}