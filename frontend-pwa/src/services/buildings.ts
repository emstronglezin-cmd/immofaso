import { api } from './api';
import type { Building } from '../models/types';

export async function listBuildings(search?: string): Promise<Building[]> {
  const { data } = await api.get('/buildings', {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function getBuilding(id: string): Promise<Building> {
  const { data } = await api.get(`/buildings/${id}`);
  return data;
}

export async function createBuilding(payload: Record<string, unknown>) {
  const { data } = await api.post('/buildings', payload);
  return data;
}

export async function updateBuilding(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/buildings/${id}`, payload);
  return data;
}

export async function deleteBuilding(id: string) {
  const { data } = await api.delete(`/buildings/${id}`);
  return data;
}