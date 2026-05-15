import { defaultPreviewSrc } from "@/data";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || "";
const BACKEND_FALLBACK_ORIGIN = "http://localhost:3333";
const COVER_GRADIENTS = [
  "from-cyan-300 via-sky-500 to-slate-900",
  "from-indigo-300 via-blue-500 to-slate-950",
  "from-fuchsia-300 via-violet-500 to-slate-900",
  "from-teal-300 via-emerald-500 to-slate-950",
  "from-amber-300 via-orange-500 to-pink-500",
  "from-rose-300 via-pink-500 to-red-500",
  "from-slate-300 via-slate-500 to-slate-950",
  "from-yellow-200 via-amber-500 to-orange-700",
  "from-emerald-200 via-teal-500 to-cyan-800",
  "from-red-300 via-orange-500 to-zinc-950",
];

function getApiBaseUrl() {
  try {
    return new URL(API_BASE_URL, window.location.origin);
  } catch {
    return new URL("/api/v1", BACKEND_FALLBACK_ORIGIN);
  }
}

function getBackendOrigin() {
  return getApiBaseUrl().origin;
}

function getMediaOrigin() {
  if (MEDIA_BASE_URL) {
    try {
      return new URL(MEDIA_BASE_URL, window.location.origin).origin;
    } catch {
      // Fall back to computed backend origin when media override is invalid.
    }
  }

  if (/^https?:\/\//i.test(API_BASE_URL)) {
    return getBackendOrigin();
  }

  if (window.location.port === "5173") {
    return BACKEND_FALLBACK_ORIGIN;
  }

  return window.location.origin;
}

function toFallbackApiUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    const isSameOrigin = parsed.origin === window.location.origin;
    const isApiRoute = parsed.pathname.startsWith("/api/");

    if (!isSameOrigin || !isApiRoute) {
      return null;
    }

    return new URL(
      `${parsed.pathname}${parsed.search}`,
      BACKEND_FALLBACK_ORIGIN,
    ).href;
  } catch {
    return null;
  }
}

async function parseJsonPayload(response) {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

function getStoredAuthToken() {
  try {
    return window.localStorage.getItem("euks.auth.token") || "";
  } catch {
    return "";
  }
}

function withAuthHeaders(init = {}) {
  const token = getStoredAuthToken();
  const headers = new Headers(init.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    ...init,
    headers,
  };
}

async function requestJson(url, init) {
  const response = await fetch(url, withAuthHeaders(init));
  const payload = await parseJsonPayload(response);

  return {
    payload,
    response,
  };
}

function formatPrice(cents, language) {
  const amount = Number(cents || 0) / 100;

  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US", {
    currency: "EUR",
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function createPurchasePrices(cents, language) {
  const basePriceCents = Number(cents || 0);

  return {
    basic: formatPrice(basePriceCents, language),
    premium: formatPrice(basePriceCents + 800, language),
    premiumPlus: formatPrice(basePriceCents + 1600, language),
    premium_plus: formatPrice(basePriceCents + 1600, language),
    unlimited: formatPrice(basePriceCents + 2800, language),
    exclusive: "NEGOTIATE",
  };
}

function getTierAmountValue(tier, trackPriceCents) {
  const baseAmount = Number(trackPriceCents || 0) / 100;

  if (tier === "premium") {
    return (baseAmount + 8).toFixed(2);
  }

  if (tier === "premiumPlus") {
    return (baseAmount + 16).toFixed(2);
  }

  if (tier === "unlimited") {
    return (baseAmount + 28).toFixed(2);
  }

  if (tier === "basic") {
    return baseAmount.toFixed(2);
  }

  return null;
}

function slugifyValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDuration(durationSeconds) {
  const safeDuration = Math.max(0, Number(durationSeconds || 0));
  const minutes = Math.floor(safeDuration / 60);
  const seconds = Math.floor(safeDuration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function buildMediaUrl(path) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const mediaOrigin = getMediaOrigin();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, mediaOrigin).href;
}

function pickCoverGradient(trackId) {
  return COVER_GRADIENTS[trackId % COVER_GRADIENTS.length];
}

function normalizeTrackTags(tags = []) {
  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    type: tag.type,
  }));
}

