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

function SignupPage() {
  const { language = "fr" } = useAppContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  const copy = useMemo(
    () =>
      ({
        fr: {
          title: "Inscription",
          subtitle: "Crée ton compte pour accéder à tes achats.",
          fullNameLabel: "Nom complet",
          fullNamePlaceholder: "Jean Dupont",
          emailLabel: "Adresse email",
          emailPlaceholder: "ton.email@example.com",
          passwordLabel: "Mot de passe",
          passwordPlaceholder: "Au moins 8 caractères",
          confirmPasswordLabel: "Confirmer le mot de passe",
          confirmPasswordPlaceholder: "Confirme ton mot de passe",
          submit: "S'inscrire",
          loading: "Inscription en cours...",
          backToStore: "Retour au store",
          loginLink: "Tu as déjà un compte? Connecte-toi",
          defaultError: "Impossible de s'inscrire.",
          passwordMismatch: "Les mots de passe ne correspondent pas.",
          passwordTooShort: "Le mot de passe doit faire au moins 8 caractères.",
        },
        en: {
          title: "Sign up",
          subtitle: "Create your account to access your purchases.",
          fullNameLabel: "Full name",
          fullNamePlaceholder: "John Doe",
          emailLabel: "Email",
          emailPlaceholder: "your.email@example.com",
          passwordLabel: "Password",
          passwordPlaceholder: "At least 8 characters",
          confirmPasswordLabel: "Confirm password",
          confirmPasswordPlaceholder: "Confirm your password",
          submit: "Sign up",
          loading: "Signing up...",
          backToStore: "Back to store",
          loginLink: "Already have an account? Sign in",
          defaultError: "Unable to sign up.",
          passwordMismatch: "Passwords do not match.",
          passwordTooShort: "Password must be at least 8 characters.",
        },
      })[language] || {
        title: "Inscription",
        subtitle: "Crée ton compte pour accéder à tes achats.",
        fullNameLabel: "Nom complet",
        fullNamePlaceholder: "Jean Dupont",
        emailLabel: "Adresse email",
        emailPlaceholder: "ton.email@example.com",
        passwordLabel: "Mot de passe",
        passwordPlaceholder: "Au moins 8 caractères",
        confirmPasswordLabel: "Confirmer le mot de passe",
        confirmPasswordPlaceholder: "Confirme ton mot de passe",
        submit: "S'inscrire",
        loading: "Inscription en cours...",
        backToStore: "Retour au store",
        loginLink: "Tu as déjà un compte? Connecte-toi",
        defaultError: "Impossible de s'inscrire.",
        passwordMismatch: "Les mots de passe ne correspondent pas.",
        passwordTooShort: "Le mot de passe doit faire au moins 8 caractères.",
      },
    [language],
  );

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = copy.passwordTooShort;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = copy.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName.trim(),
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

      // Redirect to dashboard
      window.location.href = "/client-dashboard";
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
            <label className="text-sm text-slate-200" htmlFor="signup-fullname">
              {copy.fullNameLabel}
            </label>
            <input
              id="signup-fullname"
              type="text"
              value={formData.fullName}
              onChange={(event) =>
                setFormData({ ...formData, fullName: event.target.value })
              }
              placeholder={copy.fullNamePlaceholder}
              className={`mt-2 w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-white/10 ${
                errors.fullName
                  ? "border-rose-300/45 focus:border-rose-300/45"
                  : "border-white/15 focus:border-cyan-300/45"
              }`}
              required
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-rose-300">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-200" htmlFor="signup-email">
              {copy.emailLabel}
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              placeholder={copy.emailPlaceholder}
              className={`mt-2 w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-white/10 ${
                errors.email
                  ? "border-rose-300/45 focus:border-rose-300/45"
                  : "border-white/15 focus:border-cyan-300/45"
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-300">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-200" htmlFor="signup-password">
              {copy.passwordLabel}
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
              placeholder={copy.passwordPlaceholder}
              className={`mt-2 w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-white/10 ${
                errors.password
                  ? "border-rose-300/45 focus:border-rose-300/45"
                  : "border-white/15 focus:border-cyan-300/45"
              }`}
              required
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-300">{errors.password}</p>
            )}
          </div>

          <div>
            <label
              className="text-sm text-slate-200"
              htmlFor="signup-confirm-password"
            >
              {copy.confirmPasswordLabel}
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(event) =>
                setFormData({ ...formData, confirmPassword: event.target.value })
              }
              placeholder={copy.confirmPasswordPlaceholder}
              className={`mt-2 w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:bg-white/10 ${
                errors.confirmPassword
                  ? "border-rose-300/45 focus:border-rose-300/45"
                  : "border-white/15 focus:border-cyan-300/45"
              }`}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-300">
                {errors.confirmPassword}
              </p>
            )}
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
          {copy.loginLink}
          <a
            href="/login"
            className="ml-1 text-cyan-300 transition hover:text-cyan-200"
          >
            {language === "fr" ? "ici" : "here"}
          </a>
        </p>
      </section>
    </main>
  );
}

export default SignupPage;
