import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

function getFileExtension(fileName) {
  const lowerName = String(fileName || "").toLowerCase();
  const lastDotIndex = lowerName.lastIndexOf(".");
  return lastDotIndex >= 0 ? lowerName.slice(lastDotIndex) : "";
}

function isAcceptedFileForZone(zone, file) {
  if (!file) return false;
  const ext = getFileExtension(file.name);
  if (zone === "cover") return file.type.startsWith("image/");
  if (zone === "mp3") return ext === ".mp3";
  if (zone === "wav") return ext === ".wav";
  if (zone === "stemsZip") return ext === ".zip";
  return false;
}

function FileReplaceInput({ label, accept, zone, uploadFile, uploadError, onFileAssign, dropHint, selected }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <label
      className={`block rounded-2xl border p-4 transition ${isActive ? "border-cyan-300/45 bg-cyan-400/10" : "border-white/12 bg-white/5"}`}
      onDragOver={(e) => { e.preventDefault(); setIsActive(true); }}
      onDragLeave={() => setIsActive(false)}
      onDrop={(e) => { e.preventDefault(); setIsActive(false); const f = e.dataTransfer?.files?.[0]; if (f) onFileAssign(zone, f); }}
    >
      <span className="text-sm text-slate-200">{label}</span>
      <input type="file" accept={accept} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileAssign(zone, f); }} />
      {uploadFile ? (
        <p className="mt-2 text-xs text-cyan-100">{selected}: {uploadFile.name}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">{dropHint}</p>
      )}
      {uploadError ? <p className="mt-1 text-xs text-rose-200">{uploadError}</p> : null}
    </label>
  );
}

