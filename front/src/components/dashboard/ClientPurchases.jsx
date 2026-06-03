import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib";

function formatDate(value, language) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US");
}

function formatPrice(cents, currency = "EUR", language = "fr") {
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US", {
    style: "currency", currency: currency || "EUR",
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100);
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

function ClientPurchases({ language }) {
  const copy = language === "fr"
    ? { title: "Mes achats", empty: "Aucun achat trouvé.", loading: "Chargement...", error: "Erreur.", track: "Musique", license: "Licence", amount: "Montant", date: "Date" }
    : { title: "My Purchases", empty: "No purchases found.", loading: "Loading...", error: "Error.", track: "Track", license: "License", amount: "Amount", date: "Date" };

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/account/purchases?page=${page}&perPage=12`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || copy.error);
      setItems(data.data || []);
      setMeta(data.meta ?? { currentPage: page, lastPage: 1 });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, copy.error]);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-black text-white">{copy.title}</h2>
      {error ? <p className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-400">{copy.loading}</p> : null}
      {!loading && !error && items.length === 0 ? <p className="text-sm text-slate-400">{copy.empty}</p> : null}
      {!loading && items.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">{copy.track}</th>
                  <th className="px-4 py-3 text-left">{copy.license}</th>
                  <th className="px-4 py-3 text-left">{copy.amount}</th>
                  <th className="px-4 py-3 text-left">{copy.date}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-white/8 transition hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-white">{p.track?.title || "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{p.license?.title || "—"}</td>
                    <td className="px-4 py-3 text-cyan-100">{formatPrice(p.amount, p.currency, language)}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(p.purchasedAt, language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(meta, page, setPage)}
        </>
      ) : null}
    </section>
  );
}

export default ClientPurchases;
