import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessDashboard } from '../utils/roles';

const MGMT_LINKS = [
  { to: '/manage/buildings', label: 'Immeubles' },
  { to: '/manage/properties', label: 'Biens' },
  { to: '/manage/tenants', label: 'Locataires' },
  { to: '/manage/contracts', label: 'Contrats' },
  { to: '/manage/payments', label: 'Paiements' },
  { to: '/manage/expenses', label: 'Dépenses' },
  { to: '/manage/maintenance', label: 'Maintenance' },
];

export function Navbar() {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mgmtOpen, setMgmtOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
    setMgmtOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setOpen(false);
    setMgmtOpen(false);
  }

  const showDashboard = !isGuest && user != null && canAccessDashboard(user);

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={closeMenu}>
        <span className="brand-mark">IM</span> IMMOFASO
      </Link>

      <button
        className="nav-burger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
      >
        {open ? '✕' : '☰'}
      </button>

      <div className={`nav-links${open ? ' open' : ''}`}>
        <NavLink to="/" end onClick={closeMenu}>
          Accueil
        </NavLink>
        <NavLink to="/properties" onClick={closeMenu}>
          Biens
        </NavLink>
        {showDashboard && (
          <>
            <NavLink to="/dashboard" onClick={closeMenu}>
              Tableau de bord
            </NavLink>
            <div className={`nav-mgmt${mgmtOpen ? ' open' : ''}`}>
              <button
                className="nav-mgmt-btn"
                onClick={() => setMgmtOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={mgmtOpen}
              >
                Gestion <span className="caret">▾</span>
              </button>
              <div className="nav-mgmt-panel">
                {MGMT_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} onClick={closeMenu}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`nav-actions${open ? ' open' : ''}`}>
        {user ? (
          <>
            {isGuest && <span className="badge badge-guest">Invité</span>}
            {!isGuest && (
              <span className="user-chip">{user.firstName || user.email}</span>
            )}
            <button className="btn btn-ghost" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="btn btn-ghost"
              onClick={closeMenu}
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
              onClick={closeMenu}
            >
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
