import { useEffect, useState } from 'react';
import { listProperties } from '../services/properties';
import type { Property } from '../models/types';
import { PropertyCard } from '../components/PropertyCard';
import { Spinner } from '../components/Spinner';

export function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    setLoading(true);
    listProperties({ search, city, type: type || undefined })
      .then((res) => setProperties(res.items))
      .catch(() => setError('Impossible de charger les biens.'))
      .finally(() => setLoading(false));
  }, [search, city, type]);

  return (
    <div className="page">
      <div className="section-head">
        <h1>Nos biens</h1>
      </div>

      <div className="filters">
        <input
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          placeholder="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tous les types</option>
          <option value="APARTMENT">Appartement</option>
          <option value="HOUSE">Maison</option>
          <option value="OFFICE">Bureau</option>
          <option value="COMMERCIAL">Local commercial</option>
          <option value="LAND">Terrain</option>
        </select>
      </div>

      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && properties.length === 0 && (
        <p className="muted">Aucun bien ne correspond à votre recherche.</p>
      )}
      {!loading && !error && (
        <div className="grid">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}