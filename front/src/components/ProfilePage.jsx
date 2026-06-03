import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, AUTH_USER_STORAGE_KEY } from "@/lib";
import { useAppContext } from "@/AppContext";

const I18N = {
  fr: {
    title: "Mon Profil",
    personalInfo: "Informations personnelles",
    fullName: "Nom complet",
    email: "Adresse email",
    createdAt: "Compte créé le",
    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le nouveau mot de passe",
    dangerZone: "Zone dangereuse",
    deleteAccount: "Supprimer mon compte",
    deleteWarning: "Cette action est irréversible. Toutes tes données seront supprimées.",
    deleteConfirmPrompt: "Saisis ton mot de passe pour confirmer.",
    deleteButton: "Supprimer définitivement",
    save: "Enregistrer",
    cancel: "Annuler",
    saving: "Enregistrement...",
    deleting: "Suppression...",
    backToStore: "Retour au store",
    logout: "Se déconnecter",
    profileUpdated: "Profil mis à jour.",
    passwordUpdated: "Mot de passe mis à jour.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    loading: "Chargement...",
    error: "Une erreur est survenue.",
  },
  en: {
    title: "My Profile",
    personalInfo: "Personal information",
    fullName: "Full name",
    email: "Email address",
    createdAt: "Account created on",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    dangerZone: "Danger zone",
    deleteAccount: "Delete my account",
    deleteWarning: "This action is irreversible. All your data will be deleted.",
    deleteConfirmPrompt: "Enter your password to confirm.",
    deleteButton: "Delete permanently",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving...",
    deleting: "Deleting...",
    backToStore: "Back to store",
    logout: "Sign out",
    profileUpdated: "Profile updated.",
    passwordUpdated: "Password updated.",
    passwordMismatch: "Passwords do not match.",
    loading: "Loading...",
    error: "An error occurred.",
  },
};

async function apiJson(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
      <h2 className="mb-5 text-lg font-black text-white">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-300">{label}</label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/45";

export default function ProfilePage() {
  const { language = "fr" } = useAppContext();
  const t = I18N[language] ?? I18N.fr;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [infoState, setInfoState] = useState({ saving: false, error: "", success: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwState, setPwState] = useState({ saving: false, error: "", success: "" });

  const [deletePassword, setDeletePassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteState, setDeleteState] = useState({ saving: false, error: "" });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await apiJson(`${API_BASE_URL}/account/profile`);
    if (ok) {
      const user = data?.data ?? data;
      setProfile(user);
      setFullName(user?.fullName ?? "");
      setEmail(user?.email ?? "");
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
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!ok) {
      const msg = data?.errors?.[0]?.message || data?.message || t.error;
      setInfoState({ saving: false, error: msg, success: "" });
      return;
    }

    // Sync localStorage so the header reflects the new name/email
    const updatedUser = data?.user ?? { ...profile, ...updates };
    try {
      const stored = JSON.parse(localStorage.getItem(AUTH_USER_STORAGE_KEY) || "{}");
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify({ ...stored, ...updatedUser }));
    } catch { /* ignore */ }

    setProfile((p) => ({ ...p, ...updatedUser }));
    setInfoState({ saving: false, error: "", success: t.profileUpdated });
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    if (pwState.saving) return;
    if (newPassword !== confirmPassword) {
      setPwState({ saving: false, error: t.passwordMismatch, success: "" });
      return;
    }
    setPwState({ saving: true, error: "", success: "" });
    const { ok, data } = await apiJson(`${API_BASE_URL}/account/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!ok) {
      const msg = data?.errors?.[0]?.message || data?.message || t.error;
      setPwState({ saving: false, error: msg, success: "" });
      return;
    }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setPwState({ saving: false, error: "", success: t.passwordUpdated });
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (deleteState.saving || !deletePassword) return;
    setDeleteState({ saving: true, error: "" });
    const { ok, data } = await apiJson(`${API_BASE_URL}/account/profile`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });
    if (!ok) {
      const msg = data?.errors?.[0]?.message || data?.message || t.error;
      setDeleteState({ saving: false, error: msg });
      return;
    }
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    window.location.href = "/";
  }

  function handleLogout() {
    fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" })
      .finally(() => { localStorage.removeItem(AUTH_USER_STORAGE_KEY); window.location.href = "/"; });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        {t.loading}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 md:px-6">
          <h1 className="font-['Archivo'] text-2xl font-bold">{t.title}</h1>
          <div className="flex gap-2">
            <a href="/" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
              {t.backToStore}
            </a>
            <button type="button" onClick={handleLogout} className="rounded-full border border-rose-300/30 bg-rose-400/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/25">
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 md:px-6">

        {/* Personal info */}
        <Section title={t.personalInfo}>
          <form className="space-y-4" onSubmit={handleInfoUpdate}>
            <Field label={t.fullName}>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} required />
            </Field>
            <Field label={t.email}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
            </Field>
            {profile?.createdAt ? (
              <p className="text-xs text-slate-500">
                {t.createdAt}: {new Date(profile.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}
              </p>
            ) : null}
            {infoState.error ? <p className="text-sm text-rose-300">{infoState.error}</p> : null}
            {infoState.success ? <p className="text-sm text-emerald-300">{infoState.success}</p> : null}
            <button type="submit" disabled={infoState.saving} className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:opacity-60">
              {infoState.saving ? t.saving : t.save}
            </button>
          </form>
        </Section>

        {/* Change password */}
        <Section title={t.changePassword}>
          <form className="space-y-4" onSubmit={handlePasswordUpdate}>
            <Field label={t.currentPassword}>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} autoComplete="current-password" required />
            </Field>
            <Field label={t.newPassword}>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} autoComplete="new-password" minLength={8} required />
            </Field>
            <Field label={t.confirmPassword}>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} autoComplete="new-password" required />
            </Field>
            {pwState.error ? <p className="text-sm text-rose-300">{pwState.error}</p> : null}
            {pwState.success ? <p className="text-sm text-emerald-300">{pwState.success}</p> : null}
            <button type="submit" disabled={pwState.saving} className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:opacity-60">
              {pwState.saving ? t.saving : t.save}
            </button>
          </form>
        </Section>

        {/* Danger zone */}
        <div className="rounded-2xl border border-rose-300/25 bg-rose-500/8 p-5">
          <h2 className="mb-2 text-lg font-black text-rose-300">{t.dangerZone}</h2>
          <p className="mb-4 text-sm text-slate-400">{t.deleteWarning}</p>

          {!showDelete ? (
            <button type="button" onClick={() => setShowDelete(true)} className="rounded-full border border-rose-300/35 bg-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/30">
              {t.deleteAccount}
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <p className="text-sm text-slate-300">{t.deleteConfirmPrompt}</p>
              <Field label={t.currentPassword} error={deleteState.error}>
                <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className={inputCls} required />
              </Field>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowDelete(false); setDeletePassword(""); setDeleteState({ saving: false, error: "" }); }} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
                  {t.cancel}
                </button>
                <button type="submit" disabled={deleteState.saving} className="rounded-full border border-rose-300/35 bg-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/40 disabled:opacity-60">
                  {deleteState.saving ? t.deleting : t.deleteButton}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </main>
  );
}
