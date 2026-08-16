import { Link } from 'react-router-dom';
import type { Property } from '../models/types';
import { formatPrice, statusLabel, typeLabel } from '../utils/format';

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link to={`/properties/${property.id}`} className="property-card">
      <div className="property-thumb">
        <span>{typeLabel(property.type)}</span>
      </div>
      <div className="property-body">
        <div className="property-title-row">
          <h3>{property.name}</h3>
          <span className={`badge badge-${property.status.toLowerCase()}`}>
            {statusLabel(property.status)}
          </span>
        </div>
        <p className="property-city">
          {property.city || 'Ville non précisée'}
          {property.country ? `, ${property.country}` : ''}
        </p>
        <div className="property-meta">
          {property.rooms != null && (
            <span>{property.rooms} chambres</span>
          )}
          {property.area != null && <span>{property.area} m²</span>}
        </div>
        <p className="property-price">{formatPrice(property.price)}</p>
      </div>
    </Link>
  );
}