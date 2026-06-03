import { useState } from "react";

function getFileExtension(fileName) {
  const lowerName = String(fileName || "").toLowerCase();
  const lastDotIndex = lowerName.lastIndexOf(".");
  return lastDotIndex >= 0 ? lowerName.slice(lastDotIndex) : "";
}

function isAcceptedFileForZone(zone, file) {
  if (!file) return false;
  const extension = getFileExtension(file.name);
  if (zone === "cover") return file.type.startsWith("image/");
  if (zone === "mp3") return extension === ".mp3";
  if (zone === "wav") return extension === ".wav";
  if (zone === "stemsZip") return extension === ".zip";
  return false;
}

function formatLicensePrice(cents) {
  const priceCents = Number(cents);
  if (!Number.isFinite(priceCents)) return "-";
  return `${(priceCents / 100).toFixed(2)} EUR`;
}

function getLicensePriceCents(license) {
  if (!license?.isPaypalEnabled) return null;
  const priceCents = Number(license?.priceCents);
  return Number.isFinite(priceCents) && priceCents >= 0 ? priceCents : null;
}

function getLowestLicensePriceCents(licenses) {
  const prices = licenses
    .map((l) => getLicensePriceCents(l))
    .filter((p) => p !== null);
  return prices.length === 0 ? null : Math.min(...prices);
}

function readAudioFileDuration(file) {
  return new Promise((resolve) => {
    if (!file) { resolve(null); return; }
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      URL.revokeObjectURL(objectUrl);
    };
    const handleLoadedMetadata = () => {
      const d = Math.round(audio.duration);
      cleanup();
      resolve(Number.isFinite(d) && d > 0 ? d : null);
    };
    const handleError = () => { cleanup(); resolve(null); };
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.src = objectUrl;
  });
}

