import { useEffect, useMemo, useState } from "react";
import LicenseManager from "@/components/LicenseManager.jsx";
import {
  API_BASE_URL,
  AUTH_USER_STORAGE_KEY,
  buildAuthHeaders,
  isLoggedIn,
} from "@/lib";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function toArrayPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function getFileExtension(fileName) {
  const lowerName = String(fileName || "").toLowerCase();
  const lastDotIndex = lowerName.lastIndexOf(".");
  return lastDotIndex >= 0 ? lowerName.slice(lastDotIndex) : "";
}

function isAcceptedFileForZone(zone, file) {
  if (!file) {
    return false;
  }

  const extension = getFileExtension(file.name);

  if (zone === "cover") {
    return file.type.startsWith("image/");
  }

  if (zone === "mp3") {
    return extension === ".mp3";
  }

  if (zone === "wav") {
    return extension === ".wav";
  }

  if (zone === "stemsZip") {
    return extension === ".zip";
  }

  return false;
}

function getLicensePriceCents(license) {
  if (!license?.isPaypalEnabled) {
    return null;
  }

  const priceCents = Number(license?.priceCents);

  return Number.isFinite(priceCents) && priceCents >= 0 ? priceCents : null;
}

function getLowestLicensePriceCents(licenses) {
  const prices = licenses
    .map((license) => getLicensePriceCents(license))
    .filter((priceCents) => priceCents !== null);

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

function formatLicensePrice(cents) {
  const priceCents = Number(cents);

  if (!Number.isFinite(priceCents)) {
    return "-";
  }

  return `${(priceCents / 100).toFixed(2)} EUR`;
}

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
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getPaginationMeta(payload) {
  return (
    payload?.meta ?? payload?.metadata ?? {
    currentPage: 1,
    lastPage: 1,
    perPage: 12,
    total: 0,
    }
  );
}

function readAudioFileDuration(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      URL.revokeObjectURL(objectUrl);
    };

    const handleLoadedMetadata = () => {
      const durationSeconds = Math.round(audio.duration);
      cleanup();
      resolve(
        Number.isFinite(durationSeconds) && durationSeconds > 0
          ? durationSeconds
          : null,
      );
    };

    const handleError = () => {
      cleanup();
      resolve(null);
    };

    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.src = objectUrl;
  });
}

