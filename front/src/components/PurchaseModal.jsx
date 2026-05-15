import { useCallback, useEffect, useState } from "react";
import { Play, X, Sparkles, ChevronDown, ShieldCheck } from "lucide-react";
import PayPalSandboxCheckout from "@/components/PayPalSandboxCheckout.jsx";

function getDefaultLicenseId(cards) {
  return (
    cards.find((card) => card.tier === "premiumPlus")?.selectionId ??
    cards[0]?.selectionId
  );
}

const purchaseModalCopy = {
  fr: {
    dialogLabel: (title) => `Modal d'achat pour ${title}`,
    kicker: "Achat exclusif du beat",
    closeAriaLabel: "Fermer la modale d'achat",
    play: "Ecouter le morceau",
    licenseOptions: "Options de licence",
    negotiateHelp: "Ou sinon : negocier le prix.",
    showTerms: "Voir les conditions d'utilisation",
    hideTerms: "Masquer les conditions d'utilisation",
    onRequest: "Sur demande",
    negotiate: "Negocier",
    chooseLicense: "Choisir",
    useForFree: "Utilisation gratuite",
    selectedLicense: "Licence selectionnee",
    testModeBadge: "Mode test PayPal",
    sandboxTitle: "Checkout sandbox",
    sandboxDescription:
      "Le bloc ci-dessous lance un vrai checkout PayPal Sandbox via l'API pour tester le parcours complet.",
    processing: "Connexion au sandbox PayPal...",
    successTitle: "Paiement test valide",
    successDescription:
      "Le paiement sandbox est bien passe. Tu peux maintenant verifier le flux complet cote UX.",
    orderId: "Commande test",
    trackLabel: "Morceau",
    bpmLabel: "Tempo",
    secureNote: "Aucun debit reel",
    unavailableTitle: "Paiement test indisponible",
    unavailableDescription:
      "Cette licence passe par une nego, donc le checkout PayPal est desactive pour celle-ci.",
    freeTitle: "Licence gratuite",
    freeDescription:
      "Cette licence est en mode gratuit, donc aucun checkout PayPal n'est necessaire.",
    quoteOnly: "Devis",
    selectedTag: "Selectionnee",
    paypalInstructionTitle: "Test sandbox",
    paypalInstructionBody:
      "Connecte-toi avec un compte acheteur sandbox PayPal pour approuver ce paiement de test.",
    paypalMissingTitle: "Configuration PayPal manquante",
    paypalMissingDescription:
      "Ajoute PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET dans .env.local, puis relance Vite pour activer le vrai checkout sandbox.",
    paypalLoading: "Chargement du checkout PayPal...",
    paypalConfigError: "Impossible de recuperer la configuration PayPal.",
    paypalCreateOrderError: "La creation de commande PayPal a echoue.",
    paypalCaptureError: "La capture du paiement PayPal a echoue.",
    paypalGenericError: "Une erreur PayPal est survenue.",
    paypalErrorTitle: "Erreur PayPal",
    paypalCancelled: "Le paiement a ete annule dans la fenetre PayPal.",
    paypalApprovedDescription:
      "La commande sandbox a ete approuvee et capturee avec succes.",
    paypalCaptureId: "Capture",
    paypalPayerEmail: "Acheteur sandbox",
    paypalUnavailable:
      "Le bouton PayPal n'est pas disponible pour cette configuration.",
  },
  en: {
    dialogLabel: (title) => `Purchase modal for ${title}`,
    kicker: "Exclusive beat checkout",
    closeAriaLabel: "Close purchase modal",
    play: "Play the track",
    licenseOptions: "License options",
    negotiateHelp: "Or, you can also: negotiate the price.",
    showTerms: "Show usage terms",
    hideTerms: "Hide usage terms",
    onRequest: "On request",
    negotiate: "Negotiate",
    chooseLicense: "Choose",
    useForFree: "Free to use",
    selectedLicense: "Selected license",
    testModeBadge: "PayPal test mode",
    sandboxTitle: "Sandbox checkout",
    sandboxDescription:
      "The block below runs a real PayPal Sandbox checkout through the API so you can test the full flow.",
    processing: "Connecting to PayPal sandbox...",
    successTitle: "Test payment approved",
    successDescription:
      "The sandbox payment went through successfully. You can now review the full UX flow.",
    orderId: "Test order",
    trackLabel: "Track",
    bpmLabel: "Tempo",
    secureNote: "No real charge",
    unavailableTitle: "Test payment unavailable",
    unavailableDescription:
      "This license goes through a negotiated quote, so PayPal checkout is disabled for it.",
    freeTitle: "Free license",
    freeDescription:
      "This license is marked as free to use, so no PayPal checkout is needed.",
    quoteOnly: "Quote only",
    selectedTag: "Selected",
    paypalInstructionTitle: "Sandbox test",
    paypalInstructionBody:
      "Sign in with a PayPal sandbox buyer account to approve this test payment.",
    paypalMissingTitle: "PayPal configuration missing",
    paypalMissingDescription:
      "Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env.local, then restart Vite to enable the real sandbox checkout.",
    paypalLoading: "Loading PayPal checkout...",
    paypalConfigError: "Unable to load PayPal configuration.",
    paypalCreateOrderError: "PayPal order creation failed.",
    paypalCaptureError: "PayPal payment capture failed.",
    paypalGenericError: "A PayPal error occurred.",
    paypalErrorTitle: "PayPal error",
    paypalCancelled: "The payment was cancelled in the PayPal window.",
    paypalApprovedDescription:
      "The sandbox order was approved and captured successfully.",
    paypalCaptureId: "Capture",
    paypalPayerEmail: "Sandbox buyer",
    paypalUnavailable:
      "The PayPal button is unavailable for this configuration.",
  },
};

