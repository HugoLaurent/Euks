import { useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib";
import { useAppContext } from "@/AppContext";

async function parseResponsePayload(response) {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

function ForgotPasswordPage() {
  const { language = "fr" } = useAppContext();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const copy = useMemo(
    () =>
      ({
        fr: {
          title: "Mot de passe oublié",
          subtitle: "Entre ton email, on t'envoie un lien pour le réinitialiser.",
          emailLabel: "Adresse email",
          emailPlaceholder: "ton@email.com",
          submit: "Envoyer le lien",
          loading: "Envoi...",
          backToLogin: "Retour à la connexion",
          sentTitle: "Email envoyé",
          sentBody:
            "Si un compte existe pour cette adresse, tu vas recevoir un lien de réinitialisation. Pense à vérifier tes spams. Le lien est valable 1 heure.",
          error: "Une erreur est survenue.",
        },
        en: {
          title: "Forgot password",
          subtitle: "Enter your email and we'll send you a reset link.",
          emailLabel: "Email",
          emailPlaceholder: "your@email.com",
          submit: "Send reset link",
          loading: "Sending...",
          backToLogin: "Back to sign in",
          sentTitle: "Email sent",
          sentBody:
            "If an account exists for this email, you'll get a reset link. Check your spam folder. The link is valid for 1 hour.",
          error: "Something went wrong.",
        },
      })[language] ?? {},
    [language],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = await parseResponsePayload(response);
      if (!response.ok) {
        throw new Error(payload?.errors?.[0]?.message || payload?.message || copy.error);
      }
      setSent(true);
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

        {sent ? (
          <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-50">
            <p className="font-semibold">{copy.sentTitle}</p>
            <p className="mt-2 leading-6 text-emerald-50/90">{copy.sentBody}</p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-200" htmlFor="forgot-email">
                {copy.emailLabel}
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.emailPlaceholder}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/45 focus:bg-white/10"
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
              disabled={isLoading}
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

export default ForgotPasswordPage;
