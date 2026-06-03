import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, ShoppingBag } from "lucide-react";
import { API_BASE_URL, AUTH_USER_STORAGE_KEY } from "@/lib";
import { useAppContext } from "@/AppContext";

const FILE_TYPE_LABELS = {
  audio: { fr: "MP3 Preview", en: "MP3 Preview" },
  wave: { fr: "Fichier WAV", en: "WAV File" },
  stems: { fr: "Stems (ZIP)", en: "Stems (ZIP)" },
  cover: { fr: "Pochette", en: "Cover Art" },
};

function getFileTypeLabel(fileType, language) {
  return FILE_TYPE_LABELS[fileType]?.[language] ?? fileType;
}

function formatDate(dateString, language) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US");
}

function formatPrice(cents, currency = "EUR", language = "fr") {
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100);
}

function renderPagination(meta, page, setPage) {
  const currentPage = Number(meta?.currentPage || 1);
  const lastPage = Number(meta?.lastPage || 1);
  if (lastPage <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
      <span>Page {currentPage} / {lastPage}</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >Prev</button>
        <button
          type="button"
          disabled={currentPage >= lastPage}
          onClick={() => setPage(Math.min(lastPage, currentPage + 1))}
          className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >Next</button>
      </div>
    </div>
  );
}

function ClientDashboardPage() {
  const { language = "fr" } = useAppContext();
  const [activeTab, setActiveTab] = useState("downloads");

  const [downloads, setDownloads] = useState([]);
  const [downloadsMeta, setDownloadsMeta] = useState({ currentPage: 1, lastPage: 1 });
  const [downloadsPage, setDownloadsPage] = useState(1);
  const [downloadsLoading, setDownloadsLoading] = useState(false);
  const [downloadsError, setDownloadsError] = useState("");

  const [purchases, setPurchases] = useState([]);
  const [purchasesMeta, setPurchasesMeta] = useState({ currentPage: 1, lastPage: 1 });
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState("");

  const [downloadError, setDownloadError] = useState("");

  const copy = useMemo(() => ({
    fr: {
      title: "Mon Espace",
      subtitle: "Achats et téléchargements",
      tabDownloads: "Mes téléchargements",
      tabPurchases: "Historique d'achats",
      backToStore: "Retour au store",
      logout: "Déconnexion",
      noDownloads: "Aucun téléchargement disponible.",
      noPurchases: "Aucun achat trouvé.",
      track: "Musique",
      license: "Licence",
      fileType: "Fichier",
      downloadCount: "Téléchargements",
      expiresAt: "Expire le",
      download: "Télécharger",
      expired: "Expiré",
      amount: "Montant",
      purchasedAt: "Acheté le",
      loading: "Chargement...",
      error: "Une erreur est survenue.",
    },
    en: {
      title: "My Account",
      subtitle: "Purchases and downloads",
      tabDownloads: "My Downloads",
      tabPurchases: "Purchase History",
      backToStore: "Back to store",
      logout: "Sign out",
      noDownloads: "No downloads available.",
      noPurchases: "No purchases found.",
      track: "Track",
      license: "License",
      fileType: "File",
      downloadCount: "Downloads",
      expiresAt: "Expires on",
      download: "Download",
      expired: "Expired",
      amount: "Amount",
      purchasedAt: "Purchased on",
      loading: "Loading...",
      error: "An error occurred.",
    },
  })[language] ?? {}, [language]);

  const fetchDownloads = useCallback(async () => {
    setDownloadsLoading(true);
    setDownloadsError("");
    try {
      const res = await fetch(`${API_BASE_URL}/account/downloads?page=${downloadsPage}&perPage=12`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || copy.error);
      setDownloads(data.data || []);
      setDownloadsMeta(data.meta ?? { currentPage: downloadsPage, lastPage: 1 });
    } catch (err) {
      setDownloadsError(err?.message || copy.error);
    } finally {
      setDownloadsLoading(false);
    }
  }, [downloadsPage, copy.error]);

  const fetchPurchases = useCallback(async () => {
    setPurchasesLoading(true);
    setPurchasesError("");
    try {
      const res = await fetch(`${API_BASE_URL}/account/purchases?page=${purchasesPage}&perPage=12`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || copy.error);
      setPurchases(data.data || []);
      setPurchasesMeta(data.meta ?? { currentPage: purchasesPage, lastPage: 1 });
    } catch (err) {
      setPurchasesError(err?.message || copy.error);
    } finally {
      setPurchasesLoading(false);
    }
  }, [purchasesPage, copy.error]);

  useEffect(() => { fetchDownloads(); }, [fetchDownloads]);
  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  async function handleDownload(download) {
    setDownloadError("");
    try {
      const res = await fetch(`${API_BASE_URL}/downloads/${download.accessToken}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(copy.error);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename[^;=\n]*=([^;\n]*)/);
      a.download = match?.[1]?.replace(/['"]/g, "").trim() || `${download.track?.title || "download"}.${download.fileType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      fetchDownloads();
    } catch (err) {
      setDownloadError(err?.message || copy.error);
    }
  }

  function handleLogout() {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).finally(() => {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      window.location.href = "/";
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="font-['Archivo'] text-3xl font-bold text-white">{copy.title}</h1>
            <p className="text-sm text-slate-400">{copy.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
              {copy.backToStore}
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-rose-300/35 bg-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/30"
            >
              {copy.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("downloads")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "downloads"
                ? "bg-slate-800 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="h-4 w-4" />
            {copy.tabDownloads}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("purchases")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "purchases"
                ? "bg-slate-800 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {copy.tabPurchases}
          </button>
        </div>

        {downloadError ? (
          <div className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {downloadError}
          </div>
        ) : null}

        {/* Downloads */}
        {activeTab === "downloads" && (
          <div className="mt-6">
            {downloadsError ? (
              <p className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">{downloadsError}</p>
            ) : null}
            {downloadsLoading ? (
              <p className="text-center text-sm text-slate-400">{copy.loading}</p>
            ) : !downloadsError && downloads.length === 0 ? (
              <p className="text-center text-sm text-slate-400">{copy.noDownloads}</p>
            ) : null}

            {!downloadsLoading && downloads.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {downloads.map((dl) => (
                    <div
                      key={dl.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="font-semibold text-white truncate">{dl.track?.title || "—"}</p>
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
                      <button
                        type="button"
                        onClick={() => handleDownload(dl)}
                        disabled={!dl.isValid}
                        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                          dl.isValid
                            ? "border border-cyan-300/35 bg-cyan-400/20 text-cyan-100 hover:bg-cyan-400/30"
                            : "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
                        }`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {dl.isValid ? copy.download : copy.expired}
                      </button>
                    </div>
                  ))}
                </div>
                {renderPagination(downloadsMeta, downloadsPage, setDownloadsPage)}
              </>
            ) : null}
          </div>
        )}

        {/* Purchases */}
        {activeTab === "purchases" && (
          <div className="mt-6">
            {purchasesError ? (
              <p className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">{purchasesError}</p>
            ) : null}
            {purchasesLoading ? (
              <p className="text-center text-sm text-slate-400">{copy.loading}</p>
            ) : !purchasesError && purchases.length === 0 ? (
              <p className="text-center text-sm text-slate-400">{copy.noPurchases}</p>
            ) : null}

            {!purchasesLoading && purchases.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-400">
                      <tr>
                        <th className="px-4 py-3 text-left">{copy.track}</th>
                        <th className="px-4 py-3 text-left">{copy.license}</th>
                        <th className="px-4 py-3 text-left">{copy.amount}</th>
                        <th className="px-4 py-3 text-left">{copy.purchasedAt}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b border-white/8 transition hover:bg-white/5">
                          <td className="px-4 py-3 font-semibold text-white">
                            {purchase.track?.title || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {purchase.license?.title || "—"}
                          </td>
                          <td className="px-4 py-3 text-cyan-100">
                            {formatPrice(purchase.amount, purchase.currency, language)}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {formatDate(purchase.purchasedAt, language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(purchasesMeta, purchasesPage, setPurchasesPage)}
              </>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}

export default ClientDashboardPage;
