import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

const PAYPAL_API_BASE_URL = "https://api-m.sandbox.paypal.com";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function getEnvConfig(envSource = {}) {
  const runtimeEnv = globalThis.process?.env ?? {};
  const env = { ...runtimeEnv, ...envSource };
  const clientId = env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = env.PAYPAL_CLIENT_SECRET?.trim();
  const currencyCode = env.PAYPAL_CURRENCY?.trim() || "EUR";
  const buyerCountry = env.PAYPAL_BUYER_COUNTRY?.trim() || "FR";
  const brandName = env.PAYPAL_BRAND_NAME?.trim() || "EUKS Store";
  const configured = Boolean(clientId && clientSecret);

  return {
    clientId,
    clientSecret,
    currencyCode,
    buyerCountry,
    brandName,
    configured,
  };
}

function buildConfigPayload(config) {
  return {
    configured: config.configured,
    clientId: config.configured ? config.clientId : null,
    currencyCode: config.currencyCode,
    buyerCountry: config.buyerCountry,
    brandName: config.brandName,
    missing:
      config.configured
        ? []
        : [
            !config.clientId ? "PAYPAL_CLIENT_ID" : null,
            !config.clientSecret ? "PAYPAL_CLIENT_SECRET" : null,
          ].filter(Boolean),
  };
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function getAccessToken(config) {
  const basicAuth = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "PayPal OAuth failed");
  }

  return payload.access_token;
}

function normalizeAmountValue(value) {
  const numeric = Number.parseFloat(String(value));

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric.toFixed(2);
}

async function paypalFetch(config, path, payload) {
  const accessToken = await getAccessToken(config);
  const response = await fetch(`${PAYPAL_API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "PayPal API request failed");
    error.statusCode = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

function createPaypalSandboxPlugin(envSource = {}) {
  const middleware = async (req, res, next) => {
    const url = new URL(req.url || "/", "http://localhost");

    if (!url.pathname.startsWith("/api/paypal/")) {
      next();
      return;
    }

    const config = getEnvConfig(envSource);

    if (req.method === "GET" && url.pathname === "/api/paypal/config") {
      sendJson(res, 200, buildConfigPayload(config));
      return;
    }

    if (!config.configured) {
      sendJson(res, 500, {
        message: "PayPal sandbox credentials are missing.",
        ...buildConfigPayload(config),
      });
      return;
    }

    try {
      if (req.method === "POST" && url.pathname === "/api/paypal/create-order") {
        const body = await readJsonBody(req);
        const amountValue = normalizeAmountValue(body.amountValue);

        if (!amountValue) {
          sendJson(res, 400, { message: "A valid amountValue is required." });
          return;
        }

        const currencyCode = body.currencyCode || config.currencyCode;
        const licenseKey = String(body.licenseKey || "license");
        const trackTitle = String(body.trackTitle || "Track");
        const licenseTitle = String(body.licenseTitle || "License");
        const locale = String(body.locale || "en-US");
        const description = `${trackTitle} - ${licenseTitle}`.slice(0, 127);
        const customId = `${trackTitle}:${licenseKey}`.slice(0, 255);

        const order = await paypalFetch(
          config,
          "/v2/checkout/orders",
          {
            intent: "CAPTURE",
            purchase_units: [
              {
                reference_id: licenseKey,
                description,
                custom_id: customId,
                amount: {
                  currency_code: currencyCode,
                  value: amountValue,
                },
              },
            ],
            payment_source: {
              paypal: {
                experience_context: {
                  brand_name: config.brandName,
                  landing_page: "LOGIN",
                  locale,
                  shipping_preference: "NO_SHIPPING",
                  user_action: "PAY_NOW",
                },
              },
            },
          },
        );

        sendJson(res, 200, {
          id: order.id,
          status: order.status,
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/paypal/capture-order") {
        const body = await readJsonBody(req);
        const orderID = String(body.orderID || "").trim();

        if (!orderID) {
          sendJson(res, 400, { message: "orderID is required." });
          return;
        }

        const capture = await paypalFetch(
          config,
          `/v2/checkout/orders/${orderID}/capture`,
          {},
        );

        sendJson(res, 200, capture);
        return;
      }

      sendJson(res, 404, { message: "PayPal route not found." });
    } catch (error) {
      sendJson(res, error.statusCode || 500, {
        message: error.message || "PayPal request failed.",
        details: error.payload?.details || [],
        debug_id: error.payload?.debug_id,
      });
    }
  };

  return {
    name: "paypal-sandbox-plugin",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default createPaypalSandboxPlugin;
