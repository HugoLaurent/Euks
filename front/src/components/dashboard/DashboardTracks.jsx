import { Edit3 } from "lucide-react";

function getTrackDisplayPrice(track, language) {
  const licenses = Array.isArray(track.licenses) ? track.licenses : [];
  const activePrices = licenses
    .filter((l) => l.isPaypalEnabled && l.isActive)
    .map((l) => Number(l.priceCents))
    .filter((p) => Number.isFinite(p) && p > 0);

  if (activePrices.length === 0) {
    return language === "fr" ? "Sur demande" : "Quote";
  }

  const min = Math.min(...activePrices);
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US", {
    currency: "EUR",
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(min / 100);
}

function renderPagination(meta, onPageChange) {
  const currentPage = Number(meta?.currentPage || 1);
  const lastPage = Number(meta?.lastPage || 1);
  if (lastPage <= 1) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
      <span>Page {currentPage} / {lastPage}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          disabled={currentPage >= lastPage}
          className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function DashboardTracks({
  copy,
  language,
  tracks,
  tracksMeta,
  tracksLoading,
  tracksError,
  trackSearch,
  setTrackSearch,
  trackStatusFilter,
  setTrackStatusFilter,
  setTrackPage,
  trackActionState,
  onPatchTrack,
  onDeleteTrack,
  onEditTrack,
}) {
  const trackFilters = [
    ["all", copy.tracks.filters.all],
    ["available", copy.tracks.filters.available],
    ["active", copy.tracks.filters.active],
    ["hidden", copy.tracks.filters.hidden],
    ["sold", copy.tracks.filters.sold],
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">{copy.tracks.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{copy.tracks.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {trackFilters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => { setTrackStatusFilter(value); setTrackPage(1); }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                trackStatusFilter === value
                  ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100"
                  : "border-white/12 bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <input
        value={trackSearch}
        onChange={(e) => { setTrackSearch(e.target.value); setTrackPage(1); }}
        placeholder={copy.tracks.search}
        className="mt-5 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
      />

      {tracksLoading ? (
        <p className="mt-6 text-sm text-slate-300">{copy.tracks.loading}</p>
      ) : null}
      {tracksError ? (
        <p className="mt-6 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
          {tracksError}
        </p>
      ) : null}
      {trackActionState.error ? (
        <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
          {trackActionState.error}
        </p>
      ) : null}
      {!tracksLoading && !tracksError && tracks.length === 0 ? (
        <p className="mt-6 text-sm text-slate-300">{copy.tracks.empty}</p>
      ) : null}

      {!tracksLoading && !tracksError && tracks.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm text-slate-200">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="py-2">{copy.tracks.columns.title}</th>
                <th className="py-2">{copy.tracks.columns.bpm}</th>
                <th className="py-2">{copy.tracks.columns.price}</th>
                <th className="py-2">{copy.tracks.columns.listens}</th>
                <th className="py-2">{copy.tracks.columns.status}</th>
                <th className="py-2 text-right">{copy.tracks.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => {
                const isWorking = trackActionState.id === track.id;
                return (
                  <tr key={track.id} className="border-t border-white/8">
                    <td className="py-3">
                      <div>
                        <p className="font-semibold text-white">{track.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{track.musicalKey?.name || "-"}</p>
                      </div>
                    </td>
                    <td className="py-3">{track.bpm ?? 0}</td>
                    <td className="py-3 text-cyan-100">{getTrackDisplayPrice(track, language)}</td>
                    <td className="py-3">{track.listenCount ?? 0}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full border px-2 py-1 text-xs ${
                          track.isActive
                            ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-100"
                            : "border-white/12 bg-white/5 text-slate-300"
                        }`}>
                          {track.isActive ? copy.tracks.status.active : copy.tracks.status.hidden}
                        </span>
                        {track.isSold ? (
                          <span className="rounded-full border border-amber-300/30 bg-amber-400/12 px-2 py-1 text-xs text-amber-100">
                            {copy.tracks.status.sold}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => onEditTrack(track)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/25 bg-blue-400/10 px-3 py-1.5 text-xs text-blue-100 transition hover:bg-blue-400/18 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit3 className="h-3 w-3" />
                          {copy.tracks.actions.edit}
                        </button>
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => onPatchTrack(track, { isActive: !track.isActive })}
                          className={`rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 ${isWorking ? "opacity-50" : ""}`}
                        >
                          {track.isActive ? copy.tracks.actions.hide : copy.tracks.actions.restore}
                        </button>
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => onPatchTrack(track, { isSold: !track.isSold })}
                          className={`rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-400/18 disabled:cursor-not-allowed disabled:opacity-50 ${isWorking ? "opacity-50" : ""}`}
                        >
                          {track.isSold ? copy.tracks.actions.markAvailable : copy.tracks.actions.markSold}
                        </button>
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => onDeleteTrack(track)}
                          className="rounded-full border border-rose-300/25 bg-rose-400/12 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isWorking ? copy.tracks.actions.working : copy.tracks.actions.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {renderPagination(tracksMeta, setTrackPage)}
        </div>
      ) : null}
    </section>
  );
}

export default DashboardTracks;