function getTrackVibe(tags, musicalKey) {
  const mood = tags.find((tag) => tag.type === "mood")?.name;
  const genre = tags.find((tag) => tag.type === "genre")?.name;

  return mood || genre || musicalKey?.name || "Beat";
}

function adaptTrack(track, language) {
  const tags = normalizeTrackTags(track.tags);
  const coverImage = buildMediaUrl(track.coverImagePath);
  const audioSrc = buildMediaUrl(track.audioFilePath) || defaultPreviewSrc;

  return {
    id: track.id,
    title: track.title,
    artist: "EUKS Store",
    vibe: getTrackVibe(tags, track.musicalKey),
    duration: formatDuration(track.durationSeconds),
    bpm: track.bpm ?? 0,
    price: formatPrice(track.priceCents, language),
    priceCents: track.priceCents,
    purchasePrices: createPurchasePrices(track.priceCents, language),
    cover: pickCoverGradient(track.id || 0),
    coverImage,
    audioSrc,
    tags: tags.map((tag) => tag.name),
    tagsByType: tags,
    musicalKey: track.musicalKey,
  };
}

function formatLimit(value, unlimitedLabel) {
  if (value === null || value === undefined || value === "") {
    return unlimitedLabel;
  }

  return new Intl.NumberFormat("en-US", {
    notation: Number(value) >= 100000 ? "compact" : "standard",
  }).format(Number(value));
}

function createLicenseDetails(license, language) {
  const isFrench = language === "fr";
  const unlimitedLabel = isFrench ? "Illimite" : "Unlimited";
  const enabledLabel = isFrench ? "Autorise" : "Allowed";
  const disabledLabel = isFrench ? "Non inclus" : "Not included";

  return [
    `${isFrench ? "Streams" : "Streams"}: ${formatLimit(
      license.maxStreams,
      unlimitedLabel,
    )}`,
    `${isFrench ? "Telechargements" : "Downloads"}: ${formatLimit(
      license.maxDownloads,
      unlimitedLabel,
    )}`,
    `${isFrench ? "Videos" : "Videos"}: ${
      license.allowVideoClips
        ? formatLimit(license.videoClipsLimit, unlimitedLabel)
        : disabledLabel
    }`,
    `${isFrench ? "Monetisation" : "Monetization"}: ${
      license.allowMonetization ? enabledLabel : disabledLabel
    }`,
    `${isFrench ? "Remix" : "Remix"}: ${
      license.allowRemix ? enabledLabel : disabledLabel
    }`,
    `${isFrench ? "Live" : "Live"}: ${
      license.allowLivePerformance ? enabledLabel : disabledLabel
    }`,
    `${isFrench ? "Radio" : "Radio"}: ${
      license.allowRadioAirplay ? enabledLabel : disabledLabel
    }`,
    `${isFrench ? "TV" : "TV"}: ${
      license.allowTelevision ? enabledLabel : disabledLabel
    }`,
  ];
}

function resolveLicenseTier(license) {
  const normalizedCategory = slugifyValue(license.templateCategory);
  const normalizedTitle = slugifyValue(license.title);

  if (!license.isPaypalEnabled) {
    return "free";
  }

  if (normalizedCategory === "standard" || normalizedTitle.includes("basic")) {
    return "basic";
  }

  if (
    normalizedCategory === "premium" &&
    normalizedTitle.includes("plus")
  ) {
    return "premiumPlus";
  }

  if (normalizedTitle.includes("premium-plus")) {
    return "premiumPlus";
  }

  if (normalizedCategory === "premium" || normalizedTitle.includes("premium")) {
    return "premium";
  }

  if (
    normalizedCategory === "exclusive" ||
    normalizedTitle.includes("exclusive")
  ) {
    return "exclusive";
  }

  if (normalizedTitle.includes("unlimited")) {
    return "unlimited";
  }

  return "basic";
}

function getLicensePriceMeta(license, language, trackPriceCents) {
  const tier = resolveLicenseTier(license);

  if (tier === "free") {
    return {
      amountValue: null,
      checkoutEnabled: false,
      displayPrice: language === "fr" ? "Gratuit" : "Free of use",
      tier,
    };
  }

  const purchasePrices = createPurchasePrices(trackPriceCents, language);
  const rawPrice = purchasePrices[tier] ?? null;
  const amountValue =
    typeof rawPrice === "string" && rawPrice !== "NEGOTIATE"
      ? getTierAmountValue(tier, trackPriceCents)
      : null;

  return {
    amountValue,
    checkoutEnabled: rawPrice != null && rawPrice !== "NEGOTIATE",
    displayPrice:
      rawPrice === "NEGOTIATE"
        ? language === "fr"
          ? "Negocier"
          : "Negotiate"
        : rawPrice,
    tier,
  };
}

