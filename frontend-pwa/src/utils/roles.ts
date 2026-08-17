import type { User } from '../models/types';

const DASHBOARD_ROLES = ['ADMIN', 'MANAGER', 'OWNER'];

export function canAccessDashboard(user: User | null | undefined): boolean {
  if (!user || user.isGuest) return false;
  return DASHBOARD_ROLES.includes(user.role);
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Administrateur',
    MANAGER: 'Gestionnaire',
    OWNER: 'Propriétaire',
    TENANT: 'Locataire',
    GUEST: 'Invité',
  };
  return labels[role] || role;
}