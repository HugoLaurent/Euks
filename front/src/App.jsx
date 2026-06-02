import { useCallback, useEffect, useMemo, useState } from "react";
import bgDesktop from "@/assets/bg/background_desktop.webp";
import bgMobile from "@/assets/bg/bg_mobile.webp";
import bgTags from "@/assets/bg/bg_tags.jpg";
import {
  DashboardPage,
  LoginPage,
  PlayerCard,
  PurchaseModal,
  SelectionPanel,
  SoftAurora as Aurora,
  TagPicker,
} from "@/components";
import { defaultPreviewSrc } from "@/data";
import { useReactiveAudioPlayer } from "@/hooks";
import {
  API_BASE_URL,
  AUTH_USER_STORAGE_KEY,
  adaptCatalogTracks,
  fetchCatalog,
  getStoredAuthUser,
} from "@/lib";

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || "/login";
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || "/dashboard";

const EMPTY_PLAYER_TRACK = {
  id: 0,
  title: "",
  artist: "",
  vibe: "",
  duration: "0:00",
  bpm: 0,
  price: "",
  purchasePrices: {},
  cover: "from-slate-700 via-slate-800 to-slate-950",
  coverImage: null,
  audioSrc: defaultPreviewSrc,
  tags: [],
};

function FlagFr() {
  return (
    <svg
      viewBox="0 0 18 12"
      aria-hidden="true"
      className="h-3.5 w-5 rounded-[2px]"
    >
      <rect width="6" height="12" fill="#1d4ed8" />
      <rect x="6" width="6" height="12" fill="#ffffff" />
      <rect x="12" width="6" height="12" fill="#dc2626" />
    </svg>
  );
}

function FlagGb() {
  return (
    <svg
      viewBox="0 0 18 12"
      aria-hidden="true"
      className="h-3.5 w-5 rounded-[2px]"
    >
      <rect width="18" height="12" fill="#1e3a8a" />
      <path d="M0 0L18 12M18 0L0 12" stroke="#fff" strokeWidth="2.4" />
      <path d="M0 0L18 12M18 0L0 12" stroke="#dc2626" strokeWidth="1.2" />
      <path d="M9 0v12M0 6h18" stroke="#fff" strokeWidth="4" />
      <path d="M9 0v12M0 6h18" stroke="#dc2626" strokeWidth="2.2" />
    </svg>
  );
}

function readAudioMetadataDuration(audioSrc) {
  return new Promise((resolve) => {
    if (!audioSrc) {
      resolve(null);
      return;
    }

    const audio = new Audio();

    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.removeAttribute("src");
      audio.load();
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
    audio.src = audioSrc;
  });
}

