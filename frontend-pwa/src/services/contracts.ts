import { api } from './api';
import type { Contract, ContractBalance } from '../models/types';

export async function listContracts(): Promise<Contract[]> {
  const { data } = await api.get('/contracts');
  return data;
}

export async function getContract(id: string): Promise<Contract> {
  const { data } = await api.get(`/contracts/${id}`);
  return data;
}

export async function createContract(payload: Record<string, unknown>) {
  const { data } = await api.post('/contracts', payload);
  return data;
}

export async function updateContract(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.patch(`/contracts/${id}`, payload);
  return data;
}

export async function deleteContract(id: string) {
  const { data } = await api.delete(`/contracts/${id}`);
  return data;
}

export async function createRent(payload: Record<string, unknown>) {
  const { data } = await api.post('/rents', payload);
  return data;
}

export async function getContractBalance(id: string): Promise<ContractBalance> {
  const { data } = await api.get(`/payments/balance/${id}`);
  return data;
}