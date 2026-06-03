import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib";
import { useAppContext } from "@/AppContext";
import { passwordChecks, isPasswordValid } from "@/lib/password";

async function parseResponsePayload(response) {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

function ResetPasswordPage() {
  const { language = "fr" } = useAppContext();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") || "";
    setToken(t);
  }, []);

  const copy = useMemo(
    () =>
      ({
        fr: {
          title: "Nouveau mot de passe",
          subtitle: "Choisis un nouveau mot de passe pour ton compte.",
          passwordLabel: "Nouveau mot de passe",
          confirmLabel: "Confirmer le mot de passe",
          submit: "Réinitialiser",
          loading: "Mise à jour...",
          backToLogin: "Retour à la connexion",
          mismatch: "Les mots de passe ne correspondent pas.",
          weak: "Le mot de passe ne respecte pas les critères.",
          noToken: "Lien invalide : aucun jeton fourni. Refais une demande.",
          doneTitle: "Mot de passe mis à jour ✅",
          doneBody: "Tu peux maintenant te connecter avec ton nouveau mot de passe.",
          goLogin: "Se connecter",
          error: "Une erreur est survenue.",
          reqLength: "Au moins 12 caractères",
          reqLower: "Une minuscule",
          reqUpper: "Une majuscule",
          reqDigit: "Un chiffre",
          reqSpecial: "Un caractère spécial",
        },
        en: {
          title: "New password",
          subtitle: "Choose a new password for your account.",
          passwordLabel: "New password",
          confirmLabel: "Confirm password",
          submit: "Reset password",
          loading: "Updating...",
          backToLogin: "Back to sign in",
          mismatch: "Passwords do not match.",
          weak: "Password does not meet the requirements.",
          noToken: "Invalid link: no token provided. Please request a new one.",
          doneTitle: "Password updated ✅",
          doneBody: "You can now sign in with your new password.",
          goLogin: "Sign in",
          error: "Something went wrong.",
          reqLength: "At least 12 characters",
          reqLower: "One lowercase letter",
          reqUpper: "One uppercase letter",
          reqDigit: "One digit",
          reqSpecial: "One special character",
        },
      })[language] ?? {},
    [language],
  );

  const checks = passwordChecks(password);
  const requirements = [
    { key: "length", label: copy.reqLength },
    { key: "lower", label: copy.reqLower },
    { key: "upper", label: copy.reqUpper },
    { key: "digit", label: copy.reqDigit },
    { key: "special", label: copy.reqSpecial },
  ];

  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    if (!isPasswordValid(password)) {
      setErrorMessage(copy.weak);
      return;
    }
    if (password !== confirm) {
      setErrorMessage(copy.mismatch);
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = await parseResponsePayload(response);
      if (!response.ok) {
        throw new Error(payload?.errors?.[0]?.message || payload?.message || copy.error);
      }
      setDone(true);
    } catch (error) {
      setErrorMessage(error?.message || copy.error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 text-white">
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/85 p-6 shadow-2xl backdrop-blur md:p-8">
        <a
          href="/login"
          className="text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-200"
        >
          {copy.backToLogin}
        </a>

        <h1 className="mt-6 font-['Archivo'] text-4xl text-white">{copy.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{copy.subtitle}</p>

        {done ? (
          <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-50">
            <p className="font-semibold">{copy.doneTitle}</p>
            <p className="mt-2 leading-6 text-emerald-50/90">{copy.doneBody}</p>
            <a
              href="/login"
              className="mt-4 inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/25"
            >
              {copy.goLogin}
            </a>
          </div>
        ) : !token ? (
          <div className="mt-6 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {copy.noToken}
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-200" htmlFor="reset-password">
                {copy.passwordLabel}
              </label>
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:bg-white/10"
                required
              />
            </div>

            <ul className="space-y-1 text-xs">
              {requirements.map((req) => (
                <li
                  key={req.key}
                  className={checks[req.key] ? "text-emerald-300" : "text-slate-400"}
                >
                  {checks[req.key] ? "✓" : "○"} {req.label}
                </li>
              ))}
            </ul>

            <div>
              <label className="text-sm text-slate-200" htmlFor="reset-confirm">
                {copy.confirmLabel}
              </label>
              <input
                id="reset-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/45 focus:bg-white/10"
                required
              />
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid(password) || password !== confirm}
              className="w-full rounded-full border border-cyan-300/35 bg-cyan-400/20 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? copy.loading : copy.submit}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default ResetPasswordPage;