function PurchaseModal({ isOpen, onClose, onPlay, track, language = "en" }) {
  const copy = purchaseModalCopy[language] ?? purchaseModalCopy.en;
  const licenseCards = track?.licenseCards ?? [];
  const defaultLicenseId = getDefaultLicenseId(licenseCards);
  const [expandedTerms, setExpandedTerms] = useState({});
  const [selectedLicenseId, setSelectedLicenseId] = useState(defaultLicenseId);
  const resolvedSelectedLicenseId = selectedLicenseId ?? defaultLicenseId;
  const selectedLicense =
    licenseCards.find((card) => card.selectionId === resolvedSelectedLicenseId) ??
    licenseCards[0];
  const selectedPrice = selectedLicense?.displayPrice ?? copy.onRequest;
  const canSimulatePayment = Boolean(selectedLicense?.checkoutEnabled);

  const handleRequestClose = useCallback(() => {
    setExpandedTerms({});
    setSelectedLicenseId(defaultLicenseId);
    onClose();
  }, [defaultLicenseId, onClose]);

  const handleLicenseSelect = useCallback((licenseId) => {
    setSelectedLicenseId(licenseId);
  }, []);

  useEffect(() => {
    setSelectedLicenseId(defaultLicenseId);
  }, [defaultLicenseId]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleRequestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleRequestClose]);

  if (!isOpen || !track) {
    return null;
  }

  const coverStyle = track.coverImage
    ? {
        backgroundImage: `linear-gradient(rgba(2,6,23,0.18), rgba(2,6,23,0.68)), url(${track.coverImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }
    : undefined;

  return (
    <div
      className="purchase-modal-backdrop-enter fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-4 py-4 backdrop-blur-md md:items-center md:py-8"
      onClick={handleRequestClose}
      role="presentation"
    >
      <div
        className="purchase-modal-panel-enter max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-4xl border border-white/10 bg-slate-950/95 shadow-[0_30px_100px_rgba(2,6,23,0.75)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={copy.dialogLabel(track.title)}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              {copy.kicker}
            </p>
            <h2 className="mt-1 text-2xl font-black text-white md:text-3xl">
              {track.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label={copy.closeAriaLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 overflow-y-auto px-5 py-5 md:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8">
          <aside className="space-y-4">
            <div
              className={`flex min-h-65 items-end rounded-3xl ${
                track.coverImage
                  ? "bg-slate-900"
                  : `bg-linear-to-br ${track.cover}`
              } p-5 shadow-[0_20px_60px_rgba(2,6,23,0.4)]`}
              style={coverStyle}
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                  {track.artist}
                </p>
                <p className="max-w-55 text-4xl font-black leading-none text-white">
                  {track.title}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {track.duration}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {track.bpm} BPM
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-cyan-100">
                {track.price}
              </span>
            </div>

            <button
              type="button"
              onClick={onPlay}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-cyan-300/30 bg-cyan-300/15 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/25"
            >
              <Play className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
              <span>{copy.play}</span>
            </button>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-cyan-200">
                <Sparkles className="h-4 w-4" />
                <p className="font-semibold uppercase tracking-[0.2em] text-xs">
                  {copy.licenseOptions}
                </p>
              </div>
              <p className="mt-3 leading-6">{copy.negotiateHelp}</p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[#ffc439]/20 bg-[linear-gradient(180deg,rgba(0,48,135,0.88),rgba(2,6,23,0.94))] p-4 text-sm text-slate-100 shadow-[0_18px_60px_rgba(0,48,135,0.28)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#ffc439]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {copy.testModeBadge}
                  </span>
                  <div>
                    <p className="text-lg font-black text-white">
                      {copy.sandboxTitle}
                    </p>
                    <p className="mt-2 max-w-72 leading-6 text-slate-200/85">
                      {copy.sandboxDescription}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#ffc439] px-3 py-2 text-[#003087] shadow-[0_10px_24px_rgba(255,196,57,0.22)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em]">
                    PayPal
                  </p>
                  <p className="text-xs font-semibold">{copy.secureNote}</p>
                </div>
              </div>

              {selectedLicense ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                          {copy.selectedLicense}
                        </p>
                        <p className="mt-1 text-base font-black text-white">
                          {selectedLicense.title}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                          {selectedLicense.format}
                        </p>
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-[#ffc439]">
                        {selectedPrice}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div className="rounded-2xl border border-white/8 bg-white/6 px-3 py-2">
                        <p className="uppercase tracking-[0.18em] text-slate-500">
                          {copy.trackLabel}
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-white">
                          {track.title}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/6 px-3 py-2">
                        <p className="uppercase tracking-[0.18em] text-slate-500">
                          {copy.bpmLabel}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {track.bpm} BPM
                        </p>
                      </div>
                    </div>
                  </div>

                  <PayPalSandboxCheckout
                    amountValue={selectedLicense?.amountValue ?? null}
                    copy={copy}
                    isEnabled={canSimulatePayment}
                    language={language}
                    license={selectedLicense}
                    track={track}
                  />
                </div>
              ) : null}
            </div>
          </aside>

          <section className="min-w-0">
            {track.licenseError ? (
              <div className="rounded-3xl border border-rose-300/25 bg-rose-500/10 p-5 text-sm leading-6 text-rose-100">
                {track.licenseError}
              </div>
            ) : null}

            {!track.licenseError && licenseCards.length === 0 ? (
              <div className="rounded-3xl border border-amber-300/25 bg-amber-400/10 p-5 text-sm leading-6 text-amber-100">
                No licenses are available from the API for this track.
              </div>
            ) : null}

            {!track.licenseError && licenseCards.length > 0 ? (
              <div className="flex flex-col gap-4 lg:gap-5">
              {licenseCards.map((card) => {
                const price = card.displayPrice ?? copy.onRequest;
                const isExpanded = Boolean(expandedTerms[card.selectionId]);
                const isSelected = card.selectionId === resolvedSelectedLicenseId;
                const canCheckout = Boolean(card.checkoutEnabled);

                return (
                  <article
                    key={card.selectionId}
                    className={`flex w-full flex-col rounded-3xl border bg-white/5 p-4 shadow-[0_16px_50px_rgba(2,6,23,0.18)] transition ${
                      isSelected
                        ? "border-[#ffc439]/55 ring-2 ring-[#ffc439]/20"
                        : card.tier === "premiumPlus"
                          ? "border-cyan-300/40 ring-1 ring-cyan-300/20"
                          : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-white">
                            {card.title}
                          </p>
                          {isSelected ? (
                            <span className="rounded-full border border-[#ffc439]/25 bg-[#ffc439]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffc439]">
                              {copy.selectedTag}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                          {card.format}
                        </p>
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {price}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedTerms((prev) => ({
                            ...prev,
                            [card.selectionId]: !prev[card.selectionId],
                          }));
                        }}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:text-white"
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : "rotate-0"
                          }`}
                        />
                        <span>
                          {isExpanded ? copy.hideTerms : copy.showTerms}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLicenseSelect(card.selectionId)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          canCheckout || card.isFree
                            ? isSelected
                              ? "border-[#ffc439]/50 bg-[#003087] text-white"
                              : "border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
                            : "border-white/8 bg-white/5 text-slate-500"
                        }`}
                      >
                        <span>
                          {card.isFree
                            ? copy.useForFree
                            : canCheckout
                              ? copy.chooseLicense
                              : copy.quoteOnly}
                        </span>
                      </button>
                    </div>

                    {isExpanded ? (
                      <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-sm text-slate-300 md:grid-cols-2">
                        {card.details.map((detail) => (
                          <li key={detail} className="flex gap-2 leading-5">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export default PurchaseModal;
