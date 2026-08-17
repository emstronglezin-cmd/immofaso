import { Link } from 'react-router-dom';
import type { Property } from '../models/types';
import { formatPrice, statusLabel, typeLabel, typeIcon } from '../utils/format';

export function PropertyCard({ property }: { property: Property }) {
  const firstImage = Array.isArray(property.images)
    ? (property.images.find((i) => typeof i === 'string' && i) as
        | string
        | undefined)
    : undefined;

  return (
    <Link
      to={`/properties/${property.id}`}
      className="property-card animate-fade-up"
    >
      <div className="property-thumb">
        {firstImage ? (
          <img src={firstImage} alt={property.name} loading="lazy" />
        ) : (
          <div className="property-thumb-fallback">
            <span className="thumb-icon" role="img" aria-label="Bien">
              {typeIcon(property.type)}
            </span>
          </div>
        )}
        <span className="property-type-badge">{typeLabel(property.type)}</span>
        <span
          className={`property-status-badge badge badge-${property.status.toLowerCase()}`}
        >
          {statusLabel(property.status)}
        </span>
      </div>
      <div className="property-body">
        <div className="property-title-row">
          <h3>{property.name}</h3>
        </div>
        <p className="property-city">
          📍 {property.city || 'Ville non précisée'}
          {property.country ? `, ${property.country}` : ''}
        </p>
        <div className="property-meta">
          {property.rooms != null && <span>🛏 {property.rooms}</span>}
          {property.bathrooms != null && <span>🚿 {property.bathrooms}</span>}
          {property.area != null && <span>📐 {property.area} m²</span>}
        </div>
        <p className="property-price">{formatPrice(property.price)}</p>
      </div>
    </Link>
  );
}
