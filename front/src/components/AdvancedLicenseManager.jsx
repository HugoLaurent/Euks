import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  createLicense,
  deleteLicense,
  fetchLicenses,
  updateLicense,
} from "@/lib";

const AUDIO_FORMATS = ["mp3", "wav", "Pistes séparées (stems)"];
const PLATFORMS = [
  "tiktok",
  "youtube",
  "instagram",
  "twitch",
  "facebook",
  "snapchat",
];
const TEMPLATE_CATEGORIES = ["standard", "premium", "exclusive", "custom"];

const INITIAL_FORM = {
  title: "",
  description: "",
  isActive: true,
  isTemplate: false,
  templateCategory: "custom",
  isPaypalEnabled: true,
  audioFormats: ["mp3", "wav"],
  trackSeparation: "full_mix",
  maxStreams: "",
  maxDownloads: "",
  maxSales: "",
  allowVideoClips: true,
  videoClipsLimit: "",
  allowedPlatforms: ["youtube", "instagram", "tiktok"],
  allowLivePerformance: false,
  allowRadioAirplay: false,
  allowTelevision: false,
  allowStreaming: true,
  allowPodcast: false,
  allowMechanicalRepro: false,
  allowRemix: false,
  allowRemixDistribution: false,
  allowSampling: false,
  allowMonetization: true,
  allowContentId: false,
  isExclusive: false,
  allowCommercialUse: true,
  commercialUseLimit: "limited",
  commercialUseDescription: "",
  allowedTerritories: ["WORLDWIDE"],
  durationMonths: "",
  allowTransfer: false,
  allowSublicense: false,
  transferRestrictions: "",
  requireMasterCredit: true,
  requirePublishingCredit: true,
  requireArtistCredit: true,
  creditRequirements: "[Artist] - [Track] (euks.io)",
  masterSplitPercentage: 0,
  publishingSplitPercentage: 0,
  thirdPartySplitPercentage: 0,
  minAudioBitrate: "320",
  requireDrmEncryption: false,
  allowOfflineListening: true,
  maxConcurrentStreams: "",
  allowTrackModification: false,
  requireApprovalForModification: false,
  modificationRestrictions: "",
  allowNonprofitUse: true,
  allowEducationalUse: true,
  allowReligiousUse: true,
  allowPoliticalUse: false,
  allowAdultContent: true,
  allowGamblingUse: false,
  allowMilitaryUse: false,
  restrictedGenres: [],
  restrictedUseCases: [],
  additionalTerms: "",
  requiresWrittenAgreement: false,
  revisionNotes: "",
};

const BOOLEAN_RIGHTS = [
  ["allowLivePerformance", "Live"],
  ["allowRadioAirplay", "Radio"],
  ["allowTelevision", "TV"],
  ["allowStreaming", "Streaming"],
  ["allowPodcast", "Podcast"],
  ["allowMechanicalRepro", "Mechanical"],
  ["allowRemix", "Remix"],
  ["allowRemixDistribution", "Remix distribution"],
  ["allowSampling", "Sampling"],
  ["allowMonetization", "Monetization"],
  ["allowContentId", "Content ID"],
];

const RESTRICTED_USE_FLAGS = [
  ["allowNonprofitUse", "Nonprofit"],
  ["allowEducationalUse", "Education"],
  ["allowReligiousUse", "Religious"],
  ["allowPoliticalUse", "Political"],
  ["allowAdultContent", "Adult content"],
  ["allowGamblingUse", "Gambling"],
  ["allowMilitaryUse", "Military"],
];

function toArrayPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function toFormValue(license) {
  return {
    ...INITIAL_FORM,
    ...license,
    audioFormats: license.audioFormats || [],
    allowedPlatforms: license.allowedPlatforms || [],
    allowedTerritories: license.allowedTerritories || ["WORLDWIDE"],
    restrictedGenres: license.restrictedGenres || [],
    restrictedUseCases: license.restrictedUseCases || [],
    maxStreams: license.maxStreams ?? "",
    maxDownloads: license.maxDownloads ?? "",
    maxSales: license.maxSales ?? "",
    videoClipsLimit: license.videoClipsLimit ?? "",
    durationMonths: license.durationMonths ?? "",
    maxConcurrentStreams: license.maxConcurrentStreams ?? "",
  };
}

function nullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function listFromText(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formToPayload(form) {
  return {
    ...form,
    maxStreams: nullableNumber(form.maxStreams),
    maxDownloads: nullableNumber(form.maxDownloads),
    maxSales: nullableNumber(form.maxSales),
    videoClipsLimit: nullableNumber(form.videoClipsLimit),
    durationMonths: nullableNumber(form.durationMonths),
    maxConcurrentStreams: nullableNumber(form.maxConcurrentStreams),
    masterSplitPercentage: Number(form.masterSplitPercentage || 0),
    publishingSplitPercentage: Number(form.publishingSplitPercentage || 0),
    thirdPartySplitPercentage: Number(form.thirdPartySplitPercentage || 0),
    restrictedGenres: form.restrictedGenres?.length
      ? form.restrictedGenres
      : null,
    restrictedUseCases: form.restrictedUseCases?.length
      ? form.restrictedUseCases
      : null,
  };
}

function validateForm(form) {
  const errors = [];
  const splitTotal =
    Number(form.masterSplitPercentage || 0) +
    Number(form.publishingSplitPercentage || 0) +
    Number(form.thirdPartySplitPercentage || 0);

  if (!form.title.trim() || form.title.length > 160) {
    errors.push("Title is required and must stay under 160 characters.");
  }

  if (splitTotal > 100) {
    errors.push("Revenue splits must total 100% or less.");
  }

  if (!form.allowRemix && form.allowRemixDistribution) {
    errors.push("Remix distribution requires remix rights.");
  }

  if (form.isExclusive && !form.durationMonths) {
    errors.push("Exclusive licenses must define a duration.");
  }

  if (
    (form.requireArtistCredit ||
      form.requireMasterCredit ||
      form.requirePublishingCredit) &&
    !form.creditRequirements.trim()
  ) {
    errors.push("Credit requirements are required when credits are enabled.");
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

function AdvancedLicenseManager({ language = "fr" }) {
  const [licenses, setLicenses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [templatesOnly, setTemplatesOnly] = useState(true);
  const [freeOnly, setFreeOnly] = useState(false);
  const [editingLicenseId, setEditingLicenseId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
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
            subtitle: "Creation et gestion des licences avancees.",
            refresh: "Rafraichir",
            create: "Nouvelle licence",
            edit: "Modifier",
            duplicate: "Dupliquer",
            remove: "Supprimer",
            filters: {
              templates: "Templates",
              active: "Actives",
              free: "Gratuites",
            },
            loading: "Chargement des licences...",
            empty: "Aucune licence ne correspond aux filtres.",
            submit: "Enregistrer",
            saving: "Enregistrement...",
            cancel: "Annuler",
            advanced: "Options avancees",
            freeMode: "Mode gratuit",
            freeLabel: "Gratuit",
            paidLabel: "Payant",
            deleteConfirm: "Supprimer cette licence ?",
            tokenRequired: "Tu dois etre connecte pour modifier les licences.",
          }
        : {
            title: "Licenses",
            subtitle: "Create and manage advanced license templates.",
            refresh: "Refresh",
            create: "New license",
            edit: "Edit",
            duplicate: "Duplicate",
            remove: "Delete",
            filters: {
              templates: "Templates",
              active: "Active",
              free: "Free",
            },
            loading: "Loading licenses...",
            empty: "No license matches the filters.",
            submit: "Save",
            saving: "Saving...",
            cancel: "Cancel",
            advanced: "Advanced options",
            freeMode: "Free mode",
            freeLabel: "Free",
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
        freeOnly ? !license.isPaypalEnabled : true,
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
          freeOnly ? !license.isPaypalEnabled : true,
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
  }, [activeOnly, freeOnly, templatesOnly]);

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

    const authToken = localStorage.getItem("euks.auth.token") || "";

    if (!authToken) {
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
        await updateLicense(editingLicenseId, payload, authToken);
      } else {
        await createLicense(payload, authToken);
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

    const authToken = localStorage.getItem("euks.auth.token") || "";

    if (!authToken) {
      setSubmitState({
        isLoading: false,
        error: copy.tokenRequired,
        success: "",
      });
      return;
    }

    try {
      await deleteLicense(license.id, authToken);
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
              isActive={freeOnly}
              label={copy.filters.free}
              onClick={() => setFreeOnly((value) => !value)}
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
                          : copy.freeLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-cyan-200">
                      {(license.audioFormats || []).join(", ") || "custom"} ·{" "}
                      {license.templateCategory || "custom"}
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
                  <span>Streams: {license.maxStreams ?? "unlimited"}</span>
                  <span>Videos: {license.videoClipsLimit ?? "unlimited"}</span>
                  <span>Remix: {license.allowRemix ? "yes" : "no"}</span>
                  <span>TV: {license.allowTelevision ? "yes" : "no"}</span>
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
          <label className="text-sm text-slate-300 md:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className="mt-2 min-h-24 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
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
              {TEMPLATE_CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-slate-900 text-white"
                >
                  {category}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm text-slate-300">
            {copy.freeMode}
            <div className="mt-2">
              <ToggleButton
                isActive={!form.isPaypalEnabled}
                label={!form.isPaypalEnabled ? copy.freeLabel : copy.paidLabel}
                onClick={() =>
                  updateField("isPaypalEnabled", !form.isPaypalEnabled)
                }
              />
            </div>
          </div>
          <label className="text-sm text-slate-300">
            Track separation
            <select
              value={form.trackSeparation}
              onChange={(event) =>
                updateField("trackSeparation", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
            >
              {[
                "full_mix",
                "stems",
                "instrumental_only",
                "vocal_only",
                "acapella",
              ].map((value) => (
                <option
                  key={value}
                  value={value}
                  className="bg-slate-900 text-white"
                >
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 space-y-4">
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
              Platforms
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <ToggleButton
                  key={platform}
                  isActive={form.allowedPlatforms.includes(platform)}
                  label={platform}
                  onClick={() => toggleListValue("allowedPlatforms", platform)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["maxStreams", "Max streams"],
              ["maxDownloads", "Max downloads"],
              ["maxSales", "Max sales"],
            ].map(([field, label]) => (
              <label key={field} className="text-sm text-slate-300">
                {label}
                <input
                  type="number"
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  placeholder="Unlimited"
                  className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
                />
              </label>
            ))}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Usage rights
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {BOOLEAN_RIGHTS.map(([field, label]) => (
                <ToggleButton
                  key={field}
                  isActive={Boolean(form[field])}
                  label={label}
                  onClick={() => updateField(field, !form[field])}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdvancedOpen((value) => !value)}
            className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:bg-white/10"
          >
            {copy.advanced}
          </button>

          {isAdvancedOpen ? (
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
              <label className="text-sm text-slate-300">
                Commercial limit
                <select
                  value={form.commercialUseLimit}
                  onChange={(event) =>
                    updateField("commercialUseLimit", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                >
                  {["unlimited", "limited", "prohibited"].map((value) => (
                    <option
                      key={value}
                      value={value}
                      className="bg-slate-900 text-white"
                    >
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-300">
                Min bitrate
                <select
                  value={form.minAudioBitrate}
                  onChange={(event) =>
                    updateField("minAudioBitrate", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                >
                  {["128", "192", "256", "320", "lossless"].map((value) => (
                    <option
                      key={value}
                      value={value}
                      className="bg-slate-900 text-white"
                    >
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-300">
                Duration months
                <input
                  type="number"
                  value={form.durationMonths}
                  onChange={(event) =>
                    updateField("durationMonths", event.target.value)
                  }
                  placeholder="Perpetual"
                  className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300">
                Video clips limit
                <input
                  type="number"
                  value={form.videoClipsLimit}
                  onChange={(event) =>
                    updateField("videoClipsLimit", event.target.value)
                  }
                  placeholder="Unlimited"
                  className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300 md:col-span-2">
                Territories
                <input
                  value={form.allowedTerritories.join(", ")}
                  onChange={(event) =>
                    updateField(
                      "allowedTerritories",
                      listFromText(event.target.value),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                />
              </label>
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Restricted uses
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {RESTRICTED_USE_FLAGS.map(([field, label]) => (
                    <ToggleButton
                      key={field}
                      isActive={Boolean(form[field])}
                      label={label}
                      onClick={() => updateField(field, !form[field])}
                    />
                  ))}
                </div>
              </div>
              {[
                ["isActive", "Active"],
                ["isTemplate", "Template"],
                ["isExclusive", "Exclusive"],
                ["allowCommercialUse", "Commercial use"],
                ["allowVideoClips", "Video clips"],
                ["allowTransfer", "Transfer"],
                ["allowSublicense", "Sublicense"],
                ["requireMasterCredit", "Master credit"],
                ["requirePublishingCredit", "Publishing credit"],
                ["requireArtistCredit", "Artist credit"],
                ["requireDrmEncryption", "DRM"],
                ["allowOfflineListening", "Offline"],
                ["allowTrackModification", "Track edits"],
                ["requireApprovalForModification", "Approval for edits"],
                ["requiresWrittenAgreement", "Written agreement"],
              ].map(([field, label]) => (
                <ToggleButton
                  key={field}
                  isActive={Boolean(form[field])}
                  label={label}
                  onClick={() => updateField(field, !form[field])}
                />
              ))}
              <label className="text-sm text-slate-300 md:col-span-2">
                Credit requirements
                <input
                  value={form.creditRequirements}
                  onChange={(event) =>
                    updateField("creditRequirements", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                />
              </label>
              <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
                {[
                  ["masterSplitPercentage", "Master %"],
                  ["publishingSplitPercentage", "Publishing %"],
                  ["thirdPartySplitPercentage", "Third-party %"],
                ].map(([field, label]) => (
                  <label key={field} className="text-sm text-slate-300">
                    {label}
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form[field]}
                      onChange={(event) =>
                        updateField(field, event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                    />
                  </label>
                ))}
              </div>
              <label className="text-sm text-slate-300 md:col-span-2">
                Restricted genres
                <input
                  value={form.restrictedGenres.join(", ")}
                  onChange={(event) =>
                    updateField(
                      "restrictedGenres",
                      listFromText(event.target.value),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300 md:col-span-2">
                Restricted use cases
                <input
                  value={form.restrictedUseCases.join(", ")}
                  onChange={(event) =>
                    updateField(
                      "restrictedUseCases",
                      listFromText(event.target.value),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                />
              </label>
              <label className="text-sm text-slate-300 md:col-span-2">
                Additional terms
                <textarea
                  value={form.additionalTerms}
                  onChange={(event) =>
                    updateField("additionalTerms", event.target.value)
                  }
                  className="mt-2 min-h-28 w-full rounded-xl border border-white/12 bg-slate-950/40 px-3 py-2 text-white outline-none"
                />
              </label>
            </div>
          ) : null}
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

export default AdvancedLicenseManager;