export function adaptLicensesToPurchaseCards(licenses, language, trackPriceCents) {
  return licenses.map((license) => {
    const formats = Array.isArray(license.audioFormats)
      ? license.audioFormats
      : [];
    const separation = license.trackSeparation
      ? ` (${license.trackSeparation.replaceAll("_", " ")})`
      : "";
    const priceMeta = getLicensePriceMeta(license, language, trackPriceCents);

    return {
      ...license,
      selectionId: String(
        license.id ?? (slugifyValue(license.title) || "license"),
      ),
      title: license.title,
      format: `${formats.join(", ").toUpperCase() || "CUSTOM"}${separation}`,
      details: createLicenseDetails(license, language),
      ...priceMeta,
      isFree: !license.isPaypalEnabled,
    };
  });
}

function groupTagsByType(tags) {
  const grouped = {
    mood: [],
    genre: [],
  };

  tags.forEach((tag) => {
    if (!grouped[tag.type]) {
      grouped[tag.type] = [];
    }

    grouped[tag.type].push(tag.name);
  });

  Object.keys(grouped).forEach((type) => {
    grouped[type] = [...new Set(grouped[type])].sort((left, right) =>
      left.localeCompare(right),
    );
  });

  return grouped;
}

async function fetchJson(url, init) {
  const fallbackUrl = toFallbackApiUrl(url);

  try {
    const { response, payload } = await requestJson(url, init);

    if (response.ok) {
      return payload;
    }

    if (fallbackUrl && response.status >= 500) {
      const fallbackResult = await requestJson(fallbackUrl, init);

      if (fallbackResult.response.ok) {
        return fallbackResult.payload;
      }

      const error = new Error(
        fallbackResult.payload.message || payload.message || "Request failed",
      );
      error.status = fallbackResult.response.status;
      error.payload = fallbackResult.payload;
      throw error;
    }

    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  } catch (error) {
    if (!fallbackUrl) {
      throw error;
    }

    const fallbackResult = await requestJson(fallbackUrl, init);

    if (fallbackResult.response.ok) {
      return fallbackResult.payload;
    }

    const fallbackError = new Error(
      fallbackResult.payload.message || error.message || "Request failed",
    );
    fallbackError.status = fallbackResult.response.status;
    fallbackError.payload = fallbackResult.payload;
    throw fallbackError;
  }
}

async function fetchTags() {
  const payload = await fetchJson(`${API_BASE_URL}/tags`);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

async function fetchTracks() {
  const allTracks = [];
  let page = 1;
  let lastPage = 1;

  do {
    const payload = await fetchJson(
      `${API_BASE_URL}/tracks?page=${page}&perPage=100`,
    );

    if (Array.isArray(payload)) {
      return payload;
    }

    allTracks.push(...(payload.data || []));
    lastPage = payload.metadata?.lastPage || 1;
    page += 1;
  } while (page <= lastPage);

  return allTracks;
}

function createQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchLicenses(params = {}) {
  const payload = await fetchJson(
    `${API_BASE_URL}/licenses${createQueryString(params)}`,
  );

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export async function createLicense(data, authToken) {
  return fetchJson(`${API_BASE_URL}/licenses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateLicense(licenseId, data, authToken) {
  return fetchJson(`${API_BASE_URL}/licenses/${licenseId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteLicense(licenseId, authToken) {
  return fetchJson(`${API_BASE_URL}/licenses/${licenseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });
}

export async function fetchCatalog() {
  const [tags, tracks] = await Promise.all([fetchTags(), fetchTracks()]);

  return {
    tagsByType: groupTagsByType(tags),
    tracks,
  };
}

export function adaptCatalogTracks(
  tracks,
  language,
  licenses = [],
  licenseError = "",
) {
  return tracks.map((track) => ({
    ...adaptTrack(track, language),
    licenseCards: adaptLicensesToPurchaseCards(
      licenses,
      language,
      track.priceCents,
    ),
    licenseError,
  }));
}
