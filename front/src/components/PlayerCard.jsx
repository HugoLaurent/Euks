import { memo } from "react";
import {
  X,
  ShoppingCart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import SoftAurora from "@/components/player/SoftAurora.jsx";

function PlayerCard({
  className = "",
  currentTime,
  duration,
  energy,
  isPlaying,
  labels,
  onClose,
  onPurchase,
  onSeek,
  onTogglePlayback,
  progress,
  track,
}) {
  const coverStyle = track.coverImage
    ? {
        backgroundImage: `linear-gradient(rgba(15,23,42,0.18), rgba(15,23,42,0.5)), url(${track.coverImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }
    : undefined;
  const reactiveEnergy = isPlaying ? Math.max(energy, 0.12) : 0.08;
  const auroraSpeed = 0.1 + reactiveEnergy * 0.18;
  const auroraBrightness = 1 + reactiveEnergy * 0.42;
  const auroraScale = 0.99 + reactiveEnergy * 0.22;
  const auroraNoiseAmplitude = 0.9 + reactiveEnergy * 0.42;
  const auroraBandSpread = 0.98 + reactiveEnergy * 0.28;
  const auroraColorSpeed = 0.08 + reactiveEnergy * 0.14;

  const hasAudio = Boolean(track.audioSrc);

  const handleSeek = (event) => {
    if (!onSeek) {
      return;
    }
    if (!hasAudio) return;
    onSeek(Number(event.target.value) / 1000);
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur md:p-6 ${className}`}
    >
      <div className="absolute inset-0 opacity-100">
        <SoftAurora
          speed={auroraSpeed}
          scale={auroraScale}
          brightness={auroraBrightness}
          color1="#f7f7f7"
          color2="#88798b"
          noiseFrequency={2.5}
          noiseAmplitude={auroraNoiseAmplitude}
          bandHeight={0.5}
          bandSpread={auroraBandSpread}
          octaveDecay={0.1}
          layerOffset={reactiveEnergy * 0.07}
          colorSpeed={auroraColorSpeed}
          enableMouseInteraction={false}
          mouseInfluence={0.25}
        />
      </div>

      <div className="absolute inset-0 bg-slate-950/10" />

      <div className="relative z-10">
        {onClose ? (
          <div className="mb-4 flex items-center justify-between">
            <div className="mx-auto h-1.5 w-14 rounded-full bg-white/18" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close player"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-4">
          <div
            className={`flex h-20 w-20 items-end justify-start rounded-2xl ${
              track.coverImage
                ? "bg-slate-900"
                : `bg-linear-to-br ${track.cover}`
            } p-3 text-xs uppercase tracking-[0.3em] text-white`}
            style={coverStyle}
          >
            {track.title.slice(0, 2)}
          </div>

          <div className="min-w-0 flex-1 ">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              {labels.kicker}
            </p>
            <h2 className="truncate text-2xl font-black text-white">
              {track.title}
            </h2>
            <p className="truncate text-sm text-slate-300">
              {track.artist} - {track.vibe}
            </p>
            {!hasAudio ? (
              <p className="mt-1 text-xs text-amber-200">
                Aucun aperçu disponible
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {track.duration}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {track.bpm} BPM
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {track.price}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => hasAudio && onTogglePlayback?.()}
            disabled={!hasAudio}
            className={`group flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/45 bg-cyan-300/15 text-cyan-50 shadow-[0_0_24px_rgba(103,232,249,0.16)] transition duration-300 hover:scale-105 hover:bg-cyan-300/25 ${
              !hasAudio ? "opacity-40 cursor-not-allowed" : ""
            }`}
            aria-label={isPlaying ? labels.pause : labels.play}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
        </div>

        <div className="mt-6 space-y-3 rounded-[1.75rem]   px-5 ">
          <input
            type="range"
            min="0"
            max="1000"
            step="1"
            value={Math.round(Math.min(Math.max(progress, 0), 1) * 1000)}
            onChange={handleSeek}
            className="player-progress-slider"
            style={{
              "--player-progress": `${Math.min(Math.max(progress, 0), 1) * 100}%`,
            }}
            aria-label={labels.seek}
          />

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition duration-300 hover:-translate-x-0.5 hover:bg-white/10"
              aria-label={labels.previous}
            >
              <SkipBack className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
            </button>
            <button
              type="button"
              onClick={() => hasAudio && onTogglePlayback?.()}
              disabled={!hasAudio}
              className={`group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)] transition duration-300 hover:scale-105 hover:bg-white/14 ${
                !hasAudio ? "opacity-40 cursor-not-allowed" : ""
              }`}
              aria-label={isPlaying ? labels.pause : labels.play}
            >
              {isPlaying ? (
                <Pause className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <Play className="ml-0.5 h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
              )}
            </button>
            <button
              type="button"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition duration-300 hover:translate-x-0.5 hover:bg-white/10"
              aria-label={labels.next}
            >
              <SkipForward className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onPurchase?.(track)}
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 text-sm font-medium text-emerald-50 transition duration-300 hover:scale-[1.02] hover:bg-emerald-300/16"
            aria-label={labels.buy}
          >
            <ShoppingCart className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
            <span>{labels.buy}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(PlayerCard);