function DashboardEditTrack({
  copy,
  track,
  musicalKeys,
  availableTags,
  availableLicenses,
  taxonomyLoading,
  licensesLoading,
  taxonomyError,
  licensesError,
  onSaved,
  onCancel,
  API_BASE_URL,
  buildAuthHeaders,
}) {
  const [form, setForm] = useState({
    title: track.title || "",
    bpm: track.bpm ?? "",
    musicalKeyId: String(track.musicalKeyId ?? ""),
  });
  const [selectedTagIds, setSelectedTagIds] = useState(() =>
    (track.tags || []).map((t) => t.id)
  );
  const [selectedLicenseIds, setSelectedLicenseIds] = useState(() =>
    (track.licenses || []).map((l) => l.id)
  );
  const [uploadFiles, setUploadFiles] = useState({ cover: null, mp3: null, wav: null, stemsZip: null });
  const [uploadErrors, setUploadErrors] = useState({ cover: "", mp3: "", wav: "", stemsZip: "" });
  const [submitState, setSubmitState] = useState({ isLoading: false, error: "", success: "" });

  // Load the track's attached licenses from the dedicated endpoint on mount and
  // apply them directly (no intermediate state copied via a second effect).
  useEffect(() => {
    let cancelled = false;
    async function loadTrackLicenses() {
      try {
        const res = await fetch(`${API_BASE_URL}/tracks/${track.id}/licenses`, {
          credentials: "include",
          headers: buildAuthHeaders(),
        });
        const payload = await res.json();
        const licenses = Array.isArray(payload?.licenses) ? payload.licenses : (Array.isArray(payload) ? payload : []);
        if (!cancelled) setSelectedLicenseIds(licenses.map((l) => l.id));
      } catch {
        // keep the initial selection on failure
      }
    }
    loadTrackLicenses();
    return () => { cancelled = true; };
  }, [track.id]);

  function handleFileAssign(zone, file) {
    if (!isAcceptedFileForZone(zone, file)) {
      setUploadErrors((p) => ({ ...p, [zone]: copy.addTrack.invalidType }));
      return;
    }
    setUploadErrors((p) => ({ ...p, [zone]: "" }));
    setUploadFiles((p) => ({ ...p, [zone]: file }));
  }

  function toggleTag(tagId) {
    setSelectedTagIds((p) => p.includes(tagId) ? p.filter((id) => id !== tagId) : [...p, tagId]);
  }

  function toggleLicense(licenseId) {
    setSelectedLicenseIds((p) => p.includes(licenseId) ? p.filter((id) => id !== licenseId) : [...p, licenseId]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitState.isLoading) return;
    setSubmitState({ isLoading: true, error: "", success: "" });

    try {
      // Build multipart form for track metadata + optional file replacements
      const formData = new FormData();
      formData.append("title", form.title.trim());
      if (form.bpm !== "" && form.bpm !== null) formData.append("bpm", String(Number(form.bpm) || 0));
      if (form.musicalKeyId) formData.append("musicalKeyId", form.musicalKeyId);
      selectedTagIds.forEach((id) => formData.append("tagIds[]", String(id)));
      if (uploadFiles.cover) formData.append("cover", uploadFiles.cover);
      if (uploadFiles.mp3) formData.append("previewMp3", uploadFiles.mp3);
      if (uploadFiles.wav) formData.append("previewWav", uploadFiles.wav);
      if (uploadFiles.stemsZip) formData.append("stemsZip", uploadFiles.stemsZip);

      const trackRes = await fetch(`${API_BASE_URL}/tracks/${track.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: buildAuthHeaders(),
        body: formData,
      });
      const trackPayload = await trackRes.json().catch(() => ({}));
      if (!trackRes.ok) throw new Error(trackPayload?.message || "Unable to update track.");

      // Update licenses
      const licenseRes = await fetch(`${API_BASE_URL}/tracks/${track.id}/licenses`, {
        method: "PUT",
        credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
        body: JSON.stringify({
          licenses: selectedLicenseIds.map((id) => ({ licenseId: id, isActive: true })),
        }),
      });
      const licensePayload = await licenseRes.json().catch(() => ({}));
      if (!licenseRes.ok) throw new Error(licensePayload?.message || "Unable to update licenses.");

      setSubmitState({ isLoading: false, error: "", success: copy.addTrack.saveSuccess });
      setTimeout(() => onSaved?.(), 800);
    } catch (err) {
      setSubmitState({ isLoading: false, error: err.message || "Unable to update track.", success: "" });
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {copy.tracks.title}
        </button>
        <h2 className="text-2xl font-black text-white">{copy.tracks.actions.edit} — {track.title}</h2>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        {/* Metadata */}
        <label className="text-sm text-slate-300">
          {copy.addTrack.fields.title}
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
            required
          />
        </label>
        <label className="text-sm text-slate-300">
          {copy.addTrack.fields.bpm}
          <input
            type="number"
            value={form.bpm}
            onChange={(e) => setForm((p) => ({ ...p, bpm: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
          />
        </label>
        <label className="text-sm text-slate-300">
          {copy.addTrack.fields.musicalKey}
          <select
            value={form.musicalKeyId}
            onChange={(e) => setForm((p) => ({ ...p, musicalKeyId: e.target.value }))}
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
        </label>

        {/* Tags */}
        <label className="text-sm text-slate-300 md:col-span-2">
          {copy.addTrack.fields.linkedTags}
          <div className="mt-2 rounded-2xl border border-white/12 bg-white/5 p-3">
            {taxonomyLoading ? <p className="text-xs text-slate-400">{copy.addTrack.tagsLoading}</p> : null}
            {!taxonomyLoading && taxonomyError ? <p className="text-xs text-rose-200">{taxonomyError}</p> : null}
            {!taxonomyLoading && !taxonomyError && availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
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

        {/* Licenses */}
        <fieldset className="text-sm text-slate-300 md:col-span-2">
          <legend>{copy.addTrack.fields.linkedLicenses}</legend>
          <div className="mt-2 rounded-2xl border border-white/12 bg-white/5 p-3">
            {licensesLoading ? <p className="text-xs text-slate-400">{copy.addTrack.licensesLoading}</p> : null}
            {!licensesLoading && availableLicenses.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {availableLicenses.map((license) => {
                  const isSelected = selectedLicenseIds.includes(license.id);
                  return (
                    <div
                      key={license.id}
                      className={`rounded-2xl border p-3 transition cursor-pointer ${
                        isSelected ? "border-cyan-300/35 bg-cyan-400/12" : "border-white/12 bg-white/5"
                      }`}
                      onClick={() => toggleLicense(license.id)}
                    >
                      <p className={`text-sm font-semibold ${isSelected ? "text-cyan-100" : "text-slate-100"}`}>
                        {license.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {(license.audioFormats || []).join(", ").toUpperCase() || "CUSTOM"}
                        {license.templateCategory ? ` · ${license.templateCategory}` : ""}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-cyan-100">
                        {Number.isFinite(Number(license.priceCents))
                          ? `${(Number(license.priceCents) / 100).toFixed(2)} EUR`
                          : "-"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {!licensesLoading && licensesError ? <p className="text-xs text-rose-200">{licensesError}</p> : null}
          </div>
        </fieldset>

        {/* Optional file replacements */}
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400 md:col-span-2">
          {copy.tracks.actions.editFiles}
        </p>
        <FileReplaceInput zone="cover" label={copy.addTrack.fields.cover} accept="image/*"
          uploadFile={uploadFiles.cover} uploadError={uploadErrors.cover} onFileAssign={handleFileAssign}
          dropHint={copy.addTrack.dropHint} selected={copy.addTrack.selected} />
        <FileReplaceInput zone="mp3" label={copy.addTrack.fields.mp3} accept=".mp3,audio/mpeg"
          uploadFile={uploadFiles.mp3} uploadError={uploadErrors.mp3} onFileAssign={handleFileAssign}
          dropHint={copy.addTrack.dropHint} selected={copy.addTrack.selected} />
        <FileReplaceInput zone="wav" label={copy.addTrack.fields.wav} accept=".wav,audio/wav"
          uploadFile={uploadFiles.wav} uploadError={uploadErrors.wav} onFileAssign={handleFileAssign}
          dropHint={copy.addTrack.dropHint} selected={copy.addTrack.selected} />
        <FileReplaceInput zone="stemsZip" label={copy.addTrack.fields.stemsZip} accept=".zip,application/zip"
          uploadFile={uploadFiles.stemsZip} uploadError={uploadErrors.stemsZip} onFileAssign={handleFileAssign}
          dropHint={copy.addTrack.dropHint} selected={copy.addTrack.selected} />

        <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
          <div className="text-xs">
            {submitState.error ? <p className="text-rose-200">{submitState.error}</p> : null}
            {submitState.success ? <p className="text-emerald-200">{submitState.success}</p> : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              {copy.tracks.actions.cancelEdit}
            </button>
            <button
              type="submit"
              disabled={submitState.isLoading}
              className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitState.isLoading ? copy.addTrack.submitLoading : copy.addTrack.submit}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default DashboardEditTrack;
