import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listProperties } from '../services/properties';
import type { Property } from '../models/types';
import { PropertyCard } from '../components/PropertyCard';
import { SkeletonCard } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { continueAsGuest, isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    listProperties({ status: 'AVAILABLE' })
      .then((res) => setProperties(res.items.slice(0, 6)))
      .catch(() => setError('Impossible de charger les biens.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleGuest() {
    try {
      await continueAsGuest();
    } finally {
      navigate('/properties');
    }
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-content">
          <span className="hero-eyebrow">Plateforme immobilière moderne</span>
          <h1>
            Gérez votre patrimoine immobilier{' '}
            <span className="hero-highlight">simplement</span>
          </h1>
          <p>
            Biens, locataires, contrats, loyers et paiements au même endroit.
          </p>
          <div className="hero-actions">
            <Link to="/properties" className="btn btn-primary btn-lg">
              Voir les biens
            </Link>
            <button className="btn btn-glass btn-lg" onClick={handleGuest}>
              Continuer sans s'inscrire
            </button>
          </div>
          {isGuest && (
            <p className="guest-hint">Mode invité actif — accès limité.</p>
          )}
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>100%</strong>
            <span>Digital</span>
          </div>
          <div className="hero-stat">
            <strong>24/7</strong>
            <span>Disponible</span>
          </div>
          <div className="hero-stat">
            <strong>XOF</strong>
            <span>Paiements</span>
          </div>
        </div>
      </section>

      <section className="section page">
        <div className="section-head">
          <div>
            <span className="section-kicker">Catalogue</span>
            <h2>Biens disponibles</h2>
          </div>
          <Link to="/properties" className="btn btn-ghost">
            Tout voir →
          </Link>
        </div>

        {loading && (
          <div className="grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {error && (
          <EmptyState
            title="Impossible de charger les biens"
            message="Vérifiez votre connexion puis réessayez."
            onRetry={() => window.location.reload()}
          />
        )}
        {!loading && !error && properties.length === 0 && (
          <EmptyState
            title="Aucun bien disponible"
            message="De nouveaux biens arrivent bientôt."
          />
        )}
        {!loading && !error && properties.length > 0 && (
          <div className="grid">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}