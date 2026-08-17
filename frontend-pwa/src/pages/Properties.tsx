import { useEffect, useState } from 'react';
import { listProperties } from '../services/properties';
import type { Property } from '../models/types';
import { PropertyCard } from '../components/PropertyCard';
import { SkeletonCard } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'OFFICE', label: 'Bureau' },
  { value: 'COMMERCIAL', label: 'Local commercial' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'OTHER', label: 'Autre' },
];

export function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [debounced, setDebounced] = useState({ search: '', city: '', type: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({ search, city, type });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, city, type]);

  function load(filters: { search: string; city: string; type: string }) {
    setLoading(true);
    setError(null);
    listProperties({
      search: filters.search || undefined,
      city: filters.city || undefined,
      type: filters.type || undefined,
    })
      .then((res) => setProperties(res.items))
      .catch(() => setError('Impossible de charger les biens.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(debounced);
  }, [debounced]);

  function resetFilters() {
    setSearch('');
    setCity('');
    setType('');
  }

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <span className="section-kicker">Catalogue</span>
          <h1>Nos biens</h1>
        </div>
        {!loading && !error && (
          <span className="muted">
            {properties.length} bien{properties.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="filters animate-fade-in">
        <input
          placeholder="Rechercher un bien ou une ville…"
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
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="grid stagger">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          title="Impossible de charger les biens"
          message="Vérifiez votre connexion puis réessayez."
          onRetry={() => load(debounced)}
        />
      )}

      {!loading && !error && properties.length === 0 && (
        <EmptyState
          title="Aucun bien trouvé"
          message="Aucun bien ne correspond à votre recherche."
          action={{ label: 'Réinitialiser les filtres', onClick: resetFilters }}
        />
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="grid stagger">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}