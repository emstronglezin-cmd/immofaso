import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listTenants,
  createTenant,
  updateTenant,
  deleteTenant,
} from '../../services/tenants';
import { MgmtLayout } from '../../components/MgmtNav';
import { Modal, ConfirmDialog, Field } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Tenant } from '../../models/types';

const emptyForm = { name: '', email: '', phone: '' };

export function Tenants() {
  const toast = useToast();
  const [items, setItems] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [deleting, setDeleting] = useState<Tenant | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    listTenants(search || undefined)
      .then(setItems)
      .catch(() => toast.error('Impossible de charger les locataires.'))
      .finally(() => setLoading(false));
  }, [search, toast]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(t: Tenant) {
    setEditing(t);
    setForm({ name: t.name, email: t.email || '', phone: t.phone || '' });
    setFormOpen(true);
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error('Le nom est requis.');
      return;
    }
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      email: form.email || undefined,
      phone: form.phone || undefined,
    };
    try {
      if (editing) {
        await updateTenant(editing.id, payload);
        toast.success('Locataire mis à jour.');
      } else {
        await createTenant(payload);
        toast.success('Locataire créé.');
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
      await deleteTenant(deleting.id);
      toast.success('Locataire supprimé.');
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
      title="Locataires"
      kicker="Gestion des occupants"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouveau locataire
        </button>
      }
    >
      <div className="filters">
        <input
          placeholder="Rechercher un locataire…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Aucun locataire"
          message="Ajoutez un locataire puis créez son contrat."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Locataire</th>
                <th>Téléphone</th>
                <th>Contrats actifs</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/manage/tenants/${t.id}`}>
                      <strong>{t.name}</strong>
                    </Link>
                    {t.email && (
                      <div className="muted" style={{ fontSize: 13 }}>
                        {t.email}
                      </div>
                    )}
                  </td>
                  <td>{t.phone || '—'}</td>
                  <td>
                    {t.contracts?.filter((c) => c.status === 'ACTIVE').length ??
                      0}
                  </td>
                  <td>
                    <div className="actions">
                      <Link
                        to={`/manage/tenants/${t.id}`}
                        className="icon-btn"
                        title="Voir"
                      >
                        👁️
                      </Link>
                      <button
                        className="icon-btn"
                        onClick={() => openEdit(t)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
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
        <Modal
          title={editing ? 'Modifier le locataire' : 'Nouveau locataire'}
          onClose={() => setFormOpen(false)}
        >
          <div className="form-grid">
            <Field label="Nom *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nom et prénom"
              />
            </Field>
            <Field label="Téléphone">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+226 00 00 00 00"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
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
          title="Supprimer le locataire"
          message={`Voulez-vous vraiment supprimer « ${deleting.name} » ?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </MgmtLayout>
  );
}