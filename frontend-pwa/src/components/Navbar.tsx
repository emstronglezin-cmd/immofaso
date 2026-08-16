import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">IM</span> IMMOFASO
      </Link>
      <div className="nav-links">
        <NavLink to="/" end>
          Accueil
        </NavLink>
        <NavLink to="/properties">Biens</NavLink>
        {!isGuest && (
          <NavLink to="/dashboard">Tableau de bord</NavLink>
        )}
      </div>
      <div className="nav-actions">
        {user ? (
          <>
            {isGuest && <span className="badge badge-guest">Invité</span>}
            {!isGuest && (
              <span className="user-chip">
                {user.firstName || user.email}
              </span>
            )}
            <button className="btn btn-ghost" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              Connexion
            </Link>
            <Link to="/register" className="btn btn-primary">
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}