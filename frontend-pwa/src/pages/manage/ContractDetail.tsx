import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getContract,
  getContractBalance,
  createRent,
} from '../../services/contracts';
import { registerPayment } from '../../services/payments';
import { MgmtLayout } from '../../components/MgmtNav';
import { Modal, Field } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Contract, ContractBalance } from '../../models/types';
import { formatPrice } from '../../utils/format';

const METHODS = ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'OTHER'];

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement',
  OTHER: 'Autre',
};

export function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [balance, setBalance] = useState<ContractBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [rentOpen, setRentOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'MOBILE_MONEY' });
  const [rentForm, setRentForm] = useState({
    period: '',
    amount: '',
    dueDate: '',
  });

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getContract(id), getContractBalance(id)])
      .then(([c, b]) => {
        setContract(c);
        setBalance(b);
      })
      .catch(() => {
        setContract(null);
        setBalance(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function savePayment() {
    if (!id || !payForm.amount || Number(payForm.amount) <= 0) {
      toast.error('Le montant est requis.');
      return;
    }
    setBusy(true);
    try {
      await registerPayment({
        contractId: id,
        amount: Number(payForm.amount),
        method: payForm.method,
      });
      toast.success('Paiement enregistré.');
      setPayOpen(false);
      setPayForm({ amount: '', method: 'MOBILE_MONEY' });
      load();
    } catch {
      toast.error('Erreur lors de l\'enregistrement du paiement.');
    } finally {
      setBusy(false);
    }
  }

  async function saveRent() {
    if (!id || !rentForm.period || !rentForm.dueDate) {
      toast.error('Période et date d\'échéance sont requises.');
      return;
    }
    if (!rentForm.amount || Number(rentForm.amount) <= 0) {
      toast.error('Le montant du loyer est requis.');
      return;
    }
    setBusy(true);
    try {
      await createRent({
        contractId: id,
        period: rentForm.period,
        amount: Number(rentForm.amount),
        dueDate: rentForm.dueDate,
      });
      toast.success('Loyer créé.');
      setRentOpen(false);
      setRentForm({ period: '', amount: '', dueDate: '' });
      load();
    } catch {
      toast.error('Erreur lors de la création du loyer.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <MgmtLayout title="Contrat" kicker="Détail">
        <div className="center">
          <Spinner />
        </div>
      </MgmtLayout>
    );
  }

  if (!contract || !balance) {
    return (
      <MgmtLayout title="Contrat" kicker="Détail">
        <EmptyState title="Contrat introuvable" message="Il a peut-être été supprimé." />
      </MgmtLayout>
    );
  }

  const remaining =
    balance.due > 0 ? Math.min(100, Math.round((balance.paid / balance.due) * 100)) : 0;

  return (
    <MgmtLayout
      title={contract.reference}
      kicker="Contrat"
      actions={
        <Link to="/manage/contracts" className="btn btn-ghost">
          ← Retour
        </Link>
      }
    >
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="property-title-row" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>
            {contract.property?.name} — {contract.tenant?.name}
          </h3>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Loyer : <strong>{formatPrice(contract.rentAmount)}/mois</strong> ·{' '}
          {new Date(contract.startDate).toLocaleDateString('fr-FR')} →{' '}
          {new Date(contract.endDate).toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="balance-box" style={{ marginBottom: 24 }}>
        <div className="balance-item">
          <span className="stat-label">Loyer total</span>
          <strong>{formatPrice(balance.due)}</strong>
        </div>
        <div className="balance-item">
          <span className="stat-label">Payé</span>
          <strong style={{ color: 'var(--success)' }}>
            {formatPrice(balance.paid)}
          </strong>
        </div>
        <div className="balance-item">
          <span className="stat-label">Reste</span>
          <strong style={{ color: 'var(--danger)' }}>
            {formatPrice(balance.dette)}
          </strong>
        </div>
        <div className="balance-item">
          <span className="stat-label">Avance</span>
          <strong style={{ color: 'var(--primary)' }}>
            {formatPrice(balance.avance)}
          </strong>
        </div>
      </div>

      <div className="section-head">
        <div>
          <span className="section-kicker">Échéances</span>
          <h2>Loyers</h2>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setRentOpen(true)}>
            + Créer un loyer
          </button>
          <button className="btn btn-primary" onClick={() => setPayOpen(true)}>
            💳 Enregistrer un paiement
          </button>
        </div>
      </div>

      {balance.rents.length === 0 ? (
        <EmptyState
          title="Aucun loyer"
          message="Créez les échéances de ce contrat."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Période</th>
                <th>Montant</th>
                <th>Payé</th>
                <th>Reste</th>
                <th>Échéance</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {balance.rents.map((r) => {
                const isLate =
                  r.status !== 'PAID' && new Date(r.dueDate) < new Date();
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.period}</strong>
                    </td>
                    <td>{formatPrice(r.amount)}</td>
                    <td style={{ color: 'var(--success)' }}>
                      {formatPrice(r.paidAmount)}
                    </td>
                    <td style={{ color: isLate ? 'var(--danger)' : 'var(--muted)' }}>
                      {formatPrice(r.remaining ?? 0)}
                      {isLate && ' ⚠️'}
                    </td>
                    <td>{new Date(r.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`badge badge-${r.status.toLowerCase()}`}>
                        {r.status === 'PAID'
                          ? 'Payé'
                          : r.status === 'PARTIAL'
                            ? 'Partiel'
                            : isLate
                              ? 'En retard'
                              : 'À échoir'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="section">
        <div className="section-head">
          <div>
            <span className="section-kicker">Avancement</span>
            <h2>Paiement du contrat</h2>
          </div>
        </div>
        <div className="card">
          <div className="progress">
            <span style={{ width: `${remaining}%` }} />
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {remaining}% du total couvert par les paiements.
          </p>
        </div>
      </div>

      {payOpen && (
        <Modal title="Enregistrer un paiement" onClose={() => setPayOpen(false)}>
          <div className="form-grid">
            <Field label="Montant (FCFA) *">
              <input
                type="number"
                min={0}
                value={payForm.amount}
                onChange={(e) =>
                  setPayForm({ ...payForm, amount: e.target.value })
                }
                placeholder={String(contract.rentAmount)}
              />
            </Field>
            <Field label="Mode de paiement">
              <select
                value={payForm.method}
                onChange={(e) =>
                  setPayForm({ ...payForm, method: e.target.value })
                }
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            Le montant est automatiquement réparti sur les loyers impayés les
            plus anciens. Le surplus devient une avance.
          </p>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setPayOpen(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={savePayment} disabled={busy}>
              {busy ? 'Enregistrement…' : 'Enregistrer le paiement'}
            </button>
          </div>
        </Modal>
      )}

      {rentOpen && (
        <Modal title="Créer un loyer" onClose={() => setRentOpen(false)}>
          <div className="form-grid">
            <Field label="Période *">
              <input
                value={rentForm.period}
                onChange={(e) => setRentForm({ ...rentForm, period: e.target.value })}
                placeholder="Ex : Août 2026"
              />
            </Field>
            <Field label="Montant (FCFA) *">
              <input
                type="number"
                min={0}
                value={rentForm.amount}
                onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })}
              />
            </Field>
            <Field label="Échéance *">
              <input
                type="date"
                value={rentForm.dueDate}
                onChange={(e) => setRentForm({ ...rentForm, dueDate: e.target.value })}
              />
            </Field>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setRentOpen(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={saveRent} disabled={busy}>
              {busy ? 'Création…' : 'Créer le loyer'}
            </button>
          </div>
        </Modal>
      )}
    </MgmtLayout>
  );
}