import { api } from './api';
import type { MaintenanceTicket } from '../models/types';

export interface TicketFilters {
  search?: string;
  status?: string;
  priority?: string;
  buildingId?: string;
  propertyId?: string;
}

export async function listTickets(
  filters: TicketFilters = {},
): Promise<{ items: MaintenanceTicket[]; total: number }> {
  const { data } = await api.get('/maintenance', { params: filters });
  return data;
}

export async function createTicket(payload: Record<string, unknown>) {
  const { data } = await api.post('/maintenance', payload);
  return data;
}

export async function updateTicket(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/maintenance/${id}`, payload);
  return data;
}

export async function deleteTicket(id: string) {
  const { data } = await api.delete(`/maintenance/${id}`);
  return data;
}