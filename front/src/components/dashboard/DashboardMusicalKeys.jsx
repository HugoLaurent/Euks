import { useEffect, useState } from "react";
import { Edit3, Music, Plus, Save, Trash2, X } from "lucide-react";

async function parseJson(response) {
  const raw = await response.text();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return { message: raw }; }
}

function DashboardMusicalKeys({ language, API_BASE_URL, buildAuthHeaders }) {
  const copy = {
    fr: {
      title: "Clés musicales",
      subtitle: "Gestion des tonalités utilisées pour catégoriser les tracks.",
      create: "Nouvelle clé",
      edit: "Modifier",
      delete: "Supprimer",
      confirmDelete: "Supprimer cette clé musicale ?",
      save: "Enregistrer",
      saving: "Enregistrement...",
      cancel: "Annuler",
      loading: "Chargement...",
      empty: "Aucune clé musicale. Crée-en une ci-dessous.",
      namePlaceholder: "Ex: Do majeur, Am, F#m…",
      slugPlaceholder: "do-majeur (optionnel)",
      nameLabel: "Nom",
      slugLabel: "Slug (optionnel)",
    },
    en: {
      title: "Musical Keys",
      subtitle: "Manage the tonalities used to categorize tracks.",
      create: "New key",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Delete this musical key?",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      loading: "Loading...",
      empty: "No musical key yet. Create one below.",
      namePlaceholder: "E.g. C major, Am, F#m…",
      slugPlaceholder: "c-major (optional)",
      nameLabel: "Name",
      slugLabel: "Slug (optional)",
    },
  }[language] ?? { title: "Musical Keys", subtitle: "", create: "New key", edit: "Edit", delete: "Delete", confirmDelete: "Delete?", save: "Save", saving: "Saving...", cancel: "Cancel", loading: "Loading...", empty: "No keys.", namePlaceholder: "", slugPlaceholder: "", nameLabel: "Name", slugLabel: "Slug" };

  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [submitState, setSubmitState] = useState({ isLoading: false, error: "", success: "" });
  const [deletingId, setDeletingId] = useState(null);

  async function loadKeys() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/musical-keys`, { credentials: "include", headers: buildAuthHeaders() });
      const payload = await parseJson(res);
      if (!res.ok) throw new Error(payload?.message || "Unable to load musical keys.");
      const data = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setKeys(data);
    } catch (err) {
      setError(err.message || "Unable to load musical keys.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadKeys(); }, []);

  function startCreate() {
    setEditingId(null);
    setForm({ name: "", slug: "" });
    setSubmitState({ isLoading: false, error: "", success: "" });
  }

  function startEdit(key) {
    setEditingId(key.id);
    setForm({ name: key.name, slug: key.slug || "" });
    setSubmitState({ isLoading: false, error: "", success: "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", slug: "" });
    setSubmitState({ isLoading: false, error: "", success: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitState.isLoading || !form.name.trim()) return;
    setSubmitState({ isLoading: true, error: "", success: "" });

    const body = { name: form.name.trim(), ...(form.slug.trim() ? { slug: form.slug.trim() } : {}) };

    try {
      const url = editingId ? `${API_BASE_URL}/musical-keys/${editingId}` : `${API_BASE_URL}/musical-keys`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
        body: JSON.stringify(body),
      });
      const payload = await parseJson(res);
      if (!res.ok) throw new Error(payload?.message || "Unable to save musical key.");

      await loadKeys();
      startCreate();
      setSubmitState({ isLoading: false, error: "", success: editingId ? "Clé mise à jour." : "Clé créée." });
    } catch (err) {
      setSubmitState({ isLoading: false, error: err.message || "Unable to save musical key.", success: "" });
    }
  }

  async function handleDelete(key) {
    if (!window.confirm(`${copy.confirmDelete} "${key.name}"`)) return;
    setDeletingId(key.id);
    try {
      const res = await fetch(`${API_BASE_URL}/musical-keys/${key.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        const payload = await parseJson(res);
        throw new Error(payload?.message || "Unable to delete musical key.");
      }
      await loadKeys();
      if (editingId === key.id) cancelEdit();
    } catch (err) {
      setError(err.message || "Unable to delete musical key.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">{copy.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-300/35 bg-cyan-400/18 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/28"
          >
            <Plus className="h-3.5 w-3.5" />
            {copy.create}
          </button>
        </div>

        {isLoading ? <p className="mt-6 text-sm text-slate-300">{copy.loading}</p> : null}
        {error ? (
          <p className="mt-6 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</p>
        ) : null}
        {!isLoading && !error && keys.length === 0 ? (
          <p className="mt-6 text-sm text-slate-300">{copy.empty}</p>
        ) : null}

        {!isLoading && keys.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {keys.map((key) => (
              <div
                key={key.id}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 ${
                  editingId === key.id ? "border-cyan-300/35 bg-cyan-400/12" : "border-white/12 bg-white/5"
                }`}
              >
                <Music className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="text-sm font-semibold text-white">{key.name}</span>
                <span className="text-xs text-slate-400">{key.slug}</span>
                <div className="ml-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(key)}
                    className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    title={copy.edit}
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(key)}
                    disabled={deletingId === key.id}
                    className="rounded-full p-1 text-rose-400/70 transition hover:bg-rose-400/12 hover:text-rose-300 disabled:opacity-50"
                    title={copy.delete}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Create / Edit form */}
      <form
        className="rounded-2xl border border-white/10 bg-slate-900/55 p-5"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-white">
            {editingId ? copy.edit : copy.create}
          </h3>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
              {copy.cancel}
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            {copy.nameLabel}
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={copy.namePlaceholder}
              className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
              required
            />
          </label>
          <label className="text-sm text-slate-300">
            {copy.slugLabel}
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder={copy.slugPlaceholder}
              className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
            />
          </label>
        </div>

        {submitState.error ? (
          <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">{submitState.error}</p>
        ) : null}
        {submitState.success ? (
          <p className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">{submitState.success}</p>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={submitState.isLoading || !form.name.trim()}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/20 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitState.isLoading ? copy.saving : copy.save}
          </button>
        </div>
      </form>
    </section>
  );
}

export default DashboardMusicalKeys;
