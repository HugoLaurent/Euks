function DashboardAddTags({
  copy,
  availableTags,
  tagForm,
  setTagForm,
  tagSubmitState,
  deletingTagId,
  onTagSubmit,
  onTagDelete,
  API_BASE_URL,
  language,
}) {
  async function handleDeleteWithCount(tag) {
    // Fetch the number of tracks using this tag before confirming deletion
    let trackCount = null;
    try {
      const res = await fetch(`${API_BASE_URL}/tracks?tagId=${tag.id}&perPage=1&page=1`);
      if (res.ok) {
        const payload = await res.json();
        trackCount = payload?.meta?.total ?? payload?.metadata?.total ?? null;
      }
    } catch {
      // proceed without count
    }

    const countMsg =
      trackCount !== null
        ? language === "fr"
          ? `Ce tag est utilisé par ${trackCount} musique(s). Continuer ?`
          : `This tag is used by ${trackCount} track(s). Continue?`
        : null;

    const confirmMsg = countMsg
      ? `${copy.addTags.confirmDelete}: ${tag.name}\n\n${countMsg}`
      : `${copy.addTags.confirmDelete}: ${tag.name} ?`;

    if (!window.confirm(confirmMsg)) return;
    onTagDelete(tag, { skipConfirm: true });
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
      <h2 className="text-2xl font-black text-white">{copy.addTags.title}</h2>
      <p className="mt-2 text-sm text-slate-300">{copy.addTags.subtitle}</p>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onTagSubmit}>
        <label className="text-sm text-slate-300">
          {copy.addTags.fields.name}
          <input
            value={tagForm.name}
            onChange={(e) => setTagForm((p) => ({ ...p, name: e.target.value }))}
            placeholder={copy.addTags.placeholders.name}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
            required
          />
        </label>

        <label className="text-sm text-slate-300">
          {copy.addTags.fields.type}
          <select
            value={tagForm.type}
            onChange={(e) => setTagForm((p) => ({ ...p, type: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
          >
            <option className="bg-slate-900 text-white" value="mood">{copy.addTags.types.mood}</option>
            <option className="bg-slate-900 text-white" value="genre">{copy.addTags.types.genre}</option>
          </select>
        </label>

        <label className="text-sm text-slate-300 md:col-span-2">
          {copy.addTags.fields.slug}
          <input
            value={tagForm.slug}
            onChange={(e) => setTagForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder={copy.addTags.placeholders.slug}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
          />
        </label>

        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <div className="text-xs">
            {tagSubmitState.error ? <p className="text-rose-200">{tagSubmitState.error}</p> : null}
            {tagSubmitState.success ? <p className="text-emerald-200">{tagSubmitState.success}</p> : null}
          </div>
          <button
            type="submit"
            disabled={tagSubmitState.isLoading}
            className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {tagSubmitState.isLoading ? copy.addTags.submitLoading : copy.addTags.submit}
          </button>
        </div>
      </form>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{copy.addTags.listTitle}</p>
        {availableTags.length === 0 ? (
          <p className="mt-3 text-sm text-slate-300">{copy.addTags.empty}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <span
                key={tag.id}
                className="relative inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 pr-6 text-xs text-slate-200"
              >
                {tag.name} · {tag.type}
                <button
                  type="button"
                  onClick={() => handleDeleteWithCount(tag)}
                  disabled={deletingTagId === tag.id}
                  className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-rose-300/40 bg-rose-500/30 text-[10px] font-bold text-rose-100 transition hover:bg-rose-500/45 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`${copy.addTags.delete} ${tag.name}`}
                  title={copy.addTags.delete}
                >
                  {deletingTagId === tag.id ? "…" : "×"}
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default DashboardAddTags;
