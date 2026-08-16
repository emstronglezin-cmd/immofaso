import { api } from './api';
import type { Property } from '../models/types';

export interface PropertyFilters {
  search?: string;
  type?: string;
  status?: string;
  city?: string;
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

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  return data;
}