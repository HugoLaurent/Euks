import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, X } from "lucide-react";
import { API_BASE_URL } from "@/lib";

const FILE_TYPE_LABELS = {
  audio: { fr: "MP3 Preview", en: "MP3 Preview" },
  wave: { fr: "Fichier WAV", en: "WAV File" },
  stems: { fr: "Stems (ZIP)", en: "Stems (ZIP)" },
  cover: { fr: "Pochette", en: "Cover Art" },
};

function getFileTypeLabel(fileType, language) {
  return FILE_TYPE_LABELS[fileType]?.[language] ?? fileType;
}

function formatDate(value, language) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US");
}

function renderPagination(meta, page, setPage) {
  const cur = Number(meta?.currentPage || 1);
  const last = Number(meta?.lastPage || 1);
  if (last <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
      <span>Page {cur} / {last}</span>
      <div className="flex gap-2">
        <button type="button" disabled={cur <= 1} onClick={() => setPage(Math.max(1, cur - 1))}
          className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 disabled:opacity-50">Prev</button>
        <button type="button" disabled={cur >= last} onClick={() => setPage(Math.min(last, cur + 1))}
          className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}

function ClientDownloads({ language }) {
  const copy = language === "fr"
    ? { title: "Mes téléchargements", empty: "Aucun téléchargement disponible.", loading: "Chargement...", error: "Erreur.", license: "Licence", downloadCount: "Téléchargements", expiresAt: "Expire le", download: "Télécharger", expired: "Expiré", thanksTitle: "Merci pour ton achat ! 🎉", thanksBody: "Ton paiement a bien été validé. Tes fichiers sont disponibles ci-dessous — clique sur « Télécharger ». Les liens restent valables 12 mois.", dismiss: "Fermer" }
    : { title: "My Downloads", empty: "No downloads available.", loading: "Loading...", error: "Error.", license: "License", downloadCount: "Downloads", expiresAt: "Expires on", download: "Download", expired: "Expired", thanksTitle: "Thank you for your purchase! 🎉", thanksBody: "Your payment went through. Your files are available below — just click “Download”. Links stay valid for 12 months.", dismiss: "Dismiss" };

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dlError, setDlError] = useState("");
  const [showThanks, setShowThanks] = useState(
    () => new URLSearchParams(window.location.search).get("purchased") === "1",
  );

  // Drop the ?purchased flag from the URL so a refresh doesn't re-show the banner.
  useEffect(() => {
    if (!showThanks) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("purchased");
    window.history.replaceState({}, "", url);
  }, [showThanks]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/account/downloads?page=${page}&perPage=12`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || copy.error);
      setItems(data.data || []);
      setMeta(data.meta ?? { currentPage: page, lastPage: 1 });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, copy.error]);

  useEffect(() => { load(); }, [load]);

  async function handleDownload(dl) {
    setDlError("");
    try {
      const res = await fetch(`${API_BASE_URL}/downloads/${dl.accessToken}`, { credentials: "include" });
      if (!res.ok) throw new Error(copy.error);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disp = res.headers.get("content-disposition") ?? "";
      const match = disp.match(/filename[^;=\n]*=([^;\n]*)/);
      a.download = match?.[1]?.replace(/['"]/g, "").trim() || `${dl.track?.title || "download"}.${dl.fileType}`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
      load();
    } catch (e) { setDlError(e.message); }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-black text-white">{copy.title}</h2>
      {showThanks ? (
        <div className="relative flex items-start gap-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-sm text-emerald-50">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <div className="min-w-0 pr-6">
            <p className="font-semibold">{copy.thanksTitle}</p>
            <p className="mt-1 leading-6 text-emerald-50/90">{copy.thanksBody}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowThanks(false)}
            aria-label={copy.dismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-emerald-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {dlError ? <p className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-3 text-sm text-rose-100">{dlError}</p> : null}
      {error ? <p className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-400">{copy.loading}</p> : null}
      {!loading && !error && items.length === 0 ? <p className="text-sm text-slate-400">{copy.empty}</p> : null}
      {!loading && items.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((dl) => (
              <div key={dl.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="truncate font-semibold text-white">{dl.track?.title || "—"}</p>
                <p className="mt-1 text-xs text-slate-400">{copy.license}: {dl.license?.title || "—"}</p>
                <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                  {getFileTypeLabel(dl.fileType, language)}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{copy.downloadCount}: {dl.downloadCount}</span>
                  {dl.expiresAt ? (
                    <span className={dl.isValid ? "" : "text-rose-400"}>
                      {dl.isValid ? `${copy.expiresAt}: ${formatDate(dl.expiresAt, language)}` : copy.expired}
                    </span>
                  ) : null}
                </div>
                <button type="button" onClick={() => handleDownload(dl)} disabled={!dl.isValid}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    dl.isValid
                      ? "border border-cyan-300/35 bg-cyan-400/20 text-cyan-100 hover:bg-cyan-400/30"
                      : "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
                  }`}>
                  <Download className="h-3.5 w-3.5" />
                  {dl.isValid ? copy.download : copy.expired}
                </button>
              </div>
            ))}
          </div>
          {renderPagination(meta, page, setPage)}
        </>
      ) : null}
    </section>
  );
}

export default ClientDownloads;