async function parseResponsePayload(response) {
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

function DashboardPage({ language = "fr", onLogout }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [tracks, setTracks] = useState([]);
  const [tracksMeta, setTracksMeta] = useState(getPaginationMeta());
  const [trackPage, setTrackPage] = useState(1);
  const [trackStatusFilter, setTrackStatusFilter] = useState("all");
  const [trackSearch, setTrackSearch] = useState("");
  const [trackReloadKey, setTrackReloadKey] = useState(0);
  const [trackActionState, setTrackActionState] = useState({
    id: null,
    error: "",
  });
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [summaryReloadKey, setSummaryReloadKey] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [purchasesMeta, setPurchasesMeta] = useState(getPaginationMeta());
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState("all");
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [purchasesError, setPurchasesError] = useState("");
  const [musicalKeys, setMusicalKeys] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableLicenses, setAvailableLicenses] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [licensesLoading, setLicensesLoading] = useState(false);
  const [tracksError, setTracksError] = useState("");
  const [taxonomyError, setTaxonomyError] = useState("");
  const [licensesError, setLicensesError] = useState("");
  const [storedUser, setStoredUser] = useState(() => readStoredUser());
  const [selectedMusicalKeyId, setSelectedMusicalKeyId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [selectedLicenseIds, setSelectedLicenseIds] = useState([]);
  const [trackForm, setTrackForm] = useState({
    title: "",
    bpm: "",
  });
  const [trackSubmitState, setTrackSubmitState] = useState({
    isLoading: false,
    error: "",
    success: "",
  });
  const [tagForm, setTagForm] = useState({
    name: "",
    slug: "",
    type: "mood",
  });
  const [tagSubmitState, setTagSubmitState] = useState({
    isLoading: false,
    error: "",
    success: "",
  });
  const [deletingTagId, setDeletingTagId] = useState(null);
  const [uploadFiles, setUploadFiles] = useState({
    cover: null,
    mp3: null,
    wav: null,
    stemsZip: null,
  });
  const [uploadErrors, setUploadErrors] = useState({
    cover: "",
    mp3: "",
    wav: "",
    stemsZip: "",
  });
  const [activeDropZone, setActiveDropZone] = useState("");
  const canManageDashboard =
    storedUser?.role === "admin" || storedUser?.role === "owner";

  useEffect(() => {
    let isCancelled = false;

    async function refreshProfile() {
      try {
        const response = await fetch(`${API_BASE_URL}/account/profile`, {
          credentials: "include",
          headers: buildAuthHeaders(),
        });
        const payload = await parseResponsePayload(response);
        const user = payload?.data ?? payload;

        if (!response.ok || !user?.id) {
          return;
        }

        if (!isCancelled) {
          setStoredUser(user);
          localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
        }
      } catch {
        // Keep the locally stored user as a fallback for offline/stale sessions.
      }
    }

    refreshProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function fetchTracks() {
      if (!canManageDashboard) {
        setTracks([]);
        setTracksLoading(false);
        return;
      }

      setTracksLoading(true);
      setTracksError("");

      try {
        const query = new URLSearchParams({
          page: String(trackPage),
          perPage: "8",
          status: trackStatusFilter,
        });

        if (trackSearch.trim()) {
          query.set("search", trackSearch.trim());
        }

        const response = await fetch(
          `${API_BASE_URL}/dashboard/tracks?${query.toString()}`,
          {
            credentials: "include",
            headers: buildAuthHeaders(),
          },
        );
        const payload = await parseResponsePayload(response);

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load tracks.");
        }

        if (!isCancelled) {
          setTracks(toArrayPayload(payload));
          setTracksMeta(getPaginationMeta(payload));
        }
      } catch (error) {
        if (!isCancelled) {
          setTracks([]);
          setTracksError(error.message || "Unable to load tracks.");
        }
      } finally {
        if (!isCancelled) {
          setTracksLoading(false);
        }
      }
    }

    fetchTracks();

    return () => {
      isCancelled = true;
    };
  }, [
    canManageDashboard,
    trackPage,
    trackReloadKey,
    trackSearch,
    trackStatusFilter,
  ]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchSummary() {
      if (!canManageDashboard) {
        setSummary(null);
        setSummaryLoading(false);
        return;
      }

      setSummaryLoading(true);
      setSummaryError("");

      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
          credentials: "include",
          headers: buildAuthHeaders(),
        });
        const payload = await parseResponsePayload(response);

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load dashboard.");
        }

        if (!isCancelled) {
          setSummary(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          setSummary(null);
          setSummaryError(error.message || "Unable to load dashboard.");
        }
      } finally {
        if (!isCancelled) {
          setSummaryLoading(false);
        }
      }
    }

    fetchSummary();

    return () => {
      isCancelled = true;
    };
  }, [canManageDashboard, summaryReloadKey]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchPurchases() {
      if (!canManageDashboard) {
        setPurchases([]);
        setPurchasesLoading(false);
        return;
      }

      setPurchasesLoading(true);
      setPurchasesError("");

      try {
        const query = new URLSearchParams({
          page: String(purchasesPage),
          perPage: "10",
          status: purchaseStatusFilter,
        });
        const response = await fetch(
          `${API_BASE_URL}/dashboard/purchases?${query.toString()}`,
          {
            credentials: "include",
            headers: buildAuthHeaders(),
          },
        );
        const payload = await parseResponsePayload(response);

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load purchases.");
        }

        if (!isCancelled) {
          setPurchases(toArrayPayload(payload));
          setPurchasesMeta(getPaginationMeta(payload));
        }
      } catch (error) {
        if (!isCancelled) {
          setPurchases([]);
          setPurchasesError(error.message || "Unable to load purchases.");
        }
      } finally {
        if (!isCancelled) {
          setPurchasesLoading(false);
        }
      }
    }

    fetchPurchases();

    return () => {
      isCancelled = true;
    };
  }, [canManageDashboard, purchaseStatusFilter, purchasesPage, summaryReloadKey]);

  useEffect(() => {
    let isCancelled = false;

    if (activeSection !== "addTrack") {
      return () => {
        isCancelled = true;
      };
    }

    async function fetchLicenses() {
      setLicensesLoading(true);
      setLicensesError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/licenses?activeOnly=true`,
          {
            credentials: "include",
            headers: buildAuthHeaders(),
          },
        );
        const payload = await parseResponsePayload(response);

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load licenses.");
        }

        if (!isCancelled) {
          setAvailableLicenses(toArrayPayload(payload));
        }
      } catch (error) {
        if (!isCancelled) {
          setAvailableLicenses([]);
          setLicensesError(error.message || "Unable to load licenses.");
        }
      } finally {
        if (!isCancelled) {
          setLicensesLoading(false);
        }
      }
    }

    fetchLicenses();

    return () => {
      isCancelled = true;
    };
  }, [activeSection]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchTaxonomy() {
      setTaxonomyLoading(true);
      setTaxonomyError("");

      try {
        const [keysResponse, tagsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/musical-keys`),
          fetch(`${API_BASE_URL}/tags`),
        ]);

        const [keysPayload, tagsPayload] = await Promise.all([
          keysResponse.json(),
          tagsResponse.json(),
        ]);

        if (!keysResponse.ok) {
          throw new Error(
            keysPayload?.message || "Unable to load musical keys.",
          );
        }

        if (!tagsResponse.ok) {
          throw new Error(tagsPayload?.message || "Unable to load tags.");
        }

        if (!isCancelled) {
          setMusicalKeys(toArrayPayload(keysPayload));
          setAvailableTags(toArrayPayload(tagsPayload));
        }
      } catch (error) {
        if (!isCancelled) {
          setTaxonomyError(
            error.message || "Unable to load musical keys and tags.",
          );
        }
      } finally {
        if (!isCancelled) {
          setTaxonomyLoading(false);
        }
      }
    }

    fetchTaxonomy();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    function syncUser() {
      setStoredUser(readStoredUser());
    }

    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const copy = useMemo(
    () =>
      ({
        fr: {
          title: "Dashboard",
          subtitle: "Panneau d'administration EUKS",
          backToStore: "Retour au store",
          logout: "Se déconnecter",
          nav: {
            overview: "Vue d'ensemble",
            purchases: "Liste des achats",
            tracks: "Liste des musiques",
            licenses: "Licences",
            addTrack: "Ajouter une musique",
            addTags: "Ajouter des tags",
            settings: "Paramètres",
          },
          adminOnlyTitle: "Accès propriétaire requis",
          adminOnlyBody:
            "Ton compte est connecté, mais il n'a pas accès à ce dashboard propriétaire.",
          overview: {
            cards: {
              purchases: "Achats aujourd'hui",
              revenue: "CA aujourd'hui",
              tracks: "Musiques actives",
              activeLicenses: "Musiques sold",
            },
            recent: "Activité récente",
            recentEmpty: "Aucune activité récente à afficher pour le moment.",
          },
          purchases: {
            title: "Liste des achats",
            subtitle: "Paiements PayPal, acheteurs et licences achetées.",
            empty: "Aucun achat à afficher.",
            loading: "Chargement des achats...",
            filters: {
              all: "Tous",
              completed: "Payés",
              failed: "Échecs",
            },
            columns: {
              orderId: "Commande",
              buyer: "Acheteur",
              track: "Musique",
              license: "Licence",
              amount: "Montant",
              status: "Statut",
              date: "Date",
            },
          },
          tracks: {
            title: "Liste des musiques",
            subtitle: "Gère la visibilité, le mode sold et la suppression.",
            loading: "Chargement des musiques...",
            empty: "Aucune musique trouvée.",
            search: "Rechercher une musique",
            filters: {
              all: "Toutes",
              available: "Disponibles",
              active: "Visibles",
              hidden: "Masquées",
              sold: "Sold",
            },
            status: {
              active: "Visible",
              hidden: "Masquée",
              sold: "Sold",
            },
            actions: {
              hide: "Masquer",
              restore: "Rendre visible",
              markSold: "Marquer sold",
              markAvailable: "Remettre dispo",
              delete: "Supprimer",
              deleting: "Suppression...",
              working: "Action...",
              confirmDelete: "Supprimer définitivement cette musique ?",
            },
            columns: {
              title: "Titre",
              bpm: "BPM",
              price: "Prix",
              listens: "Écoutes",
              status: "Statut",
              actions: "Actions",
            },
          },
          addTrack: {
            title: "Ajouter une musique",
            subtitle:
              "Prototype de formulaire admin. Branche ensuite ton endpoint create track.",
            fields: {
              title: "Titre",
              bpm: "BPM",
              musicalKey: "Clé musicale",
              linkedTags: "Tags à lier",
              linkedLicenses: "Licences à attacher",
              cover: "Cover (image)",
              mp3: "Fichier MP3",
              wav: "Fichier WAV",
              stemsZip: "Piste par piste (ZIP)",
            },
            musicalKeyPlaceholder: "Sélectionner une clé",
            musicalKeyLoading: "Chargement des clés...",
            musicalKeyUnavailable: "Aucune clé disponible.",
            tagsLoading: "Chargement des tags...",
            noTags: "Aucun tag disponible.",
            licensesLoading: "Chargement des licences...",
            noLicenses:
              "Aucune licence active disponible. Crée d'abord une licence.",
            dropHint: "Glisse un fichier ici ou clique pour sélectionner",
            selected: "Sélectionné",
            invalidType: "Type de fichier invalide.",
            required:
              "Les 3 formats audio + la cover + la clé + au moins un tag + au moins une licence sont requis.",
            tokenRequired: "Tu dois être connecté pour créer une musique.",
            saveSuccess: "Musique enregistrée avec succès.",
            submit: "Enregistrer",
            submitLoading: "Enregistrement...",
            helper:
              "Ce formulaire est prêt pour être connecté au backend de création.",
          },
          addTags: {
            title: "Ajouter des tags",
            subtitle: "Crée des tags mood/genre pour les lier aux musiques.",
            fields: {
              name: "Nom",
              type: "Type",
              slug: "Slug (optionnel)",
            },
            placeholders: {
              name: "Ex: Mélancolique",
              slug: "Ex: melancholique",
            },
            types: {
              mood: "Mood",
              genre: "Genre",
            },
            submit: "Ajouter le tag",
            submitLoading: "Ajout...",
            delete: "Supprimer",
            confirmDelete: "Confirmer la suppression du tag",
            deleteLoading: "Suppression...",
            tokenRequired: "Tu dois être connecté pour créer un tag.",
            success: "Tag ajouté avec succès.",
            deleteSuccess: "Tag supprimé avec succès.",
            empty: "Aucun tag disponible.",
            listTitle: "Tags disponibles",
          },
          settings: {
            title: "Paramètres",
            subtitle: "Zone réservée aux réglages du dashboard.",
          },
        },
        en: {
          title: "Dashboard",
          subtitle: "EUKS admin panel",
          backToStore: "Back to store",
          logout: "Sign out",
          nav: {
            overview: "Overview",
            purchases: "Purchases",
            tracks: "Tracks",
            licenses: "Licenses",
            addTrack: "Add track",
            addTags: "Add tags",
            settings: "Settings",
          },
          adminOnlyTitle: "Owner access required",
          adminOnlyBody:
            "Your account is signed in, but it does not have access to this owner dashboard.",
          overview: {
            cards: {
              purchases: "Purchases today",
              revenue: "Revenue today",
              tracks: "Active tracks",
              activeLicenses: "Sold tracks",
            },
            recent: "Recent activity",
            recentEmpty: "No recent activity to display yet.",
          },
          purchases: {
            title: "Purchases",
            subtitle: "PayPal payments, buyers, and purchased licenses.",
            empty: "No purchases to show.",
            loading: "Loading purchases...",
            filters: {
              all: "All",
              completed: "Paid",
              failed: "Failed",
            },
            columns: {
              orderId: "Order",
              buyer: "Buyer",
              track: "Track",
              license: "License",
              amount: "Amount",
              status: "Status",
              date: "Date",
            },
          },
          tracks: {
            title: "Tracks",
            subtitle: "Manage visibility, sold mode, and deletion.",
            loading: "Loading tracks...",
            empty: "No tracks found.",
            search: "Search track",
            filters: {
              all: "All",
              available: "Available",
              active: "Visible",
              hidden: "Hidden",
              sold: "Sold",
            },
            status: {
              active: "Visible",
              hidden: "Hidden",
              sold: "Sold",
            },
            actions: {
              hide: "Hide",
              restore: "Show",
              markSold: "Mark sold",
              markAvailable: "Available",
              delete: "Delete",
              deleting: "Deleting...",
              working: "Working...",
              confirmDelete: "Permanently delete this track?",
            },
            columns: {
              title: "Title",
              bpm: "BPM",
              price: "Price",
              listens: "Plays",
              status: "Status",
              actions: "Actions",
            },
          },
          addTrack: {
            title: "Add track",
            subtitle:
              "Admin form prototype. You can wire your create track endpoint next.",
            fields: {
              title: "Title",
              bpm: "BPM",
              musicalKey: "Musical key",
              linkedTags: "Linked tags",
              linkedLicenses: "Licenses to attach",
              cover: "Cover (image)",
              mp3: "MP3 file",
              wav: "WAV file",
              stemsZip: "Stems (ZIP)",
            },
            musicalKeyPlaceholder: "Select key",
            musicalKeyLoading: "Loading keys...",
            musicalKeyUnavailable: "No musical key available.",
            tagsLoading: "Loading tags...",
            noTags: "No tags available.",
            licensesLoading: "Loading licenses...",
            noLicenses: "No active license available. Create a license first.",
            dropHint: "Drop a file here or click to browse",
            selected: "Selected",
            invalidType: "Invalid file type.",
            required:
              "All 3 audio formats + cover + key + at least one tag + at least one license are required.",
            tokenRequired: "You must be signed in to create a track.",
            saveSuccess: "Track saved successfully.",
            submit: "Save",
            submitLoading: "Saving...",
            helper:
              "This form is ready to be connected to backend create flow.",
          },
          addTags: {
            title: "Add tags",
            subtitle: "Create mood/genre tags to link them to tracks.",
            fields: {
              name: "Name",
              type: "Type",
              slug: "Slug (optional)",
            },
            placeholders: {
              name: "Ex: Melancholic",
              slug: "Ex: melancholic",
            },
            types: {
              mood: "Mood",
              genre: "Genre",
            },
            submit: "Add tag",
            submitLoading: "Adding...",
            delete: "Delete",
            confirmDelete: "Confirm tag deletion",
            deleteLoading: "Deleting...",
            tokenRequired: "You must be signed in to create a tag.",
            success: "Tag added successfully.",
            deleteSuccess: "Tag deleted successfully.",
            empty: "No tag available.",
            listTitle: "Available tags",
          },
          settings: {
            title: "Settings",
            subtitle: "Area reserved for dashboard settings.",
          },
        },
      })[language] || {
        title: "Dashboard",
        subtitle: "Panneau d'administration EUKS",
      },
    [language],
  );

  const navItems = [
    { id: "overview", label: copy.nav.overview },
    { id: "purchases", label: copy.nav.purchases },
    { id: "tracks", label: copy.nav.tracks },
    { id: "licenses", label: copy.nav.licenses },
    { id: "addTrack", label: copy.nav.addTrack },
    { id: "addTags", label: copy.nav.addTags },
    { id: "settings", label: copy.nav.settings },
  ];

  const summaryStats = summary?.stats ?? {};

  function handleFileAssign(zone, file) {
    if (!isAcceptedFileForZone(zone, file)) {
      setUploadErrors((previous) => ({
        ...previous,
        [zone]: copy.addTrack.invalidType,
      }));
      return;
    }

    setUploadErrors((previous) => ({
      ...previous,
      [zone]: "",
    }));

    setUploadFiles((previous) => ({
      ...previous,
      [zone]: file,
    }));
  }

  function handleDrop(zone, event) {
    event.preventDefault();
    setActiveDropZone("");

    const file = event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    handleFileAssign(zone, file);
  }

  function renderDropInput(zone, label, accept) {
    const currentFile = uploadFiles[zone];
    const error = uploadErrors[zone];
    const isActive = activeDropZone === zone;

    return (
      <label
        className={`block rounded-2xl border p-4 transition ${
          isActive
            ? "border-cyan-300/45 bg-cyan-400/10"
            : "border-white/12 bg-white/5"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setActiveDropZone(zone);
        }}
        onDragLeave={() => setActiveDropZone("")}
        onDrop={(event) => handleDrop(zone, event)}
      >
        <span className="text-sm text-slate-200">{label}</span>
        <input
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              handleFileAssign(zone, file);
            }
          }}
        />
        <p className="mt-2 text-xs text-slate-400">{copy.addTrack.dropHint}</p>
        {currentFile ? (
          <p className="mt-3 text-xs text-cyan-100">
            {copy.addTrack.selected}: {currentFile.name}
          </p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-rose-200">{error}</p> : null}
      </label>
    );
  }

  function toggleTagSelection(tagId) {
    setSelectedTagIds((previous) =>
      previous.includes(tagId)
        ? previous.filter((id) => id !== tagId)
        : [...previous, tagId],
    );
  }

  function toggleLicenseSelection(licenseId) {
    setSelectedLicenseIds((previous) =>
      previous.includes(licenseId)
        ? previous.filter((id) => id !== licenseId)
        : [...previous, licenseId],
    );
  }

  function getSelectedLicenses() {
    return selectedLicenseIds
      .map((licenseId) =>
        availableLicenses.find((license) => license.id === licenseId),
      )
      .filter(Boolean);
  }

  function buildSelectedLicensePayload() {
    return selectedLicenseIds.map((licenseId) => ({
      licenseId,
      isActive: true,
    }));
  }

  async function handleTagSubmit(event) {
    event.preventDefault();

    if (tagSubmitState.isLoading) {
      return;
    }

    if (!isLoggedIn()) {
      setTagSubmitState({
        isLoading: false,
        error: copy.addTags.tokenRequired,
        success: "",
      });
      return;
    }

    const name = tagForm.name.trim();

    if (!name) {
      return;
    }

    setTagSubmitState({
      isLoading: true,
      error: "",
      success: "",
    });

    try {
      const response = await fetch(`${API_BASE_URL}/tags`, {
        method: "POST",
        credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
        body: JSON.stringify({
          name,
          type: tagForm.type,
          slug: tagForm.slug.trim() || undefined,
        }),
      });

      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to create tag.");
      }

      const tagsResponse = await fetch(`${API_BASE_URL}/tags`);
      const tagsPayload = await parseResponsePayload(tagsResponse);

      if (tagsResponse.ok) {
        setAvailableTags(toArrayPayload(tagsPayload));
      }

      setTagForm((previous) => ({
        ...previous,
        name: "",
        slug: "",
      }));

      setTagSubmitState({
        isLoading: false,
        error: "",
        success: copy.addTags.success,
      });
    } catch (error) {
      setTagSubmitState({
        isLoading: false,
        error: error.message || "Unable to create tag.",
        success: "",
      });
    }
  }

  async function handleTagDelete(tag) {
    if (deletingTagId) {
      return;
    }

    const isConfirmed = window.confirm(
      `${copy.addTags.confirmDelete}: ${tag.name} ?`,
    );

    if (!isConfirmed) {
      return;
    }

    if (!isLoggedIn()) {
      setTagSubmitState({
        isLoading: false,
        error: copy.addTags.tokenRequired,
        success: "",
      });
      return;
    }

    setDeletingTagId(tag.id);
    setTagSubmitState((previous) => ({
      ...previous,
      error: "",
      success: "",
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/tags/${tag.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
      });

      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to delete tag.");
      }

      setAvailableTags((previous) =>
        previous.filter((item) => item.id !== tag.id),
      );
      setSelectedTagIds((previous) => previous.filter((id) => id !== tag.id));

      setTagSubmitState({
        isLoading: false,
        error: "",
        success: copy.addTags.deleteSuccess,
      });
    } catch (error) {
      setTagSubmitState({
        isLoading: false,
        error: error.message || "Unable to delete tag.",
        success: "",
      });
    } finally {
      setDeletingTagId(null);
    }
  }

  async function handleTrackSubmit(event) {
    event.preventDefault();

    if (trackSubmitState.isLoading) {
      return;
    }

    const selectedLicensePayload = buildSelectedLicensePayload();
    const selectedLicensePriceCents = getLowestLicensePriceCents(
      getSelectedLicenses(),
    );
    const hasAllRequiredFiles =
      Boolean(uploadFiles.cover) &&
      Boolean(uploadFiles.mp3) &&
      Boolean(uploadFiles.wav) &&
      Boolean(uploadFiles.stemsZip);
    const hasTrackTaxonomy =
      Boolean(selectedMusicalKeyId) && selectedTagIds.length > 0;
    const hasSelectedLicenses = selectedLicensePayload.length > 0;

    if (
      !hasAllRequiredFiles ||
      !hasTrackTaxonomy ||
      selectedLicensePriceCents === null ||
      !hasSelectedLicenses
    ) {
      return;
    }

    if (!isLoggedIn()) {
      setTrackSubmitState({
        isLoading: false,
        error: copy.addTrack.tokenRequired,
        success: "",
      });
      return;
    }

    setTrackSubmitState({
      isLoading: true,
      error: "",
      success: "",
    });

    try {
      const formData = new FormData();
      const durationSeconds = await readAudioFileDuration(uploadFiles.mp3);

      formData.append("title", trackForm.title.trim());
      formData.append("bpm", String(Number(trackForm.bpm) || 0));
      formData.append("priceCents", String(selectedLicensePriceCents));
      formData.append("musicalKeyId", selectedMusicalKeyId);

      if (durationSeconds) {
        formData.append("durationSeconds", String(durationSeconds));
      }

      selectedTagIds.forEach((tagId) => {
        formData.append("tagIds[]", String(tagId));
      });

      formData.append("cover", uploadFiles.cover);
      formData.append("previewMp3", uploadFiles.mp3);
      formData.append("previewWav", uploadFiles.wav);
      formData.append("stemsZip", uploadFiles.stemsZip);

      const response = await fetch(`${API_BASE_URL}/tracks`, {
        method: "POST",
        credentials: "include",
        headers: buildAuthHeaders(),
        body: formData,
      });

      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to create track.");
      }

      const createdTrack = payload?.data ?? payload;
      const createdTrackId = createdTrack?.id;

      if (!createdTrackId) {
        throw new Error(
          "Track created, but the response did not include an id.",
        );
      }

      const licensesResponse = await fetch(
        `${API_BASE_URL}/tracks/${createdTrackId}/licenses`,
        {
          method: "PUT",
          credentials: "include",
          headers: buildAuthHeaders(undefined, { json: true }),
          body: JSON.stringify({
            licenses: selectedLicensePayload,
          }),
        },
      );
      const licensesPayload = await parseResponsePayload(licensesResponse);

      if (!licensesResponse.ok) {
        throw new Error(
          licensesPayload?.message || "Unable to attach licenses.",
        );
      }

      setTrackPage(1);
      setTrackReloadKey((value) => value + 1);
      setSummaryReloadKey((value) => value + 1);

      setTrackForm({
        title: "",
        bpm: "",
      });
      setSelectedMusicalKeyId("");
      setSelectedTagIds([]);
      setSelectedLicenseIds([]);
      setUploadFiles({
        cover: null,
        mp3: null,
        wav: null,
        stemsZip: null,
      });
      setUploadErrors({
        cover: "",
        mp3: "",
        wav: "",
        stemsZip: "",
      });

      setTrackSubmitState({
        isLoading: false,
        error: "",
        success: copy.addTrack.saveSuccess,
      });
    } catch (error) {
      setTrackSubmitState({
        isLoading: false,
        error: error.message || "Unable to create track.",
        success: "",
      });
    }
  }

  async function patchTrack(track, updates) {
    if (!isLoggedIn()) {
      setTrackActionState({
        id: track.id,
        error: copy.addTrack.tokenRequired,
      });
      return;
    }

    setTrackActionState({ id: track.id, error: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/tracks/${track.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
        body: JSON.stringify(updates),
      });
      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update track.");
      }

      setTrackReloadKey((value) => value + 1);
      setSummaryReloadKey((value) => value + 1);
      setTrackActionState({ id: null, error: "" });
    } catch (error) {
      setTrackActionState({
        id: track.id,
        error: error.message || "Unable to update track.",
      });
    }
  }

  async function handleTrackDelete(track) {
    if (!window.confirm(copy.tracks.actions.confirmDelete)) {
      return;
    }

    if (!isLoggedIn()) {
      setTrackActionState({
        id: track.id,
        error: copy.addTrack.tokenRequired,
      });
      return;
    }

    setTrackActionState({ id: track.id, error: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/tracks/${track.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: buildAuthHeaders(),
      });
      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to delete track.");
      }

      setTrackReloadKey((value) => value + 1);
      setSummaryReloadKey((value) => value + 1);
      setTrackActionState({ id: null, error: "" });
    } catch (error) {
      setTrackActionState({
        id: track.id,
        error: error.message || "Unable to delete track.",
      });
    }
  }

  function renderPagination(meta, onPageChange) {
    const currentPage = Number(meta?.currentPage || 1);
    const lastPage = Number(meta?.lastPage || 1);

    if (lastPage <= 1) {
      return null;
    }

    return (
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <span>
          Page {currentPage} / {lastPage}
        </span>
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

  function renderMainContent() {
    if (!canManageDashboard) {
      return (
        <section className="rounded-3xl border border-amber-300/25 bg-amber-400/10 p-6 text-amber-50">
          <h2 className="text-2xl font-black">{copy.adminOnlyTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-amber-100/90">
            {copy.adminOnlyBody}
          </p>
        </section>
      );
    }

    if (activeSection === "overview") {
      return (
        <section className="space-y-5">
          {summaryLoading ? (
            <p className="text-sm text-slate-300">Chargement du dashboard...</p>
          ) : null}
          {summaryError ? (
            <p className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
              {summaryError}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {copy.overview.cards.purchases}
              </p>
              <p className="mt-3 text-2xl font-black text-white">
                {summaryStats.purchasesToday ?? 0}
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {copy.overview.cards.revenue}
              </p>
              <p className="mt-3 text-2xl font-black text-white">
                {formatMoney(summaryStats.revenueTodayCents, "EUR", language)}
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {copy.overview.cards.tracks}
              </p>
              <p className="mt-3 text-2xl font-black text-white">
                {summaryStats.activeTracks ?? 0}
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {copy.overview.cards.activeLicenses}
              </p>
              <p className="mt-3 text-2xl font-black text-white">
                {summaryStats.soldTracks ?? 0}
              </p>
            </article>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
            <h3 className="text-lg font-semibold text-white">
              {copy.overview.recent}
            </h3>
            {summary?.recentPurchases?.length ? (
              <div className="mt-4 divide-y divide-white/8">
                {summary.recentPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="grid gap-2 py-3 text-sm text-slate-200 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {purchase.trackTitle}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {purchase.payerEmail || "-"} · {purchase.licenseTitle}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-semibold text-cyan-100">
                        {formatMoney(
                          purchase.amountCents,
                          purchase.currencyCode,
                          language,
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDateTime(purchase.createdAt, language)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-300">
                {copy.overview.recentEmpty}
              </p>
            )}
          </div>
        </section>
      );
    }

    if (activeSection === "purchases") {
      const purchaseFilters = [
        ["all", copy.purchases.filters.all],
        ["COMPLETED", copy.purchases.filters.completed],
        ["FAILED", copy.purchases.filters.failed],
      ];

      return (
        <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                {copy.purchases.title}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {copy.purchases.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {purchaseFilters.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPurchaseStatusFilter(value);
                    setPurchasesPage(1);
                  }}
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
            <p className="mt-6 text-sm text-slate-300">
              {copy.purchases.loading}
            </p>
          ) : null}
          {purchasesError ? (
            <p className="mt-6 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
              {purchasesError}
            </p>
          ) : null}

          {!purchasesLoading && !purchasesError && purchases.length === 0 ? (
            <p className="mt-6 text-sm text-slate-300">
              {copy.purchases.empty}
            </p>
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
                    <tr
                      key={purchase.id}
                      className="border-t border-white/8"
                    >
                      <td className="py-3 font-mono text-xs text-cyan-100">
                        {purchase.paypalOrderId || `#${purchase.id}`}
                      </td>
                      <td className="py-3">{purchase.payerEmail || "-"}</td>
                      <td className="py-3">{purchase.trackTitle}</td>
                      <td className="py-3">{purchase.licenseTitle}</td>
                      <td className="py-3">
                        {formatMoney(
                          purchase.amountCents,
                          purchase.currencyCode,
                          language,
                        )}
                      </td>
                      <td className="py-3">{purchase.status}</td>
                      <td className="py-3">
                        {formatDateTime(purchase.createdAt, language)}
                      </td>
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

    if (activeSection === "tracks") {
      const trackFilters = [
        ["all", copy.tracks.filters.all],
        ["available", copy.tracks.filters.available],
        ["active", copy.tracks.filters.active],
        ["hidden", copy.tracks.filters.hidden],
        ["sold", copy.tracks.filters.sold],
      ];

      return (
        <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                {copy.tracks.title}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {copy.tracks.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {trackFilters.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTrackStatusFilter(value);
                    setTrackPage(1);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    trackStatusFilter === value
                      ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100"
                      : "border-white/12 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <input
            value={trackSearch}
            onChange={(event) => {
              setTrackSearch(event.target.value);
              setTrackPage(1);
            }}
            placeholder={copy.tracks.search}
            className="mt-5 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />

          {tracksLoading ? (
            <p className="mt-6 text-sm text-slate-300">{copy.tracks.loading}</p>
          ) : null}
          {tracksError ? (
            <p className="mt-6 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
              {tracksError}
            </p>
          ) : null}
          {trackActionState.error ? (
            <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-sm text-rose-100">
              {trackActionState.error}
            </p>
          ) : null}

          {!tracksLoading && !tracksError && tracks.length === 0 ? (
            <p className="mt-6 text-sm text-slate-300">{copy.tracks.empty}</p>
          ) : null}

          {!tracksLoading && !tracksError && tracks.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm text-slate-200">
                <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  <tr>
                    <th className="py-2">{copy.tracks.columns.title}</th>
                    <th className="py-2">{copy.tracks.columns.bpm}</th>
                    <th className="py-2">{copy.tracks.columns.price}</th>
                    <th className="py-2">{copy.tracks.columns.listens}</th>
                    <th className="py-2">{copy.tracks.columns.status}</th>
                    <th className="py-2 text-right">
                      {copy.tracks.columns.actions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track) => {
                    const isWorking = trackActionState.id === track.id;

                    return (
                      <tr key={track.id} className="border-t border-white/8">
                        <td className="py-3">
                          <div>
                            <p className="font-semibold text-white">
                              {track.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {track.musicalKey?.name || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3">{track.bpm ?? 0}</td>
                        <td className="py-3">
                          {formatLicensePrice(track.priceCents)}
                        </td>
                        <td className="py-3">{track.listenCount ?? 0}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-xs ${
                                track.isActive
                                  ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-100"
                                  : "border-white/12 bg-white/5 text-slate-300"
                              }`}
                            >
                              {track.isActive
                                ? copy.tracks.status.active
                                : copy.tracks.status.hidden}
                            </span>
                            {track.isSold ? (
                              <span className="rounded-full border border-amber-300/30 bg-amber-400/12 px-2 py-1 text-xs text-amber-100">
                                {copy.tracks.status.sold}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() =>
                                patchTrack(track, {
                                  isActive: !track.isActive,
                                })
                              }
                              className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {track.isActive
                                ? copy.tracks.actions.hide
                                : copy.tracks.actions.restore}
                            </button>
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() =>
                                patchTrack(track, {
                                  isSold: !track.isSold,
                                })
                              }
                              className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-400/18 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {track.isSold
                                ? copy.tracks.actions.markAvailable
                                : copy.tracks.actions.markSold}
                            </button>
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => handleTrackDelete(track)}
                              className="rounded-full border border-rose-300/25 bg-rose-400/12 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isWorking
                                ? copy.tracks.actions.working
                                : copy.tracks.actions.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {renderPagination(tracksMeta, setTrackPage)}
            </div>
          ) : null}
        </section>
      );
    }

    if (activeSection === "licenses") {
      return <LicenseManager language={language} />;
    }

    if (activeSection === "addTrack") {
      const hasAllRequiredFiles =
        Boolean(uploadFiles.cover) &&
        Boolean(uploadFiles.mp3) &&
        Boolean(uploadFiles.wav) &&
        Boolean(uploadFiles.stemsZip);
      const hasTrackTaxonomy =
        Boolean(selectedMusicalKeyId) && selectedTagIds.length > 0;
      const selectedLicenses = getSelectedLicenses();
      const selectedLicensePriceCents =
        getLowestLicensePriceCents(selectedLicenses);
      const hasSelectedLicenses =
        selectedLicenseIds.length > 0 && selectedLicensePriceCents !== null;

      return (
        <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
          <h2 className="text-2xl font-black text-white">
            {copy.addTrack.title}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {copy.addTrack.subtitle}
          </p>

          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={handleTrackSubmit}
          >
            <label className="text-sm text-slate-300">
              {copy.addTrack.fields.title}
              <input
                value={trackForm.title}
                onChange={(event) =>
                  setTrackForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
                required
              />
            </label>
            <label className="text-sm text-slate-300">
              {copy.addTrack.fields.bpm}
              <input
                type="number"
                value={trackForm.bpm}
                onChange={(event) =>
                  setTrackForm((previous) => ({
                    ...previous,
                    bpm: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
                required
              />
            </label>
            <label className="text-sm text-slate-300">
              {copy.addTrack.fields.musicalKey}
              <select
                value={selectedMusicalKeyId}
                onChange={(event) =>
                  setSelectedMusicalKeyId(event.target.value)
                }
                disabled={taxonomyLoading || musicalKeys.length === 0}
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
              >
                <option value="" className="bg-slate-900 text-white">
                  {taxonomyLoading
                    ? copy.addTrack.musicalKeyLoading
                    : copy.addTrack.musicalKeyPlaceholder}
                </option>
                {musicalKeys.map((key) => (
                  <option
                    key={key.id}
                    value={String(key.id)}
                    className="bg-slate-900 text-white"
                  >
                    {key.name}
                  </option>
                ))}
              </select>
              {!taxonomyLoading && musicalKeys.length === 0 ? (
                <p className="mt-2 text-xs text-amber-200">
                  {copy.addTrack.musicalKeyUnavailable}
                </p>
              ) : null}
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">
              {copy.addTrack.fields.linkedTags}
              <div className="mt-2 rounded-2xl border border-white/12 bg-white/5 p-3">
                {taxonomyLoading ? (
                  <p className="text-xs text-slate-400">
                    {copy.addTrack.tagsLoading}
                  </p>
                ) : null}
                {!taxonomyLoading && taxonomyError ? (
                  <p className="text-xs text-rose-200">{taxonomyError}</p>
                ) : null}
                {!taxonomyLoading &&
                !taxonomyError &&
                availableTags.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {copy.addTrack.noTags}
                  </p>
                ) : null}
                {!taxonomyLoading &&
                !taxonomyError &&
                availableTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTagSelection(tag.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition ${
                            isSelected
                              ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100"
                              : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </label>
            <fieldset className="text-sm text-slate-300 md:col-span-2">
              <legend>{copy.addTrack.fields.linkedLicenses}</legend>
              <div className="mt-2 rounded-2xl border border-white/12 bg-white/5 p-3">
                {licensesLoading ? (
                  <p className="text-xs text-slate-400">
                    {copy.addTrack.licensesLoading}
                  </p>
                ) : null}
                {!licensesLoading && licensesError ? (
                  <p className="text-xs text-rose-200">{licensesError}</p>
                ) : null}
                {!licensesLoading &&
                !licensesError &&
                availableLicenses.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {copy.addTrack.noLicenses}
                  </p>
                ) : null}
                {!licensesLoading &&
                !licensesError &&
                availableLicenses.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {availableLicenses.map((license) => {
                      const isSelected = selectedLicenseIds.includes(
                        license.id,
                      );

                      return (
                        <div
                          key={license.id}
                          className={`rounded-2xl border p-3 transition ${
                            isSelected
                              ? "border-cyan-300/35 bg-cyan-400/12"
                              : "border-white/12 bg-white/5"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleLicenseSelection(license.id)}
                            className={`w-full text-left text-sm font-semibold transition ${
                              isSelected ? "text-cyan-100" : "text-slate-100"
                            }`}
                          >
                            {license.title}
                          </button>
                          <p className="mt-1 text-xs text-slate-400">
                            {(license.audioFormats || [])
                              .join(", ")
                              .toUpperCase() || "CUSTOM"}
                            {license.templateCategory
                              ? ` · ${license.templateCategory}`
                              : ""}
                          </p>

                          <p className="mt-2 text-xs font-semibold text-cyan-100">
                            {formatLicensePrice(license.priceCents)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </fieldset>
            <label className="text-sm text-slate-300 md:col-span-2">
              {copy.addTrack.fields.cover}
              <div className="mt-2">
                {renderDropInput(
                  "cover",
                  copy.addTrack.fields.cover,
                  "image/*",
                )}
              </div>
            </label>
            <label className="text-sm text-slate-300">
              {copy.addTrack.fields.mp3}
              <div className="mt-2">
                {renderDropInput(
                  "mp3",
                  copy.addTrack.fields.mp3,
                  ".mp3,audio/mpeg",
                )}
              </div>
            </label>
            <label className="text-sm text-slate-300">
              {copy.addTrack.fields.wav}
              <div className="mt-2">
                {renderDropInput(
                  "wav",
                  copy.addTrack.fields.wav,
                  ".wav,audio/wav",
                )}
              </div>
            </label>
            <label className="text-sm text-slate-300 md:col-span-2">
              {copy.addTrack.fields.stemsZip}
              <div className="mt-2">
                {renderDropInput(
                  "stemsZip",
                  copy.addTrack.fields.stemsZip,
                  ".zip,application/zip",
                )}
              </div>
            </label>
            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
              <div className="text-xs">
                <p
                  className={`${hasAllRequiredFiles && hasTrackTaxonomy && hasSelectedLicenses ? "text-slate-400" : "text-amber-200"}`}
                >
                  {hasAllRequiredFiles &&
                  hasTrackTaxonomy &&
                  hasSelectedLicenses
                    ? copy.addTrack.helper
                    : copy.addTrack.required}
                </p>
                {trackSubmitState.error ? (
                  <p className="mt-1 text-rose-200">{trackSubmitState.error}</p>
                ) : null}
                {trackSubmitState.success ? (
                  <p className="mt-1 text-emerald-200">
                    {trackSubmitState.success}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={
                  !hasAllRequiredFiles ||
                  !hasTrackTaxonomy ||
                  !hasSelectedLicenses ||
                  trackSubmitState.isLoading
                }
                className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28"
              >
                {trackSubmitState.isLoading
                  ? copy.addTrack.submitLoading
                  : copy.addTrack.submit}
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (activeSection === "addTags") {
      return (
        <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
          <h2 className="text-2xl font-black text-white">
            {copy.addTags.title}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{copy.addTags.subtitle}</p>

          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={handleTagSubmit}
          >
            <label className="text-sm text-slate-300">
              {copy.addTags.fields.name}
              <input
                value={tagForm.name}
                onChange={(event) =>
                  setTagForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder={copy.addTags.placeholders.name}
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
                required
              />
            </label>

            <label className="text-sm text-slate-300">
              {copy.addTags.fields.type}
              <select
                value={tagForm.type}
                onChange={(event) =>
                  setTagForm((previous) => ({
                    ...previous,
                    type: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
              >
                <option className="bg-slate-900 text-white" value="mood">
                  {copy.addTags.types.mood}
                </option>
                <option className="bg-slate-900 text-white" value="genre">
                  {copy.addTags.types.genre}
                </option>
              </select>
            </label>

            <label className="text-sm text-slate-300 md:col-span-2">
              {copy.addTags.fields.slug}
              <input
                value={tagForm.slug}
                onChange={(event) =>
                  setTagForm((previous) => ({
                    ...previous,
                    slug: event.target.value,
                  }))
                }
                placeholder={copy.addTags.placeholders.slug}
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
              />
            </label>

            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <div className="text-xs">
                {tagSubmitState.error ? (
                  <p className="text-rose-200">{tagSubmitState.error}</p>
                ) : null}
                {tagSubmitState.success ? (
                  <p className="text-emerald-200">{tagSubmitState.success}</p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={tagSubmitState.isLoading}
                className="rounded-full border border-cyan-300/35 bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {tagSubmitState.isLoading
                  ? copy.addTags.submitLoading
                  : copy.addTags.submit}
              </button>
            </div>
          </form>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              {copy.addTags.listTitle}
            </p>

            {availableTags.length === 0 ? (
              <p className="mt-3 text-sm text-slate-300">
                {copy.addTags.empty}
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="relative inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 pr-6 text-xs text-slate-200"
                  >
                    {tag.name} · {tag.type}
                    <button
                      type="button"
                      onClick={() => handleTagDelete(tag)}
                      disabled={deletingTagId === tag.id}
                      className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-rose-300/40 bg-rose-500/30 text-[10px] font-bold text-rose-100 transition hover:bg-rose-500/45 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`${copy.addTags.delete} ${tag.name}`}
                      title={copy.addTags.delete}
                    >
                      {deletingTagId === tag.id ? "..." : "x"}
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
        <h2 className="text-2xl font-black text-white">
          {copy.settings.title}
        </h2>
        <p className="mt-2 text-sm text-slate-300">{copy.settings.subtitle}</p>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-[1500px] gap-4 px-4 py-4 md:px-6 md:py-6">
        <aside className="hidden w-70 shrink-0 rounded-3xl border border-white/10 bg-slate-900/70 p-5 md:block">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            EUKS
          </p>
          <h1 className="mt-3 font-['Archivo'] text-3xl text-white">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm text-slate-400">{copy.subtitle}</p>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  activeSection === item.id
                    ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 space-y-4">
          <header className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {copy.subtitle}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {storedUser?.fullName || "User"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {storedUser?.email || ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/"
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
                >
                  {copy.backToStore}
                </a>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full border border-rose-300/25 bg-rose-400/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/25"
                >
                  {copy.logout}
                </button>
              </div>
            </div>
          </header>

          <div className="md:hidden rounded-2xl border border-white/10 bg-slate-900/65 p-3">
            <div className="flex gap-2 overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                    activeSection === item.id
                      ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {renderMainContent()}
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;
