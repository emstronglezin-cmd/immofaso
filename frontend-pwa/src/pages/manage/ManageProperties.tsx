import { useCallback, useEffect, useState } from 'react';
import {
  listProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  removePropertyImage,
} from '../../services/properties';
import { listBuildings } from '../../services/buildings';
import { MgmtLayout } from '../../components/MgmtNav';
import { Modal, ConfirmDialog, Field, TextArea } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Building, Property } from '../../models/types';
import { formatPrice, typeLabel, statusLabel } from '../../utils/format';

const TYPES = ['APARTMENT', 'HOUSE', 'OFFICE', 'COMMERCIAL', 'LAND', 'OTHER'];
const STATUSES = ['AVAILABLE', 'RENTED', 'RESERVED', 'UNDER_MAINTENANCE', 'SOLD'];

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
  OFFICE: 'Bureau',
  COMMERCIAL: 'Boutique',
  LAND: 'Terrain',
  OTHER: 'Autre',
};

const emptyForm = {
  name: '',
  type: 'APARTMENT',
  status: 'AVAILABLE',
  price: '',
  description: '',
  address: '',
  city: '',
  area: '',
  rooms: '',
  bathrooms: '',
  pieces: '',
  floor: '',
  buildingId: '',
};

export function ManageProperties() {
  const toast = useToast();
  const [items, setItems] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      listProperties({
        search: search || undefined,
        status: status || undefined,
        buildingId: buildingFilter || undefined,
      }),
      listBuildings(),
    ])
      .then(([props, bs]) => {
        setItems(props.items);
        setBuildings(bs);
      })
      .catch(() => toast.error('Impossible de charger les biens.'))
      .finally(() => setLoading(false));
  }, [search, status, buildingFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(p: Property) {
    setEditing(p);
    setForm({
      name: p.name,
      type: p.type,
      status: p.status,
      price: String(p.price),
      description: p.description || '',
      address: p.address || '',
      city: p.city || '',
      area: p.area != null ? String(p.area) : '',
      rooms: p.rooms != null ? String(p.rooms) : '',
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
      pieces: p.pieces != null ? String(p.pieces) : '',
      floor: p.floor != null ? String(p.floor) : '',
      buildingId: p.buildingId || '',
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error('Le nom est requis.');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error('Le prix est requis.');
      return;
    }
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      price: Number(form.price),
      description: form.description || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      area: form.area ? Number(form.area) : undefined,
      rooms: form.rooms ? Number(form.rooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      pieces: form.pieces ? Number(form.pieces) : undefined,
      floor: form.floor ? Number(form.floor) : undefined,
      buildingId: form.buildingId || undefined,
    };
    try {
      if (editing) {
        await updateProperty(editing.id, payload);
        toast.success('Bien mis à jour.');
      } else {
        await createProperty(payload);
        toast.success('Bien créé.');
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
      await deleteProperty(deleting.id);
      toast.success('Bien supprimé.');
      setDeleting(null);
      load();
    } catch {
      toast.error('Suppression impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function onUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing || !e.target.files?.length) return;
    const file = e.target.files[0];
    setBusy(true);
    try {
      await uploadPropertyImage(editing.id, file);
      toast.success('Photo ajoutée.');
      const updated = await listProperties({});
      const found = updated.items.find((p) => p.id === editing.id);
      if (found) setEditing(found);
    } catch {
      toast.error('Échec de l\'ajout de la photo.');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  async function onRemoveImage(url: string) {
    if (!editing) return;
    setBusy(true);
    try {
      await removePropertyImage(editing.id, url);
      toast.success('Photo supprimée.');
      const updated = await listProperties({});
      const found = updated.items.find((p) => p.id === editing.id);
      if (found) setEditing(found);
    } catch {
      toast.error('Échec de la suppression.');
    } finally {
      setBusy(false);
    }
  }

  const images = Array.isArray(editing?.images) ? editing!.images : [];

  return (
    <MgmtLayout
      title="Biens"
      kicker="Gestion du patrimoine"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouveau bien
        </button>
      }
    >
      <div className="filters">
        <input
          placeholder="Rechercher un bien…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
        >
          <option value="">Tous les immeubles</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Aucun bien"
          message="Ajoutez un premier bien avec son prix, ses photos et son statut."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Bien</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Ville</th>
                <th>Prix</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>{typeLabel(p.type)}</td>
                  <td>
                    <span className={`badge badge-${p.status.toLowerCase()}`}>
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td>{p.city || '—'}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    <div className="actions">
                      <a
                        className="icon-btn"
                        href={`/properties/${p.id}`}
                        title="Voir"
                      >
                        👁️
                      </a>
                      <button
                        className="icon-btn"
                        onClick={() => openEdit(p)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => setDeleting(p)}
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
          title={editing ? 'Modifier le bien' : 'Nouveau bien'}
          onClose={() => setFormOpen(false)}
          wide
        >
          <div className="form-grid">
            <Field label="Nom *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex : Appartement F3"
              />
            </Field>
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Statut">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prix (FCFA) *">
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="100000"
              />
            </Field>
            <Field label="Immeuble">
              <select
                value={form.buildingId}
                onChange={(e) =>
                  setForm({ ...form, buildingId: e.target.value })
                }
              >
                <option value="">Aucun</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ville">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field label="Adresse">
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <Field label="Surface (m²)">
              <input
                type="number"
                min={0}
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
            </Field>
            <Field label="Chambres">
              <input
                type="number"
                min={0}
                value={form.rooms}
                onChange={(e) => setForm({ ...form, rooms: e.target.value })}
              />
            </Field>
            <Field label="Salles de bain">
              <input
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              />
            </Field>
            <Field label="Pièces">
              <input
                type="number"
                min={0}
                value={form.pieces}
                onChange={(e) => setForm({ ...form, pieces: e.target.value })}
              />
            </Field>
            <Field label="Étage">
              <input
                type="number"
                min={0}
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
            />
          </Field>

          {editing && (
            <div className="section" style={{ marginTop: 4 }}>
              <div className="section-head">
                <div>
                  <span className="section-kicker">Photos</span>
                  <h2 style={{ fontSize: 18 }}>Photos du bien</h2>
                </div>
                <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  📷 Ajouter une photo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={onUploadImage}
                    disabled={busy}
                  />
                </label>
              </div>
              {images.length === 0 ? (
                <p className="muted">Aucune photo pour l'instant.</p>
              ) : (
                <div className="photo-grid">
                  {images.map((img) => (
                    <div className="photo-item" key={img as string}>
                      <img src={img as string} alt="" />
                      <button
                        className="photo-remove"
                        onClick={() => onRemoveImage(img as string)}
                        disabled={busy}
                        title="Supprimer la photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
          title="Supprimer le bien"
          message={`Voulez-vous vraiment supprimer « ${deleting.name} » ?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </MgmtLayout>
  );
}