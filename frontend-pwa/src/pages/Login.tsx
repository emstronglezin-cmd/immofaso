import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/Spinner';
import { canAccessDashboard } from '../utils/roles';
import type { AxiosError } from 'axios';

function extractMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string | string[] }>;
  const raw = axiosErr?.response?.data?.message;
  if (Array.isArray(raw)) return raw[0] ?? fallback;
  return raw ?? fallback;
}

export function Login() {
  const { login, continueAsGuest } = useAuth();
  const { success, error: toastError } = useToast();
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
      const u = await login({ email, password });
      success('Connexion réussie. Bienvenue !');
      navigate(canAccessDashboard(u) ? '/dashboard' : '/properties');
    } catch (err) {
      const msg = extractMessage(err, 'Email ou mot de passe incorrect.');
      setError(msg);
      toastError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleGuest() {
    setError(null);
    setBusy(true);
    try {
      await continueAsGuest();
      success('Mode invité activé.');
      navigate('/properties');
    } catch (err) {
      const msg = extractMessage(err, 'Impossible de continuer en mode invité.');
      setError(msg);
      toastError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Connexion</h1>
        <p className="auth-subtitle">Ravi de vous revoir.</p>
        {error && <p className="error-text">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
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
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={busy}
        >
          {busy ? <Spinner size={18} /> : 'Se connecter'}
        </button>

        <div className="auth-divider">ou</div>

        <button
          type="button"
          className="btn btn-outline btn-block"
          onClick={handleGuest}
          disabled={busy}
        >
          Continuer sans s'inscrire
        </button>

        <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>
          Pas encore de compte ?{' '}
          <Link to="/register">S'inscrire</Link>
        </p>
      </form>
    </div>
  );
}