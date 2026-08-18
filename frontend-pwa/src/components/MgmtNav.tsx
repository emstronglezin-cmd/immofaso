import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/manage/buildings', label: 'Immeubles', icon: '🏢' },
  { to: '/manage/properties', label: 'Biens', icon: '🏠' },
  { to: '/manage/tenants', label: 'Locataires', icon: '👥' },
  { to: '/manage/contracts', label: 'Contrats', icon: '📄' },
  { to: '/manage/payments', label: 'Paiements', icon: '💰' },
  { to: '/manage/expenses', label: 'Dépenses', icon: '🧾' },
  { to: '/manage/maintenance', label: 'Maintenance', icon: '🔧' },
];

export function MgmtNav() {
  return (
    <aside className="mgmt-nav">
      {LINKS.map((link) => (
        <NavLink key={link.to} to={link.to}>
          <span>{link.icon}</span> {link.label}
        </NavLink>
      ))}
    </aside>
  );
}

export function MgmtLayout({
  title,
  kicker,
  actions,
  children,
}: {
  title: string;
  kicker: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mgmt-layout">
      <MgmtNav />
      <div>
        <div className="mgmt-head">
          <div>
            <span className="section-kicker">{kicker}</span>
            <h1>{title}</h1>
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}