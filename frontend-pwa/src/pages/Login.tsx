import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

export function Login() {
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setBusy(false);
    }
  }

  async function handleGuest() {
    setError(null);
    setBusy(true);
    try {
      await continueAsGuest();
      navigate('/properties');
    } catch {
      setError('Impossible de continuer en mode invité.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Connexion</h1>
        {error && <p className="error-text">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? <Spinner size={18} /> : 'Se connecter'}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleGuest}
          disabled={busy}
        >
          Continuer sans s'inscrire
        </button>
        <p className="muted">
          Pas encore de compte ?{' '}
          <Link to="/register">S'inscrire</Link>
        </p>
      </form>
    </div>
  );
}