import { useCallback, useEffect, useState } from 'react';
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../services/expenses';
import { listBuildings } from '../../services/buildings';
import { MgmtLayout } from '../../components/MgmtNav';
import { Modal, ConfirmDialog, Field, TextArea } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import type { Building, Expense } from '../../models/types';
import { formatPrice } from '../../utils/format';

const CATEGORIES = [
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'ELECTRICITY', label: 'Électricité' },
  { value: 'PLUMBING', label: 'Plomberie' },
  { value: 'RENOVATION', label: 'Travaux' },
  { value: 'SECURITY', label: 'Sécurité' },
  { value: 'TAXES', label: 'Taxes' },
  { value: 'OTHER', label: 'Autre' },
];

const emptyForm = {
  title: '',
  category: 'OTHER',
  amount: '',
  date: '',
  description: '',
  buildingId: '',
};

export function Expenses() {
  const toast = useToast();
  const [items, setItems] = useState<Expense[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      listExpenses({ category: category || undefined }),
      listBuildings(),
    ])
      .then(([exps, bs]) => {
        setItems(exps.items);
        setBuildings(bs);
      })
      .catch(() => toast.error('Impossible de charger les dépenses.'))
      .finally(() => setLoading(false));
  }, [category, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const total = items.reduce((s, e) => s + e.amount, 0);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setForm({
      title: e.title,
      category: e.category,
      amount: String(e.amount),
      date: e.date.slice(0, 10),
      description: e.description || '',
      buildingId: e.buildingId || '',
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.title.trim()) {
      toast.error('Le libellé est requis.');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Le montant est requis.');
      return;
    }
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      category: form.category,
      amount: Number(form.amount),
      date: form.date || undefined,
      description: form.description || undefined,
      buildingId: form.buildingId || undefined,
    };
    try {
      if (editing) {
        await updateExpense(editing.id, payload);
        toast.success('Dépense mise à jour.');
      } else {
        await createExpense(payload);
        toast.success('Dépense enregistrée.');
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
      await deleteExpense(deleting.id);
      toast.success('Dépense supprimée.');
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
      title="Dépenses"
      kicker="Charges"
      actions={
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouvelle dépense
        </button>
      }
    >
      <div className="filters">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <span className="muted" style={{ alignSelf: 'center' }}>
          Total : <strong style={{ color: 'var(--danger)' }}>{formatPrice(total)}</strong>
        </span>
      </div>

      {loading && (
        <div className="center">
          <Spinner />
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Aucune dépense"
          message="Enregistrez vos dépenses de maintenance, travaux, taxes…"
        />
      )}

      {!loading && items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Libellé</th>
                <th>Catégorie</th>
                <th>Immeuble</th>
                <th>Montant</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <strong>{e.title}</strong>
                    {e.description && (
                      <div className="muted" style={{ fontSize: 13 }}>
                        {e.description}
                      </div>
                    )}
                  </td>
                  <td>{CATEGORIES.find((c) => c.value === e.category)?.label || e.category}</td>
                  <td>{e.building?.name || '—'}</td>
                  <td>
                    <strong style={{ color: 'var(--danger)' }}>
                      {formatPrice(e.amount)}
                    </strong>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="icon-btn" onClick={() => openEdit(e)} title="Modifier">
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => setDeleting(e)}
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
          title={editing ? 'Modifier la dépense' : 'Nouvelle dépense'}
          onClose={() => setFormOpen(false)}
        >
          <div className="form-grid">
            <Field label="Libellé *">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : Réparation toiture"
              />
            </Field>
            <Field label="Catégorie">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
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
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Immeuble">
              <select
                value={form.buildingId}
                onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
              >
                <option value="">Aucun</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              rows={2}
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
          title="Supprimer la dépense"
          message={`Voulez-vous vraiment supprimer « ${deleting.title} » ?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </MgmtLayout>
  );
}