import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Edit3, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import {
  createLicense,
  deleteLicense,
  fetchLicenses,
  isLoggedIn,
  updateLicense,
} from "@/lib";

const AUDIO_FORMATS = ["mp3", "wav"];
const TRACK_SEPARATIONS = ["full_mix", "stems"];
const TEMPLATE_CATEGORIES = [
  ["basic", "Basic"],
  ["premium", "Premium"],
  ["premium_plus", "Premium Plus"],
  ["exclusive", "Exclusive"],
];

const RIGHT_FLAGS = [
  ["allowVideoClips", "Video clips"],
  ["allowLivePerformance", "Live"],
  ["allowRadioAirplay", "Radio"],
  ["allowTelevision", "TV"],
  ["allowRemix", "Remix"],
  ["allowMonetization", "Monetization"],
  ["allowContentId", "Content ID"],
];

const INITIAL_FORM = {
  title: "",
  description: "",
  priceEuro: "",
  isActive: true,
  isTemplate: true,
  templateCategory: "basic",
  isPaypalEnabled: true,
  audioFormats: ["mp3", "wav"],
  trackSeparation: "stems",
  maxStreams: "",
  maxSales: "",
  radioStations: "",
  allowVideoClips: true,
  videoClipsLimit: "1",
  allowLivePerformance: true,
  allowRadioAirplay: true,
  allowTelevision: false,
  allowRemix: false,
  allowMonetization: false,
  allowContentId: false,
  additionalTerms: "",
};

function toArrayPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function nullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function parseEuroToCents(value, { allowZero = false } = {}) {
  const normalized = String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!normalized) {
    return null;
  }

  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount) || amount < 0 || (!allowZero && amount === 0)) {
    return null;
  }

  return Math.round(amount * 100);
}

function formatCentsToEuroInput(cents) {
  const amount = Number(cents);

  if (!Number.isFinite(amount)) {
    return "";
  }

  return (amount / 100).toFixed(2);
}

function formatPriceLabel(cents) {
  const amount = Number(cents);

  if (!Number.isFinite(amount)) {
    return "-";
  }

  return `${(amount / 100).toFixed(2)} EUR`;
}

function formatNumberLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "no limit";
  }

  return new Intl.NumberFormat("fr-FR").format(Number(value));
}

function getCategoryLabel(value) {
  return TEMPLATE_CATEGORIES.find(([category]) => category === value)?.[1] ?? "Custom";
}

function toFormValue(license) {
  return {
    ...INITIAL_FORM,
    ...license,
    audioFormats: license.audioFormats || [],
    priceEuro: formatCentsToEuroInput(license.priceCents),
    maxStreams: license.maxStreams ?? "",
    maxSales: license.maxSales ?? "",
    radioStations: license.radioStations ?? "",
    videoClipsLimit: license.videoClipsLimit ?? "",
    additionalTerms: license.additionalTerms ?? "",
  };
}

function formToPayload(form) {
  const { priceEuro, ...licenseFields } = form;

  return {
    ...licenseFields,
    priceCents: parseEuroToCents(priceEuro, { allowZero: true }) ?? 0,
    maxStreams: nullableNumber(form.maxStreams),
    maxSales: nullableNumber(form.maxSales),
    radioStations: nullableNumber(form.radioStations),
    videoClipsLimit: nullableNumber(form.videoClipsLimit),
    description: form.description.trim() || null,
    additionalTerms: form.additionalTerms.trim() || null,
  };
}

function validateForm(form) {
  const errors = [];
  const priceCents = parseEuroToCents(form.priceEuro, { allowZero: true });

  if (!form.title.trim() || form.title.length > 160) {
    errors.push("Title is required and must stay under 160 characters.");
  }

  if (priceCents === null) {
    errors.push("Price must be a valid amount.");
  }

  if (form.isPaypalEnabled && (!priceCents || priceCents <= 0)) {
    errors.push("Paid licenses must have a price greater than 0.");
  }

  if (form.audioFormats.length === 0 && form.isPaypalEnabled) {
    errors.push("Paid licenses must include at least one audio format.");
  }

  return errors;
}