function App() {
  const [authUser, setAuthUser] = useState(() => getStoredAuthUser());
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [tagParallax, setTagParallax] = useState({ rotateX: 0, rotateY: 0 });
  const [activeTags, setActiveTags] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [catalogError, setCatalogError] = useState("");
  const [catalogTags, setCatalogTags] = useState({
    mood: [],
    genre: [],
  });
  const [catalogTracksRaw, setCatalogTracksRaw] = useState([]);
  const [audioDurationsByTrackId, setAudioDurationsByTrackId] = useState({});
  const isLoginPage = window.location.pathname === "/login";
  const isDashboardPage = window.location.pathname === "/dashboard";
  const isAuthenticated = Boolean(authUser);
  const catalogTracks = useMemo(
    () =>
      adaptCatalogTracks(catalogTracksRaw, language, audioDurationsByTrackId),
    [audioDurationsByTrackId, catalogTracksRaw, language],
  );
  const selectedTrack =
    catalogTracks.find((track) => track.id === selectedTrackId) ??
    catalogTracks[0] ??
    null;
  const {
    currentTime,
    duration,
    energy,
    isPlaying,
    progress,
    seekToProgress,
    togglePlayback,
  } = useReactiveAudioPlayer(selectedTrack ?? EMPTY_PLAYER_TRACK);

  const handleTagClick = useCallback(
    (tag) => {
      const nextTags = activeTags.includes(tag)
        ? activeTags.filter((activeTag) => activeTag !== tag)
        : [...activeTags, tag];

      setActiveTags(nextTags);
    },
    [activeTags],
  );

  const handleTagCardMove = useCallback((event) => {
    const { currentTarget, clientX, clientY } = event;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    setTagParallax({
      rotateY: (x - 0.5) * 14,
      rotateX: (0.5 - y) * 14,
    });
  }, []);

  const resetTagCardMove = useCallback(() => {
    setTagParallax({ rotateX: 0, rotateY: 0 });
  }, []);

  const handleTrackSelect = useCallback((track) => {
    setSelectedTrackId(track.id);
    setIsMobilePlayerOpen(true);
  }, []);

  const handlePurchaseOpen = useCallback((track) => {
    setSelectedTrackId(track.id);
    setIsPurchaseModalOpen(true);
  }, []);

  const handlePurchaseClose = useCallback(() => {
    setIsPurchaseModalOpen(false);
  }, []);

  const handleLoginModalOpen = useCallback(() => {
    if (isAuthenticated) {
      return;
    }

    setIsLoginModalOpen(true);
  }, [isAuthenticated]);

  // Redirect unauthenticated visitors away from the dashboard. Navigating in an
  // effect (rather than during render) keeps the render pure.
  useEffect(() => {
    if (isDashboardPage && !isAuthenticated) {
      const loginUrl = new URL(LOGIN_URL, window.location.origin);
      loginUrl.searchParams.set("redirect", "/dashboard");
      window.location.href = loginUrl.href;
    }
  }, [isDashboardPage, isAuthenticated]);

  const handleLoginModalClose = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    setIsLoginModalOpen(false);

    const loginUrl = new URL(LOGIN_URL, window.location.origin);
    const redirectPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (redirectPath && redirectPath !== "/login") {
      loginUrl.searchParams.set("redirect", redirectPath);
    }

    window.location.href = loginUrl.href;
  }, []);

  const handleDashboardRedirect = useCallback(() => {
    const dashboardUrl = new URL(DASHBOARD_URL, window.location.origin);
    window.location.href = dashboardUrl.href;
  }, []);

  const handleLogout = useCallback(async () => {
    if (!isAuthenticated || isLogoutLoading) {
      return;
    }

    setIsLogoutLoading(true);

    try {
      // Auth is carried by the httpOnly cookie; credentials:include sends it so
      // the server can revoke the token and clear the cookie.
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Clear local auth state even if remote logout fails.
    } finally {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      setAuthUser(null);
      setIsLoginModalOpen(false);
      setIsLogoutLoading(false);
    }
  }, [isAuthenticated, isLogoutLoading]);

  const visibleSongs = useMemo(
    () =>
      activeTags.length > 0
        ? catalogTracks.filter((track) =>
            activeTags.every((activeTag) => track.tags.includes(activeTag)),
          )
        : [],
    [activeTags, catalogTracks],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadCatalog() {
      try {
        setCatalogStatus("loading");
        setCatalogError("");

        const catalog = await fetchCatalog();

        if (isCancelled) {
          return;
        }

        setCatalogTags(catalog.tagsByType);
        setCatalogTracksRaw(catalog.tracks);
        setCatalogStatus("ready");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setCatalogStatus("error");
        setCatalogError(
          error.message ||
            "Impossible de charger les tags et les tracks depuis le backend.",
        );
      }
    }

    loadCatalog();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const tracksToHydrate = catalogTracks.filter((track) => {
      const durationSeconds = Number(track.durationSeconds);

      return (
        track.id &&
        track.audioSrc &&
        (!Number.isFinite(durationSeconds) || durationSeconds <= 0) &&
        !audioDurationsByTrackId[track.id]
      );
    });

    tracksToHydrate.forEach(async (track) => {
      const durationSeconds = await readAudioMetadataDuration(track.audioSrc);

      if (isCancelled || !durationSeconds) {
        return;
      }

      setAudioDurationsByTrackId((previousDurations) => {
        if (previousDurations[track.id]) {
          return previousDurations;
        }

        return {
          ...previousDurations,
          [track.id]: durationSeconds,
        };
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [audioDurationsByTrackId, catalogTracks]);

  useEffect(() => {
    if (!isLoginModalOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsLoginModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoginModalOpen]);

  useEffect(() => {
    function syncAuthUser() {
      setAuthUser(getStoredAuthUser());
    }

    window.addEventListener("storage", syncAuthUser);

    return () => {
      window.removeEventListener("storage", syncAuthUser);
    };
  }, []);

  const copy = useMemo(
    () =>
      ({
        fr: {
          brand: "EUKS Store",
          heroTitle: "EUKS",
          tagPicker: {
            title: "Choisis un tag",
            description:
              "Clique sur plusieurs tags pour combiner les moods et genres dans la liste de droite.",
            loading: "Chargement des tags depuis le back...",
            errorTitle: "Catalogue indisponible",
            errorDescription:
              catalogError ||
              "Le front n'arrive pas à récupérer les tags pour le moment.",
            empty: "Aucun tag disponible pour le moment.",
            categories: {
              mood: "Moods",
              genre: "Genres",
            },
          },
          selection: {
            kicker: "Selection",
            tracks: "tracks",
            emptyTitle: "Aucun morceau pour cette combinaison",
            emptyDescription: "Essaie un autre mix entre mood et genre.",
            share: "Partager",
          },
          player: {
            kicker: "Lecteur",
            play: "Play",
            pause: "Pause",
            previous: "Précédent",
            next: "Suivant",
            buy: "Acheter",
            seek: "Aller à une position du morceau",
          },
          footer: {
            description:
              "Licences de beats, achats instantanés et support artiste.",
            packs: "Packs",
            support: "Support",
            contact: "Contact",
            terms: "CGV",
            legal: "Mentions légales",
            refunds: "Politique de remboursement",
            language: "Langue",
            loginModalTitle: "Se connecter",
            loginModalDescription:
              "Tu vas être redirigé vers la page de connexion.",
            loginModalCancel: "Annuler",
            loginModalConfirm: "Continuer",
            dashboard: "Dashboard",
            logout: "Se déconnecter",
            logoutLoading: "Déconnexion...",
          },
        },
        en: {
          brand: "EUKS Store",
          heroTitle: "EUKS",
          tagPicker: {
            title: "Pick a tag",
            description:
              "Click multiple tags to combine moods and genres in the list on the right.",
            loading: "Loading tags from the backend...",
            errorTitle: "Catalog unavailable",
            errorDescription:
              catalogError ||
              "The frontend could not load tags from the backend.",
            empty: "No tags are available right now.",
            categories: {
              mood: "Moods",
              genre: "Genres",
            },
          },
          selection: {
            kicker: "Selection",
            tracks: "tracks",
            emptyTitle: "No track for this combination",
            emptyDescription: "Try another mix of mood and genre.",
            share: "Share",
          },
          player: {
            kicker: "Player",
            play: "Play",
            pause: "Pause",
            previous: "Previous",
            next: "Next",
            buy: "Buy",
            seek: "Seek track position",
          },
          footer: {
            description: "Beat licenses, instant checkout, and artist support.",
            packs: "Packs",
            support: "Support",
            contact: "Contact",
            terms: "Terms",
            legal: "Legal",
            refunds: "Refund policy",
            language: "Language",
            loginModalTitle: "Sign in",
            loginModalDescription: "You will be redirected to the login page.",
            loginModalCancel: "Cancel",
            loginModalConfirm: "Continue",
            dashboard: "Dashboard",
            logout: "Sign out",
            logoutLoading: "Signing out...",
          },
        },
      })[language],
    [catalogError, language],
  );

  if (isLoginPage) {
    return <LoginPage language={language} />;
  }

  if (isDashboardPage) {
    if (!isAuthenticated) {
      // Redirect is handled by the effect above; render nothing meanwhile.
      return null;
    }

    return <DashboardPage language={language} onLogout={handleLogout} />;
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-950  text-white">
      <div
        className="absolute inset-0 hidden bg-cover bg-[position:24%_center] bg-no-repeat md:block xl:bg-center"
        style={{ backgroundImage: `url(${bgDesktop})` }}
      />

      <div className="absolute inset-0 overflow-hidden md:hidden">
        <div className="absolute inset-y-0 left-1/2 w-[84vw] max-w-[360px] -translate-x-1/2">
          <div className="mobile-aurora-column mobile-aurora-column--primary" />
          <div className="mobile-aurora-column mobile-aurora-column--secondary" />
          <div className="mobile-aurora-column mobile-aurora-column--glow" />
        </div>
        <div className="absolute inset-0 bg-slate-950/52" />
      </div>

      <div
        className="pointer-events-none absolute -top-8 right-6 z-10 hidden h-36 w-80 opacity-85 md:-top-6 md:right-18 md:block md:h-40 md:w-96"
        style={{
          maskImage:
            "radial-gradient(circle at 52% 34%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 28%, rgba(0,0,0,0.82) 44%, rgba(0,0,0,0.48) 58%, rgba(0,0,0,0.16) 72%, rgba(0,0,0,0) 86%)",
          WebkitMaskImage:
            "radial-gradient(circle at 52% 34%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 28%, rgba(0,0,0,0.82) 44%, rgba(0,0,0,0.48) 58%, rgba(0,0,0,0.16) 72%, rgba(0,0,0,0) 86%)",
        }}
      >
        <div
          style={{ width: "820px", height: "820px" }}
          className="absolute -top-70 -right-30 blur-[10px] relative"
        >
          <Aurora
            colorStops={["#5227FF", "#7cff67", "#5227FF"]}
            amplitude={0.55}
            blend={0.1}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      <header className="relative z-20 hidden px-6 pt-6 md:block">
        <div className="mx-auto flex w-full max-w-[1380px] items-center justify-end gap-3">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleDashboardRedirect}
                className="rounded-full border border-cyan-300/35 bg-cyan-400/18 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/28"
              >
                {copy.footer.dashboard}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLogoutLoading
                  ? copy.footer.logoutLoading
                  : copy.footer.logout}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLoginModalOpen}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
            >
              {copy.footer.loginModalTitle}
            </button>
          )}
          <h1 className="font-['Archivo'] text-5xl md:text-6xl">
            {copy.heroTitle}
          </h1>
        </div>
      </header>

      <header className="relative z-10 px-4 pt-6 md:hidden">
        <div className="mx-auto flex w-full max-w-[1380px] items-center justify-end gap-3">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleDashboardRedirect}
                className="rounded-full border border-cyan-300/35 bg-cyan-400/18 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/28"
              >
                {copy.footer.dashboard}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLogoutLoading
                  ? copy.footer.logoutLoading
                  : copy.footer.logout}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLoginModalOpen}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/20"
            >
              {copy.footer.loginModalTitle}
            </button>
          )}
          <h1 className="font-['Archivo'] text-5xl md:text-6xl">
            {copy.heroTitle}
          </h1>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-end px-4 pt-6 md:px-6 md:items-center md:pt-24">
        <div className="flex w-full max-w-[1380px] flex-col gap-6">
          <section
            className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl p-4 md:p-6 xl:p-8"
            onMouseMove={handleTagCardMove}
            onMouseLeave={resetTagCardMove}
          >
            <div
              className="absolute inset-0 bg-cover bg-left-center bg-no-repeat xl:hidden"
              style={{
                backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.76), rgba(2, 6, 23, 0.76)), url(${bgMobile})`,
              }}
            />
            <div
              className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat transition-transform duration-200 ease-out will-change-transform xl:block opacity-35"
              style={{
                backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.76), rgba(2, 6, 23, 0.76)), url(${bgTags})`,
                transform: `perspective(1200px) rotateX(${tagParallax.rotateX}deg) rotateY(${tagParallax.rotateY}deg) scale3d(1.1, 1.1, 1.1)`,
              }}
            />

            <div className="relative flex flex-col gap-6 xl:flex-row">
              <TagPicker
                activeTags={activeTags}
                labels={copy.tagPicker}
                onTagClick={handleTagClick}
                status={catalogStatus}
                tagsByCategory={catalogTags}
              />

              <SelectionPanel
                activeTags={activeTags}
                labels={copy.selection}
                onPurchase={handlePurchaseOpen}
                selectedTrack={selectedTrack}
                tracks={visibleSongs}
                onTrackSelect={handleTrackSelect}
              />
            </div>
          </section>

          {selectedTrack ? (
            <div className="hidden xl:block">
              <PlayerCard
                currentTime={currentTime}
                duration={duration}
                energy={energy}
                isPlaying={isPlaying}
                labels={copy.player}
                onPurchase={handlePurchaseOpen}
                onSeek={seekToProgress}
                onTogglePlayback={togglePlayback}
                track={selectedTrack}
                progress={progress}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 xl:hidden">
        <div
          className={`bg-slate-950/20 px-3 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isMobilePlayerOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          {selectedTrack ? (
            <PlayerCard
              className="rounded-b-none border-b-0 shadow-[0_-20px_60px_rgba(2,6,23,0.55)]"
              currentTime={currentTime}
              duration={duration}
              energy={energy}
              isPlaying={isPlaying}
              labels={copy.player}
              onPurchase={handlePurchaseOpen}
              onClose={() => setIsMobilePlayerOpen(false)}
              onSeek={seekToProgress}
              onTogglePlayback={togglePlayback}
              progress={progress}
              track={selectedTrack}
            />
          ) : null}
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        language={language}
        onClose={handlePurchaseClose}
        onPlay={togglePlayback}
        track={selectedTrack}
      />

      {isLoginModalOpen ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close login modal"
            onClick={handleLoginModalClose}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl backdrop-blur">
            <h2
              id="login-modal-title"
              className="text-2xl font-black text-white"
            >
              {copy.footer.loginModalTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {copy.footer.loginModalDescription}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleLoginModalClose}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                {copy.footer.loginModalCancel}
              </button>
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="rounded-full border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/25"
              >
                {copy.footer.loginModalConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="mt-10 w-full border-t border-white/10 bg-slate-950/30 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="YouTube"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4.5 w-4.5 fill-current"
                >
                  <path d="M23.5 6.2a2.95 2.95 0 0 0-2.08-2.08C19.59 3.6 12 3.6 12 3.6s-7.59 0-9.42.52A2.95 2.95 0 0 0 .5 6.2 30.3 30.3 0 0 0 0 12a30.3 30.3 0 0 0 .5 5.8 2.95 2.95 0 0 0 2.08 2.08C4.41 20.4 12 20.4 12 20.4s7.59 0 9.42-.52a2.95 2.95 0 0 0 2.08-2.08A30.3 30.3 0 0 0 24 12a30.3 30.3 0 0 0-.5-5.8ZM9.6 15.7V8.3l6.4 3.7-6.4 3.7Z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4.5 w-4.5 fill-current"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
                </svg>
              </a>
            </div>

            <div>
              <button
                type="button"
                onClick={
                  isAuthenticated
                    ? handleDashboardRedirect
                    : handleLoginModalOpen
                }
                className="font-['Archivo'] text-base text-white transition hover:text-cyan-200"
              >
                {copy.brand}
              </button>
              <p className="text-sm text-slate-400">
                {copy.footer.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              {copy.footer.packs}
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              {copy.footer.support}
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              {copy.footer.contact}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4 text-xs text-slate-400">
            <button type="button" className="transition hover:text-white">
              {copy.footer.terms}
            </button>
            <button type="button" className="transition hover:text-white">
              {copy.footer.legal}
            </button>
            <button type="button" className="transition hover:text-white">
              {copy.footer.refunds}
            </button>
            <div className="ml-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm">
              <span className="px-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                {copy.footer.language}
              </span>
              <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`rounded-full px-2 py-1 transition ${
                  language === "fr"
                    ? " text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                aria-label="Français"
              >
                <FlagFr />
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2 py-1 transition ${
                  language === "en"
                    ? " text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                aria-label="English"
              >
                <FlagGb />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
