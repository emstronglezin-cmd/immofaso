import { api } from './api';
import type { Tenant } from '../models/types';

export async function listTenants(search?: string): Promise<Tenant[]> {
  const { data } = await api.get('/tenants', {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function getTenant(id: string): Promise<Tenant> {
  const { data } = await api.get(`/tenants/${id}`);
  return data;
}

export async function createTenant(payload: Record<string, unknown>) {
  const { data } = await api.post('/tenants', payload);
  return data;
}

export async function updateTenant(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/tenants/${id}`, payload);
  return data;
}

export async function deleteTenant(id: string) {
  const { data } = await api.delete(`/tenants/${id}`);
  return data;
}