function ToggleButton({ isActive, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
        isActive
          ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100"
          : "border-white/12 bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {isActive ? <Check className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}

function LicenseManager({ language = "fr" }) {
  const [licenses, setLicenses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [templatesOnly, setTemplatesOnly] = useState(false);
  const [quoteOnly, setQuoteOnly] = useState(false);
  const [editingLicenseId, setEditingLicenseId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitState, setSubmitState] = useState({
    isLoading: false,
    error: "",
    success: "",
  });

  const copy = useMemo(
    () =>
      language === "fr"
        ? {
            title: "Licences",
            subtitle: "Gestion des paliers de licence affichés dans le checkout.",
            refresh: "Rafraichir",
            create: "Nouvelle licence",
            edit: "Modifier",
            duplicate: "Dupliquer",
            remove: "Supprimer",
            filters: {
              templates: "Templates",
              active: "Actives",
              quote: "Negociation",
            },
            loading: "Chargement des licences...",
            empty: "Aucune licence ne correspond aux filtres.",
            submit: "Enregistrer",
            saving: "Enregistrement...",
            cancel: "Annuler",
            price: "Prix (EUR)",
            pricePlaceholder: "Ex: 29,90",
            paymentMode: "Paiement",
            quoteLabel: "Negociation",
            paidLabel: "Payant",
            deleteConfirm: "Supprimer cette licence ?",
            tokenRequired: "Tu dois etre connecté pour modifier les licences.",
          }
        : {
            title: "Licenses",
            subtitle: "Manage the license tiers shown in checkout.",
            refresh: "Refresh",
            create: "New license",
            edit: "Edit",
            duplicate: "Duplicate",
            remove: "Delete",
            filters: {
              templates: "Templates",
              active: "Active",
              quote: "Quote only",
            },
            loading: "Loading licenses...",
            empty: "No license matches the filters.",
            submit: "Save",
            saving: "Saving...",
            cancel: "Cancel",
            price: "Price (EUR)",
            pricePlaceholder: "Ex: 29.99",
            paymentMode: "Payment",
            quoteLabel: "Quote",
            paidLabel: "Paid",
            deleteConfirm: "Delete this license?",
            tokenRequired: "You must be signed in to edit licenses.",
          },
    [language],
  );

  const validationErrors = useMemo(() => validateForm(form), [form]);

  async function loadLicenses({ showLoading = true } = {}) {
    if (showLoading) {
      setStatus("loading");
      setError("");
    }

    try {
      const payload = await fetchLicenses({
        activeOnly,
        isTemplate: templatesOnly,
      });
      const nextLicenses = toArrayPayload(payload).filter((license) =>
        quoteOnly ? !license.isPaypalEnabled : true,
      );

      setLicenses(nextLicenses);
      setStatus("ready");
    } catch (loadError) {
      setLicenses([]);
      setStatus("error");
      setError(loadError.message || "Unable to load licenses.");
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function syncLicenses() {
      try {
        const payload = await fetchLicenses({
          activeOnly,
          isTemplate: templatesOnly,
        });

        if (isCancelled) {
          return;
        }

        const nextLicenses = toArrayPayload(payload).filter((license) =>
          quoteOnly ? !license.isPaypalEnabled : true,
        );
        setLicenses(nextLicenses);
        setStatus("ready");
        setError("");
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        setLicenses([]);
        setStatus("error");
        setError(loadError.message || "Unable to load licenses.");
      }
    }

    syncLicenses();

    return () => {
      isCancelled = true;
    };
  }, [activeOnly, quoteOnly, templatesOnly]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function toggleListValue(field, value) {
    setForm((previous) => {
      const currentValues = previous[field] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...previous,
        [field]: nextValues,
      };
    });
  }

  function startCreate() {
    setEditingLicenseId(null);
    setForm(INITIAL_FORM);
    setSubmitState({ isLoading: false, error: "", success: "" });
  }

  function startEdit(license) {
    setEditingLicenseId(license.id);
    setForm(toFormValue(license));
    setSubmitState({ isLoading: false, error: "", success: "" });
  }

  function startDuplicate(license) {
    setEditingLicenseId(null);
    setForm({
      ...toFormValue(license),
      title: `${license.title} Copy`,
      isTemplate: false,
    });
    setSubmitState({ isLoading: false, error: "", success: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitState.isLoading) {
      return;
    }

    if (!isLoggedIn()) {
      setSubmitState({
        isLoading: false,
        error: copy.tokenRequired,
        success: "",
      });
      return;
    }

    if (validationErrors.length > 0) {
      setSubmitState({
        isLoading: false,
        error: validationErrors[0],
        success: "",
      });
      return;
    }

    setSubmitState({ isLoading: true, error: "", success: "" });

    try {
      const payload = formToPayload(form);

      if (editingLicenseId) {
        await updateLicense(editingLicenseId, payload);
      } else {
        await createLicense(payload);
      }

      await loadLicenses();
      setSubmitState({
        isLoading: false,
        error: "",
        success: editingLicenseId ? "License updated." : "License created.",
      });
    } catch (submitError) {
      setSubmitState({
        isLoading: false,
        error: submitError.message || "Unable to save license.",
        success: "",
      });
    }
  }

  async function handleDelete(license) {
    if (!window.confirm(copy.deleteConfirm)) {
      return;
    }

    if (!isLoggedIn()) {
      setSubmitState({
        isLoading: false,
        error: copy.tokenRequired,
        success: "",
      });
      return;
    }

    try {
      await deleteLicense(license.id);
      await loadLicenses();
    } catch (deleteError) {
      setSubmitState({
        isLoading: false,
        error: deleteError.message || "Unable to delete license.",
        success: "",
      });
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

          <div className="flex flex-wrap gap-2">
            <ToggleButton
              isActive={templatesOnly}
              label={copy.filters.templates}
              onClick={() => setTemplatesOnly((value) => !value)}
            />
            <ToggleButton
              isActive={activeOnly}
              label={copy.filters.active}
              onClick={() => setActiveOnly((value) => !value)}
            />
            <ToggleButton
              isActive={quoteOnly}
              label={copy.filters.quote}
              onClick={() => setQuoteOnly((value) => !value)}
            />
            <button
              type="button"
              onClick={loadLicenses}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {copy.refresh}
            </button>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/18 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/28"
            >
              <Plus className="h-3.5 w-3.5" />
              {copy.create}
            </button>
          </div>
        </div>

        {status === "loading" ? (
          <p className="mt-6 text-sm text-slate-300">{copy.loading}</p>
        ) : null}

        {status === "error" ? (
          <p className="mt-6 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        {status === "ready" && licenses.length === 0 ? (
          <p className="mt-6 text-sm text-slate-300">{copy.empty}</p>
        ) : null}

        {status === "ready" && licenses.length > 0 ? (
          <div className="mt-6 grid gap-3 xl:grid-cols-2">
            {licenses.map((license) => (
              <article
                key={license.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-white">
                        {license.title}
                      </h3>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                        {license.isPaypalEnabled
                          ? copy.paidLabel
                          : copy.quoteLabel}
                      </span>
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                        {formatPriceLabel(license.priceCents)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-cyan-200">
                      {getCategoryLabel(license.templateCategory)} ·{" "}
                      {(license.audioFormats || []).join(" + ") || "quote"} ·{" "}
                      {license.trackSeparation === "stems" ? "stems" : "full mix"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      license.isActive
                        ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-100"
                        : "border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    {license.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300 sm:grid-cols-4">
                  <span>Streams: {formatNumberLabel(license.maxStreams)}</span>
                  <span>Sales: {formatNumberLabel(license.maxSales)}</span>
                  <span>Video: {formatNumberLabel(license.videoClipsLimit)}</span>
                  <span>Radio: {formatNumberLabel(license.radioStations)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  {RIGHT_FLAGS.filter(([field]) => license[field]).map(
                    ([field, label]) => (
                      <span
                        key={field}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                      >
                        {label}
                      </span>
                    ),
                  )}
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(license)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {copy.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => startDuplicate(license)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copy.duplicate}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(license)}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-300/25 bg-rose-400/12 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/22"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {copy.remove}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <form
        className="rounded-2xl border border-white/10 bg-slate-900/55 p-5"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-white">
            {editingLicenseId ? copy.edit : copy.create}
          </h3>
          {editingLicenseId ? (
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
              {copy.cancel}
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Title
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
              required
            />
          </label>
          <label className="text-sm text-slate-300">
            {copy.price}
            <input
              type="text"
              inputMode="decimal"
              value={form.priceEuro}
              onChange={(event) => updateField("priceEuro", event.target.value)}
              placeholder={copy.pricePlaceholder}
              className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
              required={form.isPaypalEnabled}
            />
          </label>
          <label className="text-sm text-slate-300">
            Category
            <select
              value={form.templateCategory}
              onChange={(event) =>
                updateField("templateCategory", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
            >
              {TEMPLATE_CATEGORIES.map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                  className="bg-slate-900 text-white"
                >
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm text-slate-300">
            {copy.paymentMode}
            <div className="mt-2">
              <ToggleButton
                isActive={!form.isPaypalEnabled}
                label={
                  !form.isPaypalEnabled ? copy.quoteLabel : copy.paidLabel
                }
                onClick={() =>
                  setForm((previous) => {
                    const isPaypalEnabled = !previous.isPaypalEnabled;

                    return {
                      ...previous,
                      isPaypalEnabled,
                      priceEuro: isPaypalEnabled ? previous.priceEuro : "0",
                    };
                  })
                }
              />
            </div>
          </div>
          <label className="text-sm text-slate-300 md:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className="mt-2 min-h-20 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Audio formats
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {AUDIO_FORMATS.map((format) => (
                <ToggleButton
                  key={format}
                  isActive={form.audioFormats.includes(format)}
                  label={format.toUpperCase()}
                  onClick={() => toggleListValue("audioFormats", format)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Track separation
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TRACK_SEPARATIONS.map((value) => (
                <ToggleButton
                  key={value}
                  isActive={form.trackSeparation === value}
                  label={value === "stems" ? "Stems" : "Full mix"}
                  onClick={() => updateField("trackSeparation", value)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["maxStreams", "Max streams"],
            ["maxSales", "Max sales"],
            ["videoClipsLimit", "Video clips"],
            ["radioStations", "Radio stations"],
          ].map(([field, label]) => (
            <label key={field} className="text-sm text-slate-300">
              {label}
              <input
                type="number"
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                placeholder="No limit"
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
              />
            </label>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Rights
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {RIGHT_FLAGS.map(([field, label]) => (
              <ToggleButton
                key={field}
                isActive={Boolean(form[field])}
                label={label}
                onClick={() => updateField(field, !form[field])}
              />
            ))}
          </div>
        </div>

        <label className="mt-5 block text-sm text-slate-300">
          Additional terms
          <textarea
            value={form.additionalTerms}
            onChange={(event) => updateField("additionalTerms", event.target.value)}
            className="mt-2 min-h-24 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <ToggleButton
            isActive={form.isActive}
            label="Active"
            onClick={() => updateField("isActive", !form.isActive)}
          />
          <ToggleButton
            isActive={form.isTemplate}
            label="Template"
            onClick={() => updateField("isTemplate", !form.isTemplate)}
          />
        </div>

        {validationErrors.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 text-sm text-amber-100">
            {validationErrors[0]}
          </div>
        ) : null}

        {submitState.error ? (
          <p className="mt-5 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
            {submitState.error}
          </p>
        ) : null}

        {submitState.success ? (
          <p className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {submitState.success}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={submitState.isLoading || validationErrors.length > 0}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/20 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitState.isLoading ? copy.saving : copy.submit}
          </button>
        </div>
      </form>
    </section>
  );
}

export default LicenseManager;
