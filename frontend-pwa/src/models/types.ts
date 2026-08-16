export interface User {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: string;
  isGuest?: boolean;
  active?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string | null;
  user: User;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  price: number;
  area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  images: unknown[];
  ownerId?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  properties: number;
  availableProperties: number;
  tenants: number;
  owners: number;
  contracts: number;
  activeContracts: number;
  revenue: { collected: number; pending: number };
  pendingRents: number;
  occupancyRate: number;
  recentPayments: Array<Record<string, unknown>>;
}