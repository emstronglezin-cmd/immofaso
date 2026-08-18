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
  pieces?: number | null;
  floor?: number | null;
  amenities: unknown[];
  images: unknown[];
  ownerId?: string | null;
  buildingId?: string | null;
  building?: Building | null;
  createdAt: string;
}

export interface Building {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  description?: string | null;
  floors?: number | null;
  photos: unknown[];
  ownerId?: string | null;
  owner?: Owner | null;
  properties?: Property[];
  createdAt: string;
  stats?: {
    propertyCount: number;
    occupiedCount: number;
    occupancyRate: number;
    activeContracts: number;
    revenue: number;
    unpaid: number;
    unpaidRentsCount: number;
    expenses: number;
  };
}

export interface Owner {
  id: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface Tenant {
  id: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  contracts?: Contract[];
  createdAt: string;
}

export interface Contract {
  id: string;
  reference: string;
  propertyId: string;
  tenantId: string;
  ownerId?: string | null;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
  status: string;
  property?: Property | null;
  tenant?: Tenant | null;
  owner?: Owner | null;
  rents?: Rent[];
  createdAt: string;
}

export interface Rent {
  id: string;
  contractId: string;
  period: string;
  amount: number;
  paidAmount: number;
  remaining?: number;
  dueDate: string;
  paidAt?: string | null;
  status: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  rentId?: string | null;
  contractId?: string | null;
  amount: number;
  method: string;
  status: string;
  provider?: string | null;
  providerRef?: string | null;
  rent?: Rent | null;
  contract?: {
    tenant?: Tenant | null;
    property?: Property | null;
  } | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description?: string | null;
  receiptPath?: string | null;
  buildingId?: string | null;
  propertyId?: string | null;
  building?: Building | null;
  property?: Property | null;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  propertyId?: string | null;
  buildingId?: string | null;
  tenantId?: string | null;
  dueDate?: string | null;
  property?: Property | null;
  building?: Building | null;
  tenant?: Tenant | null;
  createdAt: string;
}

export interface ContractBalance {
  contractId: string;
  due: number;
  paid: number;
  balance: number;
  avance: number;
  dette: number;
  rents: Rent[];
}

export interface DashboardOverview {
  today: {
    collected: number;
    expected: number;
    expenses: number;
    ticketsInProgress: number;
  };
  month: {
    revenue: number;
    expenses: number;
    profit: number;
    expected: number;
    unpaid: number;
    paymentsCount: number;
  };
  year: {
    revenue: number;
    expenses: number;
    profit: number;
    occupancyRate: number;
    properties: number;
    occupied: number;
    tenants: number;
    activeContracts: number;
    growth: number;
  };
  unpaidByTenant: Array<{
    id: string;
    period: string;
    amount: number;
    paidAmount: number;
    remaining: number;
    dueDate: string;
    tenantName?: string | null;
    propertyName?: string | null;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    method: string;
    createdAt: string;
    tenantName?: string | null;
    propertyName?: string | null;
  }>;
  revenueByMonth: Array<{ month: string; value: number }>;
  expenseByMonth: Array<{ month: string; value: number }>;
  paymentsByMethod: Array<{ method: string; amount: number }>;
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