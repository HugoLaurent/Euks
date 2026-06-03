import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, AUTH_USER_STORAGE_KEY } from "@/lib";

function ClientDashboardPage({ language = "fr" }) {
  const [activeTab, setActiveTab] = useState("downloads");
  const [purchases, setPurchases] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [purchasesPage] = useState(1);
  const [downloadsPage] = useState(1);

  const copy = useMemo(
    () =>
      ({
        fr: {
          title: "Mon Espace",
          subtitle: "Gère tes achats et téléchargements",
          tabDownloads: "Mes téléchargements",
          tabPurchases: "Historique d'achats",
          backToStore: "Retour au store",
          logout: "Déconnexion",
          noDownloads: "Aucun téléchargement disponible",
          noPurchases: "Aucun achat trouvé",
          track: "Track",
          license: "Licence",
          downloadCount: "Téléchargements",
          expiresAt: "Expire le",
          download: "Télécharger",
          expired: "Expiré",
          amount: "Montant",
          purchasedAt: "Acheté le",
          loading: "Chargement...",
          error: "Une erreur est survenue",
        },
        en: {
          title: "My Account",
          subtitle: "Manage your purchases and downloads",
          tabDownloads: "My Downloads",
          tabPurchases: "Purchase History",
          backToStore: "Back to store",
          logout: "Sign out",
          noDownloads: "No downloads available",
          noPurchases: "No purchases found",
          track: "Track",
          license: "License",
          downloadCount: "Downloads",
          expiresAt: "Expires on",
          download: "Download",
          expired: "Expired",
          amount: "Amount",
          purchasedAt: "Purchased on",
          loading: "Loading...",
          error: "An error occurred",
        },
      })[language] || {
        title: "Mon Espace",
        subtitle: "Gère tes achats et téléchargements",
        tabDownloads: "Mes téléchargements",
        tabPurchases: "Historique d'achats",
        backToStore: "Retour au store",
        logout: "Déconnexion",
        noDownloads: "Aucun téléchargement disponible",
        noPurchases: "Aucun achat trouvé",
        track: "Track",
        license: "Licence",
        downloadCount: "Téléchargements",
        expiresAt: "Expire le",
        download: "Télécharger",
        expired: "Expiré",
        amount: "Montant",
        purchasedAt: "Acheté le",
        loading: "Chargement...",
        error: "Une erreur est survenue",
      },
    [language],
  );

  const fetchDownloads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/account/downloads?page=${downloadsPage}&perPage=12`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || copy.error);
      }

      setDownloads(data.data || []);
    } catch (error) {
      setErrorMessage(error?.message || copy.error);
    } finally {
      setIsLoading(false);
    }
  }, [copy.error, downloadsPage]);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/account/purchases?page=${purchasesPage}&perPage=12`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || copy.error);
      }

      setPurchases(data.data || []);
    } catch (error) {
      setErrorMessage(error?.message || copy.error);
    } finally {
      setIsLoading(false);
    }
  }, [copy.error, purchasesPage]);

  useEffect(() => {
    if (activeTab === "downloads") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDownloads();
    } else {
      fetchPurchases();
    }
  }, [activeTab, fetchDownloads, fetchPurchases]);

  async function handleDownload(accessToken) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/downloads/${accessToken}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(copy.error);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers
        .get("content-disposition")
        ?.split("filename=")[1] || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setErrorMessage(error?.message || copy.error);
    }
  }

  function handleLogout() {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      window.location.href = "/";
    });
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US");
  }

  function formatPrice(cents) {
    return (cents / 100).toFixed(2);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="font-['Archivo'] text-3xl font-bold">{copy.title}</h1>
            <p className="text-sm text-slate-400">{copy.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-slate-400 transition hover:text-slate-200"
            >
              {copy.backToStore}
            </a>
            <button
              onClick={handleLogout}
              className="rounded-full border border-rose-300/35 bg-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/30"
            >
              {copy.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab("downloads")}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === "downloads"
                ? "border-b-2 border-cyan-400 text-cyan-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {copy.tabDownloads}
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === "purchases"
                ? "border-b-2 border-cyan-400 text-cyan-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {copy.tabPurchases}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div className="mt-6">
            {isLoading ? (
              <div className="text-center text-slate-400">{copy.loading}</div>
            ) : downloads.length === 0 ? (
              <div className="text-center text-slate-400">{copy.noDownloads}</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {downloads.map((download) => (
                  <div
                    key={download.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <h3 className="font-semibold text-white">
                      {download.track?.title || "Unknown Track"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {copy.license}: {download.license?.title}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Type: {download.fileType}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{copy.downloadCount}: {download.downloadCount}</span>
                      {download.expiresAt && (
                        <span className={download.isValid ? "" : "text-rose-400"}>
                          {download.isValid
                            ? `${copy.expiresAt}: ${formatDate(download.expiresAt)}`
                            : copy.expired}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownload(download.accessToken)}
                      disabled={!download.isValid}
                      className={`mt-4 w-full rounded-full px-4 py-2 text-xs font-semibold transition ${
                        download.isValid
                          ? "border border-cyan-300/35 bg-cyan-400/20 text-cyan-100 hover:bg-cyan-400/30"
                          : "border border-slate-300/20 bg-slate-400/10 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {copy.download}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === "purchases" && (
          <div className="mt-6">
            {isLoading ? (
              <div className="text-center text-slate-400">{copy.loading}</div>
            ) : purchases.length === 0 ? (
              <div className="text-center text-slate-400">{copy.noPurchases}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left font-semibold">
                        {copy.track}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        {copy.license}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        {copy.amount}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        {copy.purchasedAt}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        className="border-b border-white/10 transition hover:bg-white/5"
                      >
                        <td className="px-4 py-3">
                          {purchase.track?.title || "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          {purchase.license?.title || "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          €{formatPrice(purchase.amount)}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(purchase.purchasedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default ClientDashboardPage;