function DashboardAddTrack({
  copy,
  musicalKeys,
  availableTags,
  availableLicenses,
  taxonomyLoading,
  licensesLoading,
  taxonomyError,
  licensesError,
  onTrackCreated,
  API_BASE_URL,
  buildAuthHeaders,
  isLoggedIn,
}) {
  const [trackForm, setTrackForm] = useState({ title: "", bpm: "" });
  const [selectedMusicalKeyId, setSelectedMusicalKeyId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [selectedLicenseIds, setSelectedLicenseIds] = useState([]);
  const [uploadFiles, setUploadFiles] = useState({ cover: null, mp3: null, wav: null, stemsZip: null });
  const [uploadErrors, setUploadErrors] = useState({ cover: "", mp3: "", wav: "", stemsZip: "" });
  const [activeDropZone, setActiveDropZone] = useState("");
  const [submitState, setSubmitState] = useState({ isLoading: false, error: "", success: "" });

  function handleFileAssign(zone, file) {
    if (!isAcceptedFileForZone(zone, file)) {
      setUploadErrors((p) => ({ ...p, [zone]: copy.addTrack.invalidType }));
      return;
    }
    setUploadErrors((p) => ({ ...p, [zone]: "" }));
    setUploadFiles((p) => ({ ...p, [zone]: file }));
  }

  function renderDropInput(zone, label, accept) {
    const currentFile = uploadFiles[zone];
    const error = uploadErrors[zone];
    const isActive = activeDropZone === zone;

    return (
      <label
        className={`block rounded-2xl border p-4 transition ${
          isActive ? "border-cyan-300/45 bg-cyan-400/10" : "border-white/12 bg-white/5"
        }`}
        onDragOver={(e) => { e.preventDefault(); setActiveDropZone(zone); }}
        onDragLeave={() => setActiveDropZone("")}
        onDrop={(e) => { e.preventDefault(); setActiveDropZone(""); const f = e.dataTransfer?.files?.[0]; if (f) handleFileAssign(zone, f); }}
      >
        <span className="text-sm text-slate-200">{label}</span>
        <input
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileAssign(zone, f); }}
        />
        <p className="mt-2 text-xs text-slate-400">{copy.addTrack.dropHint}</p>
        {currentFile ? <p className="mt-3 text-xs text-cyan-100">{copy.addTrack.selected}: {currentFile.name}</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-200">{error}</p> : null}
      </label>
    );
  }

  function toggleTagSelection(tagId) {
    setSelectedTagIds((p) => p.includes(tagId) ? p.filter((id) => id !== tagId) : [...p, tagId]);
  }

  function toggleLicenseSelection(licenseId) {
    setSelectedLicenseIds((p) => p.includes(licenseId) ? p.filter((id) => id !== licenseId) : [...p, licenseId]);
  }

  const selectedLicenses = selectedLicenseIds.map((id) => availableLicenses.find((l) => l.id === id)).filter(Boolean);
  const selectedLicensePriceCents = getLowestLicensePriceCents(selectedLicenses);

  const hasAllRequiredFiles = Boolean(uploadFiles.cover) && Boolean(uploadFiles.mp3) && Boolean(uploadFiles.wav) && Boolean(uploadFiles.stemsZip);
  const hasTrackTaxonomy = Boolean(selectedMusicalKeyId) && selectedTagIds.length > 0;
  const hasSelectedLicenses = selectedLicenseIds.length > 0 && selectedLicensePriceCents !== null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitState.isLoading) return;
    if (!hasAllRequiredFiles || !hasTrackTaxonomy || !hasSelectedLicenses) return;
    if (!isLoggedIn()) {
      setSubmitState({ isLoading: false, error: copy.addTrack.tokenRequired, success: "" });
      return;
    }

    setSubmitState({ isLoading: true, error: "", success: "" });

    try {
      const formData = new FormData();
      const durationSeconds = await readAudioFileDuration(uploadFiles.mp3);

      formData.append("title", trackForm.title.trim());
      formData.append("bpm", String(Number(trackForm.bpm) || 0));
      formData.append("priceCents", String(selectedLicensePriceCents));
      formData.append("musicalKeyId", selectedMusicalKeyId);
      if (durationSeconds) formData.append("durationSeconds", String(durationSeconds));
      selectedTagIds.forEach((tagId) => formData.append("tagIds[]", String(tagId)));
      formData.append("cover", uploadFiles.cover);
      formData.append("previewMp3", uploadFiles.mp3);
      formData.append("previewWav", uploadFiles.wav);
      formData.append("stemsZip", uploadFiles.stemsZip);

      const response = await fetch(`${API_BASE_URL}/tracks`, {
        method: "POST",
        credentials: "include",
        headers: buildAuthHeaders(),
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload?.message || "Unable to create track.");

      const createdTrack = payload?.data ?? payload;
      if (!createdTrack?.id) throw new Error("Track created, but the response did not include an id.");

      const licensesResponse = await fetch(`${API_BASE_URL}/tracks/${createdTrack.id}/licenses`, {
        method: "PUT",
        credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
        body: JSON.stringify({ licenses: selectedLicenseIds.map((licenseId) => ({ licenseId, isActive: true })) }),
      });
      const licensesPayload = await licensesResponse.json().catch(() => ({}));
      if (!licensesResponse.ok) throw new Error(licensesPayload?.message || "Unable to attach licenses.");

      setTrackForm({ title: "", bpm: "" });
      setSelectedMusicalKeyId("");
      setSelectedTagIds([]);
      setSelectedLicenseIds([]);
      setUploadFiles({ cover: null, mp3: null, wav: null, stemsZip: null });
      setUploadErrors({ cover: "", mp3: "", wav: "", stemsZip: "" });
      setSubmitState({ isLoading: false, error: "", success: copy.addTrack.saveSuccess });
      onTrackCreated?.();
    } catch (error) {
      setSubmitState({ isLoading: false, error: error.message || "Unable to create track.", success: "" });
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
      <h2 className="text-2xl font-black text-white">{copy.addTrack.title}</h2>
      <p className="mt-2 text-sm text-slate-300">{copy.addTrack.subtitle}</p>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm text-slate-300">
          {copy.addTrack.fields.title}
          <input
            value={trackForm.title}
            onChange={(e) => setTrackForm((p) => ({ ...p, title: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
            required
          />
        </label>
        <label className="text-sm text-slate-300">
          {copy.addTrack.fields.bpm}
          <input
            type="number"
            value={trackForm.bpm}
            onChange={(e) => setTrackForm((p) => ({ ...p, bpm: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
            required
          />
        </label>
        <label className="text-sm text-slate-300">
          {copy.addTrack.fields.musicalKey}
          <select
            value={selectedMusicalKeyId}
            onChange={(e) => setSelectedMusicalKeyId(e.target.value)}
            disabled={taxonomyLoading || musicalKeys.length === 0}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
          >
            <option value="" className="bg-slate-900 text-white">
              {taxonomyLoading ? copy.addTrack.musicalKeyLoading : copy.addTrack.musicalKeyPlaceholder}
            </option>
            {musicalKeys.map((key) => (
              <option key={key.id} value={String(key.id)} className="bg-slate-900 text-white">
                {key.name}
              </option>
            ))}
          </select>
          {!taxonomyLoading && musicalKeys.length === 0 ? (
            <p className="mt-2 text-xs text-amber-200">{copy.addTrack.musicalKeyUnavailable}</p>
          ) : null}
        </label>

        <label className="text-sm text-slate-300 md:col-span-2">
          {copy.addTrack.fields.linkedTags}
          <div className="mt-2 rounded-2xl border border-white/12 bg-white/5 p-3">
            {taxonomyLoading ? <p className="text-xs text-slate-400">{copy.addTrack.tagsLoading}</p> : null}
            {!taxonomyLoading && taxonomyError ? <p className="text-xs text-rose-200">{taxonomyError}</p> : null}
            {!taxonomyLoading && !taxonomyError && availableTags.length === 0 ? (
              <p className="text-xs text-slate-400">{copy.addTrack.noTags}</p>
            ) : null}
            {!taxonomyLoading && !taxonomyError && availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTagSelection(tag.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        isSelected
                          ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100"
                          : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </label>

        <fieldset className="text-sm text-slate-300 md:col-span-2">
          <legend>{copy.addTrack.fields.linkedLicenses}</legend>
          <div className="mt-2 rounded-2xl border border-white/12 bg-white/5 p-3">
            {licensesLoading ? <p className="text-xs text-slate-400">{copy.addTrack.licensesLoading}</p> : null}
            {!licensesLoading && licensesError ? <p className="text-xs text-rose-200">{licensesError}</p> : null}
            {!licensesLoading && !licensesError && availableLicenses.length === 0 ? (
              <p className="text-xs text-slate-400">{copy.addTrack.noLicenses}</p>
            ) : null}
            {!licensesLoading && !licensesError && availableLicenses.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {availableLicenses.map((license) => {
                  const isSelected = selectedLicenseIds.includes(license.id);
                  return (
                    <div
                      key={license.id}
                      className={`rounded-2xl border p-3 transition ${
                        isSelected ? "border-cyan-300/35 bg-cyan-400/12" : "border-white/12 bg-white/5"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleLicenseSelection(license.id)}
                        className={`w-full text-left text-sm font-semibold transition ${isSelected ? "text-cyan-100" : "text-slate-100"}`}
                      >
                        {license.title}
                      </button>
                      <p className="mt-1 text-xs text-slate-400">
                        {(license.audioFormats || []).join(", ").toUpperCase() || "CUSTOM"}
                        {license.templateCategory ? ` · ${license.templateCategory}` : ""}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-cyan-100">
                        {formatLicensePrice(license.priceCents)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </fieldset>

        <label className="text-sm text-slate-300 md:col-span-2">
          {copy.addTrack.fields.cover}
          <div className="mt-2">{renderDropInput("cover", copy.addTrack.fields.cover, "image/*")}</div>
        </label>
        <label className="text-sm text-slate-300">
          {copy.addTrack.fields.mp3}
          <div className="mt-2">{renderDropInput("mp3", copy.addTrack.fields.mp3, ".mp3,audio/mpeg")}</div>
        </label>
        <label className="text-sm text-slate-300">
          {copy.addTrack.fields.wav}
          <div className="mt-2">{renderDropInput("wav", copy.addTrack.fields.wav, ".wav,audio/wav")}</div>
        </label>
        <label className="text-sm text-slate-300 md:col-span-2">
          {copy.addTrack.fields.stemsZip}
          <div className="mt-2">{renderDropInput("stemsZip", copy.addTrack.fields.stemsZip, ".zip,application/zip")}</div>
        </label>

        <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
          <div className="text-xs">
            <p className={`${hasAllRequiredFiles && hasTrackTaxonomy && hasSelectedLicenses ? "text-slate-400" : "text-amber-200"}`}>
              {hasAllRequiredFiles && hasTrackTaxonomy && hasSelectedLicenses
                ? copy.addTrack.helper
                : copy.addTrack.required}
            </p>
            {submitState.error ? <p className="mt-1 text-rose-200">{submitState.error}</p> : null}
            {submitState.success ? <p className="mt-1 text-emerald-200">{submitState.success}</p> : null}
          </div>
          <button
            type="submit"
            disabled={!hasAllRequiredFiles || !hasTrackTaxonomy || !hasSelectedLicenses || submitState.isLoading}
            className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitState.isLoading ? copy.addTrack.submitLoading : copy.addTrack.submit}
          </button>
        </div>
      </form>
    </section>
  );
}

export default DashboardAddTrack;
