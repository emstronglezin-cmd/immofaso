import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listContracts,
  createContract,
  updateContract,
  deleteContract,
} from '../../services/contracts';
import { listProperties } from '../../services/properties';
import { listTenants } from '../../services/tenants';
import { MgmtLayout } from '../../components/MgmtNav';
import { Modal, ConfirmDialog, Field } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Contract, Property, Tenant } from '../../models/types';
import { formatPrice } from '../../utils/format';

const emptyForm = {
  tenantId: '',
  propertyId: '',
  rentAmount: '',
  deposit: '',
  startDate: '',
  endDate: '',
  status: 'ACTIVE',
};

function statusBadge(c: Contract) {
  const cls =
    c.status === 'ACTIVE'
      ? 'badge-available'
      : c.status === 'EXPIRED'
        ? 'badge-sold'
        : c.status === 'TERMINATED'
          ? 'badge-under_maintenance'
          : 'badge-waiting';
  const label =
    c.status === 'ACTIVE'
      ? 'Actif'
      : c.status === 'EXPIRED'
        ? 'Expiré'
        : c.status === 'TERMINATED'
          ? 'Résilié'
          : 'En attente';
  return (
    <span className={`badge ${cls}`}>{label}</span>
  );
}

export function Contracts() {
  const toast = useToast();
  const [items, setItems] = useState<Contract[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState<Contract | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([listContracts(), listProperties({}), listTenants()])
      .then(([cs, props, tens]) => {
        setItems(cs);
        setProperties(props.items);
        setTenants(tens);
      })
      .catch(() => toast.error('Impossible de charger les contrats.'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(c: Contract) {
    setEditing(c);
    setForm({
      tenantId: c.tenantId,
      propertyId: c.propertyId,
      rentAmount: String(c.rentAmount),
      deposit: String(c.deposit),
      startDate: c.startDate.slice(0, 10),
      endDate: c.endDate.slice(0, 10),
      status: c.status,
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.tenantId || !form.propertyId) {
      toast.error('Locataire et bien sont requis.');
      return;
    }
    if (!form.rentAmount || Number(form.rentAmount) <= 0) {
      toast.error('Le montant du loyer est requis.');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Les dates sont requises.');
      return;
    }
    setBusy(true);
    const payload = {
      tenantId: form.tenantId,
      propertyId: form.propertyId,
      rentAmount: Number(form.rentAmount),
      deposit: form.deposit ? Number(form.deposit) : 0,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
    };
    try {
      if (editing) {
        await updateContract(editing.id, payload);
        toast.success('Contrat mis à jour.');
      } else {
        await createContract(payload);
        toast.success('Contrat créé.');
      }
      setFormOpen(false);
      load();
    } catch {
      toast.error('Erreur lors de l\'enregistrement.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteContract(deleting.id);
      toast.success('Contrat supprimé.');
      setDeleting(null);
      load();
    } catch {
      toast.error('Suppression impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <MgmtLayout
      title="Contrats"
      kicker="Location"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouveau contrat
        </button>
      }
    >
      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Aucun contrat"
          message="Créez un contrat entre un locataire et un bien."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Locataire</th>
                <th>Bien</th>
                <th>Loyer</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/manage/contracts/${c.id}`}>
                      <strong>{c.reference}</strong>
                    </Link>
                  </td>
                  <td>{c.tenant?.name || '—'}</td>
                  <td>{c.property?.name || '—'}</td>
                  <td>{formatPrice(c.rentAmount)}</td>
                  <td>{statusBadge(c)}</td>
                  <td>
                    <div className="actions">
                      <Link
                        to={`/manage/contracts/${c.id}`}
                        className="icon-btn"
                        title="Voir"
                      >
                        👁️
                      </Link>
                      <button
                        className="icon-btn"
                        onClick={() => openEdit(c)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => setDeleting(c)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <Modal
          title={editing ? 'Modifier le contrat' : 'Nouveau contrat'}
          onClose={() => setFormOpen(false)}
        >
          <div className="form-grid">
            <Field label="Locataire *">
              <select
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
              >
                <option value="">Choisir…</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bien *">
              <select
                value={form.propertyId}
                onChange={(e) =>
                  setForm({ ...form, propertyId: e.target.value })
                }
              >
                <option value="">Choisir…</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Loyer mensuel (FCFA) *">
              <input
                type="number"
                min={0}
                value={form.rentAmount}
                onChange={(e) =>
                  setForm({ ...form, rentAmount: e.target.value })
                }
              />
            </Field>
            <Field label="Caution (FCFA)">
              <input
                type="number"
                min={0}
                value={form.deposit}
                onChange={(e) => setForm({ ...form, deposit: e.target.value })}
              />
            </Field>
            <Field label="Début *">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </Field>
            <Field label="Fin *">
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
            <Field label="Statut">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">Actif</option>
                <option value="PENDING">En attente</option>
                <option value="EXPIRED">Expiré</option>
                <option value="TERMINATED">Résilié</option>
              </select>
            </Field>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setFormOpen(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Supprimer le contrat"
          message={`Voulez-vous vraiment supprimer le contrat « ${deleting.reference} » ?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </MgmtLayout>
  );
}