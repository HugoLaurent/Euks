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

function StatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </article>
  );
}

function DashboardOverview({ copy, summary, summaryLoading, summaryError, language }) {
  const s = summary?.stats ?? {};

  return (
    <section className="space-y-5">
      {summaryLoading ? (
        <p className="text-sm text-slate-300">{copy.overview.loading}</p>
      ) : null}
      {summaryError ? (
        <p className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
          {summaryError}
        </p>
      ) : null}

      {/* Today */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          {language === "fr" ? "Aujourd'hui" : "Today"}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={copy.overview.cards.purchases} value={s.purchasesToday ?? 0} />
          <StatCard label={copy.overview.cards.revenue} value={formatMoney(s.revenueTodayCents, "EUR", language)} />
          <StatCard label={copy.overview.cards.tracks} value={s.activeTracks ?? 0} />
          <StatCard label={copy.overview.cards.activeLicenses} value={s.soldTracks ?? 0} />
        </div>
      </div>

      {/* This month */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          {language === "fr" ? "Ce mois-ci" : "This month"}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={language === "fr" ? "Achats du mois" : "Monthly purchases"}
            value={s.purchasesMonth ?? 0}
          />
          <StatCard
            label={language === "fr" ? "CA du mois" : "Monthly revenue"}
            value={formatMoney(s.revenueMonthCents, "EUR", language)}
          />
          <StatCard
            label={language === "fr" ? "Total achats" : "Total purchases"}
            value={s.completedPurchases ?? 0}
          />
          <StatCard
            label={language === "fr" ? "CA total" : "All-time revenue"}
            value={formatMoney(s.totalRevenueCents, "EUR", language)}
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
        <h3 className="text-lg font-semibold text-white">{copy.overview.recent}</h3>
        {summary?.recentPurchases?.length ? (
          <div className="mt-4 divide-y divide-white/8">
            {summary.recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="grid gap-2 py-3 text-sm text-slate-200 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-white">{purchase.trackTitle}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {purchase.payerEmail || "-"} · {purchase.licenseTitle}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-semibold text-cyan-100">
                    {formatMoney(purchase.amountCents, purchase.currencyCode, language)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(purchase.createdAt, language)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-300">{copy.overview.recentEmpty}</p>
        )}
      </div>
    </section>
  );
}

export default DashboardOverview;
