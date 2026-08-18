import { api } from './api';
import type { Property } from '../models/types';
import type { DashboardOverview } from '../models/types';

export interface PropertyFilters {
  search?: string;
  type?: string;
  status?: string;
  city?: string;
  buildingId?: string;
}

export async function listProperties(
  filters: PropertyFilters = {},
): Promise<{ items: Property[]; total: number }> {
  const { data } = await api.get('/properties', { params: filters });
  return data;
}

export async function getProperty(id: string): Promise<Property> {
  const { data } = await api.get(`/properties/${id}`);
  return data;
}

export async function createProperty(payload: Record<string, unknown>) {
  const { data } = await api.post('/properties', payload);
  return data;
}

export async function updateProperty(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/properties/${id}`, payload);
  return data;
}

export async function deleteProperty(id: string) {
  const { data } = await api.delete(`/properties/${id}`);
  return data;
}

export async function uploadPropertyImage(id: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/properties/${id}/images`, form);
  return data;
}

export async function removePropertyImage(id: string, url: string) {
  const { data } = await api.delete(`/properties/${id}/images`, {
    data: { url },
  });
  return data;
}

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  return data;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await api.get('/dashboard/overview');
  return data;
}