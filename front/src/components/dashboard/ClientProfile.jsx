import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, AUTH_USER_STORAGE_KEY } from "@/lib";
import { isPasswordValid } from "@/lib/password";

const inputCls = "w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/45";

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
      <h3 className="mb-5 text-base font-black text-white">{title}</h3>
      {children}
    </div>
  );
}

async function apiJson(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function ClientProfile({ language }) {
  const t = language === "fr"
    ? { title: "Mon profil", personalInfo: "Informations", fullName: "Nom complet", email: "Email", createdAt: "Membre depuis", changePassword: "Changer le mot de passe", currentPassword: "Mot de passe actuel", newPassword: "Nouveau mot de passe", confirmPassword: "Confirmer", dangerZone: "Zone dangereuse", deleteWarning: "Cette action est irréversible.", deleteConfirmPrompt: "Saisis ton mot de passe pour confirmer.", deleteButton: "Supprimer définitivement", deleteAccount: "Supprimer le compte", save: "Enregistrer", cancel: "Annuler", saving: "Enregistrement...", deleting: "Suppression...", profileUpdated: "Profil mis à jour.", passwordUpdated: "Mot de passe mis à jour.", passwordMismatch: "Les mots de passe ne correspondent pas.", weakPassword: "Min. 12 caractères, avec majuscule, minuscule, chiffre et caractère spécial.", loading: "Chargement...", error: "Erreur." }
    : { title: "My profile", personalInfo: "Information", fullName: "Full name", email: "Email", createdAt: "Member since", changePassword: "Change password", currentPassword: "Current password", newPassword: "New password", confirmPassword: "Confirm", dangerZone: "Danger zone", deleteWarning: "This action is irreversible.", deleteConfirmPrompt: "Enter your password to confirm.", deleteButton: "Delete permanently", deleteAccount: "Delete account", save: "Save", cancel: "Cancel", saving: "Saving...", deleting: "Deleting...", profileUpdated: "Profile updated.", passwordUpdated: "Password updated.", passwordMismatch: "Passwords do not match.", weakPassword: "Min. 12 chars, with uppercase, lowercase, digit and special character.", loading: "Loading...", error: "Error." };

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [infoState, setInfoState] = useState({ saving: false, error: "", success: "" });
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwState, setPwState] = useState({ saving: false, error: "", success: "" });
  const [deletePw, setDeletePw] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteState, setDeleteState] = useState({ saving: false, error: "" });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await apiJson(`${API_BASE_URL}/account/profile`);
    if (ok) {
      const user = data?.data ?? data;
      setProfile(user); setFullName(user?.fullName ?? ""); setEmail(user?.email ?? "");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function handleInfoUpdate(e) {
    e.preventDefault();
    if (infoState.saving) return;
    setInfoState({ saving: true, error: "", success: "" });
    const updates = {};
    if (fullName !== profile?.fullName) updates.fullName = fullName;
    if (email !== profile?.email) updates.email = email;
    const { ok, data } = await apiJson(`${API_BASE_URL}/account/profile`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates),
    });
    if (!ok) { setInfoState({ saving: false, error: data?.errors?.[0]?.message || data?.message || t.error, success: "" }); return; }
    const updated = data?.user ?? { ...profile, ...updates };
    try { const s = JSON.parse(localStorage.getItem(AUTH_USER_STORAGE_KEY) || "{}"); localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify({ ...s, ...updated })); } catch { /* ignore storage errors */ }
    setProfile((p) => ({ ...p, ...updated }));
    setInfoState({ saving: false, error: "", success: t.profileUpdated });
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    if (pwState.saving) return;
    if (!isPasswordValid(newPw)) { setPwState({ saving: false, error: t.weakPassword, success: "" }); return; }
    if (newPw !== confirmPw) { setPwState({ saving: false, error: t.passwordMismatch, success: "" }); return; }
    setPwState({ saving: true, error: "", success: "" });
    const { ok, data } = await apiJson(`${API_BASE_URL}/account/profile`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    if (!ok) { setPwState({ saving: false, error: data?.errors?.[0]?.message || data?.message || t.error, success: "" }); return; }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwState({ saving: false, error: "", success: t.passwordUpdated });
  }

  async function handleDelete(e) {
    e.preventDefault();
    if (deleteState.saving || !deletePw) return;
    setDeleteState({ saving: true, error: "" });
    const { ok, data } = await apiJson(`${API_BASE_URL}/account/profile`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: deletePw }),
    });
    if (!ok) { setDeleteState({ saving: false, error: data?.errors?.[0]?.message || data?.message || t.error }); return; }
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    window.location.href = "/";
  }

  if (loading) return <p className="text-sm text-slate-400">{t.loading}</p>;

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-black text-white">{t.title}</h2>

      <Section title={t.personalInfo}>
        <form className="space-y-4" onSubmit={handleInfoUpdate}>
          <div>
            <label className="block text-sm text-slate-300">{t.fullName}</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={`mt-2 ${inputCls}`} required />
          </div>
          <div>
            <label className="block text-sm text-slate-300">{t.email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${inputCls}`} required />
          </div>
          {profile?.createdAt ? <p className="text-xs text-slate-500">{t.createdAt}: {new Date(profile.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}</p> : null}
          {infoState.error ? <p className="text-sm text-rose-300">{infoState.error}</p> : null}
          {infoState.success ? <p className="text-sm text-emerald-300">{infoState.success}</p> : null}
          <button type="submit" disabled={infoState.saving} className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:opacity-60">
            {infoState.saving ? t.saving : t.save}
          </button>
        </form>
      </Section>

      <Section title={t.changePassword}>
        <form className="space-y-4" onSubmit={handlePasswordUpdate}>
          <div>
            <label className="block text-sm text-slate-300">{t.currentPassword}</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={`mt-2 ${inputCls}`} autoComplete="current-password" required />
          </div>
          <div>
            <label className="block text-sm text-slate-300">{t.newPassword}</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={`mt-2 ${inputCls}`} autoComplete="new-password" minLength={12} required />
          </div>
          <div>
            <label className="block text-sm text-slate-300">{t.confirmPassword}</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={`mt-2 ${inputCls}`} autoComplete="new-password" required />
          </div>
          {pwState.error ? <p className="text-sm text-rose-300">{pwState.error}</p> : null}
          {pwState.success ? <p className="text-sm text-emerald-300">{pwState.success}</p> : null}
          <button type="submit" disabled={pwState.saving} className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:opacity-60">
            {pwState.saving ? t.saving : t.save}
          </button>
        </form>
      </Section>

      <div className="rounded-2xl border border-rose-300/25 bg-rose-500/8 p-5">
        <h3 className="mb-2 text-base font-black text-rose-300">{t.dangerZone}</h3>
        <p className="mb-4 text-sm text-slate-400">{t.deleteWarning}</p>
        {!showDelete ? (
          <button type="button" onClick={() => setShowDelete(true)} className="rounded-full border border-rose-300/35 bg-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/30">
            {t.deleteAccount}
          </button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-3">
            <p className="text-sm text-slate-300">{t.deleteConfirmPrompt}</p>
            <input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} className={inputCls} required />
            {deleteState.error ? <p className="text-sm text-rose-300">{deleteState.error}</p> : null}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowDelete(false); setDeletePw(""); setDeleteState({ saving: false, error: "" }); }}
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">{t.cancel}</button>
              <button type="submit" disabled={deleteState.saving}
                className="rounded-full border border-rose-300/35 bg-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/40 disabled:opacity-60">
                {deleteState.saving ? t.deleting : t.deleteButton}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default ClientProfile;
