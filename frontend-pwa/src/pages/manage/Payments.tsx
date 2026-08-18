import { useCallback, useEffect, useState } from 'react';
import { listPayments, registerPayment, downloadReceipt } from '../../services/payments';
import { listContracts } from '../../services/contracts';
import { MgmtLayout } from '../../components/MgmtNav';
import { Modal, Field } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Contract, Payment } from '../../models/types';
import { formatPrice } from '../../utils/format';

const METHODS: Record<string, string> = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement',
  LEEKPAY: 'LeekPay',
  OTHER: 'Autre',
};

export function Payments() {
  const toast = useToast();
  const [items, setItems] = useState<Payment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    contractId: '',
    amount: '',
    method: 'MOBILE_MONEY',
  });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([listPayments({ status: status || undefined }), listContracts()])
      .then(([p, cs]) => {
        setItems(p.items);
        setContracts(cs);
      })
      .catch(() => toast.error('Impossible de charger les paiements.'))
      .finally(() => setLoading(false));
  }, [status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!form.contractId) {
      toast.error('Choisissez un contrat.');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Le montant est requis.');
      return;
    }
    setBusy(true);
    try {
      await registerPayment({
        contractId: form.contractId,
        amount: Number(form.amount),
        method: form.method,
      });
      toast.success('Paiement enregistré.');
      setPayOpen(false);
      setForm({ contractId: '', amount: '', method: 'MOBILE_MONEY' });
      load();
    } catch {
      toast.error('Erreur lors de l\'enregistrement.');
    } finally {
      setBusy(false);
    }
  }

  const total = items.reduce((s, p) => s + p.amount, 0);

  return (
    <MgmtLayout
      title="Paiements"
      kicker="Encaissements"
      actions={
        <button className="btn btn-primary" onClick={() => setPayOpen(true)}>
          + Enregistrer un paiement
        </button>
      }
    >
      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="PAID">Payé</option>
          <option value="PENDING">En attente</option>
          <option value="FAILED">Échoué</option>
        </select>
        <span className="muted" style={{ alignSelf: 'center' }}>
          Total affiché : <strong>{formatPrice(total)}</strong>
        </span>
      </div>

      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Aucun paiement"
          message="Enregistrez un paiement pour commencer le suivi."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Locataire</th>
                <th>Bien</th>
                <th>Mode</th>
                <th>Montant</th>
                <th style={{ textAlign: 'right' }}>Reçu</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>{p.contract?.tenant?.name || '—'}</td>
                  <td>{p.contract?.property?.name || '—'}</td>
                  <td>{METHODS[p.method] || p.method}</td>
                  <td>
                    <strong>{formatPrice(p.amount)}</strong>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn"
                        onClick={() => downloadReceipt(p.id).catch(() => toast.error('Reçu indisponible.'))}
                        title="Télécharger le reçu PDF"
                      >
                        📄 Télécharger
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payOpen && (
        <Modal
          title="Enregistrer un paiement"
          onClose={() => setPayOpen(false)}
        >
          <div className="form-grid">
            <Field label="Contrat *">
              <select
                value={form.contractId}
                onChange={(e) => setForm({ ...form, contractId: e.target.value })}
              >
                <option value="">Choisir…</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.reference} — {c.tenant?.name} ({formatPrice(c.rentAmount)}/mois)
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Montant (FCFA) *">
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Field>
            <Field label="Mode de paiement">
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
              >
                {Object.entries(METHODS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setPayOpen(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </Modal>
      )}
    </MgmtLayout>
  );
}