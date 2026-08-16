import { useEffect, useState } from 'react';
import { listProperties } from '../services/properties';
import type { Property } from '../models/types';
import { PropertyCard } from '../components/PropertyCard';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    await continueAsGuest();
    navigate('/properties');
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <h1>Gérez votre patrimoine immobilier simplement</h1>
          <p>
            Biens, locataires, contrats, loyers et paiements au même endroit.
          </p>
          <div className="hero-actions">
            <a href="#biens" className="btn btn-primary">
              Voir les biens
            </a>
            <button className="btn btn-outline" onClick={handleGuest}>
              Continuer sans s'inscrire
            </button>
          </div>
          {isGuest && (
            <p className="guest-hint">
              Mode invité actif — certaines fonctionnalités sont limitées.
            </p>
          )}
        </div>
      </section>

      <section id="biens" className="section">
        <div className="section-head">
          <h2>Biens disponibles</h2>
          <a href="#/properties" className="btn btn-ghost">
            Tout voir
          </a>
        </div>

        {loading && (
          <div className="center">
            <Spinner />
          </div>
        )}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && (
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