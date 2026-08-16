import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

export function Register() {
  const { register } = useAuth();
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
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setBusy(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch {
      setError('Inscription impossible. Cet email est peut-être déjà utilisé.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Créer un compte</h1>
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
          />
        </label>
        <label>
          Téléphone
          <input
            type="tel"
            value={form.phone}
            onChange={update('phone')}
            autoComplete="tel"
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
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? <Spinner size={18} /> : "S'inscrire"}
        </button>
        <p className="muted">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}