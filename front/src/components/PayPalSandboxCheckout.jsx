import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";

let paypalSdkPromise = null;
let paypalSdkSrc = "";

function buildSdkSource({ buyerCountry, clientId, currencyCode }) {
  const params = new URLSearchParams({
    "client-id": clientId,
    "buyer-country": buyerCountry,
    components: "buttons",
    currency: currencyCode,
    intent: "capture",
  });

  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

function loadPaypalSdk(config) {
  const src = buildSdkSource(config);

  if (window.paypal && paypalSdkSrc === src) {
    return Promise.resolve(window.paypal);
  }

  if (paypalSdkPromise && paypalSdkSrc === src) {
    return paypalSdkPromise;
  }

  const existingScript = document.querySelector('script[data-paypal-sdk="true"]');

  if (existingScript && existingScript.getAttribute("src") !== src) {
    existingScript.remove();
    paypalSdkPromise = null;
  }

  paypalSdkSrc = src;

  paypalSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-paypal-sdk", "true");
    script.setAttribute("data-sdk-integration-source", "euks-store");
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("PayPal SDK failed to load."));
    document.head.append(script);
  });

  return paypalSdkPromise;
}

function getPrimaryCapture(result) {
  return result?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;
}

function PayPalSandboxCheckout({
  amountValue,
  copy,
  isEnabled,
  language,
  license,
  track,
}) {
  const containerRef = useRef(null);
  const [configState, setConfigState] = useState({
    configured: false,
    isLoading: true,
    payload: null,
  });
  const [checkoutState, setCheckoutState] = useState({
    approval: null,
    error: "",
    status: "idle",
  });

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    const controller = new AbortController();

    async function fetchConfig() {
      try {
        setConfigState((prev) => ({
          ...prev,
          isLoading: true,
        }));

        const response = await fetch("/api/paypal/config", {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || copy.paypalConfigError);
        }

        setConfigState({
          configured: Boolean(payload.configured),
          isLoading: false,
          payload,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setConfigState({
          configured: false,
          isLoading: false,
          payload: {
            message: error.message || copy.paypalConfigError,
            missing: [],
          },
        });
      }
    }

    fetchConfig();

    return () => controller.abort();
  }, [copy.paypalConfigError, isEnabled]);

  useEffect(() => {
    if (!isEnabled || !configState.configured || !configState.payload || !license) {
      return undefined;
    }

    let isCancelled = false;
    const container = containerRef.current;

    async function renderButtons() {
      try {
        setCheckoutState((prev) => ({
          ...prev,
          approval: null,
          error: "",
          status: "loading_sdk",
        }));

        const paypal = await loadPaypalSdk({
          buyerCountry: configState.payload.buyerCountry,
          clientId: configState.payload.clientId,
          currencyCode: configState.payload.currencyCode,
        });

        if (isCancelled || !container) {
          return;
        }

        container.innerHTML = "";

        const buttons = paypal.Buttons({
          fundingSource: "paypal",
          style: {
            borderRadius: 16,
            color: "gold",
            height: 50,
            label: "paypal",
            layout: "vertical",
            shape: "rect",
          },
          createOrder: async () => {
            setCheckoutState((prev) => ({
              ...prev,
              error: "",
              status: "creating_order",
            }));

            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amountValue,
                currencyCode: configState.payload.currencyCode,
                licenseId: license.id,
                licenseTitle: license.title,
                locale: language === "fr" ? "fr-FR" : "en-US",
                trackTitle: track.title,
              }),
            });

            const payload = await response.json();

            if (!response.ok || !payload.id) {
              throw new Error(payload.message || copy.paypalCreateOrderError);
            }

            setCheckoutState((prev) => ({
              ...prev,
              status: "awaiting_approval",
            }));

            return payload.id;
          },
          onApprove: async (data, actions) => {
            setCheckoutState((prev) => ({
              ...prev,
              error: "",
              status: "capturing",
            }));

            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            });

            const payload = await response.json();

            if (!response.ok) {
              const issue = payload.details?.[0]?.issue;

              if (issue === "INSTRUMENT_DECLINED" && actions?.restart) {
                return actions.restart();
              }

              throw new Error(payload.message || copy.paypalCaptureError);
            }

            const capture = getPrimaryCapture(payload);

            setCheckoutState({
              approval: {
                captureId: capture?.id || "",
                orderId: payload.id || data.orderID,
                payerEmail: payload.payer?.email_address || "",
                status: capture?.status || payload.status || "COMPLETED",
              },
              error: "",
              status: "approved",
            });
          },
          onCancel: () => {
            setCheckoutState((prev) => ({
              ...prev,
              error: "",
              status: "cancelled",
            }));
          },
          onError: (error) => {
            setCheckoutState((prev) => ({
              ...prev,
              error: error.message || copy.paypalGenericError,
              status: "error",
            }));
          },
        });

        if (!buttons.isEligible()) {
          setCheckoutState((prev) => ({
            ...prev,
            error: copy.paypalUnavailable,
            status: "error",
          }));
          return;
        }

        await buttons.render(container);

        if (!isCancelled) {
          setCheckoutState((prev) => ({
            ...prev,
            status: "ready",
          }));
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setCheckoutState((prev) => ({
          ...prev,
          error: error.message || copy.paypalGenericError,
          status: "error",
        }));
      }
    }

    renderButtons();

    return () => {
      isCancelled = true;

      if (container) {
        container.innerHTML = "";
      }
    };
  }, [
    amountValue,
    configState.configured,
    configState.payload,
    copy.paypalCaptureError,
    copy.paypalCreateOrderError,
    copy.paypalGenericError,
    copy.paypalUnavailable,
    isEnabled,
    language,
    license,
    track,
  ]);

  if (!isEnabled) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-slate-200">
        <p className="font-semibold text-white">
          {license?.isFree ? copy.freeTitle : copy.unavailableTitle}
        </p>
        <p className="mt-2 leading-6 text-slate-300">
          {license?.isFree ? copy.freeDescription : copy.unavailableDescription}
        </p>
      </div>
    );
  }

  if (configState.isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-slate-200">
        <div className="flex items-center gap-3">
          <LoaderCircle className="h-4.5 w-4.5 animate-spin text-[#ffc439]" />
          <span>{copy.paypalLoading}</span>
        </div>
      </div>
    );
  }

  if (!configState.configured) {
    const missing = configState.payload?.missing?.join(", ");

    return (
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
          <div>
            <p className="font-semibold">{copy.paypalMissingTitle}</p>
            <p className="mt-2 leading-6 text-amber-50/85">
              {copy.paypalMissingDescription}
            </p>
            {missing ? (
              <p className="mt-3 font-mono text-xs text-amber-100">{missing}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
          {copy.paypalInstructionTitle}
        </p>
        <p className="mt-2 leading-6 text-slate-200/90">
          {copy.paypalInstructionBody}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
        {(checkoutState.status === "loading_sdk" ||
          checkoutState.status === "creating_order" ||
          checkoutState.status === "capturing") ? (
          <div className="mb-4 flex items-center gap-3 text-sm text-slate-200">
            <LoaderCircle className="h-4.5 w-4.5 animate-spin text-[#ffc439]" />
            <span>
              {checkoutState.status === "capturing"
                ? copy.processing
                : copy.paypalLoading}
            </span>
          </div>
        ) : null}

        <div ref={containerRef} className="min-h-13" />

        {checkoutState.status === "cancelled" ? (
          <p className="mt-4 text-sm text-slate-300">
            {copy.paypalCancelled}
          </p>
        ) : null}

        {checkoutState.error ? (
          <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-50">
            <p className="font-semibold">{copy.paypalErrorTitle}</p>
            <p className="mt-2 leading-6 text-rose-100/90">
              {checkoutState.error}
            </p>
          </div>
        ) : null}

        {checkoutState.approval ? (
          <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm text-emerald-50">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div className="min-w-0">
                <p className="font-semibold">{copy.successTitle}</p>
                <p className="mt-1 leading-6 text-emerald-50/85">
                  {copy.paypalApprovedDescription}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-200/85">
                  {copy.orderId}
                </p>
                <p className="mt-1 font-mono text-xs text-emerald-100">
                  {checkoutState.approval.orderId}
                </p>
                {checkoutState.approval.captureId ? (
                  <>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-200/85">
                      {copy.paypalCaptureId}
                    </p>
                    <p className="mt-1 font-mono text-xs text-emerald-100">
                      {checkoutState.approval.captureId}
                    </p>
                  </>
                ) : null}
                {checkoutState.approval.payerEmail ? (
                  <>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-200/85">
                      {copy.paypalPayerEmail}
                    </p>
                    <p className="mt-1 text-xs text-emerald-100">
                      {checkoutState.approval.payerEmail}
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PayPalSandboxCheckout;
