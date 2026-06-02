import { defaultPreviewSrc } from "@/data";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
export const AUTH_TOKEN_STORAGE_KEY = "euks.auth.token";
export const AUTH_USER_STORAGE_KEY = "euks.auth.user";
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

export function getStoredAuthToken() {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

// Auth is carried by an httpOnly cookie (not readable by JS), so the logged-in
// state is derived from the stored, non-sensitive user object instead.
export function getStoredAuthUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getStoredAuthUser());
}

export function buildAuthHeaders(token = getStoredAuthToken(), { json = false } = {}) {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function withAuthHeaders(init = {}) {
  const token = getStoredAuthToken();
  const headers = new Headers(init.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    // Send the httpOnly auth cookie with every API request.
    credentials: "include",
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

function formatLicensePrice(cents, language) {
  if (cents === null || cents === undefined) {
    return null;
  }

  return formatPrice(cents, language);
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

function getResolvedDurationSeconds(track, durationOverrides = {}) {
  const override = durationOverrides[track.id];
  const numericOverride = Number(override);

  if (Number.isFinite(numericOverride) && numericOverride > 0) {
    return numericOverride;
  }

  return track.durationSeconds;
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

function adaptTrack(track, language, durationOverrides) {
  const tags = normalizeTrackTags(track.tags);
  const coverImage = buildMediaUrl(track.coverImagePath);
  const audioSrc = buildMediaUrl(track.audioFilePath) || defaultPreviewSrc;
  const durationSeconds = getResolvedDurationSeconds(track, durationOverrides);

  return {
    id: track.id,
    title: track.title,
    artist: "EUKS",
    vibe: getTrackVibe(tags, track.musicalKey),
    duration: formatDuration(durationSeconds),
    durationSeconds,
    bpm: track.bpm ?? 0,
    price: formatPrice(track.priceCents, language),
    priceCents: track.priceCents,
    isActive: track.isActive ?? true,
    isSold: Boolean(track.isSold),
    soldAt: track.soldAt ?? null,
    cover: pickCoverGradient(track.id || 0),
    coverImage,
    audioSrc,
    tags: tags.map((tag) => tag.name),
    tagsByType: tags,
    musicalKey: track.musicalKey,
  };
}

// BeatStars-style usage terms: full numbers ("500,000"), "UNLIMITED" when the
// underlying value is null/empty (no cap).
function formatCountOrUnlimited(value, language) {
  if (value === null || value === undefined || value === "") {
    return language === "fr" ? "illimité" : "UNLIMITED";
  }

  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US").format(
    Number(value),
  );
}

// Deliverable files label, e.g. "MP3", "WAV & MP3", "WAV, STEMS & MP3".
function formatDeliverables(license, language) {
  const formats = Array.isArray(license.audioFormats)
    ? license.audioFormats
    : [];
  const parts = [];

  if (formats.includes("wav")) {
    parts.push("WAV");
  }
  if (license.trackSeparation === "stems") {
    parts.push("STEMS");
  }
  if (formats.includes("mp3")) {
    parts.push("MP3");
  }

  if (parts.length === 0) {
    if (!license.isPaypalEnabled) {
      return language === "fr" ? "NEGOCIATION" : "NEGOTIATE";
    }
    return "CUSTOM";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts.slice(0, -1).join(", ")} & ${parts[parts.length - 1]}`;
}

function createLicenseDetails(license, language) {
  const isFrench = language === "fr";
  const copies = formatCountOrUnlimited(license.maxSales, language);
  const streams = formatCountOrUnlimited(license.maxStreams, language);
  const videos = formatCountOrUnlimited(license.videoClipsLimit, language);
  const stations = formatCountOrUnlimited(license.radioStations, language);

  const details = isFrench
    ? [
        "Utilisation pour enregistrement musical",
        `Distribuer jusqu'à ${copies} copies`,
        `${streams} streams audio en ligne`,
      ]
    : [
        "Used for Music Recording",
        `Distribute up to ${copies} copies`,
        `${streams} Online Audio Streams`,
      ];

  if (license.allowVideoClips) {
    details.push(isFrench ? `${videos} clips vidéo` : `${videos} Music Video`);
  }

  if (license.allowLivePerformance) {
    details.push(
      isFrench ? "Performances live monétisées" : "For Profit Live Performances",
    );
  }

  if (license.allowRadioAirplay) {
    details.push(
      isFrench
        ? `Droits de diffusion radio (${stations} stations)`
        : `Radio Broadcasting rights (${stations} Stations)`,
    );
  }

  return details;
}

function resolveLicenseTier(license) {
  const normalizedCategory = slugifyValue(license.templateCategory);
  const normalizedTitle = slugifyValue(license.title);

  if (normalizedCategory === "basic" || normalizedTitle.includes("basic")) {
    return "basic";
  }

  if (
    normalizedCategory === "premium-plus" ||
    normalizedTitle.includes("premium-plus")
  ) {
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

  return "basic";
}

function getLicensePriceMeta(license, language) {
  const tier = resolveLicenseTier(license);
  const attachedPriceCents = Number(license.priceCents);
  const effectivePriceCents =
    Number.isFinite(attachedPriceCents) && attachedPriceCents >= 0
      ? attachedPriceCents
      : 0;

  if (!license.isPaypalEnabled || tier === "exclusive") {
    return {
      checkoutEnabled: false,
      displayPrice: language === "fr" ? "Negocier" : "Negotiate",
      priceCents: null,
      tier,
    };
  }

  const attachedDisplayPrice = formatLicensePrice(
    effectivePriceCents,
    language,
  );

  if (attachedDisplayPrice) {
    return {
      displayPrice: attachedDisplayPrice,
      priceCents: effectivePriceCents,
      checkoutEnabled: Boolean(license.isPaypalEnabled),
      tier,
    };
  }

  return {
    checkoutEnabled: false,
    displayPrice: language === "fr" ? "Indisponible" : "Unavailable",
    priceCents: effectivePriceCents,
    tier,
  };
}

export function adaptLicensesToPurchaseCards(licenses, language) {
  return licenses.map((license) => {
    const priceMeta = getLicensePriceMeta(license, language);

    return {
      ...license,
      selectionId: String(
        license.id ?? (slugifyValue(license.title) || "license"),
      ),
      title: license.title,
      format: formatDeliverables(license, language),
      details: createLicenseDetails(license, language),
      ...priceMeta,
    };
  });
}

function getLowestPricedLicenseCard(licenseCards) {
  return licenseCards
    .filter(
      (card) =>
        card.checkoutEnabled &&
        card.priceCents !== null &&
        card.priceCents !== undefined &&
        Number.isFinite(Number(card.priceCents)),
    )
    .sort(
      (left, right) => Number(left.priceCents) - Number(right.priceCents),
    )[0];
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

// Auth flows through the httpOnly cookie (added by withAuthHeaders), so these
// no longer take/send a bearer token.
export async function createLicense(data) {
  return fetchJson(`${API_BASE_URL}/licenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateLicense(licenseId, data) {
  return fetchJson(`${API_BASE_URL}/licenses/${licenseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteLicense(licenseId) {
  return fetchJson(`${API_BASE_URL}/licenses/${licenseId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}

export async function fetchCatalog() {
  const [tags, tracks] = await Promise.all([fetchTags(), fetchTracks()]);

  return {
    tagsByType: groupTagsByType(tags),
    tracks,
  };
}

export function adaptCatalogTracks(tracks, language, durationOverrides = {}) {
  return tracks.map((track) => {
    const attachedLicenses = Array.isArray(track.licenses)
      ? track.licenses
      : [];
    const licenseCards = track.isSold
      ? []
      : adaptLicensesToPurchaseCards(attachedLicenses, language);
    const lowestLicenseCard = getLowestPricedLicenseCard(licenseCards);
    const adaptedTrack = adaptTrack(track, language, durationOverrides);
    const soldLabel = language === "fr" ? "Vendu" : "Sold";

    return {
      ...adaptedTrack,
      price: track.isSold
        ? soldLabel
        : lowestLicenseCard?.displayPrice ?? adaptedTrack.price,
      displayPriceCents:
        track.isSold
          ? null
          : lowestLicenseCard?.priceCents ?? adaptedTrack.priceCents,
      licenseCards,
      licenseError: track.isSold
        ? language === "fr"
          ? "Cette musique est vendue et n'est plus disponible a l'achat."
          : "This track is sold and is no longer available for purchase."
        : "",
    };
  });
}
