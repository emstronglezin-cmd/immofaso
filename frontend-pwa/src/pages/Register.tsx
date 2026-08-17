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

export function Register() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      const msg = 'Le mot de passe doit contenir au moins 6 caractères.';
      setError(msg);
      toastError(msg);
      return;
    }
    setBusy(true);
    try {
      const u = await register(form);
      success('Compte créé avec succès !');
      navigate(canAccessDashboard(u) ? '/dashboard' : '/properties');
    } catch (err) {
      const msg = extractMessage(
        err,
        'Inscription impossible. Cet email est peut-être déjà utilisé.',
      );
      setError(msg);
      toastError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez IMMOFASO en quelques secondes.</p>
        {error && <p className="error-text">{error}</p>}
        <div className="row">
          <label>
            Prénom
            <input value={form.firstName} onChange={update('firstName')} />
          </label>
          <label>
            Nom
            <input value={form.lastName} onChange={update('lastName')} />
          </label>
        </div>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
          />
        </label>
        <label>
          Téléphone
          <input
            type="tel"
            value={form.phone}
            onChange={update('phone')}
            autoComplete="tel"
            placeholder="+226 XX XX XX XX"
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Au moins 6 caractères"
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={busy}
        >
          {busy ? <Spinner size={18} /> : "S'inscrire"}
        </button>
        <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}