import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/AppContext";
import LicenseManager from "@/components/LicenseManager.jsx";
import DashboardOverview from "@/components/dashboard/DashboardOverview.jsx";
import DashboardPurchases from "@/components/dashboard/DashboardPurchases.jsx";
import DashboardTracks from "@/components/dashboard/DashboardTracks.jsx";
import DashboardEditTrack from "@/components/dashboard/DashboardEditTrack.jsx";
import DashboardAddTrack from "@/components/dashboard/DashboardAddTrack.jsx";
import DashboardAddTags from "@/components/dashboard/DashboardAddTags.jsx";
import DashboardMusicalKeys from "@/components/dashboard/DashboardMusicalKeys.jsx";
import ClientDownloads from "@/components/dashboard/ClientDownloads.jsx";
import ClientPurchases from "@/components/dashboard/ClientPurchases.jsx";
import ClientProfile from "@/components/dashboard/ClientProfile.jsx";
import {
  API_BASE_URL,
  AUTH_USER_STORAGE_KEY,
  buildAuthHeaders,
  isLoggedIn,
} from "@/lib";

function getPaginationMeta(payload) {
  return payload?.meta ?? payload?.metadata ?? { currentPage: 1, lastPage: 1, perPage: 12, total: 0 };
}

function toArrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function parseResponsePayload(response) {
  const raw = await response.text();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return { message: raw }; }
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const DASHBOARD_COPY = {
  fr: {
    title: "Dashboard",
    subtitle: "Panneau d'administration EUKS",
    clientTitle: "Mon Espace",
    clientSubtitle: "Achats et téléchargements",
    backToStore: "Retour au store",
    logout: "Se déconnecter",
    nav: {
      overview: "Vue d'ensemble",
      purchases: "Achats",
      tracks: "Musiques",
      licenses: "Licences",
      musicalKeys: "Tonalités",
      addTrack: "Ajouter une musique",
      addTags: "Tags",
      settings: "Paramètres",
    },
    adminOnlyTitle: "Accès propriétaire requis",
    adminOnlyBody: "Ton compte est connecté, mais il n'a pas accès à ce dashboard propriétaire.",
    overview: {
      loading: "Chargement du dashboard...",
      cards: { purchases: "Achats aujourd'hui", revenue: "CA aujourd'hui", tracks: "Musiques actives", activeLicenses: "Musiques sold" },
      recent: "Activité récente",
      recentEmpty: "Aucune activité récente à afficher pour le moment.",
    },
    purchases: {
      title: "Liste des achats",
      subtitle: "Paiements PayPal, acheteurs et licences achetées.",
      empty: "Aucun achat à afficher.",
      loading: "Chargement des achats...",
      filters: { all: "Tous", completed: "Payés", failed: "Échecs" },
      columns: { orderId: "Commande", buyer: "Acheteur", track: "Musique", license: "Licence", amount: "Montant", status: "Statut", date: "Date" },
    },
    tracks: {
      title: "Liste des musiques",
      subtitle: "Gère la visibilité, le mode sold, l'édition et la suppression.",
      loading: "Chargement des musiques...",
      empty: "Aucune musique trouvée.",
      search: "Rechercher une musique",
      filters: { all: "Toutes", available: "Disponibles", active: "Visibles", hidden: "Masquées", sold: "Sold" },
      status: { active: "Visible", hidden: "Masquée", sold: "Sold" },
      actions: {
        edit: "Modifier",
        editFiles: "Remplacer des fichiers (optionnel)",
        cancelEdit: "Annuler",
        hide: "Masquer", restore: "Rendre visible", markSold: "Marquer sold",
        markAvailable: "Remettre dispo", delete: "Supprimer", deleting: "Suppression...", working: "Action...",
        confirmDelete: "Supprimer définitivement cette musique ?",
      },
      columns: { title: "Titre", bpm: "BPM", price: "Prix", listens: "Écoutes", status: "Statut", actions: "Actions" },
    },
    addTrack: {
      title: "Ajouter une musique",
      subtitle: "Formulaire admin de création de track.",
      fields: { title: "Titre", bpm: "BPM", musicalKey: "Clé musicale", linkedTags: "Tags à lier", linkedLicenses: "Licences à attacher", cover: "Cover (image)", mp3: "Fichier MP3", wav: "Fichier WAV", stemsZip: "Piste par piste (ZIP)" },
      musicalKeyPlaceholder: "Sélectionner une clé",
      musicalKeyLoading: "Chargement des clés...",
      musicalKeyUnavailable: "Aucune clé disponible.",
      tagsLoading: "Chargement des tags...",
      noTags: "Aucun tag disponible.",
      licensesLoading: "Chargement des licences...",
      noLicenses: "Aucune licence active disponible. Crée d'abord une licence.",
      dropHint: "Glisse un fichier ici ou clique pour sélectionner",
      selected: "Sélectionné",
      invalidType: "Type de fichier invalide.",
      required: "Les 3 formats audio + la cover + la clé + au moins un tag + au moins une licence sont requis.",
      tokenRequired: "Tu dois être connecté pour créer une musique.",
      saveSuccess: "Musique enregistrée avec succès.",
      submit: "Enregistrer",
      submitLoading: "Enregistrement...",
      helper: "Tous les champs sont remplis. Clique sur Enregistrer.",
    },
    addTags: {
      title: "Gestion des tags",
      subtitle: "Crée des tags mood/genre pour les lier aux musiques.",
      fields: { name: "Nom", type: "Type", slug: "Slug (optionnel)" },
      placeholders: { name: "Ex: Mélancolique", slug: "Ex: melancholique" },
      types: { mood: "Mood", genre: "Genre" },
      submit: "Ajouter le tag", submitLoading: "Ajout...",
      delete: "Supprimer", confirmDelete: "Confirmer la suppression du tag",
      deleteLoading: "Suppression...", tokenRequired: "Tu dois être connecté pour créer un tag.",
      success: "Tag ajouté avec succès.", deleteSuccess: "Tag supprimé avec succès.",
      empty: "Aucun tag disponible.", listTitle: "Tags disponibles",
    },
    settings: {
      title: "Paramètres",
      subtitle: "Réglages du dashboard.",
      comingSoon: "Prochainement : notifications de vente, configuration du store, export CSV des achats.",
    },
  },
  en: {
    title: "Dashboard",
    subtitle: "EUKS admin panel",
    clientTitle: "My Account",
    clientSubtitle: "Purchases & downloads",
    backToStore: "Back to store",
    logout: "Sign out",
    nav: {
      overview: "Overview", purchases: "Purchases", tracks: "Tracks",
      licenses: "Licenses", musicalKeys: "Musical keys", addTrack: "Add track", addTags: "Tags", settings: "Settings",
    },
    adminOnlyTitle: "Owner access required",
    adminOnlyBody: "Your account is signed in, but it does not have access to this owner dashboard.",
    overview: {
      loading: "Loading dashboard...",
      cards: { purchases: "Purchases today", revenue: "Revenue today", tracks: "Active tracks", activeLicenses: "Sold tracks" },
      recent: "Recent activity",
      recentEmpty: "No recent activity to display yet.",
    },
    purchases: {
      title: "Purchases",
      subtitle: "PayPal payments, buyers, and purchased licenses.",
      empty: "No purchases to show.",
      loading: "Loading purchases...",
      filters: { all: "All", completed: "Paid", failed: "Failed" },
      columns: { orderId: "Order", buyer: "Buyer", track: "Track", license: "License", amount: "Amount", status: "Status", date: "Date" },
    },
    tracks: {
      title: "Tracks",
      subtitle: "Manage visibility, sold mode, edit, and deletion.",
      loading: "Loading tracks...",
      empty: "No tracks found.",
      search: "Search track",
      filters: { all: "All", available: "Available", active: "Visible", hidden: "Hidden", sold: "Sold" },
      status: { active: "Visible", hidden: "Hidden", sold: "Sold" },
      actions: {
        edit: "Edit",
        editFiles: "Replace files (optional)",
        cancelEdit: "Cancel",
        hide: "Hide", restore: "Show", markSold: "Mark sold",
        markAvailable: "Available", delete: "Delete", deleting: "Deleting...", working: "Working...",
        confirmDelete: "Permanently delete this track?",
      },
      columns: { title: "Title", bpm: "BPM", price: "Price", listens: "Plays", status: "Status", actions: "Actions" },
    },
    addTrack: {
      title: "Add track",
      subtitle: "Admin form for track creation.",
      fields: { title: "Title", bpm: "BPM", musicalKey: "Musical key", linkedTags: "Linked tags", linkedLicenses: "Licenses to attach", cover: "Cover (image)", mp3: "MP3 file", wav: "WAV file", stemsZip: "Stems (ZIP)" },
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
      required: "All 3 audio formats + cover + key + at least one tag + at least one license are required.",
      tokenRequired: "You must be signed in to create a track.",
      saveSuccess: "Track saved successfully.",
      submit: "Save",
      submitLoading: "Saving...",
      helper: "All fields are ready. Click Save.",
    },
    addTags: {
      title: "Tags management",
      subtitle: "Create mood/genre tags to link them to tracks.",
      fields: { name: "Name", type: "Type", slug: "Slug (optional)" },
      placeholders: { name: "Ex: Melancholic", slug: "Ex: melancholic" },
      types: { mood: "Mood", genre: "Genre" },
      submit: "Add tag", submitLoading: "Adding...",
      delete: "Delete", confirmDelete: "Confirm tag deletion",
      deleteLoading: "Deleting...", tokenRequired: "You must be signed in to create a tag.",
      success: "Tag added successfully.", deleteSuccess: "Tag deleted successfully.",
      empty: "No tag available.", listTitle: "Available tags",
    },
    settings: {
      title: "Settings",
      subtitle: "Dashboard settings.",
      comingSoon: "Coming soon: sale notifications, store configuration, CSV export of purchases.",
    },
  },
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value, delay]);
  return debouncedValue;
}

