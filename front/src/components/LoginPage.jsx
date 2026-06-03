import { useMemo, useState } from "react";
import { API_BASE_URL, AUTH_USER_STORAGE_KEY } from "@/lib";
import { useAppContext } from "@/AppContext";

async function parseResponsePayload(response) {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

function LoginPage() {
  const { language = "fr" } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const copy = useMemo(
    () =>
      ({
        fr: {
          title: "Connexion",
          subtitle: "Connecte-toi pour accéder à ton espace.",
          emailLabel: "Adresse email",
          emailPlaceholder: "votre@email.com",
          passwordLabel: "Mot de passe",
          passwordPlaceholder: "Ton mot de passe",
          submit: "Se connecter",
          loading: "Connexion en cours...",
          backToStore: "Retour au store",
          hintTitle: null,
          hintBody: null,
          defaultError: "Impossible de se connecter.",
          signupLink: "Tu n'as pas encore de compte ?",
          signupLinkText: "S'inscrire",
          forgotPassword: "Mot de passe oublié ?",
        },
        en: {
          title: "Sign in",
          subtitle: "Sign in to access your account.",
          emailLabel: "Email",
          emailPlaceholder: "votre@email.com",
          passwordLabel: "Password",
          passwordPlaceholder: "Your password",
          submit: "Sign in",
          loading: "Signing in...",
          backToStore: "Back to store",
          hintTitle: null,
          hintBody: null,
          defaultError: "Unable to sign in.",
          signupLink: "Don't have an account?",
          signupLinkText: "Sign up",
          forgotPassword: "Forgot password?",
        },
      })[language] || {
        title: "Connexion",
        subtitle: "Connecte-toi pour accéder à ton espace.",
        emailLabel: "Adresse email",
        emailPlaceholder: "admin@euks.local",
        passwordLabel: "Mot de passe",
        passwordPlaceholder: "Ton mot de passe",
        submit: "Se connecter",
        loading: "Connexion en cours...",
        backToStore: "Retour au store",
        hintTitle: "Comptes de dev",
        hintBody: "admin@euks.local / Admin12345!",
        defaultError: "Impossible de se connecter.",
        signupLink: "Tu n'as pas encore de compte ?",
        signupLinkText: "S'inscrire",
        forgotPassword: "Mot de passe oublié ?",
      },
    [language],
  );

  async function loginWith(quickEmail, quickPassword) {
    if (isLoading) return;
    setEmail(quickEmail);
    setPassword(quickPassword);
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: quickEmail, password: quickPassword }),
      });
      const payload = await parseResponsePayload(response);
      const authData = payload?.data ?? payload;
      if (!response.ok || !authData?.token) {
        throw new Error(payload?.message || authData?.message || copy.defaultError);
      }
      if (authData.user) {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authData.user));
      }
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("redirect") || "/";
    } catch (error) {
      setErrorMessage(error?.message || copy.defaultError);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = await parseResponsePayload(response);
      const authData = payload?.data ?? payload;

      if (!response.ok || !authData?.token) {
        throw new Error(
          payload?.message || authData?.message || copy.defaultError,
        );
      }

      // The token lives in an httpOnly cookie set by the server. We only keep
      // the non-sensitive user object to drive the logged-in UI state.
      if (authData.user) {
        localStorage.setItem(
          AUTH_USER_STORAGE_KEY,
          JSON.stringify(authData.user),
        );
      }

      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect") || "/";
      window.location.href = redirectTarget;
    } catch (error) {
      setErrorMessage(error?.message || copy.defaultError);
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
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-200"
        >
          {copy.backToStore}
        </a>

        <h1 className="mt-6 font-['Archivo'] text-4xl text-white">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{copy.subtitle}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-200" htmlFor="login-email">
              {copy.emailLabel}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={copy.emailPlaceholder}
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/45 focus:bg-white/10"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-200" htmlFor="login-password">
              {copy.passwordLabel}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={copy.passwordPlaceholder}
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/45 focus:bg-white/10"
              required
            />
            <div className="mt-2 text-right">
              <a
                href="/forgot-password"
                className="text-xs text-slate-400 transition hover:text-cyan-200"
              >
                {copy.forgotPassword}
              </a>
            </div>
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

        <p className="mt-6 text-center text-sm text-slate-400">
          {copy.signupLink}
          <a
            href="/signup"
            className="ml-1 text-cyan-300 transition hover:text-cyan-200"
          >
            {copy.signupLinkText}
          </a>
        </p>

        {/* Dev quick-login — visible en développement uniquement */}
        {import.meta.env.DEV ? (
          <div className="mt-6 space-y-2 border-t border-white/8 pt-5">
            <p className="text-center text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Accès rapide dev
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => loginWith("a@a.com", "jeleveux")}
                className="flex-1 rounded-full border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
              >
                👤 Client
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => loginWith("euks@euks.fr", "Enculer123!!!")}
                className="flex-1 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/18 disabled:opacity-50"
              >
                🎛️ Vendeur
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default LoginPage;
