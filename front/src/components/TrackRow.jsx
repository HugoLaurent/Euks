import { Share2, ShoppingCart } from "lucide-react";

function TrackRow({ isActive, labels, onPurchase, onSelect, track }) {
  const coverStyle = track.coverImage
    ? {
        backgroundImage: `linear-gradient(rgba(15,23,42,0.16), rgba(15,23,42,0.45)), url(${track.coverImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }
    : undefined;

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`block w-full rounded-2xl border px-4 py-3 text-left transition ${
        isActive
          ? "border-cyan-200 bg-cyan-200/90 text-slate-950"
          : "border-white/10 bg-white/5 text-white hover:border-cyan-300/50 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center md:gap-4 gap-2">
        <div
          className={`flex h-14 w-14 shrink-0 items-end rounded-xl ${
            track.coverImage ? "bg-slate-900" : `bg-linear-to-br ${track.cover}`
          } p-2`}
          style={coverStyle}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">
            {track.title.slice(0, 2)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center md:gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{track.title}</p>
              <p
                className={`truncate text-xs ${
                  isActive ? "text-slate-700" : "text-slate-300"
                }`}
              >
                {track.artist} - {track.vibe}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-xs font-medium">
              <span
                className={`rounded-full px-2.5 py-1 ${
                  isActive
                    ? "bg-slate-900/10 text-slate-700"
                    : "bg-white/10 text-slate-200"
                }`}
              >
                {track.duration}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 ${
                  isActive
                    ? "bg-slate-900/10 text-slate-700"
                    : "bg-white/10 text-slate-200"
                }`}
              >
                {track.bpm} BPM
              </span>
              <span
                className={`flex items-center justify-center rounded-full px-2.5 py-1 ${
                  isActive
                    ? "bg-slate-900/10 text-slate-700"
                    : "bg-white/10 text-slate-200"
                }`}
                aria-label={labels.share}
                title={labels.share}
              >
                <Share2 className="h-3.5 w-3.5" />
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onPurchase(track);
                }}
                className={`rounded-full px-2.5 py-1 font-semibold transition ${
                  isActive
                    ? "bg-slate-900/10 text-slate-700"
                    : "bg-white/10 text-cyan-100"
                }`}
                aria-label={`Buy ${track.title}`}
                title={`Buy ${track.title}`}
              >
                <span className="flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>{track.price}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackRow;
