import { useEffect, useMemo, useState } from "react";
import AdvancedLicenseManager from "@/components/AdvancedLicenseManager.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("euks.auth.user");
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

function parseEuroToCents(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!normalized) {
    return null;
  }

  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
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
  const [musicalKeys, setMusicalKeys] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [tracksError, setTracksError] = useState("");
  const [taxonomyError, setTaxonomyError] = useState("");
  const [storedUser, setStoredUser] = useState(() => readStoredUser());
  const [selectedMusicalKeyId, setSelectedMusicalKeyId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [trackPriceEuro, setTrackPriceEuro] = useState("");
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

  useEffect(() => {
    let isCancelled = false;

    async function fetchTracks() {
      setTracksLoading(true);
      setTracksError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/tracks?page=1&perPage=20`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load tracks.");
        }

        const data = Array.isArray(payload) ? payload : payload?.data || [];

        if (!isCancelled) {
          setTracks(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!isCancelled) {
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
  }, []);

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
          adminOnlyTitle: "Accès admin requis",
          adminOnlyBody:
            "Ton compte est connecté, mais il n'a pas le rôle admin pour ce dashboard.",
          overview: {
            cards: {
              purchases: "Achats aujourd'hui",
              revenue: "CA estimé",
              tracks: "Musiques en ligne",
              activeLicenses: "Licences actives",
            },
            recent: "Activité récente",
            recentEmpty: "Aucune activité récente à afficher pour le moment.",
          },
          purchases: {
            title: "Liste des achats",
            subtitle:
              "Aperçu des derniers paiements. Tu pourras brancher la vraie route achats ensuite.",
            empty: "Aucun achat à afficher.",
            columns: {
              orderId: "Commande",
              buyer: "Acheteur",
              amount: "Montant",
              status: "Statut",
            },
          },
          tracks: {
            title: "Liste des musiques",
            subtitle: "Catalogue chargé depuis l'API.",
            loading: "Chargement des musiques...",
            empty: "Aucune musique trouvée.",
            columns: {
              title: "Titre",
              bpm: "BPM",
              price: "Prix",
              listens: "Écoutes",
            },
          },
          addTrack: {
            title: "Ajouter une musique",
            subtitle:
              "Prototype de formulaire admin. Branche ensuite ton endpoint create track.",
            fields: {
              title: "Titre",
              bpm: "BPM",
              price: "Prix (EUR)",
              musicalKey: "Clé musicale",
              linkedTags: "Tags à lier",
              cover: "Cover (image)",
              mp3: "Fichier MP3",
              wav: "Fichier WAV",
              stemsZip: "Piste par piste (ZIP)",
            },
            musicalKeyPlaceholder: "Sélectionner une clé",
            musicalKeyLoading: "Chargement des clés...",
            musicalKeyUnavailable: "Aucune clé disponible.",
            pricePlaceholder: "Ex: 29,99",
            priceInvalid: "Prix invalide",
            priceCentsPreview: "Valeur backend (centimes)",
            tagsLoading: "Chargement des tags...",
            noTags: "Aucun tag disponible.",
            dropHint: "Glisse un fichier ici ou clique pour sélectionner",
            selected: "Sélectionné",
            invalidType: "Type de fichier invalide.",
            required:
              "Les 3 formats audio + la cover + la clé + au moins un tag sont requis.",
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
          adminOnlyTitle: "Admin access required",
          adminOnlyBody:
            "Your account is signed in, but it does not have the admin role for this dashboard.",
          overview: {
            cards: {
              purchases: "Purchases today",
              revenue: "Estimated revenue",
              tracks: "Tracks online",
              activeLicenses: "Active licenses",
            },
            recent: "Recent activity",
            recentEmpty: "No recent activity to display yet.",
          },
          purchases: {
            title: "Purchases",
            subtitle:
              "Preview of recent payments. You can connect your real purchases endpoint next.",
            empty: "No purchases to show.",
            columns: {
              orderId: "Order",
              buyer: "Buyer",
              amount: "Amount",
              status: "Status",
            },
          },
          tracks: {
            title: "Tracks",
            subtitle: "Catalog loaded from API.",
            loading: "Loading tracks...",
            empty: "No tracks found.",
            columns: {
              title: "Title",
              bpm: "BPM",
              price: "Price",
              listens: "Plays",
            },
          },
          addTrack: {
            title: "Add track",
            subtitle:
              "Admin form prototype. You can wire your create track endpoint next.",
            fields: {
              title: "Title",
              bpm: "BPM",
              price: "Price (EUR)",
              musicalKey: "Musical key",
              linkedTags: "Linked tags",
              cover: "Cover (image)",
              mp3: "MP3 file",
              wav: "WAV file",
              stemsZip: "Stems (ZIP)",
            },
            musicalKeyPlaceholder: "Select key",
            musicalKeyLoading: "Loading keys...",
            musicalKeyUnavailable: "No musical key available.",
            pricePlaceholder: "Ex: 29.99",
            priceInvalid: "Invalid price",
            priceCentsPreview: "Backend value (cents)",
            tagsLoading: "Loading tags...",
            noTags: "No tags available.",
            dropHint: "Drop a file here or click to browse",
            selected: "Selected",
            invalidType: "Invalid file type.",
            required:
              "All 3 audio formats + cover + key + at least one tag are required.",
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

  const isAdmin = storedUser?.role === "admin";
  const purchasesPreview = [
    {
      orderId: "5O190127TN364715T",
      buyer: "buyer@test.local",
      amount: "35.00 EUR",
      status: "COMPLETED",
    },
    {
      orderId: "9N122857A0150042W",
      buyer: "alpha@test.local",
      amount: "17.00 EUR",
      status: "COMPLETED",
    },
  ];

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

  async function handleTagSubmit(event) {
    event.preventDefault();

    if (tagSubmitState.isLoading) {
      return;
    }

    const authToken = localStorage.getItem("euks.auth.token") || "";

    if (!authToken) {
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
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
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

    const authToken = localStorage.getItem("euks.auth.token") || "";

    if (!authToken) {
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
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
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

    const parsedPriceCents = parseEuroToCents(trackPriceEuro);
    const hasAllRequiredFiles =
      Boolean(uploadFiles.cover) &&
      Boolean(uploadFiles.mp3) &&
      Boolean(uploadFiles.wav) &&
      Boolean(uploadFiles.stemsZip);
    const hasTrackTaxonomy =
      Boolean(selectedMusicalKeyId) && selectedTagIds.length > 0;

    if (!hasAllRequiredFiles || !hasTrackTaxonomy || !parsedPriceCents) {
      return;
    }

    const authToken = localStorage.getItem("euks.auth.token") || "";

    if (!authToken) {
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
      formData.append("title", trackForm.title.trim());
      formData.append("bpm", String(Number(trackForm.bpm) || 0));
      formData.append("priceCents", String(parsedPriceCents));
      formData.append("musicalKeyId", selectedMusicalKeyId);

      selectedTagIds.forEach((tagId) => {
        formData.append("tagIds[]", String(tagId));
      });

      formData.append("cover", uploadFiles.cover);
      formData.append("previewMp3", uploadFiles.mp3);
      formData.append("previewWav", uploadFiles.wav);
      formData.append("stemsZip", uploadFiles.stemsZip);

      const response = await fetch(`${API_BASE_URL}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to create track.");
      }

      const tracksResponse = await fetch(
        `${API_BASE_URL}/tracks?page=1&perPage=20`,
      );
      const tracksPayload = await parseResponsePayload(tracksResponse);

      if (tracksResponse.ok) {
        setTracks(toArrayPayload(tracksPayload));
      }

      setTrackForm({
        title: "",
        bpm: "",
      });
      setTrackPriceEuro("");
      setSelectedMusicalKeyId("");
      setSelectedTagIds([]);
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

  function renderMainContent() {
    if (!isAdmin) {
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {copy.overview.cards.purchases}
              </p>
              <p className="mt-3 text-2xl font-black text-white">18</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {copy.overview.cards.revenue}
              </p>
              <p className="mt-3 text-2xl font-black text-white">420 EUR</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {copy.overview.cards.tracks}
              </p>
              <p className="mt-3 text-2xl font-black text-white">
                {tracks.length}
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {copy.overview.cards.activeLicenses}
              </p>
              <p className="mt-3 text-2xl font-black text-white">5</p>
            </article>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
            <h3 className="text-lg font-semibold text-white">
              {copy.overview.recent}
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              {copy.overview.recentEmpty}
            </p>
          </div>
        </section>
      );
    }

    if (activeSection === "purchases") {
      return (
        <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
          <h2 className="text-2xl font-black text-white">
            {copy.purchases.title}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {copy.purchases.subtitle}
          </p>

          {purchasesPreview.length === 0 ? (
            <p className="mt-6 text-sm text-slate-300">
              {copy.purchases.empty}
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm text-slate-200">
                <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  <tr>
                    <th className="py-2">{copy.purchases.columns.orderId}</th>
                    <th className="py-2">{copy.purchases.columns.buyer}</th>
                    <th className="py-2">{copy.purchases.columns.amount}</th>
                    <th className="py-2">{copy.purchases.columns.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasesPreview.map((purchase) => (
                    <tr
                      key={purchase.orderId}
                      className="border-t border-white/8"
                    >
                      <td className="py-3 font-mono text-xs text-cyan-100">
                        {purchase.orderId}
                      </td>
                      <td className="py-3">{purchase.buyer}</td>
                      <td className="py-3">{purchase.amount}</td>
                      <td className="py-3">{purchase.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      );
    }

    if (activeSection === "tracks") {
      return (
        <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
          <h2 className="text-2xl font-black text-white">
            {copy.tracks.title}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{copy.tracks.subtitle}</p>

          {tracksLoading ? (
            <p className="mt-6 text-sm text-slate-300">{copy.tracks.loading}</p>
          ) : null}
          {tracksError ? (
            <p className="mt-6 text-sm text-rose-200">{tracksError}</p>
          ) : null}

          {!tracksLoading && !tracksError && tracks.length === 0 ? (
            <p className="mt-6 text-sm text-slate-300">{copy.tracks.empty}</p>
          ) : null}

          {!tracksLoading && !tracksError && tracks.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm text-slate-200">
                <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  <tr>
                    <th className="py-2">{copy.tracks.columns.title}</th>
                    <th className="py-2">{copy.tracks.columns.bpm}</th>
                    <th className="py-2">{copy.tracks.columns.price}</th>
                    <th className="py-2">{copy.tracks.columns.listens}</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track) => (
                    <tr key={track.id} className="border-t border-white/8">
                      <td className="py-3">{track.title}</td>
                      <td className="py-3">{track.bpm ?? 0}</td>
                      <td className="py-3">{track.priceCents ?? 0}</td>
                      <td className="py-3">{track.listenCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      );
    }

    if (activeSection === "licenses") {
      return <AdvancedLicenseManager language={language} />;
    }

    if (activeSection === "addTrack") {
      const parsedPriceCents = parseEuroToCents(trackPriceEuro);
      const hasAllRequiredFiles =
        Boolean(uploadFiles.cover) &&
        Boolean(uploadFiles.mp3) &&
        Boolean(uploadFiles.wav) &&
        Boolean(uploadFiles.stemsZip);
      const hasValidPrice = Boolean(parsedPriceCents);
      const hasTrackTaxonomy =
        Boolean(selectedMusicalKeyId) && selectedTagIds.length > 0;

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
              {copy.addTrack.fields.price}
              <input
                type="text"
                inputMode="decimal"
                value={trackPriceEuro}
                onChange={(event) => setTrackPriceEuro(event.target.value)}
                placeholder={copy.addTrack.pricePlaceholder}
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-white outline-none"
              />
              <div className="mt-2 text-xs text-slate-400">
                {parsedPriceCents ? (
                  <span>
                    {copy.addTrack.priceCentsPreview}: {parsedPriceCents}
                  </span>
                ) : trackPriceEuro ? (
                  <span className="text-amber-200">
                    {copy.addTrack.priceInvalid}
                  </span>
                ) : null}
              </div>
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
                  className={`${hasAllRequiredFiles && hasTrackTaxonomy && hasValidPrice ? "text-slate-400" : "text-amber-200"}`}
                >
                  {hasAllRequiredFiles && hasTrackTaxonomy && hasValidPrice
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
                  !hasValidPrice ||
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
