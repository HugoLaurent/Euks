function formatMoney(cents, currencyCode = "EUR", language = "fr") {
  const amount = Number(cents || 0) / 100;
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US", {
    currency: currencyCode || "EUR",
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(value, language = "fr") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
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

function DashboardPurchases({
  copy,
  language,
  purchases,
  purchasesMeta,
  purchasesLoading,
  purchasesError,
  purchaseStatusFilter,
  setPurchaseStatusFilter,
  setPurchasesPage,
}) {
  const purchaseFilters = [
    ["all", copy.purchases.filters.all],
    ["COMPLETED", copy.purchases.filters.completed],
    ["FAILED", copy.purchases.filters.failed],
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">{copy.purchases.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{copy.purchases.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {purchaseFilters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => { setPurchaseStatusFilter(value); setPurchasesPage(1); }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                purchaseStatusFilter === value
                  ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100"
                  : "border-white/12 bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {purchasesLoading ? (
        <p className="mt-6 text-sm text-slate-300">{copy.purchases.loading}</p>
      ) : null}
      {purchasesError ? (
        <p className="mt-6 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
          {purchasesError}
        </p>
      ) : null}
      {!purchasesLoading && !purchasesError && purchases.length === 0 ? (
        <p className="mt-6 text-sm text-slate-300">{copy.purchases.empty}</p>
      ) : null}

      {!purchasesLoading && !purchasesError && purchases.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm text-slate-200">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="py-2">{copy.purchases.columns.orderId}</th>
                <th className="py-2">{copy.purchases.columns.buyer}</th>
                <th className="py-2">{copy.purchases.columns.track}</th>
                <th className="py-2">{copy.purchases.columns.license}</th>
                <th className="py-2">{copy.purchases.columns.amount}</th>
                <th className="py-2">{copy.purchases.columns.status}</th>
                <th className="py-2">{copy.purchases.columns.date}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-t border-white/8">
                  <td className="py-3 font-mono text-xs text-cyan-100">
                    {purchase.paypalOrderId || `#${purchase.id}`}
                  </td>
                  <td className="py-3">{purchase.payerEmail || "-"}</td>
                  <td className="py-3">{purchase.trackTitle}</td>
                  <td className="py-3">{purchase.licenseTitle}</td>
                  <td className="py-3">
                    {formatMoney(purchase.amountCents, purchase.currencyCode, language)}
                  </td>
                  <td className="py-3">{purchase.status}</td>
                  <td className="py-3">{formatDateTime(purchase.createdAt, language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination(purchasesMeta, setPurchasesPage)}
        </div>
      ) : null}
    </section>
  );
}

export default DashboardPurchases;