function DashboardPage() {
  const navigate = useNavigate();
  const { language } = useAppContext();
  const copy = DASHBOARD_COPY[language] ?? DASHBOARD_COPY.fr;

  const [storedUser, setStoredUser] = useState(() => readStoredUser());
  const isAdmin = storedUser?.role === "admin" || storedUser?.role === "owner";

  const [activeSection, setActiveSection] = useState(() => isAdmin ? "overview" : "myDownloads");
  const [editingTrack, setEditingTrack] = useState(null);

  // Tracks
  const [tracks, setTracks] = useState([]);
  const [tracksMeta, setTracksMeta] = useState(getPaginationMeta());
  const [trackPage, setTrackPage] = useState(1);
  const [trackStatusFilter, setTrackStatusFilter] = useState("all");
  const [trackSearch, setTrackSearch] = useState("");
  const debouncedTrackSearch = useDebounce(trackSearch, 300);
  const [trackReloadKey, setTrackReloadKey] = useState(0);
  const [trackActionState, setTrackActionState] = useState({ id: null, error: "" });
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState("");

  // Summary
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [summaryReloadKey, setSummaryReloadKey] = useState(0);

  // Purchases — default to COMPLETED
  const [purchases, setPurchases] = useState([]);
  const [purchasesMeta, setPurchasesMeta] = useState(getPaginationMeta());
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState("COMPLETED");
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [purchasesError, setPurchasesError] = useState("");

  // Taxonomy + licenses
  const [musicalKeys, setMusicalKeys] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableLicenses, setAvailableLicenses] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [licensesLoading, setLicensesLoading] = useState(false);
  const [taxonomyError, setTaxonomyError] = useState("");
  const [licensesError, setLicensesError] = useState("");

  // Tag form
  const [tagForm, setTagForm] = useState({ name: "", slug: "", type: "mood" });
  const [tagSubmitState, setTagSubmitState] = useState({ isLoading: false, error: "", success: "" });
  const [deletingTagId, setDeletingTagId] = useState(null);

  const canManageDashboard = isAdmin;

  // Refresh stored user
  useEffect(() => {
    let isCancelled = false;
    async function refreshProfile() {
      try {
        const response = await fetch(`${API_BASE_URL}/account/profile`, { credentials: "include", headers: buildAuthHeaders() });
        const payload = await parseResponsePayload(response);
        const user = payload?.data ?? payload;
        if (!response.ok || !user?.id || isCancelled) return;
        setStoredUser(user);
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      } catch { /* keep stored fallback */ }
    }
    refreshProfile();
    return () => { isCancelled = true; };
  }, []);

  useEffect(() => {
    const syncUser = () => setStoredUser(readStoredUser());
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // Summary
  useEffect(() => {
    let isCancelled = false;
    if (!canManageDashboard) { setSummary(null); setSummaryLoading(false); return; }
    setSummaryLoading(true); setSummaryError("");
    async function go() {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/summary`, { credentials: "include", headers: buildAuthHeaders() });
        const payload = await parseResponsePayload(res);
        if (!res.ok) throw new Error(payload?.message || "Unable to load dashboard.");
        if (!isCancelled) setSummary(payload);
      } catch (err) {
        if (!isCancelled) { setSummary(null); setSummaryError(err.message || "Unable to load dashboard."); }
      } finally { if (!isCancelled) setSummaryLoading(false); }
    }
    go();
    return () => { isCancelled = true; };
  }, [canManageDashboard, summaryReloadKey]);

  // Tracks
  useEffect(() => {
    let isCancelled = false;
    if (!canManageDashboard) { setTracks([]); setTracksLoading(false); return; }
    setTracksLoading(true); setTracksError("");
    async function go() {
      try {
        const q = new URLSearchParams({ page: String(trackPage), perPage: "8", status: trackStatusFilter });
        if (debouncedTrackSearch.trim()) q.set("search", debouncedTrackSearch.trim());
        const res = await fetch(`${API_BASE_URL}/dashboard/tracks?${q}`, { credentials: "include", headers: buildAuthHeaders() });
        const payload = await parseResponsePayload(res);
        if (!res.ok) throw new Error(payload?.message || "Unable to load tracks.");
        if (!isCancelled) { setTracks(toArrayPayload(payload)); setTracksMeta(getPaginationMeta(payload)); }
      } catch (err) {
        if (!isCancelled) { setTracks([]); setTracksError(err.message || "Unable to load tracks."); }
      } finally { if (!isCancelled) setTracksLoading(false); }
    }
    go();
    return () => { isCancelled = true; };
  }, [canManageDashboard, trackPage, trackReloadKey, debouncedTrackSearch, trackStatusFilter]);

  // Purchases
  useEffect(() => {
    let isCancelled = false;
    if (!canManageDashboard) { setPurchases([]); setPurchasesLoading(false); return; }
    setPurchasesLoading(true); setPurchasesError("");
    async function go() {
      try {
        const q = new URLSearchParams({ page: String(purchasesPage), perPage: "10", status: purchaseStatusFilter });
        const res = await fetch(`${API_BASE_URL}/dashboard/purchases?${q}`, { credentials: "include", headers: buildAuthHeaders() });
        const payload = await parseResponsePayload(res);
        if (!res.ok) throw new Error(payload?.message || "Unable to load purchases.");
        if (!isCancelled) { setPurchases(toArrayPayload(payload)); setPurchasesMeta(getPaginationMeta(payload)); }
      } catch (err) {
        if (!isCancelled) { setPurchases([]); setPurchasesError(err.message || "Unable to load purchases."); }
      } finally { if (!isCancelled) setPurchasesLoading(false); }
    }
    go();
    return () => { isCancelled = true; };
  }, [canManageDashboard, purchaseStatusFilter, purchasesPage, summaryReloadKey]);

  // Taxonomy
  useEffect(() => {
    let isCancelled = false;
    setTaxonomyLoading(true); setTaxonomyError("");
    async function go() {
      try {
        const [keysRes, tagsRes] = await Promise.all([fetch(`${API_BASE_URL}/musical-keys`), fetch(`${API_BASE_URL}/tags`)]);
        const [keysP, tagsP] = await Promise.all([keysRes.json(), tagsRes.json()]);
        if (!keysRes.ok) throw new Error(keysP?.message || "Unable to load musical keys.");
        if (!tagsRes.ok) throw new Error(tagsP?.message || "Unable to load tags.");
        if (!isCancelled) { setMusicalKeys(toArrayPayload(keysP)); setAvailableTags(toArrayPayload(tagsP)); }
      } catch (err) {
        if (!isCancelled) setTaxonomyError(err.message || "Unable to load musical keys and tags.");
      } finally { if (!isCancelled) setTaxonomyLoading(false); }
    }
    go();
    return () => { isCancelled = true; };
  }, []);

  // Licenses (only when addTrack or editTrack is active)
  useEffect(() => {
    let isCancelled = false;
    if (activeSection !== "addTrack" && editingTrack === null) return;
    setLicensesLoading(true); setLicensesError("");
    async function go() {
      try {
        const res = await fetch(`${API_BASE_URL}/licenses?activeOnly=true`, { credentials: "include", headers: buildAuthHeaders() });
        const payload = await parseResponsePayload(res);
        if (!res.ok) throw new Error(payload?.message || "Unable to load licenses.");
        if (!isCancelled) setAvailableLicenses(toArrayPayload(payload));
      } catch (err) {
        if (!isCancelled) { setAvailableLicenses([]); setLicensesError(err.message || "Unable to load licenses."); }
      } finally { if (!isCancelled) setLicensesLoading(false); }
    }
    go();
    return () => { isCancelled = true; };
  }, [activeSection, editingTrack]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } });
    } catch { /* ignore */ } finally {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      navigate("/login");
    }
  }, [navigate]);

  function reloadTracks() {
    setTrackReloadKey((v) => v + 1);
    setSummaryReloadKey((v) => v + 1);
  }

  async function patchTrack(track, updates) {
    if (!isLoggedIn()) { setTrackActionState({ id: track.id, error: copy.addTrack.tokenRequired }); return; }
    setTrackActionState({ id: track.id, error: "" });
    try {
      const res = await fetch(`${API_BASE_URL}/tracks/${track.id}`, {
        method: "PATCH", credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
        body: JSON.stringify(updates),
      });
      const payload = await parseResponsePayload(res);
      if (!res.ok) throw new Error(payload?.message || "Unable to update track.");
      setTrackActionState({ id: null, error: "" });
      reloadTracks();
    } catch (err) {
      setTrackActionState({ id: track.id, error: err.message || "Unable to update track." });
    }
  }

  async function handleTrackDelete(track) {
    if (!window.confirm(copy.tracks.actions.confirmDelete)) return;
    if (!isLoggedIn()) { setTrackActionState({ id: track.id, error: copy.addTrack.tokenRequired }); return; }
    setTrackActionState({ id: track.id, error: "" });
    try {
      const res = await fetch(`${API_BASE_URL}/tracks/${track.id}`, { method: "DELETE", credentials: "include", headers: buildAuthHeaders() });
      const payload = await parseResponsePayload(res);
      if (!res.ok) throw new Error(payload?.message || "Unable to delete track.");
      setTrackActionState({ id: null, error: "" });
      // Go back to page 1 to avoid empty page
      setTrackPage(1);
      reloadTracks();
    } catch (err) {
      setTrackActionState({ id: track.id, error: err.message || "Unable to delete track." });
    }
  }

  function handleEditTrack(track) {
    setEditingTrack(track);
    setActiveSection("tracks");
  }

  function handleEditSaved() {
    setEditingTrack(null);
    reloadTracks();
  }

  function handleEditCancel() {
    setEditingTrack(null);
  }

  async function handleTagSubmit(event) {
    event.preventDefault();
    if (tagSubmitState.isLoading) return;
    if (!isLoggedIn()) { setTagSubmitState({ isLoading: false, error: copy.addTags.tokenRequired, success: "" }); return; }
    const name = tagForm.name.trim();
    if (!name) return;
    setTagSubmitState({ isLoading: true, error: "", success: "" });
    try {
      const res = await fetch(`${API_BASE_URL}/tags`, {
        method: "POST", credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
        body: JSON.stringify({ name, type: tagForm.type, slug: tagForm.slug.trim() || undefined }),
      });
      const payload = await parseResponsePayload(res);
      if (!res.ok) throw new Error(payload?.message || "Unable to create tag.");
      const tagsRes = await fetch(`${API_BASE_URL}/tags`);
      const tagsPayload = await parseResponsePayload(tagsRes);
      if (tagsRes.ok) setAvailableTags(toArrayPayload(tagsPayload));
      setTagForm((p) => ({ ...p, name: "", slug: "" }));
      setTagSubmitState({ isLoading: false, error: "", success: copy.addTags.success });
    } catch (err) {
      setTagSubmitState({ isLoading: false, error: err.message || "Unable to create tag.", success: "" });
    }
  }

  async function handleTagDelete(tag, options = {}) {
    if (deletingTagId) return;
    if (!options.skipConfirm) {
      if (!window.confirm(`${copy.addTags.confirmDelete}: ${tag.name} ?`)) return;
    }
    if (!isLoggedIn()) { setTagSubmitState({ isLoading: false, error: copy.addTags.tokenRequired, success: "" }); return; }
    setDeletingTagId(tag.id);
    setTagSubmitState((p) => ({ ...p, error: "", success: "" }));
    try {
      const res = await fetch(`${API_BASE_URL}/tags/${tag.id}`, {
        method: "DELETE", credentials: "include",
        headers: buildAuthHeaders(undefined, { json: true }),
      });
      const payload = await parseResponsePayload(res);
      if (!res.ok) throw new Error(payload?.message || "Unable to delete tag.");
      setAvailableTags((p) => p.filter((t) => t.id !== tag.id));
      setTagSubmitState({ isLoading: false, error: "", success: copy.addTags.deleteSuccess });
    } catch (err) {
      setTagSubmitState({ isLoading: false, error: err.message || "Unable to delete tag.", success: "" });
    } finally { setDeletingTagId(null); }
  }

  const clientNavItems = [
    { id: "myDownloads", label: language === "fr" ? "Mes téléchargements" : "My downloads" },
    { id: "myPurchases", label: language === "fr" ? "Mes achats" : "My purchases" },
    { id: "myProfile", label: language === "fr" ? "Mon profil" : "My profile" },
  ];

  const adminNavItems = [
    { id: "overview", label: copy.nav.overview },
    { id: "purchases", label: copy.nav.purchases },
    { id: "tracks", label: copy.nav.tracks },
    { id: "licenses", label: copy.nav.licenses },
    { id: "musicalKeys", label: copy.nav.musicalKeys },
    { id: "addTrack", label: copy.nav.addTrack },
    { id: "addTags", label: copy.nav.addTags },
    { id: "settings", label: copy.nav.settings },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  function renderMainContent() {
    // Client sections
    if (activeSection === "myDownloads") return <ClientDownloads language={language} />;
    if (activeSection === "myPurchases") return <ClientPurchases language={language} />;
    if (activeSection === "myProfile") return <ClientProfile language={language} />;

    // Guard admin sections for non-admins
    if (!isAdmin) return <ClientDownloads language={language} />;

    if (activeSection === "overview") {
      return <DashboardOverview copy={copy} summary={summary} summaryLoading={summaryLoading} summaryError={summaryError} language={language} />;
    }

    if (activeSection === "purchases") {
      return (
        <DashboardPurchases
          copy={copy} language={language}
          purchases={purchases} purchasesMeta={purchasesMeta}
          purchasesLoading={purchasesLoading} purchasesError={purchasesError}
          purchaseStatusFilter={purchaseStatusFilter}
          setPurchaseStatusFilter={setPurchaseStatusFilter}
          setPurchasesPage={setPurchasesPage}
        />
      );
    }

    if (activeSection === "tracks") {
      if (editingTrack) {
        return (
          <DashboardEditTrack
            copy={copy}
            track={editingTrack}
            musicalKeys={musicalKeys}
            availableTags={availableTags}
            availableLicenses={availableLicenses}
            taxonomyLoading={taxonomyLoading}
            licensesLoading={licensesLoading}
            taxonomyError={taxonomyError}
            licensesError={licensesError}
            onSaved={handleEditSaved}
            onCancel={handleEditCancel}
            API_BASE_URL={API_BASE_URL}
            buildAuthHeaders={buildAuthHeaders}
          />
        );
      }

      return (
        <DashboardTracks
          copy={copy} language={language}
          tracks={tracks} tracksMeta={tracksMeta}
          tracksLoading={tracksLoading} tracksError={tracksError}
          trackSearch={trackSearch} setTrackSearch={setTrackSearch}
          trackStatusFilter={trackStatusFilter} setTrackStatusFilter={setTrackStatusFilter}
          setTrackPage={setTrackPage}
          trackActionState={trackActionState}
          onPatchTrack={patchTrack}
          onDeleteTrack={handleTrackDelete}
          onEditTrack={handleEditTrack}
        />
      );
    }

    if (activeSection === "licenses") {
      return <LicenseManager language={language} />;
    }

    if (activeSection === "musicalKeys") {
      return <DashboardMusicalKeys language={language} API_BASE_URL={API_BASE_URL} buildAuthHeaders={buildAuthHeaders} />;
    }

    if (activeSection === "addTrack") {
      return (
        <DashboardAddTrack
          copy={copy}
          musicalKeys={musicalKeys}
          availableTags={availableTags}
          availableLicenses={availableLicenses}
          taxonomyLoading={taxonomyLoading}
          licensesLoading={licensesLoading}
          taxonomyError={taxonomyError}
          licensesError={licensesError}
          onTrackCreated={reloadTracks}
          API_BASE_URL={API_BASE_URL}
          buildAuthHeaders={buildAuthHeaders}
          isLoggedIn={isLoggedIn}
        />
      );
    }

    if (activeSection === "addTags") {
      return (
        <DashboardAddTags
          copy={copy} language={language}
          availableTags={availableTags}
          tagForm={tagForm} setTagForm={setTagForm}
          tagSubmitState={tagSubmitState}
          deletingTagId={deletingTagId}
          onTagSubmit={handleTagSubmit}
          onTagDelete={handleTagDelete}
          API_BASE_URL={API_BASE_URL}
        />
      );
    }

    return (
      <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
        <h2 className="text-2xl font-black text-white">{copy.settings.title}</h2>
        <p className="mt-2 text-sm text-slate-300">{copy.settings.subtitle}</p>
        <p className="mt-6 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-6 text-slate-400">
          {copy.settings.comingSoon}
        </p>
      </section>
    );
  }

  function handleNavClick(sectionId) {
    setEditingTrack(null);
    setActiveSection(sectionId);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-[1500px] gap-4 px-4 py-4 md:px-6 md:py-6">
        <aside className="hidden w-70 shrink-0 rounded-3xl border border-white/10 bg-slate-900/70 p-5 md:block">
          {isAdmin ? (
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">EUKS</p>
          ) : null}
          <h1 className="mt-3 font-['Archivo'] text-3xl text-white">
            {isAdmin ? copy.title : copy.clientTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {isAdmin ? copy.subtitle : copy.clientSubtitle}
          </p>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  activeSection === item.id && !editingTrack
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
                  {isAdmin ? copy.subtitle : copy.clientSubtitle}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">{storedUser?.fullName || "User"}</h2>
                <p className="mt-1 text-sm text-slate-400">{storedUser?.email || ""}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
                  {copy.backToStore}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
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
                  onClick={() => handleNavClick(item.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                    activeSection === item.id ? "border-cyan-300/35 bg-cyan-400/18 text-cyan-100" : "border-white/10 bg-white/5 text-slate-200"
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
