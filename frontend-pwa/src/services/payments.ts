import { api } from './api';
import type { Payment } from '../models/types';

export interface PaymentFilters {
  tenantId?: string;
  contractId?: string;
  propertyId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export async function listPayments(
  filters: PaymentFilters = {},
): Promise<{ items: Payment[]; total: number }> {
  const { data } = await api.get('/payments', { params: filters });
  return data;
}

export async function registerPayment(payload: {
  contractId?: string;
  rentId?: string;
  amount: number;
  method?: string;
  provider?: string;
  providerRef?: string;
}) {
  const { data } = await api.post('/payments', payload);
  return data;
}

export async function downloadReceipt(paymentId: string): Promise<void> {
  const res = await api.get(`/payments/${paymentId}/receipt`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recu-${paymentId.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}