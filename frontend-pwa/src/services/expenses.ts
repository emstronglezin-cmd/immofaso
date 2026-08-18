import { api } from './api';
import type { Expense } from '../models/types';

export interface ExpenseFilters {
  search?: string;
  category?: string;
  buildingId?: string;
  propertyId?: string;
}

export async function listExpenses(
  filters: ExpenseFilters = {},
): Promise<{ items: Expense[]; total: number }> {
  const { data } = await api.get('/expenses', { params: filters });
  return data;
}

export async function createExpense(payload: Record<string, unknown>) {
  const { data } = await api.post('/expenses', payload);
  return data;
}

export async function updateExpense(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/expenses/${id}`, payload);
  return data;
}

export async function deleteExpense(id: string) {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
}