import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from '../../services/buildings';
import { MgmtLayout } from '../../components/MgmtNav';
import { Modal, ConfirmDialog, Field, TextArea } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Building } from '../../models/types';
import { formatPrice } from '../../utils/format';

const emptyForm = {
  name: '',
  address: '',
  city: '',
  description: '',
  floors: '',
};

export function Buildings() {
  const toast = useToast();
  const [items, setItems] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [deleting, setDeleting] = useState<Building | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setLoading(true);
    listBuildings(search || undefined)
      .then(setItems)
      .catch(() => toast.error('Impossible de charger les immeubles.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(b: Building) {
    setEditing(b);
    setForm({
      name: b.name,
      address: b.address || '',
      city: b.city || '',
      description: b.description || '',
      floors: b.floors != null ? String(b.floors) : '',
    });
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
      address: form.address || undefined,
      city: form.city || undefined,
      description: form.description || undefined,
      floors: form.floors ? Number(form.floors) : undefined,
    };
    try {
      if (editing) {
        await updateBuilding(editing.id, payload);
        toast.success('Immeuble mis à jour.');
      } else {
        await createBuilding(payload);
        toast.success('Immeuble créé.');
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
      await deleteBuilding(deleting.id);
      toast.success('Immeuble supprimé.');
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
      title="Immeubles"
      kicker="Patrimoine"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouvel immeuble
        </button>
      }
    >
      <div className="filters">
        <input
          placeholder="Rechercher un immeuble…"
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
          title="Aucun immeuble"
          message="Créez votre premier immeuble pour commencer à gérer votre patrimoine."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="grid stagger">
          {items.map((b) => (
            <div key={b.id} className="card animate-fade-up">
              <div className="property-title-row">
                <Link to={`/manage/buildings/${b.id}`} className="back-link">
                  <h3 style={{ margin: 0 }}>{b.name}</h3>
                </Link>
              </div>
              <p className="property-city">
                📍 {b.city || b.address || 'Adresse non renseignée'}
              </p>
              <p className="muted" style={{ fontSize: 13, minHeight: 20 }}>
                {b.description?.slice(0, 90)}
              </p>
              <div className="property-meta" style={{ marginBottom: 10 }}>
                <span>🛏 {b.stats?.propertyCount ?? 0} logements</span>
                <span>
                  📈 Taux d'occupation{' '}
                  {b.stats?.occupancyRate ?? 0}%
                </span>
              </div>
              <div className="property-meta" style={{ marginBottom: 14 }}>
                <span>
                  💰 Revenus :{' '}
                  <strong style={{ color: 'var(--primary)' }}>
                    {formatPrice(b.stats?.revenue ?? 0)}
                  </strong>
                </span>
                <span>
                  ⚠️ Impayés :{' '}
                  <strong style={{ color: 'var(--danger)' }}>
                    {formatPrice(b.stats?.unpaid ?? 0)}
                  </strong>
                </span>
              </div>
              <div className="actions" style={{ justifyContent: 'flex-start' }}>
                <Link
                  to={`/manage/buildings/${b.id}`}
                  className="btn btn-outline"
                  style={{ padding: '8px 14px', fontSize: 13 }}
                >
                  Voir détails
                </Link>
                <button
                  className="icon-btn"
                  onClick={() => openEdit(b)}
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  className="icon-btn danger"
                  onClick={() => setDeleting(b)}
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <Modal
          title={editing ? 'Modifier l\'immeuble' : 'Nouvel immeuble'}
          onClose={() => setFormOpen(false)}
        >
          <div className="form-grid">
            <Field label="Nom *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex : Résidence Kalgondé"
              />
            </Field>
            <Field label="Ville">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ouagadougou"
              />
            </Field>
            <Field label="Adresse">
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <Field label="Nombre d'étages">
              <input
                type="number"
                min={0}
                value={form.floors}
                onChange={(e) => setForm({ ...form, floors: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              rows={3}
            />
          </Field>
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
          title="Supprimer l'immeuble"
          message={`Voulez-vous vraiment supprimer « ${deleting.name} » ? Les biens associés seront conservés mais détachés de cet immeuble.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </MgmtLayout>
  );
}