import { useCallback, useEffect, useState } from 'react';
import {
  listTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../../services/maintenance';
import { listProperties } from '../../services/properties';
import { listTenants } from '../../services/tenants';
import { MgmtLayout } from '../../components/MgmtNav';
import { Modal, ConfirmDialog, Field, TextArea } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { MaintenanceTicket, Property, Tenant } from '../../models/types';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['NEW', 'IN_PROGRESS', 'WAITING', 'DONE'];

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouveau',
  IN_PROGRESS: 'En cours',
  WAITING: 'En attente',
  DONE: 'Terminé',
};

const emptyForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'NEW',
  propertyId: '',
  tenantId: '',
};

export function Maintenance() {
  const toast = useToast();
  const [items, setItems] = useState<MaintenanceTicket[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<MaintenanceTicket | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      listTickets({ status: status || undefined }),
      listProperties({}),
      listTenants(),
    ])
      .then(([ts, props, tens]) => {
        setItems(ts.items);
        setProperties(props.items);
        setTenants(tens);
      })
      .catch(() => toast.error('Impossible de charger les tickets.'))
      .finally(() => setLoading(false));
  }, [status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!form.title.trim()) {
      toast.error('Le titre est requis.');
      return;
    }
    setBusy(true);
    try {
      await createTicket({
        title: form.title.trim(),
        description: form.description || undefined,
        priority: form.priority,
        status: form.status,
        propertyId: form.propertyId || undefined,
        tenantId: form.tenantId || undefined,
      });
      toast.success('Ticket créé.');
      setFormOpen(false);
      setForm(emptyForm);
      load();
    } catch {
      toast.error('Erreur lors de la création du ticket.');
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(ticket: MaintenanceTicket, next: string) {
    try {
      await updateTicket(ticket.id, { status: next });
      load();
    } catch {
      toast.error('Impossible de mettre à jour le statut.');
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteTicket(deleting.id);
      toast.success('Ticket supprimé.');
      setDeleting(null);
      load();
    } catch {
      toast.error('Suppression impossible.');
    } finally {
      setBusy(false);
    }
  }

  const inProgress = items.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <MgmtLayout
      title="Maintenance"
      kicker="Travaux"
      actions={
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          + Nouveau ticket
        </button>
      }
    >
      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <span className="muted" style={{ alignSelf: 'center' }}>
          En cours : <strong>{inProgress}</strong>
        </span>
      </div>

      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Aucun ticket"
          message="Créez un ticket de maintenance : plomberie, électricité, peinture…"
        />
      )}

      {!loading && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Bien</th>
                <th>Locataire</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.title}</strong>
                    {t.description && (
                      <div className="muted" style={{ fontSize: 13 }}>
                        {t.description.slice(0, 60)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${t.priority.toLowerCase()}`}>
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                  </td>
                  <td>
                    <select
                      value={t.status}
                      onChange={(e) => changeStatus(t, e.target.value)}
                      style={{ padding: '6px 8px', margin: 0, fontSize: 13 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{t.property?.name || '—'}</td>
                  <td>{t.tenant?.name || '—'}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn danger"
                        onClick={() => setDeleting(t)}
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
        <Modal title="Nouveau ticket de maintenance" onClose={() => setFormOpen(false)}>
          <div className="form-grid">
            <Field label="Titre *">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : Fuite d'eau salle de bain"
              />
            </Field>
            <Field label="Priorité">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bien">
              <select
                value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
              >
                <option value="">Aucun</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Locataire">
              <select
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
              >
                <option value="">Aucun</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
            />
          </Field>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setFormOpen(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>
              {busy ? 'Création…' : 'Créer le ticket'}
            </button>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Supprimer le ticket"
          message={`Voulez-vous vraiment supprimer « ${deleting.title} » ?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </MgmtLayout>
  );
}